import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/types";

export function useOllamaChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize chat with a welcome message
  const initChat = (model: string) => {
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: "Hello! I'm your Ollama assistant. How can I help you today?",
      model,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
    return saveMessage(welcomeMessage);
  };

  // Send a message to the Ollama API and get a response
  const sendMessage = async (userInput: string, model: string) => {
    if (!userInput.trim()) return;

    setIsLoading(true);

    try {
      // Create and add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: userInput,
        model,
        timestamp: new Date().toISOString(),
      };

      // Update UI with user message
      setMessages((prev) => [...prev, userMessage]);
      
      // Save user message
      await saveMessage(userMessage);
      
      // Send to Ollama API
      const response = await apiRequest('POST', '/api/ollama/chat', {
        model,
        prompt: userInput
      });
      
      const data = await response.json();
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        model,
        timestamp: new Date().toISOString(),
      };
      
      // Update UI with assistant message
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save assistant message
      await saveMessage(assistantMessage);
      
      return data;
    } catch (error) {
      console.error("Error in chat:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to communicate with Ollama",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Save message to the server
  const saveMessage = async (message: ChatMessage) => {
    try {
      const response = await apiRequest('POST', '/api/messages', message);
      return await response.json();
    } catch (error) {
      console.error("Error saving message:", error);
      toast({
        title: "Error",
        description: "Failed to save message",
        variant: "destructive",
      });
      return null;
    }
  };

  // Load messages from the server
  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('GET', '/api/messages', undefined);
      const data = await response.json();
      setMessages(data);
      return data;
    } catch (error) {
      console.error("Error loading messages:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all messages
  const clearMessages = async () => {
    setIsLoading(true);
    try {
      await apiRequest('DELETE', '/api/messages', undefined);
      setMessages([]);
    } catch (error) {
      console.error("Error clearing messages:", error);
      toast({
        title: "Error",
        description: "Failed to clear messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    loadMessages,
    clearMessages,
    initChat
  };
}
