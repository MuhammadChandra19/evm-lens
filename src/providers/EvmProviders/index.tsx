import { createContext, ReactNode } from "react";
import useService from "./useService";

interface EvmProvidersProps {
  children: ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
export const EvmProvidersContext = createContext<ReturnType<
  typeof useService
> | null>(null);

const EvmProviders = ({ children }: EvmProvidersProps) => {
  const service = useService();

  return (
    <EvmProvidersContext.Provider value={service}>
      {children}
    </EvmProvidersContext.Provider>
  );
};

export default EvmProviders;
