"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { todos } from "@/lib/db/schema";
import { todoSchema } from "@/lib/schema"; // Your Zod validation schema
import { eq, desc, asc, sql, inArray } from "drizzle-orm";

// Query: Fetch from SQL
export async function getTodos() {
  return await db.select().from(todos).orderBy(desc(todos.position));
}

// Mutation: Insert into SQL
export async function createTodo(formData: unknown) {
  const result = todoSchema.safeParse(formData);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  await db.insert(todos).values({
    title: result.data.title,
    // Finds max position, defaults to -1 if empty, and adds 1 (so first item is 0)
    position: sql`(SELECT COALESCE(MAX(position), -1) + 1 FROM ${todos})`,
  });


  revalidatePath("/");
  return { success: true };
}

// Mutation: Update Row
export async function toggleTodoStatus(id: string, isCompleted: boolean) {
  await db
    .update(todos)
    .set({ isCompleted })
    .where(eq(todos.id, id));

  revalidatePath("/");
}

// New Bulk Update Mutation for Select All functionality
export async function toggleMultipleTodos(ids: string[], isCompleted: boolean) {
  await db
    .update(todos)
    .set({ isCompleted })
    .where(inArray(todos.id, ids));

  revalidatePath("/");
}

export async function updateTodoOrder(orderedItems: { id: string; position: number }[]) {
  // Run all updates in a database transaction for optimal performance and safety
  await db.transaction(async (tx) => {
    for (const item of orderedItems) {
      await tx
        .update(todos)
        .set({ position: item.position })
        .where(eq(todos.id, item.id));
    }
  });

  revalidatePath("/");
}

// Mutation: Delete Row
export async function deleteTodo(id: string) {
  await db.delete(todos).where(eq(todos.id, id));

  revalidatePath("/");
}

// Mutation: Bulk delete all completed rows
export async function deleteCompletedTodos() {
  await db
    .delete(todos)
    .where(eq(todos.isCompleted, true));

  revalidatePath("/");
}