import { z } from "zod";

// Runtime validation schema for creating a Todo
export const todoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be under 100 characters")
    .trim(),
});

// Infer TypeScript types from the schema
export type TodoInput = z.infer<typeof todoSchema>;

// Full Todo representation
export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: Date;
}