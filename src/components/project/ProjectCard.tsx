import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "@/types";
import { Edit2, Trash2, Calendar, MoreVertical } from "lucide-react";
import { EditProjectModal } from "./ProjectModals";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "../ui/Toast";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const deleteProject = useMutation(api.projects.remove);
  const { toast } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const total = project.totalTasks || 0;
  const completed = project.completedTasks || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete project "${project.title}"? This will delete all tasks and activities.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject({ id: project._id });
      toast(`Project "${project.title}" deleted successfully.`, "success");
    } catch (err) {
      toast("Failed to delete project", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(project.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <div
        onClick={() => navigate(`/project/${project._id}`)}
        className="glass-card flex flex-col p-5 rounded-xl cursor-pointer select-none group relative h-60"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors text-base truncate flex-1">
            {project.title}
          </h3>
          
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-400 hover:text-slate-205 p-1 rounded-md hover:bg-slate-800/80 cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 top-7 z-20 w-36 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 animate-in fade-in duration-100">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsEditOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 text-left cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Details
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Project
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed flex-1">
          {project.description || "No description provided."}
        </p>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Progress</span>
            <span className="font-semibold text-slate-300">
              {percent}% ({completed}/{total} tasks)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/40 pt-3 text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            {project.ownerImage ? (
              <img
                src={project.ownerImage}
                alt={project.ownerName}
                className="h-5 w-5 rounded-full border border-slate-800 object-cover"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[8px]">
                {project.ownerName[0]?.toUpperCase()}
              </div>
            )}
            <span className="truncate max-w-[80px] font-medium text-slate-400">{project.ownerName}</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <EditProjectModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={project}
      />
    </>
  );
}
