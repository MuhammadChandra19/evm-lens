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
import ActionRecorder from './action-recorder';

export type EVMState = {
  actionRecorder: ActionRecorder;
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
  setActionRecorder: (actionRecorder: ActionRecorder) => void;
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
  getActionHistory: () => ActionSnapshot[];
  clearActionHistory: () => void;
};

export type EVMStore = EVMState & EVMAction;

export type ExecutionResult =
  | (CallResult & {
      steps: ExecutionStep[];
    })
  | null;

export type ContractDeploymentResult = DeploymentResult;

// Action Snapshot System Types
export type ActionType =
  | "DEPLOY_CONTRACT"
  | "CREATE_ACCOUNT"
  | "FUND_ACCOUNT"
  | "CALL_FUNCTION"
  | "REGISTER_ACCOUNT";

export type ActionSnapshot = {
  id: string;
  type: ActionType;
  timestamp: number;
  payload: unknown;
  // result?: unknown;
};

export type ActionHistory = {
  snapshots: ActionSnapshot[];
};

export type ReplayableAction = {
  type: ActionType;
  payload: unknown;
  execute: (payload: unknown, evmStore: EVMStore) => Promise<unknown>;
};
