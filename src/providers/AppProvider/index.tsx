import type { Repository } from "@/repository";
import initRepository from "@/repository";
import { ActionRecorder } from "@/service/action-recorder";
import { createContext, ReactNode } from "react";

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
  const repository = initRepository();
  const actionRecorder = new ActionRecorder(repository.snapshot);
  return (
    <AppProviderContext.Provider
      value={{
        repository,
        actionRecorder,
      }}
    >
      {children}
    </AppProviderContext.Provider>
  );
};

export default AppProvider;
