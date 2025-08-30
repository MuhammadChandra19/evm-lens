import { PlaygroundProviderContext } from '@/providers/Playground';
import { useContext } from 'react';

export const usePlayground = () => {
  const context = useContext(PlaygroundProviderContext);
  if (!context) {
    throw new Error("usePlayground must be used within an PlaygroundProvider context");
  }

  return context;
}
