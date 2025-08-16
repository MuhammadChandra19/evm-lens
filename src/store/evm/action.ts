import EVMAnalyzer, { CallResult, ExecutionStep } from "@/service/evm-analyzer";
import { Address } from "@ethereumjs/util";
import {
  CreateNewEVMPayload,
  ExecutionResult,
  EVMState,
} from "./types";
import { keccak256 } from "ethereum-cryptography/keccak";
import { BytecodeAnalyzer } from "@/service/evm-analyzer/utils/bytecode-analyzer";
import { ERRORS } from "./errors";
import { AbiFunction } from '@/service/evm-analyzer/abi/types';
import { generateFunctionHash, generateInputHash } from '@/service/evm-analyzer/abi/util';
import { AbiValidator } from '@/service/evm-analyzer/abi';

export const createNewEVM = async (
  payload: CreateNewEVMPayload,
  set: (partial: Partial<EVMState>) => void,
  get: () => EVMState,
) => {
  try {
    const evm = get().evm;
    if (!evm) return { success: false, error: "EVM not initialized" };
    const contractAddress = await evm.createAccount(payload.contractAddress);

    const runtimeStart =
      payload.constructorBytecode.indexOf("6080604052600436");
    const runtimeBytecode = payload.constructorBytecode.slice(runtimeStart);
    await evm.deployContractToAddress(
      payload.contractAddress,
      runtimeBytecode,
    );

    const totalSupply =
      payload.totalSupply * BigInt(10 ** payload.decimals);
    await initializeContractState(
      evm,
      payload.contractAddress,
      payload.ownerAddress,
      totalSupply,
    );

    const analysis = BytecodeAnalyzer.analyzeWithMetadata(
      runtimeBytecode,
      payload.abi,
    );
    const functions = new Map(analysis.functions.map((f) => [f.name, f]));

    const ownerAddress = await createAccount(payload.ownerAddress, get)

    set({
      contractAddress,
      abi: payload.abi,
      functions,
      totalSupply,
      ownerAddress: ownerAddress!,
      abiMetadata: new AbiValidator(payload.abi)
    });

    return { success: true, error: null };
  } catch (e) {
    console.error("DEX deployment failed:", e);
    return { success: false, error: e };
  }
};

export const callFunction = async (
  executorAddres: string,
  func: AbiFunction,
  args: string[],
  gasLimit: number,
  get: () => EVMState,
): Promise<ExecutionResult> => {
  const evm = get().evm;
  if (!evm) return null;

  const contractAddress = get().contractAddress;
  if (!contractAddress) return null;

  let data = generateFunctionHash(func)
  data += generateInputHash(func, args)

  const result = await evm.callContract({
    data,
    from: executorAddres,
    to: contractAddress.toString(),
    gasLimit: BigInt(gasLimit),
    value: 0n
  }, {
    includeMemory: true,
    includeStack: true,
    includeStorage: true,
  })
  return result
}

const initializeContractState = async (
  evm: EVMAnalyzer,
  contractAddress: string,
  ownerAddress: string,
  totalSupply: bigint,
) => {
  const setStorage = async (slot: number | string, value: string) => {
    let slotHex: string;
    if (typeof slot === "number") {
      slotHex = slot.toString(16).padStart(64, "0");
    } else {
      slotHex = slot.padStart(64, "0");
    }

    const valueHex = value.startsWith("0x") ? value.slice(2) : value;
    const cleanAddr = contractAddress.startsWith("0x")
      ? contractAddress.slice(2)
      : contractAddress;
    const addr = new Address(Buffer.from(cleanAddr, "hex"));

    await evm.stateManagerService.stateManager.putStorage(
      addr,
      Buffer.from(slotHex, "hex"),
      Buffer.from(valueHex.padStart(64, "0"), "hex"),
    );
  };

  // Helper to calculate balance mapping slot
  const getBalanceSlot = (address: string, mappingSlot: number): string => {
    const cleanAddr = address.startsWith("0x") ? address.slice(2) : address;
    const addrBuffer = Buffer.from(cleanAddr.padStart(64, "0"), "hex");
    const slotBuffer = Buffer.from(
      mappingSlot.toString(16).padStart(64, "0"),
      "hex",
    );

    const combined = Buffer.concat([addrBuffer, slotBuffer]);
    const hash = keccak256(new Uint8Array(combined));

    return Buffer.from(hash).toString("hex");
  };

  // Set owner (slot 6)
  await setStorage(6, ownerAddress.slice(2));

  // Set total supply (slot 3) - now uses parameter
  await setStorage(3, totalSupply.toString(16));

  // Set owner's balance (mapping slot 4) - now uses parameter
  const ownerBalanceSlot = getBalanceSlot(ownerAddress, 4);
  await setStorage(ownerBalanceSlot, totalSupply.toString(16));
};

