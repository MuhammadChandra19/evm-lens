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
  createAccount: async (address: string) => {
    // Record the action
    const actionPayload = { address };

    const fixAddress = address.startsWith('0x') ? address.slice(2) : address;
    const addressType = new Address(Buffer.from(fixAddress, 'hex'));
    const result = await actions.createAccount(addressType, get);
    if (!result) {
      actionRecorder.recordAction('CREATE_ACCOUNT', actionPayload, null);
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

    // Record successful action
    actionRecorder.recordAction('CREATE_ACCOUNT', actionPayload, result);
    return result;
  },
  fundAccount: async (address: Address, balance: bigint) => {
    // Record the action
    const actionPayload = { address, balance };

    const parsedBalance = balance * BigInt(10 ** ETH_DECIMAL);
    const accounts = get().accounts!;
    const currentAccount = accounts[address.toString()];
    const newBalance = currentAccount.balance + parsedBalance;
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
    }

    // Record the action
    actionRecorder.recordAction('FUND_ACCOUNT', actionPayload, result);
    return result;
  },

  deployContractToEVM: async (payload: CreateNewEVMPayload) => {
    const result = await actions.deployContractToEVM(payload, set, get);

    // Record the action
    actionRecorder.recordAction('DEPLOY_CONTRACT', payload, result);
    return result;
  },

  callFunction: async (txData: TxData) => {
    try {
      const result = await actions.callFunction(txData, get);

      // Record the action
      actionRecorder.recordAction('CALL_FUNCTION', txData, result);
      return result;
    } catch (e) {
      console.error(e);
      // Record failed action
      actionRecorder.recordAction('CALL_FUNCTION', txData, { error: e });
    }
  },

  registerAccount: async (address: Address) => {
    // Record the action
    const actionPayload = { address };

    const result = await actions.createAccount(address, get);
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

    // Record the action
    actionRecorder.recordAction('REGISTER_ACCOUNT', actionPayload, result);
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

// EVM restoration is now handled by deserializeEVM in serializers.ts

export default useEVMStore;
