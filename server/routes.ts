import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import axios from "axios";
import { z } from "zod";
import { OLLAMA_API_URL, debugLog } from "./config";

export async function registerRoutes(app: Express): Promise<Server> {
  // Disable compression for API routes to avoid streaming issues
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      res.setHeader('Content-Encoding', 'identity');
      res.setHeader('Transfer-Encoding', 'identity');
    }
    next();
  });

  // API routes
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(messages));
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      console.log("Received message data:", JSON.stringify(req.body, null, 2));
      
      // Try parsing with the schema
      const messageData = insertMessageSchema.parse(req.body);
      console.log("Validated message data:", JSON.stringify(messageData, null, 2));
      
      const message = await storage.addMessage(messageData);
      console.log("Saved message:", JSON.stringify(message, null, 2));
      
      // Ensure proper response formatting
      res.setHeader('Content-Type', 'application/json');
      res.status(201).send(JSON.stringify(message));
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", JSON.stringify(error.errors, null, 2));
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ 
          message: "Invalid message data", 
          errors: error.errors,
          receivedData: req.body 
        }));
      } else {
        console.error("Error adding message:", error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({ 
          message: "Failed to add message",
          error: error instanceof Error ? error.message : "Unknown error" 
        }));
      }
    }
  });

  app.delete("/api/messages", async (req, res) => {
    try {
      await storage.clearMessages();
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({ message: "All messages cleared" }));
    } catch (error) {
      console.error("Error clearing messages:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send(JSON.stringify({ message: "Failed to clear messages" }));
    }
  });

  // Check Ollama API connection
  app.get("/api/ollama/status", async (req, res) => {
    try {
      const response = await axios.get(`${OLLAMA_API_URL}/api/version`, { timeout: 5000 });
      debugLog("Ollama status check:", response.data);
      res.json({ 
        connected: true, 
        version: response.data.version,
        url: OLLAMA_API_URL
      });
    } catch (error) {
      debugLog("Ollama connection error:", error);
      res.status(200).json({ 
        connected: false,
        url: OLLAMA_API_URL,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Ollama API proxy routes
  app.post("/api/ollama/chat", async (req, res) => {
    try {
      const { model, prompt } = req.body;
      
      if (!model || !prompt) {
        return res.status(400).json({ message: "Model and prompt are required" });
      }

      debugLog("Sending request to Ollama:", { model, prompt });
      const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
        model,
        prompt,
        stream: false
      });

      res.json(response.data);
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      
      // Handle connection errors specifically
      const axiosError = error as any;
      const isConnRefused = axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND';
      const statusCode = isConnRefused ? 503 : 500;
      const message = isConnRefused 
        ? `Could not connect to Ollama at ${OLLAMA_API_URL}`
        : "Failed to communicate with Ollama API";
        
      res.status(statusCode).json({ 
        message,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/ollama/models", async (req, res) => {
    try {
      debugLog("Fetching Ollama models");
      const response = await axios.get(`${OLLAMA_API_URL}/api/tags`);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching Ollama models:", error);
      
      // Handle connection errors specifically
      const axiosError = error as any;
      const isConnRefused = axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND';
      const statusCode = isConnRefused ? 503 : 500;
      const message = isConnRefused 
        ? `Could not connect to Ollama at ${OLLAMA_API_URL}`
        : "Failed to fetch models from Ollama";
        
      res.status(statusCode).json({ 
        message,
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
