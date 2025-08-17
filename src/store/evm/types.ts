import EVMAnalyzer from "@/service/evm-analyzer";
import { AbiValidator } from "@/service/evm-analyzer/abi";
import { Abi, AbiFunction } from "@/service/evm-analyzer/abi/types";
import {
  CallResult,
  ExecutionStep,
  FunctionInfo,
  DeploymentResult,
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
};

export type CreateNewEVMPayload = {
  contractAddress: string;
  constructorBytecode: string;
  abi: Abi;
  ownerAddress: string;
  totalSupply: bigint;
  decimals: number;
};

export type EVMAction = {
  deployContractToEVM: (
    payload: CreateNewEVMPayload,
  ) => Promise<ContractDeploymentResult | null>;

  // Basic EVM functions
  createAccount: (address: string) => Promise<Address | null>;
  fundAccount: (
    address: string,
    balance: bigint,
  ) => Promise<{
    success: boolean;
    error: unknown;
  }>;
  callFunction: (
    executorAddres: string,
    func: AbiFunction,
    args: string[],
    gasLimit: number,
  ) => Promise<ExecutionResult>;

  // Persistence helpers
  initializeEVM: () => Promise<void>;
  saveEVMState: () => Promise<void>;
  clearPersistedState: () => void;
};

export type EVMStore = EVMState & EVMAction;

export type ExecutionResult =
  | (CallResult & {
      steps: ExecutionStep[];
    })
  | null;

export type ContractDeploymentResult = DeploymentResult;
