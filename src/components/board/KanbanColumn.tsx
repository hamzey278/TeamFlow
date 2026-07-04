import { Task } from "@/types";
import { TaskCard } from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { Button } from "../ui/Button";

interface KanbanColumnProps {
  id: "todo" | "in_progress" | "done";
  title: string;
  tasks: Task[];
  onAddTaskClick: () => void;
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onAddTaskClick,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-full min-w-[280px] bg-slate-900/10 border border-slate-800/60 rounded-2xl p-4 transition-colors duration-200 min-h-[500px] ${
        isOver ? "bg-slate-900/40 border-indigo-500/20" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-slate-200">{title}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-bold">
            {tasks.length}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddTaskClick}
          className="h-8 w-8 p-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
        {tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 border border-dashed border-slate-800/40 rounded-xl">
            <span className="text-xs text-slate-500 italic">No tasks here</span>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  );
}
