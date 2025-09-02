import type { Repository } from "@/repository";
import initRepository from "@/repository";
import { ActionRecorder } from "@/service/action-recorder";
import LoadingScreen from "@/components/loading-screen";
import { createContext, ReactNode, useEffect, useState } from "react";
import EVMAnalyzer from "@/service/evm-analyzer";
import { EVMAdapter } from "@/service/evm-adapter";

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

  useEffect(() => {
    const init = async () => {
      try {
        const repo = await initRepository();
        // await repo.clearTables(["playground", "snapshot"]);
        const evm = await EVMAnalyzer.create();
        const recorder = new ActionRecorder(repo.snapshot);

        const recordActionWrapper = async (
          playgroundId: number,
          type:
            | "DEPLOY_CONTRACT"
            | "CREATE_ACCOUNT"
            | "FUND_ACCOUNT"
            | "CALL_FUNCTION"
            | "REGISTER_ACCOUNT",
          payload: unknown,
          gasUsed: string,
        ) => {
          return await recorder.recordAction(
            playgroundId,
            type,
            payload,
            gasUsed,
          );
        };

        const evmAdapter = new EVMAdapter(evm, recordActionWrapper);

        // Connect the EVMAdapter to the ActionRecorder for snapshot replay
        recorder.setEVMAdapter(evmAdapter);

        setRepository(repo);
        setActionRecorder(recorder);
        setEvmAdapter(evmAdapter);
      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, []);

  if (isInitializing || !repository) {
    return <LoadingScreen />;
  }

  return (
    <AppProviderContext.Provider
      value={{
        repository,
        actionRecorder: actionRecorder!,
        evmAdapter: evmAdapter!,
      }}
    >
      {children}
    </AppProviderContext.Provider>
  );
};

export default AppProvider;
