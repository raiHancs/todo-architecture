"use client";

import { useTransition } from "react";
import { deleteCompletedTodos } from "@/app/actions";
import { Button } from "@/components/ui/button";

interface TodoClearButtonProps {
  completedCount: number;
}

export function TodoClearButton({ completedCount }: TodoClearButtonProps) {
  const [isPending, startTransition] = useTransition();

  // If there are no completed items, don't render the action trigger
  if (completedCount === 0) return null;

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Are you sure you want to clear all completed tasks?")) {
          startTransition(() => deleteCompletedTodos());
        }
      }}
      className="text-xs text-white tracking-tight bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
    >
      {isPending ? "Clearing..." : `Clear Completed (${completedCount})`}
    </Button>
  );
}