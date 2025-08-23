import { create } from 'zustand';
import { EVMState, CreateNewEVMPayload, EVMStore, TxData } from './types';
import * as actions from './action';
import EVMAnalyzer, { AccountInfo } from '@/service/evm-analyzer';
import { Address } from '@ethereumjs/util';
import { Abi } from '@/service/evm-analyzer/abi/types';
import { ETH_DECIMAL } from '@/lib/constants';
import ActionRecorder from './action-recorder';

const initialState: EVMState = {
  constructorBytecode: '',
  abi: {} as Abi,
  totalSupply: BigInt(0),
  decimals: 18,
};

// Get the action recorder instance
const actionRecorder = ActionRecorder.getInstance();

const useEVMStore = create<EVMStore>()((set, get) => ({
  ...initialState,

  // Basic EVM functions
  createAccount: async (address: string, shouldRecord: boolean = true) => {
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
  fundAccount: async (address: Address, balance: bigint, shouldRecord: boolean = true) => {
    const parsedBalance = balance * BigInt(10 ** ETH_DECIMAL);
    const accounts = get().accounts!;
    const currentAccount = accounts[address.toString()];
    const newBalance = currentAccount.balance + parsedBalance;
    const result = await actions.fundAccount(address, newBalance, get, actionRecorder, shouldRecord);

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

  deployContractToEVM: async (payload: CreateNewEVMPayload, shouldRecord: boolean = true) => {
    const result = await actions.deployContractToEVM(payload, set, get, actionRecorder, shouldRecord);
    return result;
  },

  callFunction: async (txData: TxData, shouldRecord: boolean = true) => {
    try {
      const result = await actions.callFunction(txData, get, actionRecorder, shouldRecord);
      return result;
    } catch (e) {
      console.error(e);
    }
  },

  registerAccount: async (address: Address, shouldRecord: boolean = true) => {
    const result = await actions.registerAccount(address, get, actionRecorder, shouldRecord);
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
  getActionHistory: () => {
    return actionRecorder.getSnapshots();
  },
  clearActionHistory: () => {
    actionRecorder.clearHistory();
  },
}));

// EVM state is now managed through action replay system

export default useEVMStore;
