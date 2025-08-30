import { SQLocalDrizzle } from "sqlocal/drizzle";
import { drizzle } from "drizzle-orm/sqlite-proxy";

import playgroundRepository from "./playground/query";
import snapshotRepository from "./snapshot/query";
import type { PlaygroundRepository } from "./playground/query";
import type { SnapshotRepository } from "./snapshot/query";
import { migrateBrowser } from "./migration/migrate-browser";
import migrations from "./migration";
import { getRepositoryConfig } from "./config";
import { clearDatabaseTables } from "./clear-tables";

export type Repository = {
  playground: PlaygroundRepository;
  snapshot: SnapshotRepository;
  clearTables: (tables?: ("playground" | "snapshot")[]) => Promise<void>;
};

// Export configuration
export { getRepositoryConfig } from "./config";
export type { RepositoryConfig } from "./config";

const initRepository = async (): Promise<Repository> => {
  // Get repository configuration
  const config = getRepositoryConfig();

  if (config.enableDebugLogging) {
    console.log("🔧 Repository config:", config);
  }

  const { driver, batchDriver } = new SQLocalDrizzle(config.databaseName);
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

  // Clear tables if configured to do so
  try {
    await clearDatabaseTables(db, config);
  } catch (err) {
    console.error("❌ Failed to clear tables", err);
  }

  return {
    playground: playgroundRepository(db),
    snapshot: snapshotRepository(db),
    clearTables: async (tables?: ("playground" | "snapshot")[]) => {
      await clearDatabaseTables(db, {
        clearTablesOnInit: true,
        enableDebugLogging: true,
        databaseName: config.databaseName,
        tablesToClear: tables || [],
      });
    },
  };
};

export default initRepository;
