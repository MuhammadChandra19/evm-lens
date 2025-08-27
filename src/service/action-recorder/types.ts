import type { SnapshotType } from "@/repository/snapshot/entity";
import type { EVMStore } from "@/store/evm/types";

export type ReplayableAction = {
  type: SnapshotType;
  payload: unknown;
  execute: (payload: unknown, evmStore: EVMStore) => Promise<unknown>;
};

export type SnapshotResult<T> = {
  data: T;
  error: Error | null;
};
