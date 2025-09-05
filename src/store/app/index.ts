import { create } from 'zustand';
import { ActiveFunction, AppStore, PlaygroundConfig, ResultHistory } from './types';
import { AccountInfo } from '@/service/evm-analyzer';

const useAppStore = create<AppStore>()((set, get) => ({
  configs: new Map(),
  accounts: new Map(),
  playground: new Map(),
  history: [],

  saveExecutionResult: (history: ResultHistory) => {
    const currentHistory = get().history;
    set({
      history: [history, ...currentHistory],
    });
  },

  createNewPlayground: (config: PlaygroundConfig) => {
    set((state) => ({
      configs: new Map(state.configs.set(config.id, config)),
      playground: new Map(
        state.playground.set(config.id, {
          activeFunction: undefined,
        })
      ),
    }));
  },

  getPlaygroundConfig: (id: number): PlaygroundConfig => {
    const config = get().configs.get(id);
    return config!;
  },

  getAccounts: (): Map<string, AccountInfo> => {
    return get().accounts;
  },

  getFunctionLastResult: (id: number, functionName: string): ResultHistory | undefined => {
    const res = get().history.filter((v) => v.playgroundId === id && v.functionName === functionName);
    if (res.length > 0) {
      return res[0];
    }

    return undefined;
  },
  getFunctionResultHistory: (id: number, functionName: string): ResultHistory[] => {
    const history = get().history.filter((v) => v.playgroundId === id && v.functionName === functionName);
    return history;
  },

  getAllPlayground: (): PlaygroundConfig[] => {
    return Array.from(get().configs.values());
  },

  setAccounts: (accounts: [string, AccountInfo][]) => {
    const currentAccounts = get().accounts;
    for (let i = 0; i < accounts.length; i++) {
      const [id, account] = accounts[i];
      currentAccounts.set(id, account);
    }
    set({
      accounts: currentAccounts,
    });
  },

  getAccount: (id: string) => {
    const account = get().accounts.get(id);

    return account;
  },

  updateAccountBalance: (key: string, balance: bigint) => {
    const account = get().accounts.get(key);
    if (!account) return;

    account.balance = balance;
    set((state) => ({
      accounts: new Map(state.accounts.set(key, account)),
    }));
  },

  setActiveFunction: (id: number, activeFunction: ActiveFunction) => {
    let playground = get().playground.get(id);
    if (!playground) {
      // Initialize playground state if it doesn't exist
      playground = {
        activeFunction: undefined,
      };
    }

    playground.activeFunction = activeFunction;
    set((state) => ({
      playground: new Map(state.playground.set(id, playground)),
    }));
  },
}));

export default useAppStore;
