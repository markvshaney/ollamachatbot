import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatHistory from "@/components/chat/ChatHistory";
import ChatInput from "@/components/chat/ChatInput";
import ModelSelector from "@/components/chat/ModelSelector";
import { useTheme } from "@/components/ui/theme-provider";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage, ModelsResponse } from "@/types";
import { Sun, Moon, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("llama2");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available models from the Ollama API
  const { data: modelsData, isLoading: isLoadingModels, error: modelsError } = useQuery<ModelsResponse>({
    queryKey: ['/api/ollama/models'],
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Fetch existing messages
  const { data: existingMessages, isLoading: isLoadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ['/api/messages'],
    onSuccess: (data) => {
      if (data.length > 0) {
        setMessages(data);
      } else {
        // Add welcome message if no messages exist
        const welcomeMessage: ChatMessage = {
          role: 'assistant',
          content: "Hello! I'm your Ollama assistant. How can I help you today?",
          model: selectedModel,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
        sendMessageToServer(welcomeMessage);
      }
    },
    onError: () => {
      // Add welcome message if fetching fails
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: "Hello! I'm your Ollama assistant. How can I help you today?",
        model: selectedModel,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    },
  });

  // Send message to Ollama API
  const sendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;

    setIsLoading(true);

    // Create and add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput,
      model: selectedModel,
      timestamp: new Date().toISOString(),
    };

    // Update UI with user message
    setMessages((prev) => [...prev, userMessage]);
    
    // Save user message to our API
    try {
      await sendMessageToServer(userMessage);
      
      try {
        // Send request to Ollama API
        const response = await apiRequest('POST', '/api/ollama/chat', {
          model: selectedModel,
          prompt: userInput
        });
        
        const data = await response.json();
        
        // Create assistant message from response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
          model: selectedModel,
          timestamp: new Date().toISOString(),
        };
        
        // Update UI with assistant message
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Save assistant message to our API
        await sendMessageToServer(assistantMessage);
      } catch (error) {
        // Handle Ollama API error
        console.error("Error calling Ollama API:", error);
        toast({
          title: "API Error",
          description: error instanceof Error ? error.message : "Failed to get response from Ollama",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Handle error saving message
      console.error("Error saving message:", error);
      toast({
        title: "Error",
        description: "Failed to save message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save message to server
  const sendMessageToServer = async (message: ChatMessage) => {
    await apiRequest('POST', '/api/messages', message);
  };

  // Handle model change
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-primary" />
            Ollama Chat
          </h1>
        </div>
        <div className="flex items-center">
          {/* Model Selector */}
          <ModelSelector 
            selectedModel={selectedModel} 
            models={modelsData?.models || []} 
            onModelChange={handleModelChange}
            isLoading={isLoadingModels}
          />
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>
      
      {/* Chat Container */}
      <ChatHistory 
        messages={messages} 
        isLoading={isLoading}
      />
      
      {/* Message Input */}
      <ChatInput 
        onSendMessage={sendMessage}
        isLoading={isLoading}
        currentModel={selectedModel}
      />
    </div>
  );
}
