import { create } from "zustand";
import { AppStore, PlaygroundConfig, ResultHistory } from "./types";
import { AccountInfo } from "@/service/evm-analyzer";

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
    }));
  },

  getPlaygroundConfig: (id: number): PlaygroundConfig => {
    const config = get().configs.get(id);
    return config!;
  },

  getAccounts: (): Map<string, AccountInfo> => {
    return get().accounts;
  },

  getFunctionLastResult: (
    id: number,
    functionName: string,
  ): ResultHistory | undefined => {
    const res = get().history.filter(
      (v) => v.playgroundId === id && v.functionName === functionName,
    );
    if (res.length > 0) {
      return res[0];
    }

    return undefined;
  },
  getFunctionResultHistory: (
    id: number,
    functionName: string,
  ): ResultHistory[] => {
    const history = get().history.filter(
      (v) => v.playgroundId === id && v.functionName === functionName,
    );
    return history;
  },

  getAllPlayground: (): PlaygroundConfig[] => {
    return Array.from(get().configs.values());
  },
}));

export default useAppStore;
