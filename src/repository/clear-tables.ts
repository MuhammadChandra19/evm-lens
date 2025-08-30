import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import playgroundSchema from './playground/entity';
import snapshotSchema from './snapshot/entity';
import type { RepositoryConfig } from './config';

/**
 * Clear database tables based on configuration
 *
 * @param db - The database instance
 * @param config - Repository configuration
 */
export const clearDatabaseTables = async (db: SqliteRemoteDatabase, config: RepositoryConfig): Promise<void> => {
  if (!config.clearTablesOnInit) {
    return;
  }

  const tablesToClear = config.tablesToClear.length > 0 ? config.tablesToClear : (['playground', 'snapshot'] as const);

  if (config.enableDebugLogging) {
    console.log('🗑️  Clearing database tables:', tablesToClear);
  }

  try {
    // Clear tables in the correct order (respecting foreign key constraints)
    // Clear snapshot table first (has foreign key to playground)
    if (tablesToClear.includes('snapshot')) {
      await db.delete(snapshotSchema);
      if (config.enableDebugLogging) {
        console.log('✅ Cleared snapshot table');
      }
    }

    // Clear playground table second
    if (tablesToClear.includes('playground')) {
      await db.delete(playgroundSchema);
      if (config.enableDebugLogging) {
        console.log('✅ Cleared playground table');
      }
    }

    console.log('🧹 Database tables cleared successfully');
  } catch (error) {
    console.error('❌ Failed to clear database tables:', error);
    throw error;
  }
};

export default clearDatabaseTables;
