import { Address } from "@ethereumjs/util";
import type { NewSnapshot, SnapshotType } from "@/repository/snapshot/entity";
import { SnapshotRepository } from "@/repository/snapshot/query";
import { ReplayableAction, SnapshotResult } from "./types";
import { EVMAdapter } from "../evm-adapter";

export class ActionRecorder {
  private snapshotRepo: SnapshotRepository;
  evmAdapter?: EVMAdapter;

  constructor(snapshotRepo: SnapshotRepository) {
    this.snapshotRepo = snapshotRepo;
  }

  setEVMAdapter(evmAdapter: EVMAdapter) {
    this.evmAdapter = evmAdapter;
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
        snapshot,
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
    playgroundId: number,
    type: SnapshotType,
    payload: unknown,
    gasUsed: string,
  ): Promise<SnapshotResult<number>> {
    try {
      // Serialize BigInt and Address values for database storage
      const serializedPayload = this.serializePayload(payload);
      const data: NewSnapshot = {
        playgroundId,
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
            return this.toAddressType(stringifiedValue);
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

  toAddressType(address: string) {
    const fixAddress = address.startsWith("0x") ? address.slice(2) : address;
    const addressType = new Address(Buffer.from(fixAddress, "hex"));

    return addressType;
  }
}
