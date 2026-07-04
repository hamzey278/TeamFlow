import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Dialog } from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { Task, User } from "@/types";
import { Id } from "../../../convex/_generated/dataModel";
import { Trash2 } from "lucide-react";
import confetti from "canvas-confetti";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: Id<"projects">;
  initialStatus?: "todo" | "in_progress" | "done";
}

export function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  initialStatus = "todo",
}: CreateTaskModalProps) {
  const createTask = useMutation(api.tasks.create);
  const users = useQuery(api.users.list, {}) as User[] | undefined;
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">(initialStatus);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignedUserId, setAssignedUserId] = useState<string>("unassigned");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setStatus(initialStatus);
      setPriority("medium");
      setDueDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]); // Tomorrow
      setAssignedUserId("unassigned");
      setError("");
    }
  }, [isOpen, initialStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const selectedAssignee = assignedUserId === "unassigned" ? undefined : (assignedUserId as Id<"users">);
      
      await createTask({
        projectId,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: new Date(dueDate).getTime(),
        assignedUserId: selectedAssignee,
      });

      if (status === "done") {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      }

      toast(`Task "${title}" created successfully!`, "success");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create task");
      toast("Error creating task", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const userOptions = [
    { value: "unassigned", label: "Unassigned" },
    ...(users || []).map((u) => ({ value: u._id, label: u.name || u.email || "User" })),
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Create Task
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g. Implement Oauth"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          error={error}
          disabled={isLoading}
          required
        />
        <Textarea
          label="Task Description"
          placeholder="Detailed task goals and specifications..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Column / Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: "todo", label: "Todo" },
              { value: "in_progress", label: "In Progress" },
              { value: "done", label: "Done" },
            ]}
            disabled={isLoading}
          />
          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            disabled={isLoading}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isLoading}
          />
          <Select
            label="Assignee"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
            options={userOptions}
            disabled={isLoading}
          />
        </div>
      </form>
    </Dialog>
  );
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);
  const updateStatus = useMutation(api.tasks.move);
  const users = useQuery(api.users.list, {}) as User[] | undefined;
  const { toast } = useToast();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">(task.status);
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task.priority);
  const [dueDate, setDueDate] = useState(new Date(task.dueDate).toISOString().split("T")[0]);
  const [assignedUserId, setAssignedUserId] = useState<string>(task.assignedUserId || "unassigned");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(new Date(task.dueDate).toISOString().split("T")[0]);
      setAssignedUserId(task.assignedUserId || "unassigned");
      setError("");
    }
  }, [isOpen, task]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const selectedAssignee = assignedUserId === "unassigned" ? undefined : (assignedUserId as Id<"users">);
      
      // Update basic fields
      await updateTask({
        id: task._id,
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: new Date(dueDate).getTime(),
        assignedUserId: selectedAssignee,
      });

      // Update status if changed
      if (status !== task.status) {
        await updateStatus({ id: task._id, status });
        if (status === "done") {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
        }
      }

      toast(`Task "${title}" updated successfully!`, "success");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update task");
      toast("Error updating task", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteTask({ id: task._id });
      toast(`Task "${task.title}" deleted.`, "success");
      onClose();
    } catch (err) {
      toast("Failed to delete task", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const userOptions = [
    { value: "unassigned", label: "Unassigned" },
    ...(users || []).map((u) => ({ value: u._id, label: u.name || u.email || "User" })),
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={isLoading}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-550/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Task
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              Close
            </Button>
            <Button onClick={handleUpdate} isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleUpdate} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g. Implement Oauth"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          error={error}
          disabled={isLoading}
          required
        />
        <Textarea
          label="Task Description"
          placeholder="Detailed task goals and specifications..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Column / Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: "todo", label: "Todo" },
              { value: "in_progress", label: "In Progress" },
              { value: "done", label: "Done" },
            ]}
            disabled={isLoading}
          />
          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            disabled={isLoading}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isLoading}
          />
          <Select
            label="Assignee"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
            options={userOptions}
            disabled={isLoading}
          />
        </div>
      </form>
    </Dialog>
  );
}
