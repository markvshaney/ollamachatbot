import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle2, Settings, Loader2 } from "lucide-react";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  onConnectionChange?: (connected: boolean) => void;
}

export default function ConnectionStatus({ onConnectionChange }: ConnectionStatusProps) {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState("");
  const [version, setVersion] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Check connection status on component mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Call onConnectionChange when connection status changes
  useEffect(() => {
    if (onConnectionChange && isConnected !== null) {
      onConnectionChange(isConnected);
    }
  }, [isConnected, onConnectionChange]);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", "/api/ollama/status", undefined);
      const data = await response.json();
      setIsConnected(data.connected);
      setApiUrl(data.url);
      if (data.version) {
        setVersion(data.version);
      }
    } catch (error) {
      setIsConnected(false);
      console.error("Error checking connection status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs px-2"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isConnected ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
            )}
            <span className={cn(
              "hidden sm:inline-block",
              isConnected ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
            )}>
              {isLoading 
                ? "Checking..." 
                : isConnected 
                  ? `Connected ${version ? `(v${version})` : ''}` 
                  : "Not connected"}
            </span>
            <Settings className="h-3.5 w-3.5 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Ollama Connection</h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {isConnected 
                  ? `Connected to Ollama at ${apiUrl}` 
                  : `Unable to connect to Ollama at ${apiUrl}`}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div 
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-green-500" : "bg-yellow-500"
                  )} 
                />
                <span className="text-sm">
                  {isConnected ? "Connected" : "Not connected"}
                </span>
                {version && <span className="text-xs text-gray-500">v{version}</span>}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Configuration</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                This feature is not available yet.
              </p>
              <div className="grid gap-2">
                <Input 
                  value={customUrl || apiUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  disabled
                  className="text-sm h-8"
                />
                <div className="flex justify-between gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={checkConnection}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                    Test Connection
                  </Button>
                  <Button 
                    size="sm" 
                    disabled 
                    className="text-xs"
                  >
                    Save Configuration
                  </Button>
                </div>
                <p className="text-xs text-yellow-500 mt-1">
                  To change the Ollama API URL, set the OLLAMA_API_URL environment variable on the server.
                </p>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}