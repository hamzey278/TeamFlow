import { query } from "./_generated/server.js";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { projectId: v.optional(v.id("projects")) },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    let activities;
    if (args.projectId) {
      activities = await ctx.db
        .query("activity")
        .withIndex("by_projectId", (q: any) => q.eq("projectId", args.projectId!))
        .order("desc")
        .take(50);
    } else {
      activities = await ctx.db.query("activity").order("desc").take(50);
    }

    const activitiesWithUser = await Promise.all(
      activities.map(async (activity: any) => {
        const actor = await ctx.db.get(activity.userId);
        return {
          ...activity,
          userName: actor?.name || "Unknown User",
          userImage: actor?.image || "",
        };
      })
    );

    return activitiesWithUser;
  },
});
