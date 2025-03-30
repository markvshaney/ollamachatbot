import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define Message type
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  model: text("model").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  model: z.string(),
  timestamp: z.string()
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Define API types for Ollama
export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface OllamaCompletionRequest {
  model: string;
  prompt: string;
  stream?: boolean;
}

export interface OllamaAvailableModelsResponse {
  models: OllamaModel[];
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

// Define users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
