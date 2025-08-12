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
function encodeUint256(value: bigint): string {
  return value.toString(16).padStart(64, '0');
}

function encodeAddress(address: string): string {
  const cleanAddr = address.startsWith('0x') ? address.slice(2) : address;
  return cleanAddr.padStart(64, '0');
}

function extractUint256(result: any): bigint {
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
  console.log('🚀 SimpleToken DEX - Clean Simulation\n');

  const analyzer = await EVMAnalyzer.create();

  try {
    // === ADDRESSES ===
    const contractAddr = new Address(Buffer.from('1234567890123456789012345678901234567890', 'hex'));
    const devAddr = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    const user1Addr = '0x1111111111111111111111111111111111111111';
    const user2Addr = '0x2222222222222222222222222222222222222222';
    const user3Addr = '0x3333333333333333333333333333333333333333';

    console.log('📋 Setup:');
    console.log(`Contract: ${contractAddr.toString()}`);
    console.log(`Developer: ${devAddr}`);
    console.log(`User1-3: ${user1Addr}, ${user2Addr}, ${user3Addr}\n`);

    // === FUND ACCOUNTS ===
    console.log('💰 Developer getting initial funds...');
    await analyzer.fundAccount(devAddr, BigInt('1000000000000000000000')); // 1000 ETH
    await analyzer.fundAccount(user1Addr, BigInt('50000000000000000000')); // 50 ETH
    await analyzer.fundAccount(user2Addr, BigInt('50000000000000000000')); // 50 ETH
    await analyzer.fundAccount(user3Addr, BigInt('50000000000000000000')); // 50 ETH
    console.log('✅ All accounts funded\n');

    // === DEPLOY CONTRACT ===
    console.log('🏗️ Developer deploying contract...');

    await analyzer.createAccount(contractAddr.toString());

    // Extract runtime bytecode from constructor
    const runtimeStart = tokenBytecode.indexOf('6080604052600436');
    const runtimeBytecode = tokenBytecode.slice(runtimeStart);
    await analyzer.deployContractToAddress(contractAddr.toString(), runtimeBytecode);

    console.log('✅ Contract deployed\n');

    // === INITIALIZE CONTRACT STATE ===
    console.log('🔧 Initializing contract state...');

    // Helper function to set storage
    async function setStorage(analyzer: any, contractAddr: string, slot: number | string, value: string) {
      let slotHex: string;
      if (typeof slot === 'number') {
        slotHex = slot.toString(16).padStart(64, '0');
      } else {
        slotHex = slot.padStart(64, '0');
      }

      const valueHex = value.startsWith('0x') ? value.slice(2) : value;
      const cleanAddr = contractAddr.startsWith('0x') ? contractAddr.slice(2) : contractAddr;
      const addr = new Address(Buffer.from(cleanAddr, 'hex'));

      await analyzer.stateManagerService.stateManager.putStorage(addr, Buffer.from(slotHex, 'hex'), Buffer.from(valueHex.padStart(64, '0'), 'hex'));
    }

    // Helper to calculate balance mapping slot
    function getBalanceSlot(address: string, mappingSlot: number): string {
      const cleanAddr = address.startsWith('0x') ? address.slice(2) : address;
      const addrBuffer = Buffer.from(cleanAddr.padStart(64, '0'), 'hex');
      const slotBuffer = Buffer.from(mappingSlot.toString(16).padStart(64, '0'), 'hex');

      const combined = Buffer.concat([addrBuffer, slotBuffer]);
      const hash = keccak256(combined);

      return Buffer.from(hash).toString('hex');
    }

    const totalSupply = BigInt(1000000) * BigInt(10 ** 18); // 1M tokens

    // Set owner (slot 6)
    await setStorage(analyzer, contractAddr.toString(), 6, devAddr.slice(2));

    // Set total supply (slot 3)
    await setStorage(analyzer, contractAddr.toString(), 3, totalSupply.toString(16));

    // Set developer's balance (mapping slot 4)
    const devBalanceSlot = getBalanceSlot(devAddr, 4);
    await setStorage(analyzer, contractAddr.toString(), devBalanceSlot, totalSupply.toString(16));

    console.log('✅ Contract state initialized\n');

    // === GET CONTRACT FUNCTIONS ===
    const analysis = BytecodeAnalyzer.analyzeWithMetadata(runtimeBytecode, contractMetadata);
    const functions = new Map(analysis.functions.map((f) => [f.name, f]));

    // === ADD LIQUIDITY ===
    console.log('🏊 Developer adding liquidity...');

    // Approve contract to spend tokens
    const approveFunc = functions.get('approve');
    if (approveFunc) {
      const tokenAmount = BigInt(500000) * BigInt(10 ** 18); // 500k tokens
      const data = approveFunc.selector.slice(2) + encodeAddress(contractAddr.toString()) + encodeUint256(tokenAmount);

      await analyzer.callContract({
        from: devAddr,
        to: contractAddr.toString(),
        value: BigInt(0),
        data,
        gasLimit: BigInt(200000),
      });
    }

    // Add liquidity
    const addLiquidityFunc = functions.get('addLiquidity');
    if (addLiquidityFunc) {
      const tokenAmount = BigInt(500000) * BigInt(10 ** 18); // 500k tokens
      const ethAmount = BigInt(100) * BigInt(10 ** 18); // 100 ETH
      const data = addLiquidityFunc.selector.slice(2) + encodeUint256(tokenAmount);

      const liquidityResult = await analyzer.callContract({
        from: devAddr,
        to: contractAddr.toString(),
        value: ethAmount,
        data,
        gasLimit: BigInt(500000),
      });

      console.log(`✅ Add Liquidity: ${liquidityResult.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   Gas used: ${liquidityResult.gasUsed?.toString()}\n`);
    }

    // === TRADING FLOW ===
    console.log('🔄 Starting trading flow...\n');

    const swapEthFunc = functions.get('swapEthForTokens');
    const swapTokenFunc = functions.get('swapTokensForEth');

    // Users buy tokens
    if (swapEthFunc) {
      console.log('💰 User1 buying tokens with 10 ETH...');
      const buyResult1 = await analyzer.callContract({
        from: user1Addr,
        to: contractAddr.toString(),
        value: BigInt(10) * BigInt(10 ** 18),
        data: swapEthFunc.selector.slice(2),
        gasLimit: BigInt(300000),
      });
      console.log(`✅ User1 buy: ${buyResult1.success ? 'SUCCESS' : 'FAILED'} | Gas: ${buyResult1.gasUsed?.toString()}`);

      console.log('💰 User2 buying tokens with 15 ETH...');
      const buyResult2 = await analyzer.callContract({
        from: user2Addr,
        to: contractAddr.toString(),
        value: BigInt(15) * BigInt(10 ** 18),
        data: swapEthFunc.selector.slice(2),
        gasLimit: BigInt(300000),
      });
      console.log(`✅ User2 buy: ${buyResult2.success ? 'SUCCESS' : 'FAILED'} | Gas: ${buyResult2.gasUsed?.toString()}`);

      console.log('💰 User3 buying tokens with 5 ETH...');
      const buyResult3 = await analyzer.callContract({
        from: user3Addr,
        to: contractAddr.toString(),
        value: BigInt(5) * BigInt(10 ** 18),
        data: swapEthFunc.selector.slice(2),
        gasLimit: BigInt(300000),
      });
      console.log(`✅ User3 buy: ${buyResult3.success ? 'SUCCESS' : 'FAILED'} | Gas: ${buyResult3.gasUsed?.toString()}\n`);
    }

    // User1 sells tokens
    if (swapTokenFunc) {
      console.log('💸 User1 selling 1000 tokens for ETH...');
      const sellAmount = BigInt(1000) * BigInt(10 ** 18);
      const data = swapTokenFunc.selector.slice(2) + encodeUint256(sellAmount);

      const sellResult = await analyzer.callContract({
        from: user1Addr,
        to: contractAddr.toString(),
        value: BigInt(0),
        data,
        gasLimit: BigInt(300000),
      });
      console.log(`✅ User1 sell: ${sellResult.success ? 'SUCCESS' : 'FAILED'} | Gas: ${sellResult.gasUsed?.toString()}\n`);
    }

    // === FINAL RESULTS ===
    console.log('📊 Final Results:');

    // Check reserves
    const tokenReserveFunc = functions.get('tokenReserve');
    const ethReserveFunc = functions.get('ethReserve');

    if (tokenReserveFunc && ethReserveFunc) {
      const [tokenRes, ethRes] = await Promise.all([
        analyzer.callContract({
          from: devAddr,
          to: contractAddr.toString(),
          value: BigInt(0),
          data: tokenReserveFunc.selector.slice(2),
          gasLimit: BigInt(100000),
        }),
        analyzer.callContract({
          from: devAddr,
          to: contractAddr.toString(),
          value: BigInt(0),
          data: ethReserveFunc.selector.slice(2),
          gasLimit: BigInt(100000),
        }),
      ]);

      const tokenReserve = extractUint256(tokenRes);
      const ethReserve = extractUint256(ethRes);

      console.log(`💎 Token Reserve: ${tokenReserve / BigInt(10 ** 18)} tokens`);
      console.log(`💎 ETH Reserve: ${ethReserve / BigInt(10 ** 18)} ETH`);

      if (tokenReserve > 0 && ethReserve > 0) {
        const price = Number((ethReserve * BigInt(10 ** 18)) / tokenReserve) / 10 ** 18;
        console.log(`💰 Token Price: ${price.toFixed(8)} ETH per token`);
      }
    }

    console.log('\n🎉 Simulation Complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
