/* eslint-disable @typescript-eslint/no-explicit-any */
import EVMAnalyzer from '..';
import { Address } from '@ethereumjs/util';
import { BytecodeAnalyzer } from '../utils/bytecode-analyzer';
import { ContractMetadata } from '../types';
import test_abi from './test_abi.json';
import tokenBytecode from './token';
import { keccak256 } from 'ethereum-cryptography/keccak';

const contractMetadata: ContractMetadata = test_abi as unknown as ContractMetadata;

// Helper functions
function encodeAddress(address: string): string {
  const cleanAddr = address.startsWith('0x') ? address.slice(2) : address;
  return cleanAddr.padStart(64, '0');
}

function encodeUint256(value: bigint): string {
  return value.toString(16).padStart(64, '0');
}

function extractUint256(result: any): bigint {
  // The data is in result.returnValue, not result.res.returnValue
  if (result?.returnValue && result.returnValue.length >= 32) {
    const bytes = result.returnValue.slice(0, 32);
    let value = BigInt(0);
    for (let i = 0; i < bytes.length; i++) {
      value = (value << BigInt(8)) + BigInt(bytes[i]);
    }
    return value;
  }
  return BigInt(0);
}

async function main() {
  console.log('🚀 SimpleToken DEX Simulation\n');

  const analyzer = await EVMAnalyzer.create();

  try {
    // === SETUP ADDRESSES ===
    const contractAddr = new Address(Buffer.from('1234567890123456789012345678901234567890', 'hex'));
    const devAddr = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    const user1Addr = '0x1111111111111111111111111111111111111111';
    const user2Addr = '0x2222222222222222222222222222222222222222';
    const user3Addr = '0x3333333333333333333333333333333333333333';
    const walletAddr = '0x4444444444444444444444444444444444444444';

    console.log('📋 Addresses:');
    console.log(`Contract: ${contractAddr.toString()}`);
    console.log(`Developer: ${devAddr}`);
    console.log(`User1: ${user1Addr}`);
    console.log(`User2: ${user2Addr}`);
    console.log(`User3: ${user3Addr}`);
    console.log(`Wallet: ${walletAddr}\n`);

    // === SETUP INITIAL BALANCES ===
    console.log('💰 Setting up initial ETH balances...');
    await analyzer.fundAccount(devAddr, BigInt('100000000000000000000')); // 100 ETH
    await analyzer.fundAccount(user1Addr, BigInt('20000000000000000000')); // 20 ETH
    await analyzer.fundAccount(user2Addr, BigInt('20000000000000000000')); // 20 ETH
    await analyzer.fundAccount(user3Addr, BigInt('20000000000000000000')); // 20 ETH
    console.log('✅ All accounts funded with ETH\n');

    // === DEPLOY CONTRACT ===
    console.log('🏗️  Developer deploying SimpleToken contract...');

    // Create account and deploy
    await analyzer.createAccount(contractAddr.toString());
    await analyzer.deployContractToAddress(contractAddr.toString(), tokenBytecode);

    // Initialize contract state
    console.log('🔧 Initializing contract state...');

    // Set owner (slot 6)
    await setStorage(analyzer, contractAddr.toString(), 6, devAddr.slice(2));

    // Set total supply (slot 3) - 1 million tokens
    const totalSupply = BigInt(1000000) * BigInt(10 ** 18);
    await setStorage(analyzer, contractAddr.toString(), 3, totalSupply.toString(16));

    // Set developer's token balance in mapping
    const devBalanceSlot = getBalanceSlot(devAddr, 4);
    await setStorage(analyzer, contractAddr.toString(), devBalanceSlot, totalSupply.toString(16));

    console.log('✅ Contract deployed and initialized\n');

    // Get function selectors
    const analysis = BytecodeAnalyzer.analyzeWithMetadata(tokenBytecode, contractMetadata);
    const functions = new Map(analysis.functions.map((f) => [f.name, f]));
    await debugContractCall(analyzer, contractAddr.toString(), 'totalSupply', functions.get('totalSupply')?.selector || '', devAddr);
    await debugContractCall(analyzer, contractAddr.toString(), 'owner', functions.get('owner')?.selector || '', devAddr);

    // === DEV PROVIDES LIQUIDITY ===
    console.log('🏊 Developer providing initial liquidity...');

    const addLiquidityFunc = functions.get('addLiquidity');
    if (addLiquidityFunc) {
      const tokenAmount = BigInt(100000) * BigInt(10 ** 18); // 100,000 tokens
      const ethAmount = BigInt(50) * BigInt(10 ** 18); // 50 ETH
      const data = addLiquidityFunc.selector + encodeUint256(tokenAmount);

      const result = await analyzer.callContract({
        from: devAddr,
        to: contractAddr.toString(),
        value: ethAmount,
        data,
        gasLimit: BigInt(500000),
      });

      console.log(`✅ Liquidity added: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   Gas used: ${result.gasUsed.toString()}`);

      // Check reserves
      await checkReserves('Initial Reserves', analyzer, functions, contractAddr.toString(), devAddr);
      await showCurrentPrice('Initial Price', analyzer, functions, contractAddr.toString(), devAddr);
    }

    // === USER PURCHASES (3 users buy) ===
    console.log('🛒 Users buying tokens with ETH...');

    const swapEthForTokensFunc = functions.get('swapEthForTokens');
    if (swapEthForTokensFunc) {
      // User1 buys with 5 ETH
      console.log('💰 User1 buying tokens with 5 ETH...');
      const result1 = await analyzer.callContract({
        from: user1Addr,
        to: contractAddr.toString(),
        value: BigInt(5) * BigInt(10 ** 18),
        data: swapEthForTokensFunc.selector,
        gasLimit: BigInt(300000),
      });
      console.log(`✅ User1 purchase: ${result1.success ? 'SUCCESS' : 'FAILED'} | Gas: ${result1.gasUsed.toString()}`);
      await showCurrentPrice('Price after User1 buy', analyzer, functions, contractAddr.toString(), devAddr);

      // User2 buys with 8 ETH
      console.log('💰 User2 buying tokens with 8 ETH...');
      const result2 = await analyzer.callContract({
        from: user2Addr,
        to: contractAddr.toString(),
        value: BigInt(8) * BigInt(10 ** 18),
        data: swapEthForTokensFunc.selector,
        gasLimit: BigInt(300000),
      });
      console.log(`✅ User2 purchase: ${result2.success ? 'SUCCESS' : 'FAILED'} | Gas: ${result2.gasUsed.toString()}`);
      await showCurrentPrice('Price after User2 buy', analyzer, functions, contractAddr.toString(), devAddr);

      // User3 buys with 3 ETH
      console.log('💰 User3 buying tokens with 3 ETH...');
      const result3 = await analyzer.callContract({
        from: user3Addr,
        to: contractAddr.toString(),
        value: BigInt(3) * BigInt(10 ** 18),
        data: swapEthForTokensFunc.selector,
        gasLimit: BigInt(300000),
      });
      console.log(`✅ User3 purchase: ${result3.success ? 'SUCCESS' : 'FAILED'} | Gas: ${result3.gasUsed.toString()}\n`);
      await showCurrentPrice('Price after User3 buy', analyzer, functions, contractAddr.toString(), devAddr);
    }

    await checkReserves('After purchases', analyzer, functions, contractAddr.toString(), devAddr);

    // === USER SELLS (1 user sells) ===
    console.log('💸 User selling tokens for ETH...');

    const swapTokensForEthFunc = functions.get('swapTokensForEth');
    if (swapTokensForEthFunc) {
      console.log('💰 User1 selling 1000 tokens for ETH...');
      const tokensToSell = BigInt(1000) * BigInt(10 ** 18);
      const data = swapTokensForEthFunc.selector + encodeUint256(tokensToSell);

      const result = await analyzer.callContract({
        from: user1Addr,
        to: contractAddr.toString(),
        value: BigInt(0),
        data,
        gasLimit: BigInt(300000),
      });

      console.log(`✅ User1 sell: ${result.success ? 'SUCCESS' : 'FAILED'} | Gas: ${result.gasUsed.toString()}\n`);
      await showCurrentPrice('Price after User1 sell', analyzer, functions, contractAddr.toString(), devAddr);
    }

    await checkReserves('After sell', analyzer, functions, contractAddr.toString(), devAddr);

    // === USER TRANSFER (1 user transfers to another) ===
    console.log('📤 User transferring tokens...');

    const transferFunc = functions.get('transfer');
    if (transferFunc) {
      console.log('💰 User2 transferring 500 tokens to wallet...');
      const transferAmount = BigInt(500) * BigInt(10 ** 18);
      const data = transferFunc.selector + encodeAddress(walletAddr) + encodeUint256(transferAmount);

      const result = await analyzer.callContract({
        from: user2Addr,
        to: contractAddr.toString(),
        value: BigInt(0),
        data,
        gasLimit: BigInt(200000),
      });

      console.log(`✅ User2 transfer: ${result.success ? 'SUCCESS' : 'FAILED'} | Gas: ${result.gasUsed.toString()}\n`);
      await showCurrentPrice('Final Price', analyzer, functions, contractAddr.toString(), devAddr);
    }

    // === FINAL RESULTS ===
    console.log('📊 FINAL RESULTS');
    console.log('=================');

    await checkReserves('Final Reserves', analyzer, functions, contractAddr.toString(), devAddr);
    await checkAllBalances(analyzer, functions, contractAddr.toString(), [
      { name: 'Developer', addr: devAddr },
      { name: 'User1', addr: user1Addr },
      { name: 'User2', addr: user2Addr },
      { name: 'User3', addr: user3Addr },
      { name: 'Wallet', addr: walletAddr },
    ]);

    console.log('🎉 Simulation Complete!');
  } catch (error) {
    console.error('❌ Error during simulation:', error);
  }
}

