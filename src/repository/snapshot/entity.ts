import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import playgroundSchema from "../playground/entity";

const snapshotSchema = sqliteTable("snapshot", {
  id: integer("id").primaryKey(),
  type: text({
    enum: [
      "DEPLOY_CONTRACT",
      "CREATE_ACCOUNT",
      "FUND_ACCOUNT",
      "CALL_FUNCTION",
      "REGISTER_ACCOUNT",
    ],
  }).notNull(),
  playgroundId: integer("playground_id").references(() => playgroundSchema.id),
  timestamp: text("timestamp")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  payload: text({ mode: "json" }).notNull(),
  gasUsed: text().notNull(),
});

type NewSnapshot = typeof snapshotSchema.$inferInsert;
type Snapshot = typeof snapshotSchema.$inferSelect;
type SnapshotType = (typeof snapshotSchema.$inferSelect)["type"];

export default snapshotSchema;
export type { NewSnapshot, Snapshot, SnapshotType };
