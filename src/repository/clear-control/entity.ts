import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const clearControlSchema = sqliteTable("clear_control", {
  id: integer("id").primaryKey(),
  version: integer("version").notNull(),
  cleared_at: text("cleared_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  tables_cleared: text("tables_cleared").notNull(), // JSON string of cleared tables
});

type NewClearControl = typeof clearControlSchema.$inferInsert;
type ClearControl = typeof clearControlSchema.$inferSelect;

export { clearControlSchema, type NewClearControl, type ClearControl };
