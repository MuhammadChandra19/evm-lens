import { SQLocalDrizzle } from 'sqlocal/drizzle';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import playgroundRepository from './playground/query';
import type { PlaygroundRepository } from './playground/query';
import type { SnapshotRepository } from './snapshot/query'
import snapshotRepository from './snapshot/query';

export type Repository = {
  playground: PlaygroundRepository
  snapshot: SnapshotRepository
}

const initRepository = (): Repository => {
  const { driver, batchDriver } = new SQLocalDrizzle('evmdb.sqlite3');
  const db = drizzle(driver, batchDriver);

  return {
    playground: playgroundRepository(db),
    snapshot: snapshotRepository(db)
  }
}

export default initRepository;
