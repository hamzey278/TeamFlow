import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FolderKanban, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "../ui/Button";
import { Project, User } from "@/types";

export function Sidebar() {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();
  const projects = useQuery(api.projects.list, {}) as Project[] | undefined;
  const currentUser = useQuery(api.users.current, {}) as User | null | undefined;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const navLinks = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col h-screen overflow-hidden flex-shrink-0">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-800/60">
        <div className="bg-indigo-650/20 p-2 rounded-lg text-indigo-400 border border-indigo-500/20">
          <FolderKanban className="h-5 w-5" />
        </div>
        <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          TeamFlow
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-7">
        <div className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div>
          <h4 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Active Projects
          </h4>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {projects === undefined ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 rounded bg-slate-800/60 animate-pulse w-full mb-1" />
              ))
            ) : projects.length === 0 ? (
              <p className="px-3 text-xs text-slate-500 italic">No projects yet</p>
            ) : (
              projects.map((proj) => {
                const isActive = location.pathname === `/project/${proj._id}`;
                return (
                  <Link
                    key={proj._id}
                    to={`/project/${proj._id}`}
                    className={`flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-slate-800 text-indigo-400 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-indigo-500/80" />
                    <span className="truncate">{proj.title}</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800/60 bg-slate-900/30 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {currentUser?.image ? (
            <img
              src={currentUser.image}
              alt={currentUser.name || "User avatar"}
              className="h-9 w-9 rounded-full border border-slate-700 bg-slate-800 object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-indigo-400 text-xs">
              {currentUser?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-200 truncate">
              {currentUser?.name || "Loading..."}
            </h4>
            <p className="text-xs text-slate-500 truncate">
              {currentUser?.email || "Signed in"}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-xs border border-slate-800 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Log Out
        </Button>
      </div>
    </aside>
  );
}
