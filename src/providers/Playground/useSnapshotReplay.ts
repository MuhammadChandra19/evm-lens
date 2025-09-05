import { Address } from "@ethereumjs/util";
import { useApp } from "@/hooks/use-app";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CreateNewEVMPayload,
  ExecutionResult,
  TxData,
} from "@/service/evm-adapter/types";
import { DeploymentResult } from "@/service/evm-analyzer";
import { SnapshotType } from "@/repository/snapshot/entity";

type Props = {
  createAccount: (
    playgroundId: number,
    address: string,
    shouldRecord?: boolean,
  ) => Promise<Address | null>;
  fundAccount: (
    playgroundId: number,
    address: Address,
    balance: bigint,
    shouldRecord?: boolean,
  ) => Promise<{
    success: boolean;
    error: unknown;
  }>;
  deployContractToEVM: (
    payload: CreateNewEVMPayload,
    shouldRecord?: boolean,
  ) => Promise<DeploymentResult | null>;
  callFunction: (
    txData: TxData,
    shouldRecord?: boolean,
  ) => Promise<ExecutionResult | undefined>;
  registerAccount: (
    playgroundId: number,
    address: Address,
    shouldRecord: boolean,
  ) => Promise<void>;
};

export const useSnapshotReplay = ({
  callFunction,
  createAccount,
  deployContractToEVM,
  fundAccount,
  registerAccount,
}: Props) => {
  const context = useApp();

  // Loading state for snapshot replay
  const [isReplayingSnapshot, setIsReplayingSnapshot] = useState(true); // Start with true
  const [replayError, setReplayError] = useState<Error | null>(null);
  const hasReplayedRef = useRef(false); // Prevent double replay with ref

  const handleExecute = (playgroundId: number, type: SnapshotType) => {
    switch (type) {
      case "DEPLOY_CONTRACT":
        return async (payload: unknown) =>
          deployContractToEVM(payload as CreateNewEVMPayload, false);

      case "CREATE_ACCOUNT":
        return async (payload: unknown) => {
          const typedPayload = payload as { address: string };
          return createAccount(playgroundId, typedPayload.address, false);
        };

      case "FUND_ACCOUNT":
        return async (payload: unknown) => {
          const typedPayload = payload as { address: Address; balance: bigint };
          return fundAccount(
            playgroundId,
            typedPayload.address,
            typedPayload.balance,
            false,
          );
        };

      case "CALL_FUNCTION":
        return async (payload: unknown) => {
          return callFunction(payload as TxData, false);
        };

      case "REGISTER_ACCOUNT":
        return async (payload: unknown) => {
          const typedPayload = payload as { address: string };
          return registerAccount(
            playgroundId,
            context.evmAdapter.toAddressType(typedPayload.address),
            false,
          );
        };
    }
  };

  const runSnapshot = useCallback(async () => {
    if (hasReplayedRef.current) {
      return;
    }

    hasReplayedRef.current = true;
    setReplayError(null);

    try {
      const snapshots = await context.actionRecorder.loadUnifiedSnapshot();
      if (snapshots.data.length === 0) {
        return;
      }

      for (let i = 0; i < snapshots.data.length; i++) {
        const action = snapshots.data[i];
        try {
          await handleExecute(
            action.snapshot.playgroundId!,
            action.type,
          )(action.payload);
        } catch (error) {
          console.error(
            `Failed to replay unified action: ${action.type}`,
            error,
          );
        }
      }
    } catch (error) {
      console.error("Failed to initialize unified EVM:", error);
      setReplayError(error as Error);
    } finally {
      setIsReplayingSnapshot(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle snapshot replay errors
  useEffect(() => {
    if (replayError) {
      toast.error("Failed to run snapshot replay", {
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
