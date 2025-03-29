import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import axios from "axios";
import { z } from "zod";

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.addMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        console.error("Error adding message:", error);
        res.status(500).json({ message: "Failed to add message" });
      }
    }
  });

  app.delete("/api/messages", async (req, res) => {
    try {
      await storage.clearMessages();
      res.status(200).json({ message: "All messages cleared" });
    } catch (error) {
      console.error("Error clearing messages:", error);
      res.status(500).json({ message: "Failed to clear messages" });
    }
  });

  // Ollama API proxy routes
  app.post("/api/ollama/chat", async (req, res) => {
    try {
      const { model, prompt } = req.body;
      
      if (!model || !prompt) {
        return res.status(400).json({ message: "Model and prompt are required" });
      }

      const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
        model,
        prompt,
        stream: false
      });

      res.json(response.data);
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      res.status(500).json({ 
        message: "Failed to communicate with Ollama API",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/ollama/models", async (req, res) => {
    try {
      const response = await axios.get(`${OLLAMA_API_URL}/api/tags`);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching Ollama models:", error);
      res.status(500).json({ 
        message: "Failed to fetch models from Ollama",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
