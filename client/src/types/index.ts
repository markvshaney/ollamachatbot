export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  model: string;
  timestamp: string;
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface ModelsResponse {
  models: OllamaModel[];
}
