import { Address } from '@ethereumjs/util';
import { Abi } from '@/service/evm-analyzer/abi/types';
import { SnapshotType } from '@/repository/snapshot/entity';

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
