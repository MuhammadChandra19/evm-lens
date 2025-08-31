import { Address } from '@ethereumjs/util';
import { Abi, AbiFunction, AbiEvent, AbiType } from '@/service/evm-analyzer/abi/types';
import { SnapshotType } from '@/repository/snapshot/entity';
import { FlowData } from '@/service/evm-analyzer/utils/react-flow-parser';

// Playground configuration
export interface PlaygroundConfig {
  id: number;
  name: string;
  contractAddress: Address;
  ownerAddress: Address;
  decimals: number;
  totalSupply: bigint;
  abi: Abi;
  createdAt: Date;
  isActive?: boolean;
}

// Transaction record
export interface Transaction {
  id: string;
  playgroundId: number;
  type: SnapshotType;
  from: string;
  to?: string;
  functionName?: string;
  args?: unknown[];
  value?: bigint;
  gasUsed: bigint;
  success: boolean;
  timestamp: Date;
  blockNumber?: number;
  returnValue?: string;
}

// Token balance
export interface TokenBalance {
  contractAddress: string;
  accountAddress: string;
  balance: bigint;
  decimals: number;
  symbol?: string;
  lastUpdated: Date;
}

// Contract metadata
export interface ContractMetadata {
  address: string;
  name: string;
  abi: Abi;
  deployedAt: Date;
  deploymentTxHash?: string;
  totalSupply?: bigint;
  decimals?: number;
  symbol?: string;
}

// UI State types (migrated from old playground store)
export interface ActiveFunction {
  func: AbiFunction | AbiEvent;
  type: AbiType;
}

export interface ResultHistory {
  id: string;
  functionName: string;
  functionDefinitions: ActiveFunction;
  executedAt: string;
  executionFlow: FlowData;
  hasOutput: boolean;
  result: string;
}

// Store state
export interface PlaygroundStoreState {
  // Per-playground configurations
  configs: Map<number, PlaygroundConfig>;

  // Transaction history per playground
  transactions: Map<number, Transaction[]>;

  // Token balances per playground
  tokenBalances: Map<number, Map<string, TokenBalance>>;

  // Contract metadata per playground
  contracts: Map<number, ContractMetadata>;

  // UI State per playground (migrated from old playground store)
  activeFunction: Map<number, ActiveFunction>;
  executionHistory: Map<number, ResultHistory[]>;

  // Current active playground
  activePlaygroundId?: number;
}

// Store actions
export interface PlaygroundStoreActions {
  // Configuration management
  setPlaygroundConfig: (config: PlaygroundConfig) => void;
  getPlaygroundConfig: (id: number) => PlaygroundConfig | undefined;
  updatePlaygroundConfig: (id: number, updates: Partial<PlaygroundConfig>) => void;
  deletePlaygroundConfig: (id: number) => void;

  // Transaction management
  addTransaction: (transaction: Transaction) => void;
  getTransactionHistory: (id: number) => Transaction[];
  getTransactionById: (playgroundId: number, txId: string) => Transaction | undefined;

  // Token balance management
  setTokenBalance: (playgroundId: number, balance: TokenBalance) => void;
  getTokenBalances: (id: number) => Map<string, TokenBalance>;
  getAccountTokenBalance: (playgroundId: number, accountAddress: string, contractAddress: string) => TokenBalance | undefined;
  updateTokenBalance: (playgroundId: number, accountAddress: string, contractAddress: string, balance: bigint) => void;

  // Contract metadata management
  setContractMetadata: (playgroundId: number, metadata: ContractMetadata) => void;
  getContractMetadata: (playgroundId: number) => ContractMetadata | undefined;
  updateContractMetadata: (playgroundId: number, updates: Partial<ContractMetadata>) => void;

  // Active playground management
  setActivePlayground: (id: number) => void;
  getActivePlayground: () => PlaygroundConfig | undefined;

  // UI State management (migrated from old playground store)
  setActiveFunction: (playgroundId: number, func: ActiveFunction) => void;
  getActiveFunction: (playgroundId: number) => ActiveFunction | undefined;
  saveExecutionResult: (playgroundId: number, result: ResultHistory) => void;
  getExecutionHistory: (playgroundId: number) => ResultHistory[];
  getFunctionLastResult: (playgroundId: number, functionName: string) => ResultHistory | undefined;
  getFunctionResultHistory: (playgroundId: number, functionName: string) => ResultHistory[];

  // Utility methods
  getAllPlaygrounds: () => PlaygroundConfig[];
  getPlaygroundStats: (id: number) => {
    transactionCount: number;
    tokenBalanceCount: number;
    lastActivity?: Date;
  };

  // Cleanup methods
  clearPlaygroundData: (id: number) => void;
  clearAllData: () => void;
}

// Combined store type
export type PlaygroundStore = PlaygroundStoreState & PlaygroundStoreActions;
