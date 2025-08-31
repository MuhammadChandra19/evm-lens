import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/hooks/use-app";

/**
 * Hook for transaction-specific functionality
 */
export const useTransactions = () => {
  const { repository } = useApp();

  // Fetch explorer metrics (which includes transaction data)
  const {
    data: metrics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["explorer-metrics"],
    queryFn: () => repository.snapshot.getExplorerMetrics(),
    refetchInterval: 30000,
  });

  // Transaction-specific computed values
  const totalTransactions = metrics?.totalTransactions || 0;
  const recentTransactions = metrics?.recentTransactions || [];
  const transactionsByType = metrics?.transactionsByType || [];
  const totalGasUsed = metrics?.totalGasUsed || 0;
  const avgGasUsed = metrics?.avgGasUsed || 0;

  // Get transaction counts by type
  const functionCalls =
    transactionsByType.find((t) => t.type === "CALL_FUNCTION")?.count || 0;
  const deployments =
    transactionsByType.find((t) => t.type === "DEPLOY_CONTRACT")?.count || 0;

  // Utility functions
  const formatGas = (gas: number): string => {
    return gas.toLocaleString();
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "CALL_FUNCTION":
        return "bg-blue-500";
      case "DEPLOY_CONTRACT":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTransactionTypeName = (type: string) => {
    switch (type) {
      case "CALL_FUNCTION":
        return "Function Call";
      case "DEPLOY_CONTRACT":
        return "Contract Deploy";
      default:
        return type;
    }
  };

  return {
    // Data
    totalTransactions,
    recentTransactions,
    transactionsByType,
    totalGasUsed,
    avgGasUsed,
    functionCalls,
    deployments,

    // Loading and error states
    isLoading,
    error,

    // Utility functions
    formatGas,
    getTransactionTypeColor,
    getTransactionTypeName,

    // Actions
    refetch,
  };
};
