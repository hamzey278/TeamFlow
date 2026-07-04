import { Id } from "../../convex/_generated/dataModel";

export interface User {
  _id: Id<"users">;
  _creationTime: number;
  name?: string;
  email?: string;
  image?: string;
  emailVerificationTime?: number;
  phone?: string;
  phoneVerificationTime?: number;
  isAnonymous?: boolean;
}

export interface Project {
  _id: Id<"projects">;
  _creationTime: number;
  title: string;
  description: string;
  userId: Id<"users">;
  createdAt: number;
  ownerName: string;
  ownerImage: string;
  totalTasks?: number;
  completedTasks?: number;
}

export interface Task {
  _id: Id<"tasks">;
  _creationTime: number;
  projectId: Id<"projects">;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: number;
  assignedUserId?: Id<"users">;
  createdAt: number;
  assigneeName: string | null;
  assigneeImage: string | null;
  projectName?: string;
}

export interface Activity {
  _id: Id<"activity">;
  _creationTime: number;
  projectId: Id<"projects">;
  userId: Id<"users">;
  action: string;
  createdAt: number;
  userName: string;
  userImage: string;
}
