import { createContext, useMemo, useCallback, ReactNode } from "react";
import { useParams } from "react-router";
import useAppStore from "@/store/app";
import {
  ActiveFunction,
  PlaygroundConfig,
  ResultHistory,
} from "@/store/app/types";
import type { AccountInfo } from "@/service/evm-analyzer";

export interface CurrentPlaygroundContextValue {
  playgroundId: number;
  getConfig: () => PlaygroundConfig | null;
  accountList: AccountInfo[];
  accounts: Map<string, AccountInfo>;
  getFunctionLastResult: (functionName: string) => ResultHistory | undefined;
  activeFunction: ActiveFunction | undefined;
  setActiveFunction: (func: ActiveFunction) => void;
  lastExecutionResult: ResultHistory | null;
  saveExecutionResult: (history: ResultHistory) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const CurrentPlaygroundContext =
  createContext<CurrentPlaygroundContextValue | null>(null);

interface CurrentPlaygroundProviderProps {
  children: ReactNode;
}

export const CurrentPlaygroundProvider = ({
  children,
}: CurrentPlaygroundProviderProps) => {
  const { id: playgroundIdParam } = useParams<{ id: string }>();

  const playgroundId = useMemo(() => {
    return parseInt(playgroundIdParam!, 10);
  }, [playgroundIdParam]);

  const getPlaygroundConfig = useAppStore((store) => store.getPlaygroundConfig);
  const setPlaygroundActiveFunction = useAppStore(
    (store) => store.setActiveFunction,
  );
  const accounts = useAppStore((store) => store.accounts);
  const playgroundState = useAppStore((store) => store.playground);
  const getStoredFunctionLastResult = useAppStore(
    (store) => store.getFunctionLastResult,
  );
  const saveExecutionResult = useAppStore((store) => store.saveExecutionResult);
  const history = useAppStore((store) => store.history);

  const getConfig = useCallback(
    () => getPlaygroundConfig(playgroundId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playgroundId],
  );

  const accountList = useMemo(() => Array.from(accounts.values()), [accounts]);

  const getFunctionLastResult = useCallback(
    (functionName: string) =>
      getStoredFunctionLastResult(playgroundId, functionName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playgroundId],
  );

  const setActiveFunction = useCallback(
    (func: ActiveFunction) => {
      setPlaygroundActiveFunction(playgroundId, func);
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playgroundId],
  );

  const { activeFunction } = useMemo(() => {
    const state = playgroundState.get(playgroundId);
    if (state) {
      const { activeFunction } = state;
      return {
        activeFunction,
      };
    }

    return {
      activeFunction: undefined,
    };
  }, [playgroundId, playgroundState]);

  const lastExecutionResult = useMemo(() => {
    if (!activeFunction) return null;

    // Find the most recent execution result for the active function
    const results = history.filter(
      (v) =>
        v.playgroundId === playgroundId &&
        v.functionName === activeFunction.func.name,
    );
    return results.length > 0 ? results[0] : null;
  }, [activeFunction, history, playgroundId]);

  const value = useMemo(
    () => ({
      playgroundId,
      getConfig,
      accountList,
      accounts,
      getFunctionLastResult,
      activeFunction,
      setActiveFunction,
      lastExecutionResult,
      saveExecutionResult,
    }),
    [
      playgroundId,
      getConfig,
      accountList,
      accounts,
      getFunctionLastResult,
      activeFunction,
      setActiveFunction,
      lastExecutionResult,
      saveExecutionResult,
    ],
  );

  return (
    <CurrentPlaygroundContext.Provider value={value}>
      {children}
    </CurrentPlaygroundContext.Provider>
  );
};
