import { create } from "zustand";
import {
  ActiveFunction,
  PlaygroundState,
  PlaygroundStore,
  ResultHistory,
} from "./types";
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
    setActiveFunction: (func: ActiveFunction) => {
      set({
        activeFunction: func,
      });
    },
    saveResult: (history: ResultHistory) => {
      const currentHistory = get().history;
      set({
        history: [history, ...currentHistory],
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
