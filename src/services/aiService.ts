import { StudyMaterial } from '../types';
import { demoMaterial } from '../data/demoLecture';
import { authService } from './authService';

export interface AnalyzeLectureInput {
  text?: string;
  youtubeUrl?: string;
  file?: File;
  demo?: boolean;
}

export type ProgressCallback = (percent: number, message: string) => void;

export async function analyzeLecture(
  input: AnalyzeLectureInput,
  onProgress?: ProgressCallback
): Promise<StudyMaterial> {
  // 1. Demo mode: return local demoMaterial immediately with simulated progress
  if (input.demo) {
    onProgress?.(15, 'Loading demo lecture preset...');
    await new Promise((resolve) => setTimeout(resolve, 200));
    onProgress?.(45, 'Extracting Berkeley CS 152 concepts...');
    await new Promise((resolve) => setTimeout(resolve, 200));
    onProgress?.(75, 'Generating exam radar & active recall flashcards...');
    await new Promise((resolve) => setTimeout(resolve, 200));
    onProgress?.(95, 'Finalizing study package...');
    await new Promise((resolve) => setTimeout(resolve, 150));
    onProgress?.(100, 'Complete!');
    return demoMaterial;
  }

  // 2. Unsupported input types for now
  if (input.file) {
    throw new Error("File upload isn't available yet. Paste the lecture text or enter a YouTube URL.");
  }

  const rawText = input.text?.trim() || '';
  const youtubeUrl = input.youtubeUrl?.trim() || '';

  if (!rawText && !youtubeUrl) {
    throw new Error('Please provide either lecture text or a YouTube URL.');
  }

  if (!youtubeUrl && rawText.length < 200) {
    throw new Error('Paste at least a few paragraphs of lecture text.');
  }

  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  const apiUrl = (envUrl ? envUrl : (import.meta.env.DEV ? 'http://localhost:8787' : '')).replace(/\/+$/, '');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 300000); // 300 seconds (5 min) timeout for comprehensive local multi-chunk synthesis

  const authHeader = authService.getAuthHeader();

  try {
    const response = await fetch(`${apiUrl}/api/analyze?stream=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-stream-progress': 'true',
        ...authHeader,
      },
      body: JSON.stringify({
        text: rawText || undefined,
        youtubeUrl: youtubeUrl || undefined,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream')) {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported on response.');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let resultData: StudyMaterial | null = null;
      let errorData: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const trimmed = block.trim();
          if (trimmed.startsWith('data:')) {
            try {
              const event = JSON.parse(trimmed.slice(5).trim());
              if (event.type === 'progress') {
                onProgress?.(event.percent, event.message);
              } else if (event.type === 'result') {
                resultData = event.data;
              } else if (event.type === 'error') {
                errorData = event.error;
              }
            } catch (e) {
              console.warn('[aiService] Failed to parse SSE event:', e);
            }
          }
        }
      }

      if (errorData) {
        throw new Error(errorData);
      }
      if (resultData) {
        onProgress?.(100, 'Lecture synthesis complete!');
        return resultData;
      }
      throw new Error("We couldn't analyze this lecture.");
    }

    if (!response.ok) {
      let errorMessage = "We couldn't analyze this lecture.";
      try {
        const errorJson = await response.json();
        if (errorJson && typeof errorJson.error === 'string') {
          errorMessage = errorJson.error;
        }
      } catch {
        // Fallback to default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    onProgress?.(100, 'Complete!');
    return data as StudyMaterial;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Analysis timed out after 300 seconds. Please try again.');
      }
      if (
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('Load failed') ||
        err.message.includes('fetch failed')
      ) {
        throw new Error("Can't reach the server. Is the backend running?");
      }
      throw err;
    }

    throw new Error("Can't reach the server. Is the backend running?");
  }
}
