import useAppStore from '@/store/app';
import { ActiveFunction } from '@/store/app/types';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';
/**
 * Hook to get current playground data from URL params and playground store
 */
export const useCurrentPlayground = () => {
  const { id: playgroundIdParam } = useParams<{ id: string }>();

  const playgroundId = useMemo(() => {
    return parseInt(playgroundIdParam!, 10);
  }, [playgroundIdParam]);

  const getPlaygroundConfig = useAppStore((store) => store.getPlaygroundConfig);
  const setPlaygroundActiveFunction = useAppStore((store) => store.setActiveFunction);
  const accounts = useAppStore((store) => store.accounts);
  const playgroundState = useAppStore((store) => store.playground);
  const getStoredFunctionLastResult = useAppStore((store) => store.getFunctionLastResult);
  const saveExecutionResult = useAppStore((store) => store.saveExecutionResult);
  const history = useAppStore((store) => store.history);

  const getConfig = useCallback(
    () => getPlaygroundConfig(playgroundId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playgroundId]
  );

  const accountList = useMemo(() => Array.from(accounts.values()), [accounts]);

  const getFunctionLastResult = useCallback(
    (functionName: string) => getStoredFunctionLastResult(playgroundId, functionName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playgroundId]
  );

  const setActiveFunction = useCallback(
    (func: ActiveFunction) => {
      setPlaygroundActiveFunction(playgroundId, func);
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playgroundId]
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
    const results = history.filter((v) => v.playgroundId === playgroundId && v.functionName === activeFunction.func.name);

    return results.length > 0 ? results[0] : null;
  }, [activeFunction, history, playgroundId]);

  return {
    playgroundId,
    getConfig,
    accountList,
    accounts,
    getFunctionLastResult,
    activeFunction,
    setActiveFunction,
    lastExecutionResult,
    saveExecutionResult,
  };
};
