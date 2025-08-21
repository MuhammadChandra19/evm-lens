import { create } from "zustand";
import { PlaygroundState, PlaygroundStore, ResultHistory } from "./types";
import { AbiFunction } from "@/service/evm-analyzer/abi/types";
// import { persist } from 'zustand/middleware';

const initialSate: PlaygroundState = {
  history: [],
};
const usePlaygroundStore = create<PlaygroundStore>()(
  // persist(
  (set, get) => ({
    ...initialSate,
    setPlaygroundName: (name: string) => {
      set({
        playgroundName: name,
      });
    },
    setActiveFunction: (func: AbiFunction) => {
      set({
        activeFunction: func,
      });
    },
    saveResult: (history: ResultHistory) => {
      const currentHistory = get().history;
      set({
        history: [...currentHistory, history],
      });
    },
    getFunctionLastResult: (functionName: string) => {
      return get().history.find((f) => f.functionName === functionName);
    },
    getFunctionResultHistory: (functionName: string) => {
      return get().history.filter((f) => f.functionName === functionName);
    },
  }),
  // )
);

export default usePlaygroundStore;
