import { mssqlTable, int, varchar, bit, datetime2, customType } from "drizzle-orm/mssql-core";
import { sql } from "drizzle-orm";

const uniqueidentifier = customType<{ data: string }>({
  dataType() {
    return 'uniqueidentifier';
  },
});

export const todos = mssqlTable("todos", {
  id: uniqueidentifier("id").primaryKey().$default(() => sql`NEWID()`).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  isCompleted: bit("is_completed").default(false).notNull(),
  position: int("position").default(0).notNull(),
  createdAt: datetime2("created_at").default(sql`GETDATE()`).notNull(),
});

// Infer TypeScript types directly from the database schema
export type DbTodo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;