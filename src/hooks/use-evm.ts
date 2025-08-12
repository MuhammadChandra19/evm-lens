import { EvmProvidersContext } from '@/providers/EvmProviders';
import { useContext } from 'react';

export const useEvm = () => {
  const context = useContext(EvmProvidersContext);

  if (!context) {
    throw new Error('useEvm must be used within an EvmProviders');
  }

  return context;
};
