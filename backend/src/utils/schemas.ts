import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    college: z.string().optional(),
    degree: z.string().optional(),
    gradYear: z.string().optional(),
    skills: z.array(z.string()).optional(),
    goals: z.array(z.string()).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const opportunitySchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    budget: z.string().min(1, "Budget is required"),
    tags: z.array(z.string()).optional(),
    clientName: z.string().min(2, "Client name is required"),
    deadline: z.string().min(1, "Deadline is required"),
    duration: z.string().optional(),
    teamSizeNeeded: z.number().optional(),
  }),
});

export const teamSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Team name must be at least 2 characters"),
    description: z.string().optional(),
  }),
});

export const taskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    assigneeId: z.string().optional(),
  }),
});

export const postSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Post content cannot be empty"),
    spaceName: z.string().optional(),
  }),
});
