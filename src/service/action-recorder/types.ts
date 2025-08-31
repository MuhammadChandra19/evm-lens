import type { SnapshotType } from '@/repository/snapshot/entity';

export type AdapterReplayableAction = {
  type: SnapshotType;
  payload: unknown;
  execute: (payload: unknown) => Promise<unknown>;
};

export type SnapshotResult<T> = {
  data: T;
  error: Error | null;
};
