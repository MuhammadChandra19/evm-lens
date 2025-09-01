import LoadingScreen from "@/components/loading-screen";
import { useApp } from "@/hooks/use-app";
import QUERY_KEY from "@/lib/constants/query-key";
import { Playground } from "@/repository/playground/entity";
import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

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
  const context = useApp();

  const navigate = useNavigate();

  /**
   * Switch Active Playground
   * - Navigates to new playground URL
   * - React Router will update params and trigger snapshot reload
   */
  const setActivePlayground = async (id: number) => {
    try {
      navigate(`/playground/${id}`);
    } catch (e) {
      toast.error("Failed to switch playground");
      console.error(e);
    }
  };

  const {
    data,
    error: errorLoadingPlaygroundList,
    isLoading,
  } = useQuery({
    queryKey: [QUERY_KEY.LOAD_STORED_PLAYGROUNDS],
    queryFn: context.repository.playground.list,
  });

  useEffect(() => {
    if (errorLoadingPlaygroundList) {
      toast.error("Failed to load playground lits", {
        description: errorLoadingPlaygroundList.message,
      });
    }
  }, [errorLoadingPlaygroundList]);

  const playgroundList = useMemo(() => {
    if (!data) return [];

    return data as Playground[];
  }, [data]);

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
