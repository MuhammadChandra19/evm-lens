import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const playgroundSchema = sqliteTable('playground', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  isActive: integer({ mode: 'boolean' }),
  icon: text('icon').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

type NewPlayground = typeof playgroundSchema.$inferInsert;
type Playground = typeof playgroundSchema.$inferSelect;

export default playgroundSchema;
export type { NewPlayground, Playground };
