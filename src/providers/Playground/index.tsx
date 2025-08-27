import { useApp } from '@/hooks/use-app';
import useEVMStore from '@/store/evm';
import { createContext, ReactNode, useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

interface PlaygroundProviderProps {
  children: ReactNode;
}

type PlaygroundProviderValue = {
  isLoading: boolean;
  setActivePlayground: (id: number) => Promise<void>
};

// eslint-disable-next-line react-refresh/only-export-components
export const PlaygroundProviderContext = createContext<PlaygroundProviderValue | null>(null);

const PlaygroundProvider = ({ children }: PlaygroundProviderProps) => {
  const context = useApp()

  const navigate = useNavigate()

  // Get playground ID from URL params
  const { id: playgroundId } = useParams<{ id: string }>()
  const playgroundIdNumber = playgroundId ? parseInt(playgroundId, 10) : null

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
      navigate(`/playground/${id}`)

    } catch (e) {
      toast.error("Failed to switch playground")
      console.error(e)
    }
  }

  /**
 * STAGE 2: Snapshot Replay
 * - Runs once when component mounts
 * - Loads all recorded actions for the playground from URL params
 * - Replays actions sequentially to restore playground state
 */
  useEffect(() => {
    const replaySnapshot = async () => {

      if (!playgroundIdNumber) {
        setIsReplayingSnapshot(false);
        return;
      }

      // Prevent double replay due to React StrictMode
      if (hasReplayedRef.current) {
        return;
      }

      hasReplayedRef.current = true;
      setReplayError(null);

      try {
        // Ensure we start with a completely fresh EVM instance for replay
        await evmStore.createFreshEVM();

        // Set playground context for action recorder
        context.actionRecorder.setPlaygroundId(playgroundIdNumber);

        // Load snapshot data
        const { data, error } = await context.actionRecorder.loadSnapshot();

        if (error) {
          throw error;
        }

        // No actions to replay
        if (data.length === 0) {
          return;
        }

        // Replay each action sequentially
        for (let i = 0; i < data.length; i++) {
          const action = data[i];
          try {

            // Execute the action with current EVM store
            await action.execute(action.payload, evmStore);

          } catch (error) {
            console.error(
              `Failed to replay action: ${action.type}`,
              error,
            );
            // Continue with next action even if one fails
          }
        }
      } catch (error) {
        console.error("Failed to replay snapshot:", error);
        setReplayError(error as Error);
      } finally {
        setIsReplayingSnapshot(false);
      }
    };

    replaySnapshot();
  }, []); // Empty dependency array - runs only once on mount

  // Handle snapshot replay errors
  useEffect(() => {
    if (replayError) {
      toast.error("Failed to run snapshot replay", {
        description: replayError.message
      })
    }
  }, [replayError])

  /**
   * Combined loading state
   * - Shows loading while EVM initializes OR while replaying snapshot
   * - Ensures UI doesn't show "ready" until entire sequence completes
   */
  const isLoading = useMemo(() => isReplayingSnapshot, [isReplayingSnapshot])

  if (isLoading) {
    return <div>Initializing playground...</div>;
  }

  return (
    <PlaygroundProviderContext.Provider
      value={{
        isLoading,
        setActivePlayground
      }}
    >
      {children}
    </PlaygroundProviderContext.Provider>
  );
}

export default PlaygroundProvider
