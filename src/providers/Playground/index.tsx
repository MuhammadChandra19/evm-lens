import { useApp } from "@/hooks/use-app";
import useEVMStore from "@/store/evm";
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
};

// eslint-disable-next-line react-refresh/only-export-components
export const PlaygroundProviderContext =
  createContext<PlaygroundProviderValue | null>(null);

const PlaygroundProvider = ({ children }: PlaygroundProviderProps) => {
  const context = useApp();

  const navigate = useNavigate();

  // Get playground ID from URL params
  const { id: playgroundId } = useParams<{ id: string }>();
  const playgroundIdNumber = playgroundId ? parseInt(playgroundId, 10) : null;

  // EVM Store access
  const evmStore = useEVMStore();

  // Loading state for snapshot replay
  const [isReplayingSnapshot, setIsReplayingSnapshot] = useState(true); // Start with true
  const [replayError, setReplayError] = useState<Error | null>(null);
  const hasReplayedRef = useRef(false); // Prevent double replay with ref

  // Ensure playground ID is always set on ActionRecorder when playgroundIdNumber changes
  useEffect(() => {
    if (playgroundIdNumber) {
      context.actionRecorder.setPlaygroundId(playgroundIdNumber);
    }
  }, [playgroundIdNumber, context.actionRecorder]);

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
   * STAGE 2: Unified EVM Initialization
   * - Runs once when component mounts (regardless of playground)
   * - Loads ALL snapshots from ALL playgrounds chronologically
   * - Creates unified EVM state where all playground actions are applied in time order
   */
  const initializeUnifiedEVM = useCallback(async () => {
    // Prevent double initialization due to React StrictMode
    if (hasReplayedRef.current) {
      return;
    }

    hasReplayedRef.current = true;
    setReplayError(null);

    try {
      // Initialize unified EVM state with all snapshots from all playgrounds
      await evmStore.initializeUnifiedEVM(context.actionRecorder);

      // Set current playground context for action recorder (for new actions)
      if (playgroundIdNumber) {
        context.actionRecorder.setPlaygroundId(playgroundIdNumber);
      }
    } catch (error) {
      console.error("Failed to initialize unified EVM:", error);
      setReplayError(error as Error);
    } finally {
      setIsReplayingSnapshot(false);
    }
  }, [context.actionRecorder, evmStore, playgroundIdNumber]);

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

  /**
   * Combined loading state
   * - Shows loading while EVM initializes OR while replaying snapshot
   * - Ensures UI doesn't show "ready" until entire sequence completes
   */
  const isLoading = useMemo(() => isReplayingSnapshot, [isReplayingSnapshot]);

  if (isLoading) {
    return <div>Initializing unified EVM state...</div>;
  }

  return (
    <PlaygroundProviderContext.Provider
      value={{
        isLoading,
        setActivePlayground,
      }}
    >
      {children}
    </PlaygroundProviderContext.Provider>
  );
};

export default PlaygroundProvider;
