import { useState, useRef, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Search, Folder, CheckSquare, Sparkles } from "lucide-react";
import { useKeyPress } from "@/hooks/useKeyPress";
import { Dialog } from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Id } from "../../../convex/_generated/dataModel";
import { Project, Task } from "@/types";

export function Navbar() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  const project = useQuery(
    api.projects.get,
    projectId ? { id: projectId as Id<"projects"> } : "skip"
  ) as Project | null | undefined;

  // Fetch all projects and tasks for workspace search
  const allProjects = useQuery(api.projects.list, {}) as Project[] | undefined;
  const allTasks = useQuery(api.tasks.all, {}) as Task[] | undefined;

  // Open search modal on pressing "/"
  useKeyPress("/", () => {
    setIsSearchOpen(true);
  });

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  // Filter projects and tasks locally for instant search response
  const filteredProjects = searchQuery.trim()
    ? (allProjects || []).filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredTasks = searchQuery.trim()
    ? (allTasks || []).filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getBreadcrumbs = () => {
    if (projectId && project) {
      return (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link to="/" className="hover:text-slate-200 transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold truncate max-w-[180px]">{project.title}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-sm text-slate-200 font-semibold">
        <span>Dashboard</span>
      </div>
    );
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-6 flex-shrink-0">
        <div>{getBreadcrumbs()}</div>

        <div className="flex items-center gap-4">
          {/* Search Button trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs transition-all w-48 justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span>Search...</span>
            </div>
            <kbd className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-750 text-[10px] text-slate-500 font-semibold">
              /
            </kbd>
          </button>
        </div>
      </header>

      {/* Global Command Palette Search Modal */}
      <Dialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Workspace Instant Search"
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search project names, task titles, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-4 mt-2 max-h-[300px] overflow-y-auto pr-1">
            {searchQuery.trim() === "" ? (
              <div className="text-center py-6 text-slate-500 flex flex-col items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400/80 animate-pulse-slow" />
                <p className="text-xs">Type to search projects and tasks across the workspace.</p>
              </div>
            ) : filteredProjects.length === 0 && filteredTasks.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500 italic">No matches found for "{searchQuery}"</p>
            ) : (
              <>
                {/* Project Matches */}
                {filteredProjects.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Projects</h4>
                    <div className="space-y-1">
                      {filteredProjects.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            navigate(`/project/${p._id}`);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/60 text-slate-300 hover:text-slate-100 transition-colors text-left text-xs"
                        >
                          <Folder className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                          <span className="font-medium truncate">{p.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Task Matches */}
                {filteredTasks.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 mt-2">Tasks</h4>
                    <div className="space-y-1">
                      {filteredTasks.map((t) => (
                        <button
                          key={t._id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            // Navigate to project detail and highlight/focus task
                            navigate(`/project/${t.projectId}?task=${t._id}`);
                          }}
                          className="w-full flex flex-col gap-0.5 px-3 py-2 rounded-lg hover:bg-slate-800/60 text-left transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2 text-slate-300 hover:text-slate-100 font-medium">
                            <CheckSquare className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                            <span className="truncate">{t.title}</span>
                            <span className="text-[10px] text-slate-500 ml-auto font-normal italic">in {t.projectName}</span>
                          </div>
                          {t.description && (
                            <p className="text-[11px] text-slate-500 truncate pl-6">{t.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
