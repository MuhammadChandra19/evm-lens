import { useParams } from 'react-router';
import usePlaygroundStore from '@/store/playground-store';
import { ActiveFunction, ResultHistory } from '@/store/playground-store/types';
import { useMemo, useCallback } from 'react';

/**
 * Hook to get current playground data from URL params and playground store
 */
export const useCurrentPlayground = () => {
  const { id: playgroundIdParam } = useParams<{ id: string }>();

  const playgroundId = useMemo(() => {
    if (playgroundIdParam) {
      return parseInt(playgroundIdParam, 10);
    }
    return null;
  }, [playgroundIdParam]);

  // Create stable empty values to prevent new object creation
  const emptyTransactions = useMemo(() => [], []);
  const emptyTokenBalances = useMemo(() => new Map(), []);
  const emptyExecutionHistory = useMemo(() => [], []);

  // Get data from store with stable fallbacks
  const playgroundConfig = usePlaygroundStore((store) => (playgroundId ? store.getPlaygroundConfig(playgroundId) : undefined));
  const contractMetadata = usePlaygroundStore((store) => (playgroundId ? store.getContractMetadata(playgroundId) : undefined));
  const activeFunction = usePlaygroundStore((store) => (playgroundId ? store.getActiveFunction(playgroundId) : undefined));

  // For arrays and maps, use stable fallbacks
  const transactions = usePlaygroundStore((store) => {
    if (!playgroundId) return emptyTransactions;
    const result = store.transactions.get(playgroundId);
    return result || emptyTransactions;
  });

  const tokenBalances = usePlaygroundStore((store) => {
    if (!playgroundId) return emptyTokenBalances;
    const result = store.tokenBalances.get(playgroundId);
    return result || emptyTokenBalances;
  });

  const executionHistory = usePlaygroundStore((store) => {
    if (!playgroundId) return emptyExecutionHistory;
    const result = store.executionHistory.get(playgroundId);
    return result || emptyExecutionHistory;
  });

  // Memoize action functions to prevent infinite loops
  const setActiveFunction = useCallback(
    (func: ActiveFunction) => {
      if (playgroundId) {
        usePlaygroundStore.getState().setActiveFunction(playgroundId, func);
      }
    },
    [playgroundId]
  );

  const saveExecutionResult = useCallback(
    (result: ResultHistory) => {
      if (playgroundId) {
        usePlaygroundStore.getState().saveExecutionResult(playgroundId, result);
      }
    },
    [playgroundId]
  );

  const getFunctionLastResult = useCallback(
    (functionName: string) => {
      return playgroundId ? usePlaygroundStore.getState().getFunctionLastResult(playgroundId, functionName) : undefined;
    },
    [playgroundId]
  );

  const getFunctionResultHistory = useCallback(
    (functionName: string) => {
      return playgroundId ? usePlaygroundStore.getState().getFunctionResultHistory(playgroundId, functionName) : [];
    },
    [playgroundId]
  );

  // Debug logging (only when data changes)
  // console.log('🔍 useCurrentPlayground - playgroundId:', playgroundId);
  // console.log('🔍 useCurrentPlayground - playgroundConfig:', playgroundConfig);
  // console.log('🔍 useCurrentPlayground - contractMetadata:', contractMetadata);
  // console.log('🔍 useCurrentPlayground - ownerAddress:', playgroundConfig?.ownerAddress?.toString());

  return {
    playgroundId,
    playgroundConfig,
    contractMetadata,
    transactions,
    tokenBalances,
    // UI State
    activeFunction,
    executionHistory,
    // Store actions for UI state (memoized to prevent infinite loops)
    setActiveFunction,
    saveExecutionResult,
    getFunctionLastResult,
    getFunctionResultHistory,
    // Derived values for backward compatibility
    decimals: playgroundConfig?.decimals || 18,
    ownerAddress: playgroundConfig?.ownerAddress,
    contractAddress: playgroundConfig?.contractAddress,
    abi: playgroundConfig?.abi || contractMetadata?.abi,
    totalSupply: playgroundConfig?.totalSupply,
  };
};

export default useCurrentPlayground;
