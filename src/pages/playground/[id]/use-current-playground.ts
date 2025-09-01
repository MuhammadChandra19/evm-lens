import useAppStore from "@/store/app";
import { useCallback, useMemo } from "react";
import { useParams } from "react-router";
/**
 * Hook to get current playground data from URL params and playground store
 */
export const useCurrentPlayground = () => {
  const { id: playgroundIdParam } = useParams<{ id: string }>();

  const playgroundId = useMemo(() => {
    return parseInt(playgroundIdParam!, 10);
  }, [playgroundIdParam]);

  const getPlaygroundConfig = useAppStore((store) => store.getPlaygroundConfig);
  const accounts = useAppStore((store) => store.accounts);
  const getStoredFunctionLastResult = useAppStore(
    (store) => store.getFunctionLastResult,
  );
  const getStoredFunctionResultHistory = useAppStore(
    (store) => store.getFunctionResultHistory,
  );

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

  return {
    playgroundId,
    getConfig,
    accountList,
    getFunctionLastResult,
    getStoredFunctionResultHistory,
  };
};
