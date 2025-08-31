import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { PlaygroundStore, PlaygroundConfig, Transaction, TokenBalance, ContractMetadata } from './types';

const usePlaygroundStore = create<PlaygroundStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    configs: new Map(),
    transactions: new Map(),
    tokenBalances: new Map(),
    contracts: new Map(),
    activeFunction: new Map(),
    executionHistory: new Map(),
    activePlaygroundId: undefined,

    // Configuration management
    setPlaygroundConfig: (config: PlaygroundConfig) => {
      // console.log('🏪 PlaygroundStore - Setting config for playground', config.id, ':', config);
      set((state) => ({
        configs: new Map(state.configs.set(config.id, config)),
      }));
    },

    getPlaygroundConfig: (id: number) => {
      const config = get().configs.get(id);
      // console.log('🏪 PlaygroundStore - Getting config for playground', id, ':', config);
      return config;
    },

    updatePlaygroundConfig: (id: number, updates: Partial<PlaygroundConfig>) => {
      const config = get().configs.get(id);
      if (config) {
        const updatedConfig = { ...config, ...updates };
        set((state) => ({
          configs: new Map(state.configs.set(id, updatedConfig)),
        }));
      }
    },

    deletePlaygroundConfig: (id: number) => {
      set((state) => {
        const newConfigs = new Map(state.configs);
        newConfigs.delete(id);
        return { configs: newConfigs };
      });
    },

    // Transaction management
    addTransaction: (transaction: Transaction) => {
      set((state) => {
        const playgroundTransactions = state.transactions.get(transaction.playgroundId) || [];
        const updatedTransactions = [...playgroundTransactions, transaction];
        return {
          transactions: new Map(state.transactions.set(transaction.playgroundId, updatedTransactions)),
        };
      });
    },

    getTransactionHistory: (id: number) => {
      return get().transactions.get(id) || [];
    },

    getTransactionById: (playgroundId: number, txId: string) => {
      const transactions = get().transactions.get(playgroundId) || [];
      return transactions.find((tx) => tx.id === txId);
    },

    // Token balance management
    setTokenBalance: (playgroundId: number, balance: TokenBalance) => {
      set((state) => {
        const playgroundBalances = state.tokenBalances.get(playgroundId) || new Map();
        const balanceKey = `${balance.accountAddress}-${balance.contractAddress}`;
        const updatedBalances = new Map(playgroundBalances.set(balanceKey, balance));
        return {
          tokenBalances: new Map(state.tokenBalances.set(playgroundId, updatedBalances)),
        };
      });
    },

    getTokenBalances: (id: number) => {
      return get().tokenBalances.get(id) || new Map();
    },

    getAccountTokenBalance: (playgroundId: number, accountAddress: string, contractAddress: string) => {
      const balances = get().tokenBalances.get(playgroundId);
      if (!balances) return undefined;
      const balanceKey = `${accountAddress}-${contractAddress}`;
      return balances.get(balanceKey);
    },

    updateTokenBalance: (playgroundId: number, accountAddress: string, contractAddress: string, balance: bigint) => {
      const existingBalance = get().getAccountTokenBalance(playgroundId, accountAddress, contractAddress);
      if (existingBalance) {
        const updatedBalance: TokenBalance = {
          ...existingBalance,
          balance,
          lastUpdated: new Date(),
        };
        get().setTokenBalance(playgroundId, updatedBalance);
      }
    },

    // Contract metadata management
    setContractMetadata: (playgroundId: number, metadata: ContractMetadata) => {
      set((state) => ({
        contracts: new Map(state.contracts.set(playgroundId, metadata)),
      }));
    },

    getContractMetadata: (playgroundId: number) => {
      return get().contracts.get(playgroundId);
    },

    updateContractMetadata: (playgroundId: number, updates: Partial<ContractMetadata>) => {
      const metadata = get().contracts.get(playgroundId);
      if (metadata) {
        const updatedMetadata = { ...metadata, ...updates };
        set((state) => ({
          contracts: new Map(state.contracts.set(playgroundId, updatedMetadata)),
        }));
      }
    },

    // Active playground management
    setActivePlayground: (id: number) => {
      set({ activePlaygroundId: id });
    },

    getActivePlayground: () => {
      const activeId = get().activePlaygroundId;
      return activeId ? get().configs.get(activeId) : undefined;
    },

    // UI State management (migrated from old playground store)
    setActiveFunction: (playgroundId: number, func) => {
      set((state) => ({
        activeFunction: new Map(state.activeFunction.set(playgroundId, func)),
      }));
    },

    getActiveFunction: (playgroundId: number) => {
      return get().activeFunction.get(playgroundId);
    },

    saveExecutionResult: (playgroundId: number, result) => {
      set((state) => {
        const currentHistory = state.executionHistory.get(playgroundId) || [];
        const newHistory = [result, ...currentHistory];
        return {
          executionHistory: new Map(state.executionHistory.set(playgroundId, newHistory)),
        };
      });
    },

    getExecutionHistory: (playgroundId: number) => {
      return get().executionHistory.get(playgroundId) || [];
    },

    getFunctionLastResult: (playgroundId: number, functionName: string) => {
      const history = get().executionHistory.get(playgroundId) || [];
      return history.find((f) => f.functionName === functionName);
    },

    getFunctionResultHistory: (playgroundId: number, functionName: string) => {
      const history = get().executionHistory.get(playgroundId) || [];
      return history.filter((f) => f.functionName === functionName);
    },

    // Utility methods
    getAllPlaygrounds: () => {
      return Array.from(get().configs.values());
    },

    getPlaygroundStats: (id: number) => {
      const transactions = get().transactions.get(id) || [];
      const tokenBalances = get().tokenBalances.get(id) || new Map();

      const lastActivity = transactions.length > 0 ? new Date(Math.max(...transactions.map((tx) => tx.timestamp.getTime()))) : undefined;

      return {
        transactionCount: transactions.length,
        tokenBalanceCount: tokenBalances.size,
        lastActivity,
      };
    },

    // Cleanup methods
    clearPlaygroundData: (id: number) => {
      set((state) => {
        const newConfigs = new Map(state.configs);
        const newTransactions = new Map(state.transactions);
        const newTokenBalances = new Map(state.tokenBalances);
        const newContracts = new Map(state.contracts);

        newConfigs.delete(id);
        newTransactions.delete(id);
        newTokenBalances.delete(id);
        newContracts.delete(id);

        return {
          configs: newConfigs,
          transactions: newTransactions,
          tokenBalances: newTokenBalances,
          contracts: newContracts,
          activePlaygroundId: state.activePlaygroundId === id ? undefined : state.activePlaygroundId,
        };
      });
    },

    clearAllData: () => {
      set({
        configs: new Map(),
        transactions: new Map(),
        tokenBalances: new Map(),
        contracts: new Map(),
        activeFunction: new Map(),
        executionHistory: new Map(),
        activePlaygroundId: undefined,
      });
    },
  }))
);

export default usePlaygroundStore;
