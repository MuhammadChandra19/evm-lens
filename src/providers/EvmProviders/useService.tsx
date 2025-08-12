import EVMAnalyzer from '@/service/evm-analyzer';
import { Address } from '@ethereumjs/util';
import { BytecodeAnalyzer } from '@/service/evm-analyzer/utils/bytecode-analyzer';
import { CallResult, ContractMetadata, ExecutionStep, FunctionInfo, TxData } from '@/service/evm-analyzer/types';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { useEffect, useRef, useState } from "react";

interface DEXState {
  contractAddress?: string;
  functions?: Map<string | undefined, FunctionInfo>;
  isInitialized: boolean;
}

const useService = () => {
  const evmRef = useRef<EVMAnalyzer | null>(null);
  const [dexState, setDexState] = useState<DEXState>({ isInitialized: false });

  useEffect(() => {
    (async () => {
      const evm = await EVMAnalyzer.create();
      evmRef.current = evm;
    })();
  }, []);

  // === UTILITY FUNCTIONS ===
  const encodeUint256 = (value: bigint): string => {
    return value.toString(16).padStart(64, '0');
  };

  const encodeAddress = (address: string): string => {
    const cleanAddr = address.startsWith('0x') ? address.slice(2) : address;
    return cleanAddr.padStart(64, '0');
  };

  const extractUint256 = (result: CallResult & {
    steps: ExecutionStep[];
  }): bigint => {
    if (result?.returnValue && result.returnValue.length >= 32) {
      const bytes = result.returnValue.slice(0, 32);
      let value = BigInt(0);
      for (let i = 0; i < bytes.length; i++) {
        value = (value << BigInt(8)) + BigInt(bytes[i]);
      }
      return value;
    }
    return BigInt(0);
  };

  // === BASIC EVM FUNCTIONS ===
  const createAccount = async (address: string) => {
    if (!evmRef.current) return;
    return evmRef.current.createAccount(address);
  };

  const fundAccount = async (address: string, amount: bigint) => {
    if (!evmRef.current) return;
    return evmRef.current.fundAccount(address, amount);
  };

  const deployContract = async (bytecode: string) => {
    if (!evmRef.current) return;
    return evmRef.current.deployContract(bytecode);
  };

  const deployContractToAddress = async (address: string, bytecode: string) => {
    if (!evmRef.current) return;
    return evmRef.current.deployContractToAddress(address, bytecode);
  };

  const callContract = async (txData: TxData) => {
    if (!evmRef.current) return;
    return evmRef.current.callContract(txData);
  };

  // === DEX DEPLOYMENT ===
  const deployDEXContract = async (
    contractAddress: string,
    constructorBytecode: string,
    contractMetadata: ContractMetadata,
    ownerAddress: string,
    totalSupply: bigint
  ) => {
    if (!evmRef.current) return;

    try {
      await createAccount(contractAddress);

      const runtimeStart = constructorBytecode.indexOf('6080604052600436');
      const runtimeBytecode = constructorBytecode.slice(runtimeStart);
      await deployContractToAddress(contractAddress, runtimeBytecode);

      // Initialize contract state with the provided totalSupply
      await initializeContractState(contractAddress, ownerAddress, totalSupply);

      // Get function mappings
      const analysis = BytecodeAnalyzer.analyzeWithMetadata(runtimeBytecode, contractMetadata);
      const functions = new Map(analysis.functions.map((f) => [f.name, f]));

      setDexState({
        contractAddress,
        functions,
        isInitialized: true,
      });

      return { success: true, contractAddress, functions };
    } catch (error) {
      console.error('DEX deployment failed:', error);
      return { success: false, error };
    }
  };

  // === CONTRACT STATE INITIALIZATION ===
  const initializeContractState = async (
    contractAddress: string,
    ownerAddress: string,
    totalSupply: bigint // Add this parameter
  ) => {
    if (!evmRef.current) return;

    // Helper to set storage
    const setStorage = async (slot: number | string, value: string) => {
      let slotHex: string;
      if (typeof slot === 'number') {
        slotHex = slot.toString(16).padStart(64, '0');
      } else {
        slotHex = slot.padStart(64, '0');
      }

      const valueHex = value.startsWith('0x') ? value.slice(2) : value;
      const cleanAddr = contractAddress.startsWith('0x') ? contractAddress.slice(2) : contractAddress;
      const addr = new Address(Buffer.from(cleanAddr, 'hex'));

      await evmRef.current!.stateManagerService.stateManager.putStorage(
        addr,
        Buffer.from(slotHex, 'hex'),
        Buffer.from(valueHex.padStart(64, '0'), 'hex')
      );
    };

    // Helper to calculate balance mapping slot
    const getBalanceSlot = (address: string, mappingSlot: number): string => {
      const cleanAddr = address.startsWith('0x') ? address.slice(2) : address;
      const addrBuffer = Buffer.from(cleanAddr.padStart(64, '0'), 'hex');
      const slotBuffer = Buffer.from(mappingSlot.toString(16).padStart(64, '0'), 'hex');

      const combined = Buffer.concat([addrBuffer, slotBuffer]);
      const hash = keccak256(combined);

      return Buffer.from(hash).toString('hex');
    };

    // Set owner (slot 6)
    await setStorage(6, ownerAddress.slice(2));

    // Set total supply (slot 3) - now uses parameter
    await setStorage(3, totalSupply.toString(16));

    // Set owner's balance (mapping slot 4) - now uses parameter
    const ownerBalanceSlot = getBalanceSlot(ownerAddress, 4);
    await setStorage(ownerBalanceSlot, totalSupply.toString(16));
  };

  // === TOKEN FUNCTIONS ===
  const getTokenBalance = async (userAddress: string): Promise<bigint> => {
    if (!evmRef.current || !dexState.functions || !dexState.contractAddress) return BigInt(0);

    const balanceOfFunc = dexState.functions.get('balanceOf');
    if (!balanceOfFunc) return BigInt(0);

    const data = balanceOfFunc.selector.slice(2) + encodeAddress(userAddress);
    const result = await callContract({
      from: userAddress,
      to: dexState.contractAddress,
      value: BigInt(0),
      data,
      gasLimit: BigInt(100000),
    });

    return extractUint256(result as CallResult & { steps: ExecutionStep[] });
  };

  const approveTokens = async (userAddress: string, spenderAddress: string, amount: bigint) => {
    if (!evmRef.current || !dexState.functions || !dexState.contractAddress) return;

    const approveFunc = dexState.functions.get('approve');
    if (!approveFunc) return;

    const data = approveFunc.selector.slice(2) + encodeAddress(spenderAddress) + encodeUint256(amount);

    return await callContract({
      from: userAddress,
      to: dexState.contractAddress,
      value: BigInt(0),
      data,
      gasLimit: BigInt(200000),
    });
  };

  const transferTokens = async (fromAddress: string, toAddress: string, amount: bigint) => {
    if (!evmRef.current || !dexState.functions || !dexState.contractAddress) return;

    const transferFunc = dexState.functions.get('transfer');
    if (!transferFunc) return;

    const data = transferFunc.selector.slice(2) + encodeAddress(toAddress) + encodeUint256(amount);

    return await callContract({
      from: fromAddress,
      to: dexState.contractAddress,
      value: BigInt(0),
      data,
      gasLimit: BigInt(200000),
    });
  };

  // === DEX FUNCTIONS ===
  const addLiquidity = async (userAddress: string, tokenAmount: bigint, ethAmount: bigint) => {
    if (!evmRef.current || !dexState.functions || !dexState.contractAddress) return;

    // First approve tokens
    await approveTokens(userAddress, dexState.contractAddress, tokenAmount);

    // Then add liquidity
    const addLiquidityFunc = dexState.functions.get('addLiquidity');
    if (!addLiquidityFunc) return;

    const data = addLiquidityFunc.selector.slice(2) + encodeUint256(tokenAmount);

    return await callContract({
      from: userAddress,
      to: dexState.contractAddress,
      value: ethAmount,
      data,
      gasLimit: BigInt(500000),
    });
  };

  const swapEthForTokens = async (userAddress: string, ethAmount: bigint) => {
    if (!evmRef.current || !dexState.functions || !dexState.contractAddress) return;

    const swapFunc = dexState.functions.get('swapEthForTokens');
    if (!swapFunc) return;

    return await callContract({
      from: userAddress,
      to: dexState.contractAddress,
      value: ethAmount,
      data: swapFunc.selector.slice(2),
      gasLimit: BigInt(300000),
    });
  };

  const swapTokensForEth = async (userAddress: string, tokenAmount: bigint) => {
    if (!evmRef.current || !dexState.functions || !dexState.contractAddress) return;

    const swapFunc = dexState.functions.get('swapTokensForEth');
    if (!swapFunc) return;

    const data = swapFunc.selector.slice(2) + encodeUint256(tokenAmount);

    return await callContract({
      from: userAddress,
      to: dexState.contractAddress,
      value: BigInt(0),
      data,
      gasLimit: BigInt(300000),
    });
  };

  // === PRICE & RESERVE FUNCTIONS ===
  const getReserves = async (): Promise<{ tokenReserve: bigint; ethReserve: bigint }> => {
    if (!evmRef.current || !dexState.functions || !dexState.contractAddress) {
      return { tokenReserve: BigInt(0), ethReserve: BigInt(0) };
    }

    const tokenReserveFunc = dexState.functions.get('tokenReserve');
    const ethReserveFunc = dexState.functions.get('ethReserve');

    if (!tokenReserveFunc || !ethReserveFunc) {
      return { tokenReserve: BigInt(0), ethReserve: BigInt(0) };
    }

    const [tokenRes, ethRes] = await Promise.all([
      callContract({
        from: dexState.contractAddress,
        to: dexState.contractAddress,
        value: BigInt(0),
        data: tokenReserveFunc.selector.slice(2),
        gasLimit: BigInt(100000),
      }),
      callContract({
        from: dexState.contractAddress,
        to: dexState.contractAddress,
        value: BigInt(0),
        data: ethReserveFunc.selector.slice(2),
        gasLimit: BigInt(100000),
      }),
    ]);

    return {
      tokenReserve: extractUint256(tokenRes as CallResult & { steps: ExecutionStep[] }),
      ethReserve: extractUint256(ethRes as CallResult & { steps: ExecutionStep[] }),
    };
  };

  const getTokenPrice = async (): Promise<number> => {
    const { tokenReserve, ethReserve } = await getReserves();

    if (tokenReserve > 0 && ethReserve > 0) {
      return Number((ethReserve * BigInt(10 ** 18)) / tokenReserve) / 10 ** 18;
    }

    return 0;
  };

  const getEthAmountForTokens = async (tokenAmount: bigint): Promise<bigint> => {
    if (!evmRef.current || !dexState.functions || !dexState.contractAddress) return BigInt(0);

    const getEthFunc = dexState.functions.get('getEthAmountForTokens');
    if (!getEthFunc) return BigInt(0);

    const data = getEthFunc.selector.slice(2) + encodeUint256(tokenAmount);
    const result = await callContract({
      from: dexState.contractAddress,
      to: dexState.contractAddress,
      value: BigInt(0),
      data,
      gasLimit: BigInt(100000),
    });

    return extractUint256(result as CallResult & { steps: ExecutionStep[] });
  };

  const getTokenAmountForEth = async (ethAmount: bigint): Promise<bigint> => {
    if (!evmRef.current || !dexState.functions || !dexState.contractAddress) return BigInt(0);

    const getTokenFunc = dexState.functions.get('getTokenAmountForEth');
    if (!getTokenFunc) return BigInt(0);

    const data = getTokenFunc.selector.slice(2) + encodeUint256(ethAmount);
    const result = await callContract({
      from: dexState.contractAddress,
      to: dexState.contractAddress,
      value: BigInt(0),
      data,
      gasLimit: BigInt(100000),
    });

    return extractUint256(result as CallResult & { steps: ExecutionStep[] });
  };

  return {
    // EVM basics
    evm: evmRef.current,
    createAccount,
    fundAccount,
    deployContract,
    deployContractToAddress,
    callContract,

    // DEX deployment
    deployDEXContract,

    // Token functions
    getTokenBalance,
    approveTokens,
    transferTokens,

    // DEX trading
    addLiquidity,
    swapEthForTokens,
    swapTokensForEth,

    // Price & reserves
    getReserves,
    getTokenPrice,
    getEthAmountForTokens,
    getTokenAmountForEth,

    // State
    dexState,
    isInitialized: dexState.isInitialized,
  };
};

export default useService;