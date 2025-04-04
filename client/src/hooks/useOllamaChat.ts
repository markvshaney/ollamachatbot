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
      try {
        await saveMessage(userMessage);
      } catch (error) {
        console.error("Failed to save user message:", error);
        // Continue even if saving fails
      }
      
      // Send to Ollama API
      const response = await apiRequest('POST', '/api/ollama/chat', {
        model,
        prompt: userInput
      });
      
      const data = await response.json();
      
      if (!data || !data.response) {
        throw new Error("Invalid or empty response from Ollama API");
      }
      
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
      try {
        await saveMessage(assistantMessage);
      } catch (error) {
        console.error("Failed to save assistant message:", error);
        // Show error but don't interrupt the flow
        toast({
          title: "Warning",
          description: "Message displayed but could not be saved",
          variant: "destructive",
        });
      }
      
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
    console.log("Beginning saveMessage function with data:", JSON.stringify(message, null, 2));
    
    try {
      // Use fetch directly to have more control
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      console.log("API request completed, response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server returned ${response.status}: ${errorText || response.statusText}`);
      }
      
      let data;
      try {
        const textResponse = await response.text();
        console.log("Raw response text:", textResponse);
        
        // Only try to parse if there's content
        if (textResponse) {
          data = JSON.parse(textResponse);
          console.log("Message saved successfully, parsed data:", data);
        } else {
          console.log("Empty response received");
          data = {};
        }
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid JSON response from server");
      }
      
      return data;
    } catch (error) {
      console.error("Error in saveMessage function:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to save message: ${error.message}` 
          : "Failed to save message",
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
