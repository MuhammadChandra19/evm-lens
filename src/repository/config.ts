/**
 * Repository Configuration
 *
 * This file contains configuration options for the database repository.
 * Modify these settings to control database behavior.
 */

export interface RepositoryConfig {
  /**
   * Clear all database tables on initialization
   * WARNING: This will delete all existing data!
   *
   * @default false
   */
  clearTablesOnInit: boolean;

  /**
   * Enable debug logging for database operations
   *
   * @default false
   */
  enableDebugLogging: boolean;

  /**
   * Database file name
   *
   * @default "evmdb.sqlite3"
   */
  databaseName: string;

  /**
   * Reset specific tables only (when clearTablesOnInit is true)
   * If empty array, all tables will be cleared
   *
   * @default []
   */
  tablesToClear: ('playground' | 'snapshot')[];
}

/**
 * Default configuration
 *
 * To enable table clearing, set clearTablesOnInit to true
 */
const defaultConfig: RepositoryConfig = {
  clearTablesOnInit: false, // Set to true to clear tables on init
  enableDebugLogging: false,
  databaseName: 'evmdb.sqlite3',
  tablesToClear: [], // Empty means clear all tables
};

/**
 * Get the current repository configuration
 *
 * You can override these settings by modifying the defaultConfig above
 * or by setting environment variables (if implemented)
 */
export const getRepositoryConfig = (): RepositoryConfig => {
  // You can add environment variable overrides here if needed
  // For example:
  // const clearTables = process.env.CLEAR_DB_TABLES === 'true';

  return {
    ...defaultConfig,
    // Override with environment variables if needed
    // clearTablesOnInit: clearTables ?? defaultConfig.clearTablesOnInit,
  };
};

export default getRepositoryConfig;
