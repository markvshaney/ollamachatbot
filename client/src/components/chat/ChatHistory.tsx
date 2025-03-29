import { useRef, useEffect } from "react";
import { ChatMessage } from "@/types";
import { User, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export default function ChatHistory({ messages, isLoading }: ChatHistoryProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Format message content with basic markdown-like formatting
  const formatMessageContent = (content: string) => {
    // Replace newlines with <br>
    let formattedContent = content.replace(/\n/g, '<br>');
    
    // Simple code block formatting (backticks)
    formattedContent = formattedContent.replace(
      /`([^`]+)`/g, 
      '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">$1</code>'
    );
    
    // Bold text (asterisks)
    formattedContent = formattedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic text (underscores)
    formattedContent = formattedContent.replace(/\_([^_]+)\_/g, '<em>$1</em>');
    
    return formattedContent;
  };

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
    >
      {messages.map((message, index) => (
        <div key={index} className="message-appear">
          {message.role === 'user' ? (
            // User message
            <div className="flex items-start justify-end">
              <div className="bg-primary text-white rounded-lg p-3 shadow max-w-[80%] text-sm">
                <p>{message.content}</p>
              </div>
              <div className="flex-shrink-0 ml-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
              </div>
            </div>
          ) : (
            // AI message
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <Laptop className="h-5 w-5" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow max-w-[80%] text-sm">
                <p 
                  className="text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Typing indicator */}
      {isLoading && (
        <div className="message-appear">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <Laptop className="h-5 w-5" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow inline-block">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
