import EVMAnalyzer from "@/service/evm-analyzer";
import {
  CallResult,
  ContractMetadata,
  ExecutionStep,
  FunctionInfo,
  DeploymentResult,
  TxData,
  ContractAnalysis,
} from "@/service/evm-analyzer/types";
import { Address } from "@ethereumjs/util";

export type PlaygroundState = {
  contractAddress?: Address;
  constructorBytecode: string;
  abi: ContractMetadata;
  functions?: Map<string | undefined, FunctionInfo>;
  ownerAddress?: Address;
  totalSupply: bigint;
  decimals: number;
  evm?: EVMAnalyzer;
};

export type CreateNewPlaygroundPayload = {
  contractAddress: string;
  constructorBytecode: string;
  abi: ContractMetadata;
  ownerAddress: string;
  totalSupply: bigint;
  decimals: number;
};

export type PlaygroundAction = {
  createInitialState: (state: PlaygroundState) => void;
  createNewPlayground: (payload: CreateNewPlaygroundPayload) => Promise<{
    success: boolean;
    error: unknown;
  }>;

  // Basic EVM functions
  createAccount: (address: string) => Promise<Address | null>;
  fundAccount: (
    address: string,
    balance: bigint,
  ) => Promise<{
    success: boolean;
    error: unknown;
  }>;
  deployContract: (bytecode: string) => Promise<DeploymentResult | null>;
  deployContractToAddress: (
    address: string,
    bytecode: string,
  ) => Promise<{ analysis: ContractAnalysis } | null>;
  callContract: (txData: TxData) => Promise<CallResult | null>;

  // Token functions
  getTokenBalance: (userAddress: string) => Promise<bigint>;
  approveTokens: (
    userAddress: string,
    spenderAddress: string,
    amount: bigint,
  ) => Promise<ExecutionResult>;
  transferTokens: (
    fromAddress: string,
    toAddress: string,
    amount: bigint,
  ) => Promise<ExecutionResult>;

  // DEX trading functions
  addLiquidity: (
    userAddress: string,
    tokenAmount: bigint,
    ethAmount: bigint,
  ) => Promise<ExecutionResult>;
  swapEthForTokens: (
    userAddress: string,
    ethAmount: bigint,
  ) => Promise<ExecutionResult>;
  swapTokensForEth: (
    userAddress: string,
    tokenAmount: bigint,
  ) => Promise<ExecutionResult>;

  // Price & reserve functions
  getReserves: () => Promise<{ tokenReserve: bigint; ethReserve: bigint }>;
  getTokenPrice: () => Promise<number>;
  getEthAmountForTokens: (tokenAmount: bigint) => Promise<bigint>;
  getTokenAmountForEth: (ethAmount: bigint) => Promise<bigint>;

  // Persistence helpers
  initializeEVM: () => Promise<void>;
  saveEVMState: () => Promise<void>;
  clearPersistedState: () => void;
};

export type PlaygroundStore = PlaygroundState & PlaygroundAction;

export type ExecutionResult =
  | (CallResult & {
      steps: ExecutionStep[];
    })
  | null;
