import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Skeleton } from "../ui/Skeleton";
import { Activity as ActivityIcon } from "lucide-react";

import { Activity } from "@/types";

interface ActivityFeedProps {
  projectId?: Id<"projects">;
}

export function ActivityFeed({ projectId }: ActivityFeedProps) {
  const activities = useQuery(api.activity.list, { projectId }) as Activity[] | undefined;

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.round(diff / 60000);
    const hours = Math.round(diff / 3600000);
    const days = Math.round(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (activities === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/4 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-2 border border-dashed border-slate-800/40 rounded-xl">
        <ActivityIcon className="h-5 w-5 text-slate-650" />
        <p className="text-xs">No activities recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((act, index) => (
          <li key={act._id}>
            <div className="relative pb-8 animate-in fade-in duration-300">
              {index !== activities.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-800/60"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3 items-start">
                <div>
                  <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-slate-950 bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-800">
                    {act.userImage ? (
                      <img
                        src={act.userImage}
                        alt={act.userName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-indigo-400 font-bold text-[10px]">
                        {act.userName[0]?.toUpperCase()}
                      </div>
                    )}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-xs text-slate-350">
                    <span className="font-semibold text-slate-200 mr-1">{act.userName}</span>
                    {act.action.replace(act.userName, "").trim()}
                  </p>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {formatRelativeTime(act.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
