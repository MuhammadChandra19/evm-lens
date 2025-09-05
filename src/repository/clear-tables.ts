import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import playgroundSchema from "./playground/entity";
import snapshotSchema from "./snapshot/entity";
import { clearControlSchema } from "./clear-control/entity";
import type { RepositoryConfig } from "./config";
import { desc } from "drizzle-orm";

// Set this version number to trigger table clearing on next startup
const CLEAR_TABLES_VERSION = 1;

/**
 * Clear database tables with version control
 * This function is always called and checks internally whether to clear tables
 *
 * @param db - The database instance
 * @param config - Repository configuration (used for logging and table selection)
 */
export const clearDatabaseTables = async (
  db: SqliteRemoteDatabase,
  config: RepositoryConfig,
): Promise<void> => {
  try {
    // Check the last cleared version
    const lastClear = await db
      .select()
      .from(clearControlSchema)
      .orderBy(desc(clearControlSchema.version))
      .limit(1);

    const lastClearedVersion = lastClear[0]?.version || 0;

    // Only clear if version has been incremented
    if (lastClearedVersion >= CLEAR_TABLES_VERSION) {
      if (config.enableDebugLogging) {
        console.log(
          `🔍 Tables already cleared for version ${CLEAR_TABLES_VERSION}`,
        );
      }
      return;
    }

    const tablesToClear =
      config.tablesToClear.length > 0
        ? config.tablesToClear
        : (["playground", "snapshot"] as const);

    console.log(
      `🗑️  Clearing database tables (version ${lastClearedVersion} → ${CLEAR_TABLES_VERSION}):`,
      tablesToClear,
    );

    // Clear tables in the correct order (respecting foreign key constraints)
    // Clear snapshot table first (has foreign key to playground)
    if (tablesToClear.includes("snapshot")) {
      await db.delete(snapshotSchema);
      if (config.enableDebugLogging) {
        console.log("✅ Cleared snapshot table");
      }
    }

    // Clear playground table second
    if (tablesToClear.includes("playground")) {
      await db.delete(playgroundSchema);
      if (config.enableDebugLogging) {
        console.log("✅ Cleared playground table");
      }
    }

    // Record the clear operation
    await db.insert(clearControlSchema).values({
      version: CLEAR_TABLES_VERSION,
      tables_cleared: JSON.stringify(tablesToClear),
    });

    console.log(
      `🧹 Database tables cleared successfully (version ${CLEAR_TABLES_VERSION})`,
    );
  } catch (error) {
    console.error("❌ Failed to clear database tables:", error);
    throw error;
  }
};

export default clearDatabaseTables;
