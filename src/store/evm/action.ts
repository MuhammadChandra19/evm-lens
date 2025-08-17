import {
  CreateNewEVMPayload,
  ExecutionResult,
  EVMState,
  ContractDeploymentResult,
} from "./types";
import { ERRORS } from "./errors";
import { AbiFunction } from "@/service/evm-analyzer/abi/types";
import {
  generateFunctionHash,
  generateInputHash,
} from "@/service/evm-analyzer/abi/util";
import { AbiValidator } from "@/service/evm-analyzer/abi";

export const deployContractToEVM = async (
  payload: CreateNewEVMPayload,
  set: (partial: Partial<EVMState>) => void,
  get: () => EVMState,
): Promise<ContractDeploymentResult | null> => {
  const evm = get().evm;
  if (!evm) return null;

  const res = await evm.deployContract(
    payload.ownerAddress,
    payload.constructorBytecode,
    payload.contractAddress,
  );
  if (!res.success) return null;

  const contractAddress = await evm.createAccount(payload.contractAddress);
  if (!contractAddress) return null;
  const ownerAddress = await createAccount(payload.ownerAddress, get);
  if (!ownerAddress) return null;
  set({
    abiMetadata: new AbiValidator(payload.abi),
    ownerAddress,
    contractAddress,
  });

  return res;
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

  let data = generateFunctionHash(func);
  data += generateInputHash(func, args);

  const result = await evm.callContract(
    {
      data,
      from: executorAddres,
      to: contractAddress.toString(),
      gasLimit: BigInt(gasLimit),
      value: 0n,
    },
    {
      includeMemory: true,
      includeStack: true,
      includeStorage: true,
    },
  );
  return result;
};

export const createAccount = async (address: string, get: () => EVMState) => {
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
