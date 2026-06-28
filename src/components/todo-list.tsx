"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { DbTodo } from "@/lib/db/schema";
import { updateTodoOrder, toggleMultipleTodos } from "@/app/actions";
import { TodoItem } from "./todo-item";

interface TodoListProps {
  initialTodos: DbTodo[];
}

export function TodoList({ initialTodos }: TodoListProps) {
  const [items, setItems] = useState<DbTodo[]>(initialTodos);
  const [isPending, startTransition] = useTransition();

  const allChecked = useMemo(() => items.every((item) => item.isCompleted), [items]);
  const someChecked = useMemo(() => items.some((item) => item.isCompleted) && !allChecked, [items,allChecked]);

  const handleSelectAllChange = () => {
    const targetChecked = !allChecked;
    
    // Optimistic Update
    const updatedItems = items.map((item) => ({
      ...item,
      isCompleted: targetChecked,
    }));
    
    setItems(updatedItems);
    
    // Batch Updates
    startTransition(async () => {
      // Find all IDs that need to be updated
      const idsToUpdate = updatedItems
        .filter((item) => item.isCompleted === targetChecked)
        .map((item) => item.id);
      
      if (idsToUpdate.length > 0) {
        await toggleMultipleTodos(idsToUpdate, targetChecked);
      }
    });
  }

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
    <>
      <label className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
        <input
          type="checkbox"
          checked={allChecked}
          // React hook trick to apply indeterminate state directly in TSX
          ref={(el) => {
            if (el) el.indeterminate = someChecked;
          }}
          onChange={handleSelectAllChange}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
        />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {allChecked ? 'Unselect All' : 'Select All Tasks'}
        </span>
      </label>
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
    </>
  );
}