import { Project } from "@/types";
import { ProjectCard } from "./ProjectCard";
import { Skeleton } from "../ui/Skeleton";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "../ui/Button";

interface ProjectGridProps {
  projects: Project[] | undefined;
  onCreateOpen: () => void;
}

export function ProjectGrid({ projects, onCreateOpen }: ProjectGridProps) {
  if (projects === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-60 rounded-xl" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl p-8 max-w-xl mx-auto mt-6">
        <div className="h-16 w-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-5 animate-float">
          <FolderKanban className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-100 mb-2">No projects found</h3>
        <p className="text-sm text-slate-500 max-w-xs mb-6">
          Get started by creating your first collaborative workspace. Add tasks, timelines, and start managing!
        </p>
        <Button onClick={onCreateOpen} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create First Project
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
}
