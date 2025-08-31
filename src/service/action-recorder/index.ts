import { Address } from "@ethereumjs/util";
import type { NewSnapshot, SnapshotType } from "@/repository/snapshot/entity";
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
        payload: this.deserializePayload(snapshot.payload),
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

  /**
   * Load ALL snapshots from ALL playgrounds, sorted chronologically
   * This creates a unified EVM state where all playground actions are executed in time order
   */
  async loadUnifiedSnapshot(): Promise<SnapshotResult<ReplayableAction[]>> {
    try {
      const res = await this.snapshotRepo.loadAllSnapshotsOrderedByTime();

      const replayableAction: ReplayableAction[] = res.map((snapshot) => ({
        type: snapshot.type,
        payload: this.deserializePayload(snapshot.payload),
        execute: this.getActionExecutor(snapshot.type),
      }));

      return {
        data: replayableAction,
        error: null,
      };
    } catch (e) {
      return {
        data: [],
        error: new Error("failed to load unified snapshot", {
          cause: e,
        }),
      };
    }
  }

  async recordAction(
    type: SnapshotType,
    payload: unknown,
    gasUsed: string,
  ): Promise<SnapshotResult<number>> {
    try {
      // Serialize BigInt and Address values for database storage
      const serializedPayload = this.serializePayload(payload);
      const data: NewSnapshot = {
        playgroundId: this.playgroundId,
        type,
        payload: serializedPayload,
        gasUsed,
      };
      const res = await this.snapshotRepo.create(data);

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

  private serializePayload(payload: unknown): unknown {
    if (!payload) return payload;

    return JSON.parse(
      JSON.stringify(payload, (_key, value) => {
        // Only handle BigInt automatically since it can't be JSON serialized
        if (typeof value === "bigint") {
          return [value.toString(), "BigInt"];
        }
        return value;
      }),
    );
  }

  private deserializePayload(payload: unknown): unknown {
    if (!payload) return payload;

    return JSON.parse(JSON.stringify(payload), (_key, value) => {
      // Check if value is in our serialized format [stringified_value, original_type]
      if (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[1] === "string"
      ) {
        const [stringifiedValue, originalType] = value;

        switch (originalType) {
          case "Address": {
            const addrStr = stringifiedValue.startsWith("0x")
              ? stringifiedValue.slice(2)
              : stringifiedValue;
            return new Address(Buffer.from(addrStr, "hex"));
          }

          case "BigInt":
            return BigInt(stringifiedValue);

          default:
            // For other types, return the stringified value as-is
            return stringifiedValue;
        }
      }
      return value;
    });
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
            this,
            false,
          );
        };

      case "CREATE_ACCOUNT":
        return async (payload: unknown, evmStore: EVMStore) => {
          const typedPayload = payload as { address: string };
          return evmStore.createAccount(typedPayload.address, this, false);
        };

      case "FUND_ACCOUNT":
        return async (payload: unknown, evmStore: EVMStore) => {
          const typedPayload = payload as { address: Address; balance: bigint };
          return evmStore.fundAccount(
            typedPayload.address,
            typedPayload.balance,
            this,
            false,
          );
        };

      case "CALL_FUNCTION":
        return async (payload: unknown, evmStore: EVMStore) => {
          return evmStore.callFunction(payload as TxData, this, false);
        };

      case "REGISTER_ACCOUNT":
        return async (payload: unknown, evmStore: EVMStore) => {
          const typedPayload = payload as { address: Address };
          return evmStore.registerAccount(typedPayload.address, this, false);
        };

      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }
}
