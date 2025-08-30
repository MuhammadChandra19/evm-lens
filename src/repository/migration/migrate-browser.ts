import { sql } from "drizzle-orm/sql";

export interface MigrationMeta {
  sql: string[];
  folderMillis: number;
  hash: string;
  bps: boolean;
}

/**
 * Run migrations in a browser environment.
 *
 * @param db - drizzle sqlite db instance
 * @param apply - function that executes an array of SQL queries (e.g. driver.exec)
 * @param migrations - list of migrations (imported as ?raw in Vite)
 * @param migrationsTable - name of migrations table
 */
export async function migrateBrowser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  apply: (queries: string[]) => Promise<void>,
  migrations: MigrationMeta[],
  migrationsTable = "__drizzle_migrations",
) {
  // Ensure migrations table exists
  const migrationTableCreate = sql`
		CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			hash text NOT NULL,
			created_at numeric
		)
	`;

  await db.run(migrationTableCreate);

  // Get the last applied migration
  const dbMigrations = await db.values(
    sql`SELECT id, hash, created_at FROM ${sql.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`,
  );
  const lastDbMigration = dbMigrations[0] ?? void 0;

  // Figure out what needs to run
  const queriesToRun: string[] = [];
  for (const migration of migrations) {
    if (
      !lastDbMigration ||
      Number(lastDbMigration[2]) < migration.folderMillis
    ) {
      queriesToRun.push(
        ...migration.sql,
        `INSERT INTO ${migrationsTable} (hash, created_at) VALUES ('${migration.hash}', '${migration.folderMillis}')`,
      );
    }
  }

  // Apply
  if (queriesToRun.length > 0) {
    await apply(queriesToRun);
  }
}
