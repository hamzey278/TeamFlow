import { mutation, query } from "./_generated/server.js";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_projectId", (q: any) => q.eq("projectId", args.projectId))
      .collect();

    const tasksWithAssignee = await Promise.all(
      tasks.map(async (task: any) => {
        let assignee = null;
        if (task.assignedUserId) {
          assignee = await ctx.db.get(task.assignedUserId);
        }
        return {
          ...task,
          assigneeName: assignee?.name || null,
          assigneeImage: assignee?.image || null,
        };
      })
    );

    return tasksWithAssignee;
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.number(),
    assignedUserId: v.optional(v.id("users")),
  },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    const userName = user?.name || "Someone";

    const taskId = await ctx.db.insert("tasks", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      status: args.status,
      priority: args.priority,
      dueDate: args.dueDate,
      assignedUserId: args.assignedUserId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("activity", {
      projectId: args.projectId,
      userId,
      action: `${userName} added task "${args.title}"`,
      createdAt: Date.now(),
    });

    return taskId;
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.number(),
    assignedUserId: v.optional(v.id("users")),
  },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    const userName = user?.name || "Someone";

    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      priority: args.priority,
      dueDate: args.dueDate,
      assignedUserId: args.assignedUserId,
    });

    await ctx.db.insert("activity", {
      projectId: task.projectId,
      userId,
      action: `${userName} updated task "${args.title}"`,
      createdAt: Date.now(),
    });

    return args.id;
  },
});

export const move = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
  },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    const userName = user?.name || "Someone";

    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    if (task.status === args.status) return args.id;

    await ctx.db.patch(args.id, {
      status: args.status,
    });

    const statusLabel =
      args.status === "todo"
        ? "Todo"
        : args.status === "in_progress"
          ? "In Progress"
          : "Done";

    await ctx.db.insert("activity", {
      projectId: task.projectId,
      userId,
      action: `${userName} moved task "${task.title}" to ${statusLabel}`,
      createdAt: Date.now(),
    });

    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    const userName = user?.name || "Someone";

    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    await ctx.db.delete(args.id);

    await ctx.db.insert("activity", {
      projectId: task.projectId,
      userId,
      action: `${userName} deleted task "${task.title}"`,
      createdAt: Date.now(),
    });

    return args.id;
  },
});

export const all = query({
  args: {},
  handler: async (ctx: any) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const tasks = await ctx.db.query("tasks").collect();

    const enriched = await Promise.all(
      tasks.map(async (task: any) => {
        const project = await ctx.db.get(task.projectId);
        let assignee = null;
        if (task.assignedUserId) {
          assignee = await ctx.db.get(task.assignedUserId);
        }
        return {
          ...task,
          projectName: project?.title || "Unknown Project",
          assigneeName: assignee?.name || null,
          assigneeImage: assignee?.image || null,
        };
      })
    );
    return enriched;
  },
});
