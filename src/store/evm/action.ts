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
import { Address } from "@/service/evm-analyzer/utils/address";

export const deployContractToEVM = async (
  payload: CreateNewEVMPayload,
  set: (partial: Partial<EVMState>) => void,
  get: () => EVMState,
): Promise<ContractDeploymentResult | null> => {
  const evm = get().evm;
  if (!evm) return null;

  const owner = new Address(Buffer.from(payload.ownerAddress, "hex"));
  const ownerAddress = await createAccount(owner, get);
  if (!ownerAddress) return null;

  const contract = new Address(Buffer.from(payload.contractAddress, "hex"));
  const contractAddress = await createAccount(contract, get);
  if (!contractAddress) return null;

  const res = await evm.deployContract(
    ownerAddress,
    payload.constructorBytecode,
    contractAddress,
  );
  if (!res.success) return null;
  set({
    abiMetadata: new AbiValidator(payload.abi),
    abi: payload.abi,
    ownerAddress,
    contractAddress,
  });

  return res;
};

export const callFunction = async (
  executorAddres: Address,
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
      to: contractAddress,
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

export const createAccount = async (address: Address, get: () => EVMState) => {
  const evm = get().evm;
  if (!evm) return null;
  const account = await evm.createAccount(address);
  return account;
};

export const fundAccount = async (
  address: Address,
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
