import type { Snapshot, SnapshotType } from "@/repository/snapshot/entity";

export type ReplayableAction = {
  type: SnapshotType;
  payload: unknown;
  snapshot: Snapshot;
};

export type SnapshotResult<T> = {
  data: T;
  error: Error | null;
};
