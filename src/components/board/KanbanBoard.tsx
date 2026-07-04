import { useState } from "react";
import { Task } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { CreateTaskModal, TaskDetailModal } from "./TaskModals";
import { useToast } from "../ui/Toast";
import confetti from "canvas-confetti";

interface KanbanBoardProps {
  projectId: Id<"projects">;
  tasks: Task[];
}

export function KanbanBoard({ projectId, tasks }: KanbanBoardProps) {
  const updateTaskStatus = useMutation(api.tasks.move);
  const { toast } = useToast();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<"todo" | "in_progress" | "done">("todo");

  // Filter tasks into columns
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Avoid accidental drags on click
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as Id<"tasks">;
    const targetStatus = over.id as "todo" | "in_progress" | "done";

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === targetStatus) return;

    try {
      // Optimistically update status or call mutation (Convex is so fast it updates instantly)
      await updateTaskStatus({ id: taskId, status: targetStatus });
      
      // Fire confetti when a task is moved to "Done"
      if (targetStatus === "done") {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
        });
        toast(`Task "${task.title}" completed!`, "success");
      } else {
        const columnLabels = { todo: "Todo", in_progress: "In Progress", done: "Done" };
        toast(`Moved "${task.title}" to ${columnLabels[targetStatus]}`, "info");
      }
    } catch (err) {
      toast("Failed to move task", "error");
    }
  };

  const handleOpenCreateModal = (status: "todo" | "in_progress" | "done") => {
    setCreateInitialStatus(status);
    setIsCreateOpen(true);
  };

  const handleOpenDetailModal = (task: Task) => {
    setActiveTask(task);
    setIsDetailOpen(true);
  };

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <KanbanColumn
            id="todo"
            title="To Do"
            tasks={todoTasks}
            onAddTaskClick={() => handleOpenCreateModal("todo")}
            onTaskClick={handleOpenDetailModal}
          />
          <KanbanColumn
            id="in_progress"
            title="In Progress"
            tasks={inProgressTasks}
            onAddTaskClick={() => handleOpenCreateModal("in_progress")}
            onTaskClick={handleOpenDetailModal}
          />
          <KanbanColumn
            id="done"
            title="Done"
            tasks={doneTasks}
            onAddTaskClick={() => handleOpenCreateModal("done")}
            onTaskClick={handleOpenDetailModal}
          />
        </div>
      </DndContext>

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={projectId}
        initialStatus={createInitialStatus}
      />

      {activeTask && (
        <TaskDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setActiveTask(null);
          }}
          task={activeTask}
        />
      )}
    </>
  );
}
