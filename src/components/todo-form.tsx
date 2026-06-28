"use client";

import { useRef, useState } from "react";
import { createTodo } from "@/app/actions";

export function TodoForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);


  async function clientAction(formData: FormData) {
    setIsPending(true);
    setErrors([]);
    
    const rawData = { title: formData.get("title") };

    const response = await createTodo(rawData);

    setIsPending(false);

    console.log(response);

    if (response?.error) {
      setErrors(response.error.title || []);
    } else {
      formRef.current?.reset();
    }
  }

  return (
    <form ref={formRef} action={clientAction} className="flex flex-col gap-2 w-full">
      <div className="flex gap-2">
        <input
          type="text"
          name="title"
          placeholder="What needs to be done?"
          disabled={isPending}
          className="flex-1 px-4 py-2 border rounded-md dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Adding..." : "Add"}
        </button>
      </div>
      {errors.map((error) => (
        <p key={error} className="text-sm text-red-500 mt-1">{error}</p>
      ))}
    </form>
  );
}