import usePlaygroundStore from '@/store/playground-store';
import { useMemo } from 'react';
import { ETH_DECIMAL } from '@/lib/constants';

/**
 * Hook for account-specific functionality using playground store data
 */
export const useAccounts = () => {
  // Get all playground configurations and token balances
  const playgroundStore = usePlaygroundStore();
  const allPlaygrounds = playgroundStore.getAllPlaygrounds();

  // Transform accounts to display format
  const transformedAccounts = useMemo(() => {
    const accountMap = new Map<
      string,
      {
        address: string;
        balance: bigint;
        type: string;
        playgroundIds: number[];
      }
    >();

    // Collect all accounts from all playgrounds
    allPlaygrounds.forEach((playground) => {
      // Add owner account (EOA)
      if (playground.ownerAddress) {
        const ownerAddr = playground.ownerAddress.toString();
        const existing = accountMap.get(ownerAddr);
        if (existing) {
          existing.playgroundIds.push(playground.id);
        } else {
          accountMap.set(ownerAddr, {
            address: ownerAddr,
            balance: 0n, // Will be updated from token balances
            type: 'EOA',
            playgroundIds: [playground.id],
          });
        }
      }

      // Add contract account
      if (playground.contractAddress) {
        const contractAddr = playground.contractAddress.toString();
        const existing = accountMap.get(contractAddr);
        if (existing) {
          existing.playgroundIds.push(playground.id);
        } else {
          accountMap.set(contractAddr, {
            address: contractAddr,
            balance: 0n,
            type: 'Contract',
            playgroundIds: [playground.id],
          });
        }
      }

      // Add token balances for this playground
      const tokenBalances = playgroundStore.getTokenBalances(playground.id);
      tokenBalances.forEach((tokenBalance) => {
        const account = accountMap.get(tokenBalance.accountAddress);
        if (account) {
          account.balance += tokenBalance.balance;
        } else {
          // This is an account we haven't seen before
          accountMap.set(tokenBalance.accountAddress, {
            address: tokenBalance.accountAddress,
            balance: tokenBalance.balance,
            type: 'EOA', // Assume EOA for unknown accounts
            playgroundIds: [playground.id],
          });
        }
      });
    });

    // Convert to array format
    return Array.from(accountMap.values()).map((account) => ({
      address: account.address,
      balance: (Number(account.balance) / Math.pow(10, ETH_DECIMAL)).toFixed(4),
      type: account.type,
      playgroundIds: account.playgroundIds,
    }));
  }, [allPlaygrounds, playgroundStore]);

  // Computed values
  const totalAccounts = transformedAccounts.length;
  const eoaAccounts = transformedAccounts.filter((acc) => acc.type === 'EOA').length;
  const contractAccounts = transformedAccounts.filter((acc) => acc.type === 'Contract').length;
  const totalBalance = transformedAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);

  // Utility functions
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString();
  };

  const getAccountTypeColor = (type: string) => {
    return type === 'Contract' ? 'bg-purple-500' : 'bg-blue-500';
  };

  // Additional utility functions
  const getAccountDetails = (address: string) => {
    const account = transformedAccounts.find((acc) => acc.address === address);
    return account;
  };

  const getAccountsByPlayground = (playgroundId: number) => {
    return transformedAccounts.filter((acc) => 'playgroundIds' in acc && acc.playgroundIds.includes(playgroundId));
  };

  const getContractAccounts = () => {
    return transformedAccounts.filter((acc) => acc.type === 'Contract');
  };

  const getEOAAccounts = () => {
    return transformedAccounts.filter((acc) => acc.type === 'EOA');
  };

  return {
    // Data
    accounts: transformedAccounts,
    totalAccounts,
    eoaAccounts,
    contractAccounts,
    totalBalance,

    // Loading state (false since EVM store is synchronous)
    isLoading: false,
    error: null,

    // Utility functions
    formatAddress,
    formatBalance,
    getAccountTypeColor,
    getAccountDetails,
    getAccountsByPlayground,
    getContractAccounts,
    getEOAAccounts,
  };
};
