import type { Repository } from "@/repository";
import initRepository from "@/repository";
import { ActionRecorder } from "@/service/action-recorder";
import { EVMAdapter } from "@/service/evm-adapter";
import useEVMStore from "@/store/evm";
import LoadingScreen from "@/components/loading-screen";
import { createContext, ReactNode, useEffect, useState } from "react";

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

  const initializeEvm = useEVMStore((store) => store.initializeEVM);

  useEffect(() => {
    const init = async () => {
      try {
        const repo = await initRepository();
        // await repo.clearTables(["playground", "snapshot"]);
        const recorder = new ActionRecorder(repo.snapshot);
        setRepository(repo);
        setActionRecorder(recorder);

        // Initialize EVM first
        await initializeEvm();

        // Get the initialized EVM from store
        const evmStore = useEVMStore.getState();
        if (evmStore.evm) {
          // Create EVM adapter with the initialized EVM and action recorder
          const adapter = new EVMAdapter(evmStore.evm, recorder.recordAction);
          setEvmAdapter(adapter);

          // Set the adapter in the action recorder for new functions
          recorder.setEVMAdapter(adapter);
        }
      } catch (error) {
        console.error("Failed to initialize services:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [initializeEvm]);

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
