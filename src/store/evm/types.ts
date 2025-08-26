import { Snapshot } from "@/repository/snapshot/entity";
import EVMAnalyzer from "@/service/evm-analyzer";
import { AbiValidator } from "@/service/evm-analyzer/abi";
import {
  Abi,
  AbiEvent,
  AbiFunction,
  AbiType,
} from "@/service/evm-analyzer/abi/types";
import {
  CallResult,
  ExecutionStep,
  FunctionInfo,
  DeploymentResult,
  AccountInfo,
} from "@/service/evm-analyzer/types";
import { Address } from "@ethereumjs/util";

export type EVMState = {
  contractAddress?: Address;
  constructorBytecode: string;
  abi: Abi;
  abiMetadata?: AbiValidator;
  functions?: Map<string | undefined, FunctionInfo>;
  ownerAddress?: Address;
  totalSupply: bigint;
  decimals: number;
  evm?: EVMAnalyzer;
  accounts?: Record<string, AccountInfo>;
  projectID?: string;
};

export type CreateNewEVMPayload = {
  projectName: string;
  contractAddress: string;
  constructorBytecode: string;
  abi: Abi;
  ownerAddress: string;
  decimal: number;
  totalSupply: number;
  initialOwnerBalance: bigint;
};

export type TxData = {
  executorAddres: Address;
  func: AbiFunction | AbiEvent;
  type: AbiType;
  args: string[];
  gasLimit: number;
  ethAmount: bigint;
};

export type EVMAction = {
  getAccounts: () => AccountInfo[];

  deployContractToEVM: (
    payload: CreateNewEVMPayload,
    shouldRecord?: boolean,
  ) => Promise<ContractDeploymentResult | null>;

  // Basic EVM functions
  createAccount: (
    address: string,
    shouldRecord?: boolean,
  ) => Promise<Address | null>;
  fundAccount: (
    address: Address,
    balance: bigint,
    shouldRecord?: boolean,
  ) => Promise<{
    success: boolean;
    error: unknown;
  }>;
  callFunction: (
    tx: TxData,
    shouldRecord?: boolean,
  ) => Promise<ExecutionResult | undefined>;

  registerAccount: (address: Address, shouldRecord?: boolean) => Promise<void>;

  initializeEVM: () => Promise<void>;

  // Action history methods
  getActionHistory: () => Snapshot[];
  clearActionHistory: () => void;
};

export type EVMStore = EVMState & EVMAction;

export type ExecutionResult =
  | (CallResult & {
      steps: ExecutionStep[];
    })
  | null;

export type ContractDeploymentResult = DeploymentResult;
