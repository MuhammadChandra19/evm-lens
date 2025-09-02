import LoadingScreen from "@/components/loading-screen";
import { Playground } from "@/repository/playground/entity";
import { createContext, ReactNode, useMemo } from "react";
import { usePlaygroundList, usePlaygroundNavigation, useSnapshotReplay } from "./hooks";

interface PlaygroundProviderProps {
  children: ReactNode;
}

type PlaygroundProviderValue = {
  isLoading: boolean;
  setActivePlayground: (id: number) => Promise<void>;
  playgroundList: Playground[];
};

// eslint-disable-next-line react-refresh/only-export-components
export const PlaygroundProviderContext =
  createContext<PlaygroundProviderValue | null>(null);

const PlaygroundProvider = ({ children }: PlaygroundProviderProps) => {
  const { isReplayingSnapshot } = useSnapshotReplay();
  const { playgroundList, isLoadingPlaygroundList } = usePlaygroundList();
  const { setActivePlayground } = usePlaygroundNavigation();

  const isLoading = useMemo(
    () => isReplayingSnapshot || isLoadingPlaygroundList,
    [isReplayingSnapshot, isLoadingPlaygroundList],
  );


  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <PlaygroundProviderContext.Provider
      value={{
        isLoading,
        setActivePlayground,
        playgroundList,
      }}
    >
      {children}
    </PlaygroundProviderContext.Provider>
  );
};

export default PlaygroundProvider;
