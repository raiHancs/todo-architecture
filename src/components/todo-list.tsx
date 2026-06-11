"use client";

import { useState, useEffect, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { DbTodo } from "@/lib/db/schema";
import { updateTodoOrder } from "@/app/actions";
import { TodoItem } from "./todo-item";

interface TodoListProps {
  initialTodos: DbTodo[];
}

export function TodoList({ initialTodos }: TodoListProps) {
  const [items, setItems] = useState<DbTodo[]>(initialTodos);
  const [isPending, startTransition] = useTransition();

  // Keep local state synchronized if server components trigger a revalidation bypass
  useEffect(() => {
    setItems(initialTodos);
  }, [initialTodos]);

  async function handleOnDragEnd(result: DropResult) {
    if (!result.destination) return;

    // Rearrange our local array matching user placement (Optimistic UI Update)
    const reorderedItems = Array.from(items);
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);

    // Reassign correct consecutive position values
    const updatedPositions = reorderedItems.map((item, index) => ({
      ...item,
      position: index,
    }));

    setItems(updatedPositions);

    // Sync state layout directly down to backend
    startTransition(async () => {
      const payload = updatedPositions.map((item) => ({ id: item.id, position: item.position }));
      await updateTodoOrder(payload);
    });
  }

  if (items.length === 0) {
    return <div className="text-center py-8 text-zinc-500">All caught up! 🎉</div>;
  }

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="todos-list">
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef} 
            className={`flex flex-col gap-3 w-full transition-opacity ${isPending ? "opacity-70" : ""}`}
          >
            {items.map((todo, index) => (
              <Draggable key={todo.id} draggableId={todo.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      // Keep element layout clean during interactive transit
                      cursor: snapshot.isDragging ? "grabbing" : "grab",
                    }}
                  >
                    <TodoItem todo={todo} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}