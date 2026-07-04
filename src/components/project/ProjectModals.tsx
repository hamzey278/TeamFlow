import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Dialog } from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { Project } from "@/types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const createProject = useMutation(api.projects.create);
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setDescription("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await createProject({ title: title.trim(), description: description.trim() });
      toast(`Project "${title}" created successfully!`, "success");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
      toast("Failed to create project", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Create Project
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Title"
          placeholder="e.g. Website Redesign"
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
          label="Project Description"
          placeholder="Brief summary of project goals, team, and deliverables..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
      </form>
    </Dialog>
  );
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export function EditProjectModal({ isOpen, onClose, project }: EditProjectModalProps) {
  const updateProject = useMutation(api.projects.update);
  const { toast } = useToast();

  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(project.title);
      setDescription(project.description);
      setError("");
    }
  }, [isOpen, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await updateProject({
        id: project._id,
        title: title.trim(),
        description: description.trim(),
      });
      toast(`Project "${title}" updated successfully!`, "success");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
      toast("Failed to update project", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Project Details"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Title"
          placeholder="e.g. Website Redesign"
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
          label="Project Description"
          placeholder="Brief summary of project goals, team, and deliverables..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
      </form>
    </Dialog>
  );
}