export const createAccount = async (
  address: string,
  get: () => EVMState,
) => {
  const evm = get().evm;
  if (!evm) return null;
  const account = await evm.createAccount(address);
  return account;
};

export const fundAccount = async (
  address: string,
  balance: bigint,
  get: () => EVMState,
) => {
  const evm = get().evm;
  if (!evm) return { success: false, error: ERRORS.EVM_NOT_INITIALIZED };

  try {
    await evm.fundAccount(address, balance);
    return { success: true, error: null };
  } catch (e) {
    console.error("DEX deployment failed:", e);
    return { success: false, error: e };
  }
};

export const getTokenBalance = async (
  userAdress: string,
  get: () => EVMState,
): Promise<bigint> => {
  const evm = get().evm;
  if (!evm) return BigInt(0);

  const contractAddress = get().contractAddress;
  if (!contractAddress) return BigInt(0);

  const functions = get().functions;
  if (!functions) return BigInt(0);

  const balanceOfFunc = functions.get("balanceOf");
  if (!balanceOfFunc) return BigInt(0);

  const data = balanceOfFunc.selector.slice(2) + encodeAddress(userAdress);
  const result = await evm.callContract({
    from: userAdress,
    to: contractAddress.toString(),
    value: BigInt(0),
    data,
    gasLimit: BigInt(200000),
  });

  return extractUint256(result as CallResult & { steps: ExecutionStep[] });
};

export const transferTokens = async (
  fromAddress: string,
  toAddress: string,
  amount: bigint,
  get: () => EVMState,
): Promise<ExecutionResult> => {
  const evm = get().evm;
  if (!evm) return null;

  const contractAddress = get().contractAddress;
  if (!contractAddress) return null;

  const functions = get().functions;
  if (!functions) return null;

  const transferFunc = functions.get("transfer");
  if (!transferFunc) return null;

  const data =
    transferFunc.selector.slice(2) +
    encodeAddress(toAddress) +
    encodeUint256(amount);
  return evm.callContract({
    from: fromAddress,
    to: contractAddress.toString(),
    value: BigInt(0),
    data,
    gasLimit: BigInt(20000),
  });
};

export const deployContract = async (
  bytecode: string,
  get: () => EVMState,
) => {
  const evm = get().evm;
  if (!evm) return null;
  return evm.deployContract(bytecode);
};

export const deployContractToAddress = async (
  address: string,
  bytecode: string,
  get: () => EVMState,
) => {
  const evm = get().evm;
  if (!evm) return null;
  return evm.deployContractToAddress(address, bytecode);
};

export const callContract = async (
  txData: {
    from: string;
    to: string;
    value: bigint;
    data: string;
    gasLimit: bigint;
  },
  get: () => EVMState,
) => {
  const evm = get().evm;
  if (!evm) return null;
  return evm.callContract(txData);
};

export const approveTokens = async (
  userAddress: string,
  spenderAddress: string,
  amount: bigint,
  get: () => EVMState,
): Promise<ExecutionResult> => {
  const evm = get().evm;
  if (!evm) return null;

  const contractAddress = get().contractAddress;
  if (!contractAddress) return null;

  const functions = get().functions;
  if (!functions) return null;

  const approveFunc = functions.get("approve");
  if (!approveFunc) return null;

  const data =
    approveFunc.selector.slice(2) +
    encodeAddress(spenderAddress) +
    encodeUint256(amount);

  return evm.callContract({
    from: userAddress,
    to: contractAddress.toString(),
    value: BigInt(0),
    data,
    gasLimit: BigInt(200000),
  });
};

export const addLiquidity = async (
  userAddress: string,
  tokenAmount: bigint,
  ethAmount: bigint,
  get: () => EVMState,
): Promise<ExecutionResult> => {
  const evm = get().evm;
  if (!evm) return null;

  const contractAddress = get().contractAddress;
  if (!contractAddress) return null;

  const functions = get().functions;
  if (!functions) return null;

  // First approve tokens
  await approveTokens(
    userAddress,
    contractAddress.toString(),
    tokenAmount,
    get,
  );

  // Then add liquidity
  const addLiquidityFunc = functions.get("addLiquidity");
  if (!addLiquidityFunc) return null;

  const data = addLiquidityFunc.selector.slice(2) + encodeUint256(tokenAmount);

  return evm.callContract({
    from: userAddress,
    to: contractAddress.toString(),
    value: ethAmount,
    data,
    gasLimit: BigInt(500000),
  });
};

export const swapEthForTokens = async (
  userAddress: string,
  ethAmount: bigint,
  get: () => EVMState,
): Promise<ExecutionResult> => {
  const evm = get().evm;
  if (!evm) return null;

  const contractAddress = get().contractAddress;
  if (!contractAddress) return null;

  const functions = get().functions;
  if (!functions) return null;

  const swapFunc = functions.get("swapEthForTokens");
  if (!swapFunc) return null;

  return evm.callContract({
    from: userAddress,
    to: contractAddress.toString(),
    value: ethAmount,
    data: swapFunc.selector.slice(2),
    gasLimit: BigInt(300000),
  });
};

