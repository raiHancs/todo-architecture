"use client";

import { useTransition } from "react";
import { Todo } from "@/lib/schema";
import { toggleTodoStatus, deleteTodo } from "@/app/actions";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  // useTransition gives us pending states for background server mutations
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`flex items-center justify-between p-4 border rounded-md dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.isCompleted}
          disabled={isPending}
          onChange={(e) =>
            startTransition(() => toggleTodoStatus(todo.id, e.target.checked))
          }
          className="w-4 h-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />
        <span className={`text-sm ${todo.isCompleted ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-800 dark:text-zinc-200"}`}>
          {todo.title}
        </span>
      </div>
      <button
        onClick={() => startTransition(() => deleteTodo(todo.id))}
        disabled={isPending}
        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
      >
        Delete
      </button>
    </div>
  );
}