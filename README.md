# Ollama Chat Interface

A browser-based chat interface for interacting with Ollama language models.

## Features

- Clean, modern UI for interacting with Ollama models
- Support for multiple Ollama models
- Real-time connection status indicator
- Message history storage
- Light/dark theme support

## Requirements

- [Node.js](https://nodejs.org/) (v18 or later)
- [Ollama](https://ollama.ai/) installed and running locally or on another accessible server

## Installation

1. Clone this repository:
   ```
   git clone <your-repository-url>
   cd ollama-chat-interface
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:3000)

## Configuration

By default, the application connects to Ollama at `http://localhost:11434`. To use a different Ollama server:

1. Set the `OLLAMA_API_URL` environment variable:
   ```
   OLLAMA_API_URL=http://your-ollama-server:11434 npm run dev
   ```

## Usage

1. Make sure Ollama is running
2. Select a model from the dropdown menu
3. Type your message in the input box and press Enter or click the send button
4. View the response from the model
5. Continue the conversation as needed

## Development

- Frontend: React, TypeScript, TailwindCSS, shadcn/ui
- Backend: Express.js
- Data storage: In-memory storage (default) or use a database option

## License

MIT