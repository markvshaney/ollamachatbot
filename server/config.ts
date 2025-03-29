// Server configuration

// Ollama API configuration
export const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://127.0.0.1:11434";

// Debug mode for verbose logging
export const DEBUG = process.env.DEBUG === "true";

// Helper function to log if debug mode is enabled
export const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data || "");
  }
};