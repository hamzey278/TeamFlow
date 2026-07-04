import { mutation, query } from "./_generated/server.js";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx: any) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const projects = await ctx.db.query("projects").order("desc").collect();

    const projectsWithOwner = await Promise.all(
      projects.map(async (project: any) => {
        const owner = await ctx.db.get(project.userId);

        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_projectId", (q: any) => q.eq("projectId", project._id))
          .collect();

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t: any) => t.status === "done").length;

        return {
          ...project,
          ownerName: owner?.name || "Unknown User",
          ownerImage: owner?.image || "",
          totalTasks,
          completedTasks,
        };
      })
    );

    return projectsWithOwner;
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const project = await ctx.db.get(args.id);
    if (!project) return null;

    const owner = await ctx.db.get(project.userId);

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_projectId", (q: any) => q.eq("projectId", args.id))
      .collect();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === "done").length;

    return {
      ...project,
      ownerName: owner?.name || "Unknown User",
      ownerImage: owner?.image || "",
      totalTasks,
      completedTasks,
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    const userName = user?.name || "Someone";

    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      description: args.description,
      userId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("activity", {
      projectId,
      userId,
      action: `${userName} created Project "${args.title}"`,
      createdAt: Date.now(),
    });

    return projectId;
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    const userName = user?.name || "Someone";

    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
    });

    await ctx.db.insert("activity", {
      projectId: args.id,
      userId,
      action: `${userName} updated Project details for "${args.title}"`,
      createdAt: Date.now(),
    });

    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    // Delete tasks associated with this project
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_projectId", (q: any) => q.eq("projectId", args.id))
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    // Delete activities associated with this project
    const activities = await ctx.db
      .query("activity")
      .withIndex("by_projectId", (q: any) => q.eq("projectId", args.id))
      .collect();

    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }

    // Delete project
    await ctx.db.delete(args.id);

    return args.id;
  },
});
