import { Task } from "@/types";
import { useDraggable } from "@dnd-kit/core";
import { Calendar, GripVertical, User2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  const isOverdue = task.dueDate < Date.now() && task.status !== "done";

  const formattedDate = new Date(task.dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const priorityColors = {
    low: "bg-slate-800 text-slate-400 border-slate-700/40",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    high: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "glass-card p-4 rounded-xl relative flex flex-col gap-3 group/card border hover:border-slate-750",
        isDragging && "opacity-40 border-dashed border-indigo-500/50 shadow-none scale-95"
      )}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div
          {...listeners}
          {...attributes}
          className="text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-grab active:cursor-grabbing hover:bg-slate-800"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Task Title (Click opens modal) */}
        <h4
          onClick={onClick}
          className="font-medium text-sm text-slate-200 group-hover/card:text-indigo-400 transition-colors flex-1 cursor-pointer line-clamp-2 leading-snug"
        >
          {task.title}
        </h4>
      </div>

      {task.description && (
        <p
          onClick={onClick}
          className="text-xs text-slate-400 line-clamp-2 leading-relaxed pl-7 cursor-pointer"
        >
          {task.description}
        </p>
      )}

      {/* Badges and Assignee */}
      <div className="flex items-center justify-between border-t border-slate-800/40 pt-3 pl-7">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider",
              priorityColors[task.priority]
            )}
          >
            {task.priority}
          </span>

          {/* Due date */}
          <span
            className={cn(
              "flex items-center gap-1 text-[10px] font-medium text-slate-500",
              isOverdue && "text-red-400"
            )}
          >
            {isOverdue ? (
              <Clock className="h-3 w-3 text-red-400 animate-pulse-slow" />
            ) : (
              <Calendar className="h-3 w-3 text-slate-500" />
            )}
            <span>{formattedDate}</span>
          </span>
        </div>

        {/* Assignee */}
        <div className="flex-shrink-0">
          {task.assigneeImage ? (
            <img
              src={task.assigneeImage}
              alt={task.assigneeName || "Assignee"}
              className="h-5.5 w-5.5 rounded-full border border-slate-800 bg-slate-800 object-cover"
              title={`Assigned to ${task.assigneeName}`}
            />
          ) : task.assigneeName ? (
            <div
              className="h-5.5 w-5.5 rounded-full bg-indigo-900/40 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[9px]"
              title={`Assigned to ${task.assigneeName}`}
            >
              {task.assigneeName[0]?.toUpperCase()}
            </div>
          ) : (
            <div className="h-5.5 w-5.5 rounded-full bg-slate-800/80 border border-slate-700/40 text-slate-500 flex items-center justify-center" title="Unassigned">
              <User2 className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
