import { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import snapshotSchema from "./entity";
import type { NewSnapshot } from "./entity";
import { eq, asc } from "drizzle-orm";

const snapshotRepository = (db: SqliteRemoteDatabase) => {
  const create = async (payload: NewSnapshot) => {
    try {
      return db.insert(snapshotSchema).values(payload).returning();
    } catch (e) {
      throw new Error("failed to insert snapshot", {
        cause: e,
      });
    }
  };

  const loadPlaygroundSnapshot = async (playgroundId: number) => {
    try {
      const res = await db
        .select()
        .from(snapshotSchema)
        .where(eq(snapshotSchema.playgroundId, playgroundId))
        .orderBy(asc(snapshotSchema.timestamp));

      return res;
    } catch (e) {
      throw new Error("failed to load snapshot", {
        cause: e,
      });
    }
  };

  /**
   * Load ALL snapshots from ALL playgrounds, ordered chronologically
   * This enables unified EVM state across all playgrounds
   */
  const loadAllSnapshotsOrderedByTime = async () => {
    try {
      const res = await db
        .select()
        .from(snapshotSchema)
        .orderBy(asc(snapshotSchema.timestamp));

      return res;
    } catch (e) {
      throw new Error("failed to load all snapshots", {
        cause: e,
      });
    }
  };

  return {
    create,
    loadPlaygroundSnapshot,
    loadAllSnapshotsOrderedByTime,
  };
};

type SnapshotRepository = ReturnType<typeof snapshotRepository>;
export default snapshotRepository;
export type { SnapshotRepository };
