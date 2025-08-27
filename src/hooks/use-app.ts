import { AppProviderContext } from '@/providers/AppProvider';
import { useContext } from 'react';

export const useApp = () => {
  const context = useContext(AppProviderContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider context")
  }

  return context
}