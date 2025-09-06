import { useState, useEffect, useCallback } from "react";
import { Address } from "@ethereumjs/util";
import useAppStore from "@/store/app";
import usePlaygroundAction from "@/providers/Playground/use-playground-action";
import { extractUint256 } from "@/lib/utils";
import { AbiFunction } from "@/service/evm-analyzer/abi/types";

export interface TokenBalance {
  contractAddress: string;
  balance: bigint;
  formattedBalance: string;
  name?: string;
  symbol?: string;
  decimals?: number;
}

// Extract symbol from playground name (simple heuristic)
const extractSymbolFromName = (name: string): string => {
  // Try to extract a symbol from the name
  // Examples: "MyToken" -> "MTK", "Simple Token" -> "STK"
  const words = name.split(/\s+/);
  if (words.length === 1) {
    // Single word - take first 3 chars
    return words[0].substring(0, 3).toUpperCase();
  } else {
    // Multiple words - take first letter of each word
    return words
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 4);
  }
};

export const useAccountDetail = (accountAddress: string) => {
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getAllPlayground } = useAppStore();
  const { callFunction } = usePlaygroundAction();

  const formatTokenBalance = useCallback(
    (balance: bigint, decimals: number = 18): string => {
      const divisor = BigInt(10 ** decimals);
      const wholePart = balance / divisor;
      const fractionalPart = balance % divisor;

      if (fractionalPart === 0n) {
        return wholePart.toString();
      }

      const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
      const trimmedFractional = fractionalStr.replace(/0+$/, "");

      if (trimmedFractional === "") {
        return wholePart.toString();
      }

      return `${wholePart}.${trimmedFractional}`;
    },
    [],
  );

  const getTokenBalances = useCallback(async () => {
    if (!accountAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const playgrounds = getAllPlayground();
      const balances: TokenBalance[] = [];

      for (const playground of playgrounds) {
        try {
          // Find balanceOf function in the ABI
          const balanceOfFunction = playground.abi.find(
            (item): item is AbiFunction => {
              return (
                item.type === "function" &&
                item.name === "balanceOf" &&
                item.inputs?.length === 1 &&
                item.inputs[0].type === "address"
              );
            },
          );

          if (!balanceOfFunction) {
            console.log(
              `No balanceOf function found in playground ${playground.name}`,
            );
            continue;
          }

          // Call balanceOf function
          const txData = {
            playgroundId: playground.id,
            executorAddress: new Address(
              Buffer.from(accountAddress.slice(2), "hex"),
            ),
            func: balanceOfFunction,
            type: "function" as const,
            args: [accountAddress],
            gasLimit: 100000,
            ethAmount: 0n,
          };

          const result = await callFunction(txData);

          if (result?.success && result.returnValue) {
            // Parse the balance from the result using the utility function
            const balance = extractUint256(result.returnValue);

            if (balance > 0n) {
              const formattedBalance = formatTokenBalance(
                balance,
                playground.decimals,
              );

              balances.push({
                contractAddress: playground.contractAddress.toString(),
                balance,
                formattedBalance,
                name: playground.name,
                symbol: extractSymbolFromName(playground.name),
                decimals: playground.decimals,
              });
            }
          }
        } catch (err) {
          console.warn(
            `Failed to get balance for playground ${playground.name}:`,
            err,
          );
        }
      }

      setTokenBalances(
        balances.sort((a, b) => {
          // Sort by symbol, then by balance
          const symbolA = a.symbol || "";
          const symbolB = b.symbol || "";
          const symbolCompare = symbolA.localeCompare(symbolB);
          if (symbolCompare !== 0) return symbolCompare;
          return b.balance > a.balance ? 1 : -1;
        }),
      );
    } catch (err) {
      console.error("Failed to fetch token balances:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch token balances",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accountAddress]); // Only depend on accountAddress to avoid infinite loop

  // Load balances on mount and when account changes
  useEffect(() => {
    if (accountAddress) {
      getTokenBalances();
    } else {
      setTokenBalances([]);
    }
  }, [accountAddress]); // Remove getTokenBalances from dependencies to avoid infinite loop

  const refreshBalances = useCallback(async () => {
    if (accountAddress) {
      await getTokenBalances();
    }
  }, [accountAddress, getTokenBalances]);

  // Computed values
  const totalTokens = tokenBalances.length;
  const totalValue = tokenBalances.reduce((sum, token) => {
    // For now, just count the number of tokens
    // In a real app, you'd multiply by token prices
    return sum + Number(token.balance);
  }, 0);

  return {
    tokenBalances,
    isLoading,
    error,
    refreshBalances,
    totalTokens,
    totalValue,
    formatTokenBalance,
  };
};
