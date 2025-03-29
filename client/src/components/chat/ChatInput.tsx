import { useState, useRef, useEffect, FormEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  currentModel: string;
}

export default function ChatInput({ onSendMessage, isLoading, currentModel }: ChatInputProps) {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    
    // Limit max height
    if (textarea.scrollHeight > 200) {
      textarea.style.overflowY = "auto";
      textarea.style.height = "200px";
    } else {
      textarea.style.overflowY = "hidden";
    }
  };

  // Adjust height when message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Handle keydown events (Ctrl+Enter or Command+Enter to submit)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      <div className="relative">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-grow relative">
            <textarea 
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary resize-none"
              placeholder="Type your message..." 
              rows={1}
              disabled={isLoading}
            />
            {error && (
              <div className="text-error text-xs mt-1 ml-1">{error}</div>
            )}
          </div>
          <button 
            type="submit" 
            className="bg-primary hover:bg-blue-600 text-white rounded-lg p-3 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !message.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
        Powered by Ollama API · Using <span id="currentModel">{currentModel}</span> model
      </div>
    </div>
  );
}
