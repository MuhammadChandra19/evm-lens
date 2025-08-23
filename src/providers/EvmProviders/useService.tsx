import EVMAnalyzer from "@/service/evm-analyzer";
import { useEffect, useRef, useState, useCallback } from "react";
import ActionRecorder from "@/store/evm/action-recorder";
import useEVMStore from "@/store/evm";

const useService = () => {
  const evmRef = useRef<EVMAnalyzer | null>(null);
  const [isReplayComplete, setIsReplayComplete] = useState(false);
  const evmStore = useEVMStore();

  const replayActions = useCallback(async () => {
    try {
      const actionRecorder = ActionRecorder.getInstance();
      const replayableActions = actionRecorder.getReplayableActions();

      if (replayableActions.length === 0) {
        console.log("[EvmProviders] No actions to replay");
        return;
      }

      console.log(
        `[EvmProviders] Replaying ${replayableActions.length} actions...`,
      );

      // Enable replay mode to prevent recording during replay
      actionRecorder.setReplayMode(true);

      try {
        for (let i = 0; i < replayableActions.length; i++) {
          const action = replayableActions[i];

          try {
            console.log(
              `[EvmProviders] Replaying action ${i + 1}/${replayableActions.length}: ${action.type}`,
            );

            // Execute the action
            const result = await action.execute(action.payload, evmStore);

            console.log(
              `[EvmProviders] Successfully replayed action: ${action.type}`,
              result,
            );

            // Mark this action as replayed
            actionRecorder.markReplayed(
              actionRecorder.getSnapshots().length -
                replayableActions.length +
                i,
            );
          } catch (error) {
            console.error(
              `[EvmProviders] Failed to replay action: ${action.type}`,
              error,
            );
            // Continue with next action even if one fails
          }
        }
      } finally {
        // Always disable replay mode when done
        actionRecorder.setReplayMode(false);
      }

      console.log("[EvmProviders] Action replay completed");
    } catch (error) {
      console.error("[EvmProviders] Failed to replay actions:", error);
    }
  }, [evmStore]);

  useEffect(() => {
    (async () => {
      const evm = await EVMAnalyzer.create();
      evmRef.current = evm;

      // Initialize EVM in store
      await evmStore.initializeEVM();

      // Replay actions if any exist
      await replayActions();
      setIsReplayComplete(true);
    })();
  }, [evmStore, replayActions]);

  return {
    // EVM basics
    evm: evmRef.current,
    isReplayComplete,
    replayActions,
  };
};

export default useService;
