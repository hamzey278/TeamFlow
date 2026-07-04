import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ChevronLeft, History, SidebarClose, SidebarOpen, AlertCircle } from "lucide-react";
import { Project, Task } from "@/types";

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  
  const [isActivityOpen, setIsActivityOpen] = useState(true);

  // Fetch project details
  const project = useQuery(
    api.projects.get,
    projectId ? { id: projectId as Id<"projects"> } : "skip"
  ) as Project | null | undefined;

  // Fetch tasks for the project
  const tasks = useQuery(
    api.tasks.list,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  ) as Task[] | undefined;

  // Handle high-lighting a search task from global search breadcrumb query param
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTaskId = searchParams.get("task");
    if (searchTaskId) {
      // We can scroll to task card or flash it, or open it directly!
      // In this setup, we will look for a card with id and highlight it
      setTimeout(() => {
        const taskCardEl = document.getElementById(`task-card-${searchTaskId}`);
        if (taskCardEl) {
          taskCardEl.scrollIntoView({ behavior: "smooth", block: "center" });
          taskCardEl.classList.add("ring-2", "ring-indigo-500", "animate-pulse");
          setTimeout(() => {
            taskCardEl.classList.remove("ring-2", "ring-indigo-500", "animate-pulse");
          }, 3000);
        }
      }, 500);
    }
  }, [location.search, tasks]);

  if (project === undefined || tasks === undefined) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center py-20">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-100">Project Not Found</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-sm">
          The project you are trying to view does not exist or has been deleted by another user.
        </p>
        <Link to="/" className="mt-6">
          <Button variant="secondary">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden animate-in fade-in duration-300">
      {/* Kanban Board Container */}
      <div className="flex-1 flex flex-col min-w-0 p-6 overflow-y-auto">
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800/40 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="text-slate-500 hover:text-slate-350 p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800/60 bg-slate-900/10 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-xl font-bold text-slate-105">{project.title}</h1>
            </div>
            {project.description && (
              <p className="text-xs text-slate-400 mt-2 max-w-2xl pl-10 leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pl-10 md:pl-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsActivityOpen(!isActivityOpen)}
              className="flex items-center gap-2 border-slate-800 cursor-pointer"
            >
              <History className="h-4 w-4" />
              <span>Activity log</span>
              {isActivityOpen ? (
                <SidebarClose className="h-3.5 w-3.5 ml-1" />
              ) : (
                <SidebarOpen className="h-3.5 w-3.5 ml-1" />
              )}
            </Button>
          </div>
        </div>

        {/* Board */}
        <div className="flex-1">
          <KanbanBoard projectId={project._id} tasks={tasks} />
        </div>
      </div>

      {/* Collapsible Activity Sidebar Panel */}
      {isActivityOpen && (
        <aside className="w-80 border-l border-slate-800 bg-slate-900/30 flex flex-col h-full flex-shrink-0 animate-in slide-in-from-right duration-250">
          <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
            <h3 className="text-xs font-bold text-slate-205 uppercase tracking-wider">
              Project Activity
            </h3>
            <button
              onClick={() => setIsActivityOpen(false)}
              className="text-slate-500 hover:text-slate-350 cursor-pointer"
            >
              <SidebarClose className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
            <ActivityFeed projectId={project._id} />
          </div>
        </aside>
      )}
    </div>
  );
}
