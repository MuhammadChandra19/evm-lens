import { useContext } from "react";
import { AppProviderContext } from "@/providers/AppProvider";

/**
 * Hook to access the EVM adapter from the app context
 * @returns EVMAdapter instance
 * @throws Error if used outside of AppProvider
 */
export const useEVMAdapter = () => {
  const context = useContext(AppProviderContext);

  if (!context) {
    throw new Error("useEVMAdapter must be used within AppProvider");
  }

  return context.evmAdapter;
};

export default useEVMAdapter;
