import { OllamaModel } from "@/types";
import { ChevronDown } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  models: OllamaModel[];
  onModelChange: (model: string) => void;
  isLoading: boolean;
}

export default function ModelSelector({ 
  selectedModel, 
  models, 
  onModelChange,
  isLoading 
}: ModelSelectorProps) {
  // Default models to show if API fails
  const defaultModels = [
    { name: "llama2" },
    { name: "codellama" },
    { name: "mistral" }
  ];

  // Use API models if available, otherwise use defaults
  const availableModels = models.length > 0 
    ? models.map(model => ({ name: model.name })) 
    : defaultModels;

  return (
    <div className="relative mr-3">
      <select
        id="modelSelect"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={isLoading}
        className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
      >
        {availableModels.map((model) => (
          <option key={model.name} value={model.name}>
            {model.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}