// === HELPER FUNCTIONS ===

async function setStorage(analyzer: any, contractAddr: string, slot: number | string, value: string) {
  const slotHex = typeof slot === 'number' ? slot.toString(16).padStart(64, '0') : slot;
  const valueHex = value.startsWith('0x') ? value.slice(2) : value;

  const cleanAddr = contractAddr.startsWith('0x') ? contractAddr.slice(2) : contractAddr;
  const addr = new Address(Buffer.from(cleanAddr, 'hex'));

  await analyzer.stateManagerService.stateManager.putStorage(addr, Buffer.from(slotHex, 'hex'), Buffer.from(valueHex.padStart(64, '0'), 'hex'));
}

function getBalanceSlot(address: string, mappingSlot: number): string {
  const cleanAddr = address.startsWith('0x') ? address.slice(2) : address;
  const addrBuffer = Buffer.from(cleanAddr.padStart(64, '0'), 'hex');
  const slotBuffer = Buffer.from(mappingSlot.toString(16).padStart(64, '0'), 'hex');

  const combined = Buffer.concat([addrBuffer, slotBuffer]);
  const hash = keccak256(combined);

  return Buffer.from(hash).toString('hex');
}

async function checkReserves(title: string, analyzer: any, functions: Map<string | undefined, any>, contractAddr: string, caller: string) {
  console.log(`📊 ${title}:`);

  const tokenReserveFunc = functions.get('tokenReserve');
  const ethReserveFunc = functions.get('ethReserve');

  if (tokenReserveFunc && ethReserveFunc) {
    const [tokenResult, ethResult] = await Promise.all([
      analyzer.callContract({
        from: caller,
        to: contractAddr,
        value: BigInt(0),
        data: tokenReserveFunc.selector.slice(2), // Remove 0x prefix
        gasLimit: BigInt(200000),
      }),
      analyzer.callContract({
        from: caller,
        to: contractAddr,
        value: BigInt(0),
        data: ethReserveFunc.selector.slice(2), // Remove 0x prefix
        gasLimit: BigInt(200000),
      }),
    ]);

    const tokenReserve = extractUint256(tokenResult);
    const ethReserve = extractUint256(ethResult);

    console.log(`   Token Reserve: ${tokenReserve / BigInt(10 ** 18)} tokens`);
    console.log(`   ETH Reserve: ${ethReserve / BigInt(10 ** 18)} ETH`);

    if (tokenReserve > 0 && ethReserve > 0) {
      const priceInWei = (ethReserve * BigInt(10 ** 18)) / tokenReserve;
      const priceInEth = Number(priceInWei) / 10 ** 18;
      console.log(`   Token Price: ${priceInEth.toFixed(8)} ETH per token`);
    }
  }
  console.log('');
}

