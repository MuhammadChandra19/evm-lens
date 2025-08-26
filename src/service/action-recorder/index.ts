import { Address } from "@ethereumjs/util";
import type { SnapshotType } from "@/repository/snapshot/entity";
import { SnapshotRepository } from "@/repository/snapshot/query";
import { ReplayableAction, SnapshotResult } from "./types";
import { CreateNewEVMPayload, EVMStore, TxData } from "@/store/evm/types";

export class ActionRecorder {
  private snapshotRepo: SnapshotRepository;
  playgroundId: number = 0;

  constructor(snapshotRepo: SnapshotRepository) {
    this.snapshotRepo = snapshotRepo;
  }

  setPlaygroundId(playgroundId: number) {
    this.playgroundId = playgroundId;
  }
  async loadSnapshot(): Promise<SnapshotResult<ReplayableAction[]>> {
    try {
      const res = await this.snapshotRepo.loadPlaygroundSnapshot(
        this.playgroundId,
      );
      const replayableAction: ReplayableAction[] = res.map((snapshot) => ({
        type: snapshot.type,
        payload: snapshot.payload,
        execute: this.getActionExecutor(snapshot.type),
      }));
      return {
        data: replayableAction,
        error: null,
      };
    } catch (e) {
      return {
        data: [],
        error: new Error("failed to load snapshot", {
          cause: e,
        }),
      };
    }
  }

  async recordAction(
    type: SnapshotType,
    payload: unknown,
  ): Promise<SnapshotResult<number>> {
    try {
      const res = await this.snapshotRepo.create({
        playgroundId: this.playgroundId,
        type,
        payload,
      });

      if (res.length > 0) {
        return {
          data: res[0].id,
          error: null,
        };
      }

      return {
        data: 0,
        error: new Error("no snapshot recorded"),
      };
    } catch (e) {
      return {
        data: 0,
        error: new Error("failed to record snapshot", {
          cause: e,
        }),
      };
    }
  }

  /**
   * Get the appropriate executor function for an action type
   */
  private getActionExecutor(
    type: SnapshotType,
  ): (payload: unknown, evmStore: EVMStore) => Promise<unknown> {
    switch (type) {
      case "DEPLOY_CONTRACT":
        return async (payload: unknown, evmStore: EVMStore) => {
          return evmStore.deployContractToEVM(
            payload as CreateNewEVMPayload,
            false,
          );
        };

      case "CREATE_ACCOUNT":
        return async (payload: unknown, evmStore: EVMStore) => {
          const typedPayload = payload as { address: string };
          return evmStore.createAccount(typedPayload.address, false);
        };

      case "FUND_ACCOUNT":
        return async (payload: unknown, evmStore: EVMStore) => {
          const typedPayload = payload as { address: Address; balance: bigint };
          return evmStore.fundAccount(
            typedPayload.address,
            typedPayload.balance,
            false,
          );
        };

      case "CALL_FUNCTION":
        return async (payload: unknown, evmStore: EVMStore) => {
          return evmStore.callFunction(payload as TxData, false);
        };

      case "REGISTER_ACCOUNT":
        return async (payload: unknown, evmStore: EVMStore) => {
          const typedPayload = payload as { address: Address };
          return evmStore.registerAccount(typedPayload.address, false);
        };

      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }
}
