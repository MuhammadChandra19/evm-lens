import { create } from 'zustand';
import { EVMState, CreateNewEVMPayload, EVMStore, TxData } from './types';
import * as actions from './action';
import EVMAnalyzer, { AccountInfo } from '@/service/evm-analyzer';
import { Address } from '@ethereumjs/util';
import { Abi } from '@/service/evm-analyzer/abi/types';
import { ETH_DECIMAL } from '@/lib/constants';
import { ActionRecorder } from '@/service/action-recorder';

const initialState: EVMState = {
  constructorBytecode: '',
  abi: {} as Abi,
  totalSupply: BigInt(0),
  decimals: 18,
};

const useEVMStore = create<EVMStore>()((set, get) => ({
  ...initialState,

  getAccounts: () => {
    const accounts = get().accounts || {};
    return Object.values(accounts).filter((v) => !v.isContract && v.address.toString());
  },

  // Basic EVM functions
  createAccount: async (address: string, actionRecorder: ActionRecorder, shouldRecord: boolean = true) => {
    const fixAddress = address.startsWith('0x') ? address.slice(2) : address;
    const addressType = new Address(Buffer.from(fixAddress, 'hex'));
    const result = await actions.createAccount(addressType, get, actionRecorder, shouldRecord);
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

    return result;
  },
  fundAccount: async (address: Address, balance: bigint, actionRecorder: ActionRecorder, shouldRecord: boolean = true) => {
    const parsedBalance = balance * BigInt(10 ** ETH_DECIMAL);
    const accounts = get().accounts || {};
    const currentAccount = accounts[address.toString()];

    if (!currentAccount) {
      console.error(`Cannot fund account ${address.toString()}: account does not exist`);
      return {
        error: `Cannot fund account ${address.toString()}: account does not exist`,
        success: false,
      };
    }
    const newBalance = currentAccount.balance + parsedBalance;
    const result = await actions.fundAccount(address, newBalance, get, actionRecorder, shouldRecord, balance);

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
    }

    return result;
  },

  deployContractToEVM: async (payload: CreateNewEVMPayload, actionRecorder: ActionRecorder, shouldRecord: boolean = true) => {
    const result = await actions.deployContractToEVM(payload, set, get, actionRecorder, shouldRecord);
    return result;
  },

  callFunction: async (txData: TxData, actionRecorder: ActionRecorder, shouldRecord: boolean = true) => {
    try {
      const result = await actions.callFunction(txData, get, actionRecorder, shouldRecord);

      if (result && !result.success) {
        return result;
      }
      const account = await actions.getAccount(txData.executorAddres, get);
      if (account) {
        set((state) => ({
          accounts: {
            ...state.accounts,
            [txData.executorAddres.toString()]: account,
          },
        }));
      }
      return result;
    } catch (e) {
      console.error(e);
    }
  },

  registerAccount: async (address: Address, actionRecorder: ActionRecorder) => {
    const result = await actions.registerAccount(address, get, actionRecorder);
    if (result) {
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
  initializeEVM: async () => {
    const currentState = get();
    if (!currentState.evm) {
      const evm = await EVMAnalyzer.create();
      set({ evm });
    }
  },

  createFreshEVM: async () => {
    // Always create a completely fresh EVM instance
    const evm = await EVMAnalyzer.create();
    set({ evm });
  },
}));

// EVM state is now managed through action replay system

export default useEVMStore;
