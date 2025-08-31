import type { Repository } from "@/repository";
import initRepository from "@/repository";
import { ActionRecorder } from "@/service/action-recorder";
import { EVMAdapter } from "@/service/evm-adapter";
import EVMAnalyzer from "@/service/evm-analyzer";
import LoadingScreen from "@/components/loading-screen";
import { createContext, ReactNode, useEffect, useState, useRef } from "react";

interface AppProviderProps {
  children: ReactNode;
}

type AppProviderValue = {
  repository: Repository;
  actionRecorder: ActionRecorder;
  evmAdapter: EVMAdapter;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AppProviderContext = createContext<AppProviderValue | null>(null);

const AppProvider = ({ children }: AppProviderProps) => {
  const [repository, setRepository] = useState<Repository | null>(null);
  const [actionRecorder, setActionRecorder] = useState<ActionRecorder | null>(
    null,
  );
  const [evmAdapter, setEvmAdapter] = useState<EVMAdapter | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      // Prevent multiple initializations (React StrictMode can cause double execution)
      if (hasInitializedRef.current) {
        console.log('⚠️ AppProvider - Skipping duplicate initialization');
        return;
      }

      hasInitializedRef.current = true;
      console.log('🚀 AppProvider - Starting initialization');

      try {
        const repo = await initRepository();
        // await repo.clearTables(["playground", "snapshot"]);
        const recorder = new ActionRecorder(repo.snapshot);
        setRepository(repo);
        setActionRecorder(recorder);

        // Initialize EVM directly
        const evm = await EVMAnalyzer.create();

        // Create wrapper for recordAction to match new signature
        const recordActionWrapper = async (
          type: "DEPLOY_CONTRACT" | "CREATE_ACCOUNT" | "FUND_ACCOUNT" | "CALL_FUNCTION" | "REGISTER_ACCOUNT",
          payload: unknown,
          gasUsed: string,
          playgroundId: number
        ) => {
          return await recorder.recordAction(type, payload, gasUsed, playgroundId);
        };

        // Create EVM adapter with the initialized EVM and action recorder
        const adapter = new EVMAdapter(evm, recordActionWrapper);
        setEvmAdapter(adapter);

        // Set the adapter in the action recorder for new functions
        recorder.setEVMAdapter(adapter);

        console.log('✅ AppProvider - Initialization complete');
      } catch (error) {
        console.error("❌ AppProvider - Failed to initialize services:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, []);

  if (isInitializing || !repository || !actionRecorder || !evmAdapter) {
    return <LoadingScreen />;
  }

  return (
    <AppProviderContext.Provider
      value={{
        repository,
        actionRecorder,
        evmAdapter,
      }}
    >
      {children}
    </AppProviderContext.Provider>
  );
};

export default AppProvider;
