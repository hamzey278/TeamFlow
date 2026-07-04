import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { CreateProjectModal } from "@/components/project/ProjectModals";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { Button } from "@/components/ui/Button";
import { FolderKanban, Plus, Layers, Flame } from "lucide-react";
import { Project, Task, User } from "@/types";

export function Dashboard() {
  const currentUser = useQuery(api.users.current, {}) as User | null | undefined;
  const projects = useQuery(api.projects.list, {}) as Project[] | undefined;
  const allTasks = useQuery(api.tasks.all, {}) as Task[] | undefined;

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const totalProjects = projects?.length ?? 0;
  const totalTasks = allTasks?.length ?? 0;
  const completedTasks = allTasks?.filter((t) => t.status === "done").length ?? 0;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      {/* Welcome Message Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>Welcome back,</span>
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {currentUser?.name || "Member"}
            </span>
            <span>👋</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Here's what's happening with your team projects today.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Project Card Metric */}
        <div className="glass p-5 rounded-xl flex items-center gap-4">
          <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-indigo-400">
            <FolderKanban className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Projects</p>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">
              {projects === undefined ? "..." : totalProjects}
            </h3>
          </div>
        </div>

        {/* Tasks Card Metric */}
        <div className="glass p-5 rounded-xl flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Tasks</p>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">
              {allTasks === undefined ? "..." : `${totalTasks - completedTasks} / ${totalTasks}`}
            </h3>
          </div>
        </div>

        {/* Completion Card Metric */}
        <div className="glass p-5 rounded-xl flex items-center gap-4">
          <div className="bg-violet-500/10 p-3 rounded-xl border border-violet-500/20 text-violet-400">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Completed Tasks</p>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">
              {allTasks === undefined ? "..." : completedTasks}
            </h3>
          </div>
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-200 uppercase tracking-wider">Projects</h2>
          <ProjectGrid projects={projects} onCreateOpen={() => setIsCreateOpen(true)} />
        </div>

        {/* Global Recent Activity Column */}
        <div className="glass p-5 rounded-2xl h-[500px] flex flex-col space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex-shrink-0">
            Recent Workspace Activity
          </h2>
          <div className="flex-1 overflow-y-auto pr-1">
            <ActivityFeed />
          </div>
        </div>
      </div>

      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
