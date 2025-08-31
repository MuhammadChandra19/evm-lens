import LoadingScreen from "@/components/loading-screen";
import { useApp } from "@/hooks/use-app";
import QUERY_KEY from "@/lib/constants/query-key";
import { Playground } from "@/repository/playground/entity";
import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useNavigate, useParams } from "react-router";
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

  // Get playground ID from URL params (used for query key)
  const { id: playgroundId } = useParams<{ id: string }>();

  // Loading state for snapshot replay
  const [isReplayingSnapshot, setIsReplayingSnapshot] = useState(true); // Start with true
  const [replayError, setReplayError] = useState<Error | null>(null);
  const hasReplayedRef = useRef(false); // Prevent double replay with ref

  // Remove the setPlaygroundId effect since we now pass playgroundId as parameter

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

  /**
   * Unified EVM Initialization
   * - Runs once when component mounts (regardless of playground)
   * - Loads ALL snapshots from ALL playgrounds chronologically
   * - Creates unified EVM state where all playground actions are applied in time order
   * - Uses the EVM adapter for replay
   */
  const initializeUnifiedEVM = useCallback(async () => {
    // Prevent double initialization due to React StrictMode
    if (hasReplayedRef.current) {
      return;
    }

    hasReplayedRef.current = true;
    setReplayError(null);

    try {
      // Load ALL snapshots from ALL playgrounds with adapter-based executors
      const { data: actions, error } = await context.actionRecorder.loadUnifiedSnapshotWithAdapter();

      if (error) {
        console.error('Failed to load unified snapshots with adapter:', error);
        setReplayError(error);
        return;
      }

      if (actions.length === 0) {
        console.log('No snapshots to replay for unified EVM');
      } else {
        console.log(`🔄 Replaying ${actions.length} actions from all playgrounds using EVM adapter`);

        // Replay all actions chronologically using adapter
        for (let i = 0; i < actions.length; i++) {
          const action = actions[i];
          try {
            // Adapter-based executors only need the payload
            await action.execute(action.payload);
          } catch (error) {
            console.error(`Failed to replay unified action with adapter: ${action.type}`, error);
            // Continue with next action even if one fails
          }
        }

        console.log('✅ Unified EVM state initialized successfully with adapter');
      }
    } catch (error) {
      console.error("Failed to initialize unified EVM with adapter:", error);
      setReplayError(error as Error);
    } finally {
      setIsReplayingSnapshot(false);
    }
  }, [context.actionRecorder]);

  useEffect(() => {
    initializeUnifiedEVM();
  }, [initializeUnifiedEVM]); // Only depends on the memoized callback

  // Handle snapshot replay errors
  useEffect(() => {
    if (replayError) {
      toast.error("Failed to run snapshot replay", {
        description: replayError.message,
      });
    }
  }, [replayError]);

  const {
    data,
    error: errorLoadingPlaygroundList,
    isLoading: isLoadingPlaygroundList,
  } = useQuery({
    queryKey: [QUERY_KEY.LOAD_STORED_PLAYGROUNDS, playgroundId],
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

  /**
   * Combined loading state
   * - Shows loading while EVM initializes OR while replaying snapshot
   * - Ensures UI doesn't show "ready" until entire sequence completes
   */
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
