import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/hooks/use-app';
import { usePlayground } from '@/hooks/use-playground';

/**
 * Hook for explorer dashboard metrics and data
 */
export const useExplorer = () => {
  const { repository } = useApp();
  const { playgroundList } = usePlayground();

  // Fetch explorer metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ['explorer-metrics'],
    queryFn: () => repository.snapshot.getExplorerMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });

  // Fetch 24h stats
  const {
    data: stats24h,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['transaction-stats-24h'],
    queryFn: () => repository.snapshot.getTransactionStats(24),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 55000, // Consider data stale after 55 seconds
  });

  // Computed values
  const totalPlaygrounds = playgroundList?.length || 0;
  const activePlaygrounds = playgroundList?.filter((p) => p.isActive).length || 0;
  const isLoading = metricsLoading || statsLoading;
  const hasError = metricsError || statsError;

  // Utility functions
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatGas = (gas: number): string => {
    return gas.toLocaleString();
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'CALL_FUNCTION':
        return 'bg-blue-500';
      case 'DEPLOY_CONTRACT':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTransactionTypeName = (type: string) => {
    switch (type) {
      case 'CALL_FUNCTION':
        return 'Function Call';
      case 'DEPLOY_CONTRACT':
        return 'Contract Deploy';
      default:
        return type;
    }
  };

  // Refresh all data
  const refreshData = () => {
    refetchMetrics();
    refetchStats();
  };

  return {
    // Data
    metrics,
    stats24h,
    totalPlaygrounds,
    activePlaygrounds,

    // Loading states
    isLoading,
    metricsLoading,
    statsLoading,

    // Error states
    hasError,
    metricsError,
    statsError,

    // Utility functions
    formatNumber,
    formatGas,
    getTransactionTypeColor,
    getTransactionTypeName,

    // Actions
    refreshData,
    refetchMetrics,
    refetchStats,
  };
};
