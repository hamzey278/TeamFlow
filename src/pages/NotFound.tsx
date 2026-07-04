import { Link } from "react-router-dom";
import { FolderKanban } from "lucide-react";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-center px-4">
      <div className="bg-indigo-650/20 p-5 rounded-2xl border border-indigo-500/20 text-indigo-400 mb-6 animate-float">
        <FolderKanban className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">404 - Page Not Found</h1>
      <p className="text-sm text-slate-400 mt-2 max-w-xs leading-relaxed">
        The link you followed may be broken or the page may have been removed. Let's get you back.
      </p>
      <Link to="/" className="mt-8">
        <Button className="cursor-pointer">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