async function checkAllBalances(analyzer: any, functions: Map<string | undefined, any>, contractAddr: string, addresses: Array<{ name: string; addr: string }>) {
  console.log('💰 Token Balances:');

  const balanceOfFunc = functions.get('balanceOf');
  if (balanceOfFunc) {
    for (const { name, addr } of addresses) {
      const data = balanceOfFunc.selector.slice(2) + encodeAddress(addr);
      const result = await analyzer.callContract({
        from: addresses[0].addr,
        to: contractAddr,
        value: BigInt(0),
        data,
        gasLimit: BigInt(100000),
      });

      const balance = extractUint256(result);
      console.log(`   ${name}: ${balance / BigInt(10 ** 18)} tokens`);
    }
  }
  console.log('');
}

// Replace the debugContractCall function with this version that handles BigInt:
async function debugContractCall(analyzer: any, contractAddr: string, functionName: string, selector: string, caller: string) {
  console.log(`\n🔍 DEBUG ${functionName}:`);

  const result = await analyzer.callContract({
    from: caller,
    to: contractAddr,
    value: BigInt(0),
    data: selector.startsWith('0x') ? selector.slice(2) : selector,
    gasLimit: BigInt(200000),
  });

  console.log('- Success:', result.success);
  console.log('- Gas Used:', result.gasUsed?.toString());
  console.log('- Has result.res:', !!result.res);
  console.log('- Has result.returnValue:', !!result.returnValue);
  console.log('- Has result.res?.returnValue:', !!result.res?.returnValue);

  // Check the actual return data
  if (result.res?.returnValue) {
    console.log('- Return Value Length:', result.res.returnValue.length);
    console.log('- Return Value (hex):', Buffer.from(result.res.returnValue).toString('hex'));
  } else if (result.returnValue) {
    console.log('- Return Value Length:', result.returnValue.length);
    console.log('- Return Value (hex):', Buffer.from(result.returnValue).toString('hex'));
  } else {
    console.log('- No return value found');
  }

  // Try extracting the value
  const extracted = extractUint256(result);
  console.log('- Extracted Value:', extracted.toString());
}

