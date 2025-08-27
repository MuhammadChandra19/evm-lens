import type { Repository } from "@/repository";
import initRepository from "@/repository";
import { ActionRecorder } from "@/service/action-recorder";
import useEVMStore from '@/store/evm';
import { createContext, ReactNode, useEffect, useState } from "react";

interface AppProviderProps {
  children: ReactNode;
}

type AppProviderValue = {
  repository: Repository;
  actionRecorder: ActionRecorder;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AppProviderContext = createContext<AppProviderValue | null>(null);

const AppProvider = ({ children }: AppProviderProps) => {
  const [repository, setRepository] = useState<Repository | null>(null);
  const [actionRecorder, setActionRecorder] = useState<ActionRecorder | null>(null)
  const [isInitializing, setIsInitializing] = useState(true);

  const initializeEvm = useEVMStore(store => store.initializeEVM)


  useEffect(() => {
    const init = async () => {
      try {
        const repo = await initRepository();
        const recorder = new ActionRecorder(repo.snapshot)
        setRepository(repo);
        setActionRecorder(recorder)
        await initializeEvm()

      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    init();
  }, []);

  if (isInitializing || !repository) {
    return <div>Initializing database...</div>;
  }

  return (
    <AppProviderContext.Provider
      value={{
        repository,
        actionRecorder: actionRecorder!,
      }}
    >
      {children}
    </AppProviderContext.Provider>
  );
};

export default AppProvider;
