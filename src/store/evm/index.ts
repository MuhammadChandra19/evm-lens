import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EVMState, CreateNewEVMPayload, EVMStore } from './types';
import * as actions from './action';
import { serializeEVMState, handlePopulateState } from './serializers';
import EVMAnalyzer, { AccountInfo } from '@/service/evm-analyzer';
import { Address } from '@ethereumjs/util';
import { Abi, AbiFunction } from '@/service/evm-analyzer/abi/types';

const initialState: EVMState = {
  constructorBytecode: '',
  abi: {} as Abi,
  totalSupply: BigInt(0),
  decimals: 18,
};

/**
 * EVM Store with Persistence
 *
 * This store persists both evm state and EVM blockchain state:
 *
 * 1. Basic State Persistence (localStorage: 'evm-storage'):
 *    - Contract address, bytecode, ABI, functions, owner, supply, decimals
 *    - Uses Zustand persist middleware with custom serialization for Address/BigInt types
 *
 * 2. EVM State Persistence (localStorage: 'evm-evm-state'):
 *    - Account balances, contract code, storage slots
 *    - Serialized separately due to complexity of EVM state manager
 *    - Restored during onRehydrateStorage callback
 *
 * 3. Auto-save triggers:
 *    - EVM state is automatically saved after state-changing operations
 *    - Basic state is automatically persisted by Zustand middleware
 */

const useEVMStore = create<EVMStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Basic EVM functions
      createAccount: async (address: string) => {
        const fixAddress = address.startsWith('0x') ? address.slice(2) : address;
        const addressType = new Address(Buffer.from(fixAddress, 'hex'));
        const result = await actions.createAccount(addressType, get);
        if (!result) {
          return null;
        }
        const accounts: Record<string, AccountInfo> = get().accounts || {};
        const newAccount: AccountInfo = {
          address: result,
          balance: 0n,
          nonce: 0n,
        };

        set({
          accounts: {
            ...accounts,
            [result.toString()]: newAccount,
          },
        });
        await saveEVMState();
        return result;
      },
      fundAccount: async (address: Address, balance: bigint) => {
        const accounts = get().accounts!;
        const currentAccount = accounts[address.toString()];
        const newBalance = currentAccount.balance + balance;
        const result = await actions.fundAccount(address, newBalance, get);

        if (result.success) {
          set((state) => ({
            accounts: {
              ...state.accounts,
              [address.toString()]: {
                ...currentAccount,
                balance: newBalance,
              },
            },
          }));
          await saveEVMState();
        }
        return result;
      },

      deployContractToEVM: async (payload: CreateNewEVMPayload) => {
        const result = await actions.deployContractToEVM(payload, set, get);
        await saveEVMState();
        return result;
      },

      callFunction: async (executorAddres: Address, func: AbiFunction, args: string[], gasLimit: number) => {
        const result = await actions.callFunction(executorAddres, func, args, gasLimit, get);
        await saveEVMState();
        return result;
      },

      registerAccount: async (address: Address) => {
        const result = await actions.createAccount(address, get);
        if (result) {
          await saveEVMState();
          const accounts = get().accounts || {};

          set({
            accounts: {
              ...accounts,
              [result.toString()]: {
                address: result,
                balance: 0n,
                storage: [[]],
              } as unknown as AccountInfo,
            },
          });
        }
      },

      // Persistence helpers
      initializeEVM: async () => {
        const currentState = get();
        if (!currentState.evm) {
          const evm = await EVMAnalyzer.create();
          set({ evm });
        }
      },
      saveEVMState: async () => {
        await saveEVMState();
      },
      clearPersistedState: () => {
        localStorage.removeItem('evm-storage');
        localStorage.removeItem('evm-state');
        set(initialState);
      },
    }),
    {
      name: 'evm-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => handlePopulateState,
      partialize: (state) => ({
        contractAddress: state.contractAddress?.toString(),
        constructorBytecode: state.constructorBytecode,
        abi: state.abi,
        functions: state.functions ? Array.from(state.functions.entries()) : undefined,
        ownerAddress: state.ownerAddress?.toString(),
        totalSupply: state.totalSupply.toString(),
        decimals: state.decimals,
        // Exclude evm from automatic serialization
      }),
    }
  )
);

// Helper functions
const saveEVMState = async () => {
  try {
    const state = useEVMStore.getState();
    if (state.evm) {
      const serializedState = await serializeEVMState(state);
      localStorage.setItem('evm-state', JSON.stringify(serializedState));
    }
  } catch (error) {
    console.warn('Failed to save EVM state:', error);
  }
};

// EVM restoration is now handled by deserializeEVM in serializers.ts

export default useEVMStore;
