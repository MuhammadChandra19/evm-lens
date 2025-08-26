/**
 * useApp Hook
 *
 * Core application hook that manages the initialization sequence and state for the EVM playground.
 * Implements a 3-stage dependency chain: EVM → Active Playground → Snapshot Replay
 *
 * INITIALIZATION SEQUENCE:
 * 1. EVM Initialization (always runs first)
 *    - Initializes the EVM store and engine
 *    - Sets isLoadingEvm = true during initialization
 *
 * 2. Active Playground Loading (waits for EVM)
 *    - Only runs when: evm !== undefined && !isLoadingEvm
 *    - Fetches the currently active playground from database
 *    - If this fails, prevents snapshot replay from running
 *
 * 3. Snapshot Replay (waits for active playground)
 *    - Only runs when: !!activePlayground && !errorGetActivePlayground
 *    - Loads and replays all recorded actions for the active playground
 *    - Executes actions sequentially to restore playground state
 *
 * SWITCHING PLAYGROUNDS:
 * When setActivePlayground(id) is called:
 * 1. Updates database to set new active playground
 * 2. Invalidates all 3 queries (EVM, playground, replay)
 * 3. Re-runs the entire initialization sequence with new playground
 * 4. New playground's snapshot gets loaded and replayed
 *
 * LOADING STATES:
 * - isLoading combines EVM initialization + snapshot replay loading
 * - Ensures UI shows loading until entire sequence completes
 *
 * ERROR HANDLING:
 * - Each stage has independent error handling with user-friendly toasts
 * - Errors in earlier stages prevent later stages from running
 * - Prevents cascading failures and runtime errors
 */
import { useContext, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppProviderContext } from "@/providers/AppProvider";
import useEVMStore from "@/store/evm";
import { toast } from "sonner";
import QUERY_KEY from "@/lib/constants/query-key";

export const useApp = () => {
  const context = useContext(AppProviderContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider context");
  }

  const queryClient = useQueryClient();

  // EVM Store access
  const initializeEvm = useEVMStore((store) => store.initializeEVM);
  const evmStore = useEVMStore();
  const evm = useEVMStore((store) => store.evm);

  /**
   * STAGE 1: EVM Initialization
   * - Runs immediately when hook mounts
   * - Initializes EVM engine and populates evm store
   * - Required before any playground operations can occur
   */
  const { isLoading: isLoadingEvm } = useQuery({
    queryKey: [QUERY_KEY.INITIALIZE_EVM],
    queryFn: initializeEvm,
  });

  /**
   * STAGE 2: Active Playground Loading
   * - Waits for EVM initialization to complete
   * - Fetches currently active playground from database
   * - enabled condition ensures EVM is ready before running
   */
  const { data, error: errorGetActivePlayground } = useQuery({
    queryKey: [QUERY_KEY.GET_ACTIVE_PLAYGROUND],
    queryFn: context.repository.playground.getActivePlayground,
    enabled: evm !== undefined && !isLoadingEvm, // Wait for EVM to be ready
  });

  // Memoized active playground data
  const activePlayground = useMemo(() => data, [data]);

  /**
   * Switch Active Playground
   * - Updates database to set new active playground
   * - Invalidates all queries to trigger re-initialization sequence
   * - New playground's snapshot will be loaded and replayed
   */
  const setActivePlayground = async (id: number) => {
    try {
      // Update database
      await context.repository.playground.toggleActivePlayground(
        id,
        activePlayground?.id || null,
      );

      // Trigger re-initialization sequence for new playground
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.INITIALIZE_EVM] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.GET_ACTIVE_PLAYGROUND],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.EXECUTE_REPLAYABLE_ACTION],
      });
    } catch (e) {
      toast.error("Failed to switch playground");
      console.error(e);
    }
  };

  // Handle playground loading errors
  useEffect(() => {
    if (errorGetActivePlayground) {
      toast.error("Failed to initiate active playground", {
        description: errorGetActivePlayground.message,
      });
    }
  });

  /**
   * STAGE 3: Snapshot Replay
   * - Waits for active playground to be loaded successfully
   * - Loads all recorded actions for the playground
   * - Replays actions sequentially to restore playground state
   * - enabled condition prevents running if playground failed to load
   */
  const { error: errorReplaySnapshot, isLoading: isReplayingSnapshot } =
    useQuery({
      queryKey: [QUERY_KEY.EXECUTE_REPLAYABLE_ACTION, activePlayground?.id],
      queryFn: async () => {
        // Set playground context for action recorder
        context.actionRecorder.setPlaygroundId(activePlayground!.id);

        // Load snapshot data
        const { data, error } = await context.actionRecorder.loadSnapshot();
        if (error) {
          throw error;
        }

        // No actions to replay
        if (data.length === 0) {
          console.log("[Snapshot] No actions to replay");
          return;
        }

        // Replay each action sequentially
        for (let i = 0; i < data.length; i++) {
          const action = data[i];
          try {
            console.log(
              `[Snapshot] Replaying action ${i + 1}/${data.length}: ${action.type}`,
            );

            // Execute the action with current EVM store
            const result = await action.execute(action.payload, evmStore);

            console.log(
              `[Snapshot] Successfully replayed action: ${action.type}`,
              result,
            );
          } catch (error) {
            console.error(
              `[Snapshot] Failed to replay action: ${action.type}`,
              error,
            );
            // Continue with next action even if one fails
          }
        }
      },
      // Only run if playground loaded successfully and no errors
      enabled: !!activePlayground && !errorGetActivePlayground,
    });

  // Handle snapshot replay errors
  useEffect(() => {
    if (errorReplaySnapshot) {
      toast.error("Failed to run snapshot replay", {
        description: errorReplaySnapshot.message,
      });
    }
  });

  /**
   * Combined loading state
   * - Shows loading while EVM initializes OR while replaying snapshot
   * - Ensures UI doesn't show "ready" until entire sequence completes
   */
  const isLoading = useMemo(
    () => isLoadingEvm || isReplayingSnapshot,
    [isLoadingEvm, isReplayingSnapshot],
  );

  return {
    isLoading,
    activePlayground,
    setActivePlayground,
    ...context,
  };
};
