import { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import type { NewPlayground, Playground } from './entity';
import playgroundSchema from './entity';
import { eq } from 'drizzle-orm';


const playgroundRepository = (db: SqliteRemoteDatabase) => {
  const create = async(payload: NewPlayground) => {
    try {
      return db.insert(playgroundSchema).values(payload).returning()
    } catch(e) {
      throw new Error("failed to insert new playground", {
        cause: e
      })
    }
  }

  const list = async() => {
    try {
      const result = await db.select().from(playgroundSchema)
      return result
    } catch(e) {
      throw new Error("failed to retrieve playground list", {
        cause: e
      })
    }
  }

  const deletePlayground = async(id: number) => {
    try {
      await db.delete(playgroundSchema).where(eq(playgroundSchema.id, id)).returning()
    } catch(e) {
      throw new Error("failed to delete playground", {
        cause: e
      })
    }
  }

  const getActivePlayground = async(): Promise<Playground | null> => {
    try {
      const res = await db.select().from(playgroundSchema).where(eq(playgroundSchema.isActive, true))
      if(res.length > 0) {
        return res[0]
      }
      return null
    } catch(e) {
      throw new Error("failed to get active playground", {
        cause: e
      })
    }
  }

  const toggleActivePlayground = async (lastActiveId: number, currentActiveId: number) => {
    try {
      await db.transaction(async (tx) => {
        await tx.update(playgroundSchema).set({ isActive: false}).where(eq(playgroundSchema.id, lastActiveId))
        await tx.update(playgroundSchema).set({ isActive: true}).where(eq(playgroundSchema.id, currentActiveId))
      })
    } catch(e) {
      throw new Error("failed to toggle active playground", {
        cause: e
      })
    }
  }

  return {
    create,
    list,
    deletePlayground,
    getActivePlayground,
    toggleActivePlayground
  }
}

type PlaygroundRepository = ReturnType<typeof playgroundRepository>

export default playgroundRepository
export type { PlaygroundRepository }
