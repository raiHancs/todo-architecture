import { getTodos } from "@/app/actions";
import { TodoForm } from "@/components/todo-form";
import { TodoList } from "@/components/todo-list";
import { TodoClearButton } from "@/components/todo-clear-button";

// Force Next.js to pull fresh database records on every request
export const dynamic = "force-dynamic";

export default async function Home() {
  const initialTodos = await getTodos();
  const completedCount = initialTodos.filter((t) => t.isCompleted).length;

  return (
    <main className="max-w-xl mx-auto min-h-screen py-12 px-4 flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-zinc-500">
          Drag and drop individual items to restructure prioritization indices.
        </p>
      </header>
      
      <TodoForm />
      <hr className="border-zinc-200 dark:border-zinc-800" />
      <TodoList initialTodos={initialTodos} />

      <div className="flex justify-end">
        <TodoClearButton completedCount={completedCount} />
      </div>
    </main>
  );
}