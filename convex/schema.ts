import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    userId: v.id("users"), // Owner
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  tasks: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.number(), // timestamp
    assignedUserId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_assignedUserId", ["assignedUserId"]),

  activity: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"), // Actor
    action: v.string(),
    createdAt: v.number(),
  }).index("by_projectId", ["projectId"]),
});
