import useEVMStore from "@/store/evm";
import { ETH_DECIMAL } from "@/lib/constants";

/**
 * Hook for account-specific functionality using real EVM store data
 */
export const useAccounts = () => {
  const evmStore = useEVMStore();
  const accounts = evmStore.accounts || {};

  // Transform EVM accounts to display format
  const transformedAccounts = Object.values(accounts).map((account, index) => ({
    id: index + 1,
    address: account.address.toString(),
    balance: (Number(account.balance) / Math.pow(10, ETH_DECIMAL)).toFixed(4),
    transactionCount: Number(account.nonce), // Nonce represents transaction count
    type: account.isContract ? "Contract" : "EOA",
    playground: 1, // TODO: Add playground tracking when available
    rawBalance: account.balance,
    nonce: account.nonce,
    codeHash: account.codeHash,
    storageRoot: account.storageRoot,
  }));

  // Computed values
  const totalAccounts = transformedAccounts.length;
  const eoaAccounts = transformedAccounts.filter(
    (acc) => acc.type === "EOA",
  ).length;
  const contractAccounts = transformedAccounts.filter(
    (acc) => acc.type === "Contract",
  ).length;
  const totalBalance = transformedAccounts.reduce(
    (sum, acc) => sum + parseFloat(acc.balance),
    0,
  );

  // Utility functions
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString();
  };

  const getAccountTypeColor = (type: string) => {
    return type === "Contract" ? "bg-purple-500" : "bg-blue-500";
  };

  // Additional utility functions
  const getAccountDetails = (address: string) => {
    const account = transformedAccounts.find((acc) => acc.address === address);
    return account;
  };

  const getContractAccounts = () => {
    return transformedAccounts.filter((acc) => acc.type === "Contract");
  };

  const getEOAAccounts = () => {
    return transformedAccounts.filter((acc) => acc.type === "EOA");
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
    getContractAccounts,
    getEOAAccounts,
  };
};
