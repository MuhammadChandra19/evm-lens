import { useApp } from '@/hooks/use-app';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import useAppStore from '@/store/app';

export const useSnapshotReplay = () => {
  const context = useApp();

  // Loading state for snapshot replay
  const [isReplayingSnapshot, setIsReplayingSnapshot] = useState(true); // Start with true
  const [replayError, setReplayError] = useState<Error | null>(null);
  const hasReplayedRef = useRef(false); // Prevent double replay with ref

  const runSnapshot = useCallback(async () => {
    if (hasReplayedRef.current) {
      return;
    }

    hasReplayedRef.current = true;
    setReplayError(null);

    try {
      // Clear app store state before replay to ensure clean state
      const appStore = useAppStore.getState();
      appStore.configs.clear();
      appStore.accounts.clear();
      appStore.playground.clear();

      const snapshots = await context.actionRecorder.loadUnifiedSnapshot();
      if (snapshots.data.length === 0) {
        return;
      }

      for (let i = 0; i < snapshots.data.length; i++) {
        const action = snapshots.data[i];
        try {
          await action.execute(action.payload);
        } catch (error) {
          console.error(`Failed to replay unified action: ${action.type}`, error);
        }
      }
    } catch (error) {
      console.error('Failed to initialize unified EVM:', error);
      setReplayError(error as Error);
    } finally {
      setIsReplayingSnapshot(false);
    }
  }, [context.actionRecorder]);

  // Handle snapshot replay errors
  useEffect(() => {
    if (replayError) {
      toast.error('Failed to run snapshot replay', {
        description: replayError.message,
      });
    }
  }, [replayError]);

  // Auto-run snapshot on mount
  useEffect(() => {
    runSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isReplayingSnapshot,
    replayError,
    runSnapshot,
  };
};
