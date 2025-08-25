import type { Repository } from '@/repository';
import initRepository from '@/repository';
import { createContext, ReactNode } from 'react';

interface AppProviderProps {
  children: ReactNode;
}

type AppProviderValue = {
  repository: Repository
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppProviderContext = createContext<AppProviderValue | null>(null)

const AppProvider = ({ children }: AppProviderProps) => {
  const repository = initRepository()
  return (
    <AppProviderContext.Provider value={{
      repository
    }}>
      {children}
    </AppProviderContext.Provider>
  )
}

export default AppProvider;
