import { Address } from "@ethereumjs/util";
import {
  Abi,
  AbiFunction,
  AbiEvent,
  AbiType,
} from "@/service/evm-analyzer/abi/types";
import {
  DeploymentResult,
  CallResult,
  ExecutionStep,
} from "@/service/evm-analyzer/types";

// Standard result type for all EVM operations
export interface EVMResult<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
  gasUsed?: bigint;
  gasRefund?: bigint;
}

// Payloads for EVM operations
export interface CreateNewEVMPayload {
  id: number;
  projectName: string;
  contractAddress: string;
  constructorBytecode: string;
  abi: Abi;
  ownerAddress: string;
  decimal: number;
  totalSupply: number;
  initialOwnerBalance: bigint;
}

export interface TxData {
  executorAddress: Address;
  func: AbiFunction | AbiEvent;
  type: AbiType;
  args: string[];
  gasLimit: number;
  ethAmount: bigint;
  playgroundId: number;
}

// Result data types
export interface ContractDeploymentData {
  contractAddress: Address;
  ownerAddress: Address;
  transactionHash?: string;
  deploymentResult: DeploymentResult;
  playgroundId: number;
}

export interface FunctionCallData {
  result: CallResult;
  steps: ExecutionStep[];
  returnValue?: string;
  playgroundId: number;
}

export interface AccountCreationData {
  address: Address;
  balance: bigint;
  nonce: bigint;
  playgroundId: number;
}

export interface AccountFundingData {
  address: Address;
  previousBalance: bigint;
  newBalance: bigint;
  amountAdded: bigint;
  playgroundId: number;
}

export type ExecutionResult =
  | (CallResult & {
      steps: ExecutionStep[];
    })
  | null;

export type ContractDeploymentResult = DeploymentResult;