export const swapTokensForEth = async (
  userAddress: string,
  tokenAmount: bigint,
  get: () => EVMState,
): Promise<ExecutionResult> => {
  const evm = get().evm;
  if (!evm) return null;

  const contractAddress = get().contractAddress;
  if (!contractAddress) return null;

  const functions = get().functions;
  if (!functions) return null;

  const swapFunc = functions.get("swapTokensForEth");
  if (!swapFunc) return null;

  const data = swapFunc.selector.slice(2) + encodeUint256(tokenAmount);

  return evm.callContract({
    from: userAddress,
    to: contractAddress.toString(),
    value: BigInt(0),
    data,
    gasLimit: BigInt(300000),
  });
};

export const getReserves = async (
  get: () => EVMState,
): Promise<{ tokenReserve: bigint; ethReserve: bigint }> => {
  const evm = get().evm;
  if (!evm) return { tokenReserve: BigInt(0), ethReserve: BigInt(0) };

  const contractAddress = get().contractAddress;
  if (!contractAddress)
    return { tokenReserve: BigInt(0), ethReserve: BigInt(0) };

  const functions = get().functions;
  if (!functions) return { tokenReserve: BigInt(0), ethReserve: BigInt(0) };

  const tokenReserveFunc = functions.get("tokenReserve");
  const ethReserveFunc = functions.get("ethReserve");

  if (!tokenReserveFunc || !ethReserveFunc) {
    return { tokenReserve: BigInt(0), ethReserve: BigInt(0) };
  }

  const [tokenRes, ethRes] = await Promise.all([
    evm.callContract({
      from: contractAddress.toString(),
      to: contractAddress.toString(),
      value: BigInt(0),
      data: tokenReserveFunc.selector.slice(2),
      gasLimit: BigInt(100000),
    }),
    evm.callContract({
      from: contractAddress.toString(),
      to: contractAddress.toString(),
      value: BigInt(0),
      data: ethReserveFunc.selector.slice(2),
      gasLimit: BigInt(100000),
    }),
  ]);

  return {
    tokenReserve: extractUint256(
      tokenRes as CallResult & { steps: ExecutionStep[] },
    ),
    ethReserve: extractUint256(
      ethRes as CallResult & { steps: ExecutionStep[] },
    ),
  };
};

export const getTokenPrice = async (
  get: () => EVMState,
): Promise<number> => {
  const { tokenReserve, ethReserve } = await getReserves(get);

  if (tokenReserve > 0 && ethReserve > 0) {
    return Number((ethReserve * BigInt(10 ** 18)) / tokenReserve) / 10 ** 18;
  }

  return 0;
};

export const getEthAmountForTokens = async (
  tokenAmount: bigint,
  get: () => EVMState,
): Promise<bigint> => {
  const evm = get().evm;
  if (!evm) return BigInt(0);

  const contractAddress = get().contractAddress;
  if (!contractAddress) return BigInt(0);

  const functions = get().functions;
  if (!functions) return BigInt(0);

  const getEthFunc = functions.get("getEthAmountForTokens");
  if (!getEthFunc) return BigInt(0);

  const data = getEthFunc.selector.slice(2) + encodeUint256(tokenAmount);
  const result = await evm.callContract({
    from: contractAddress.toString(),
    to: contractAddress.toString(),
    value: BigInt(0),
    data,
    gasLimit: BigInt(100000),
  });

  return extractUint256(result as CallResult & { steps: ExecutionStep[] });
};

export const getTokenAmountForEth = async (
  ethAmount: bigint,
  get: () => EVMState,
): Promise<bigint> => {
  const evm = get().evm;
  if (!evm) return BigInt(0);

  const contractAddress = get().contractAddress;
  if (!contractAddress) return BigInt(0);

  const functions = get().functions;
  if (!functions) return BigInt(0);

  const getTokenFunc = functions.get("getTokenAmountForEth");
  if (!getTokenFunc) return BigInt(0);

  const data = getTokenFunc.selector.slice(2) + encodeUint256(ethAmount);
  const result = await evm.callContract({
    from: contractAddress.toString(),
    to: contractAddress.toString(),
    value: BigInt(0),
    data,
    gasLimit: BigInt(100000),
  });

  return extractUint256(result as CallResult & { steps: ExecutionStep[] });
};

const encodeUint256 = (value: bigint): string => {
  return value.toString(16).padStart(64, "0");
};

const encodeAddress = (address: string): string => {
  const cleanAddr = address.startsWith("0x") ? address.slice(2) : address;
  return cleanAddr.padStart(64, "0");
};

const extractUint256 = (
  result: CallResult & {
    steps: ExecutionStep[];
  },
): bigint => {
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
