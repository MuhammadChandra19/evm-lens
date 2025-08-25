import { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import snapshotSchema from './entity';
import type { NewSnapshot } from './entity';
import { eq } from 'drizzle-orm';

const snapshotRepository = (db: SqliteRemoteDatabase) => {
  const create = async(payload: NewSnapshot) => {
    try {
      return db.insert(snapshotSchema).values(payload).returning()
    } catch(e) {
      throw new Error("failed to insert snapshot", {
        cause: e
      })
    }
  }

  const loadPlaygroundSnapshot = async(playgroundId: number) => {
    try {
      const res = await db.select()
        .from(snapshotSchema)
        .where(eq(snapshotSchema.playgroundId, playgroundId))

      return res
    } catch(e) {
      throw new Error("failed to load snapshot", {
        cause: e
      })
    }
  }

  return {
    create,
    loadPlaygroundSnapshot
  }
}

type SnapshotRepository = ReturnType<typeof snapshotRepository>;
export default snapshotRepository;
export type { SnapshotRepository }
