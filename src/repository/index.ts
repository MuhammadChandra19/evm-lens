import { SQLocalDrizzle } from "sqlocal/drizzle";
import { drizzle } from "drizzle-orm/sqlite-proxy";

import playgroundRepository from "./playground/query";
import snapshotRepository from "./snapshot/query";
import type { PlaygroundRepository } from "./playground/query";
import type { SnapshotRepository } from "./snapshot/query";
import { migrateBrowser } from './migration/migrate-browser';
import migrations from './migration';

export type Repository = {
  playground: PlaygroundRepository;
  snapshot: SnapshotRepository;
};

const initRepository = async (): Promise<Repository> => {
  const { driver, batchDriver } = new SQLocalDrizzle("evmdb.sqlite3");
  const db = drizzle(driver, batchDriver);

  // proxy migrator: just run all SQL statements in batch
  const proxyMigrator = async (queries: string[]) => {
    for (const q of queries) {
      await driver(q, [], "run"); // or batchDriver.exec if you want batch execution
    }
  };

  try {
    await migrateBrowser(db, proxyMigrator, migrations);
    console.log("✅ Migrations applied");
  } catch (err) {
    console.error("❌ Migration failed", err);
  }


  return {
    playground: playgroundRepository(db),
    snapshot: snapshotRepository(db),
  };
};

export default initRepository;