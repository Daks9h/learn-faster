import { AIProvider } from './AIProvider.js';
import { GeminiProvider } from './GeminiProvider.js';
import { LocalProvider } from './LocalProvider.js';

let cachedProvider: AIProvider | null = null;
let cachedProviderType: string | null = null;

export function getAIProvider(): AIProvider {
  const providerType = (process.env.AI_PROVIDER || 'gemini').trim().toLowerCase();

  if (cachedProvider && cachedProviderType === providerType) {
    return cachedProvider;
  }

  switch (providerType) {
    case 'gemini':
      cachedProvider = new GeminiProvider();
      cachedProviderType = providerType;
      return cachedProvider;
    case 'local':
    case 'ollama':
      cachedProvider = new LocalProvider();
      cachedProviderType = providerType;
      return cachedProvider;
    default:
      throw new Error(`Unsupported AI_PROVIDER "${providerType}". Expected "gemini", "local", or "ollama".`);
  }
}

export * from './AIProvider.js';
export * from './GeminiProvider.js';
export * from './LocalProvider.js';
