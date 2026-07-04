import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { FolderKanban, Github, Chrome, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export function Login() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: "github" | "google") => {
    setIsLoading(provider);
    try {
      await signIn(provider);
    } catch (err: any) {
      toast(err?.message || `Failed to sign in with ${provider}`, "error");
      setIsLoading(null);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden px-4">
      {/* Dynamic colorful blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-650/10 rounded-full blur-3xl animate-float pointer-events-none" />

      {/* Main card container */}
      <div className="relative z-10 w-full max-w-md glass p-8 rounded-2xl shadow-2xl flex flex-col gap-6 text-center animate-in fade-in zoom-in-95 duration-350">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-indigo-650/20 p-3.5 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-inner mb-2 animate-float">
            <FolderKanban className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Welcome to TeamFlow
          </h1>
          <p className="text-xs text-slate-400 max-w-[260px] mx-auto mt-0.5">
            Real-time project management and Kanban boards for productive engineering teams.
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2.5 py-3 border-slate-700/80 hover:bg-slate-900 cursor-pointer"
            onClick={() => handleSignIn("github")}
            isLoading={isLoading === "github"}
            disabled={isLoading !== null}
          >
            <Github className="h-4.5 w-4.5 text-slate-200" />
            <span>Continue with GitHub</span>
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2.5 py-3 border-slate-700/80 hover:bg-slate-900 cursor-pointer"
            onClick={() => handleSignIn("google")}
            isLoading={isLoading === "google"}
            disabled={isLoading !== null}
          >
            <Chrome className="h-4.5 w-4.5 text-red-400" />
            <span>Continue with Google</span>
          </Button>
        </div>

        {/* Note on environment configuration */}
        <div className="mt-4 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex gap-3 text-left">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Configuration required
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              OAuth providers require configuring secret keys in your Convex cloud console. Refer to the project README instructions for guide setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