async function showCurrentPrice(title: string, analyzer: any, functions: Map<string | undefined, any>, contractAddr: string, caller: string) {
  const tokenReserveFunc = functions.get('tokenReserve');
  const ethReserveFunc = functions.get('ethReserve');

  if (tokenReserveFunc && ethReserveFunc) {
    const [tokenResult, ethResult] = await Promise.all([
      analyzer.callContract({
        from: caller,
        to: contractAddr,
        value: BigInt(0),
        data: tokenReserveFunc.selector.slice(2),
        gasLimit: BigInt(200000),
      }),
      analyzer.callContract({
        from: caller,
        to: contractAddr,
        value: BigInt(0),
        data: ethReserveFunc.selector.slice(2),
        gasLimit: BigInt(200000),
      }),
    ]);

    const tokenReserve = extractUint256(tokenResult);
    const ethReserve = extractUint256(ethResult);

    if (tokenReserve > 0 && ethReserve > 0) {
      const priceInWei = (ethReserve * BigInt(10 ** 18)) / tokenReserve;
      const priceInEth = Number(priceInWei) / 10 ** 18;
      console.log(`💰 ${title}: ${priceInEth.toFixed(8)} ETH per token`);
      console.log(`   📊 Reserves: ${tokenReserve / BigInt(10 ** 18)} tokens, ${ethReserve / BigInt(10 ** 18)} ETH\n`);
    }
  }
}

main().catch(console.error);
