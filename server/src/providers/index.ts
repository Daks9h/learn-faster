import { AIProvider } from './AIProvider.js';
import { GeminiProvider } from './GeminiProvider.js';
import { LocalProvider } from './LocalProvider.js';

export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || 'gemini').trim().toLowerCase();

  switch (provider) {
    case 'gemini':
      return new GeminiProvider();
    case 'local':
    case 'ollama':
      return new LocalProvider();
    default:
      throw new Error(`Unsupported AI_PROVIDER "${provider}". Expected "gemini", "local", or "ollama".`);
  }
}

export * from './AIProvider.js';
export * from './GeminiProvider.js';
export * from './LocalProvider.js';

