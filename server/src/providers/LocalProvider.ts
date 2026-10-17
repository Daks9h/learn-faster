import { AIProvider } from './AIProvider.js';
import { buildAnalyzePrompt, buildChunkSummaryPrompt } from '../prompts/analyze.js';

function extractJson(responseText: string): unknown {
  // 1. Direct parse attempt
  try {
    return JSON.parse(responseText.trim());
  } catch {}

  // 2. Extract within markdown code fences ```json ... ```
  const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // 3. Extract outermost JSON object { ... }
  const firstBrace = responseText.indexOf('{');
  const lastBrace = responseText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonSubstring = responseText.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonSubstring.trim());
    } catch {}
  }

  throw new Error('Could not parse valid JSON from local model output.');
}

/**
 * Splits long lecture transcripts into coherent, overlapping chunks
 * respecting sentence and paragraph boundaries to prevent context loss.
 */
function splitIntoChunks(text: string, maxChunkLength = 7000, overlap = 400): string[] {
  const clean = text.trim();
  if (clean.length <= maxChunkLength) {
    return [clean];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < clean.length) {
    let endIndex = startIndex + maxChunkLength;

    if (endIndex >= clean.length) {
      chunks.push(clean.slice(startIndex).trim());
      break;
    }

    // Try finding a paragraph break first
    let boundary = clean.lastIndexOf('\n\n', endIndex);
    if (boundary <= startIndex + maxChunkLength * 0.5) {
      // Try finding a sentence break (. ! ?)
      boundary = clean.lastIndexOf('. ', endIndex);
      if (boundary === -1 || boundary <= startIndex + maxChunkLength * 0.5) {
        boundary = clean.lastIndexOf('? ', endIndex);
      }
      if (boundary === -1 || boundary <= startIndex + maxChunkLength * 0.5) {
        boundary = clean.lastIndexOf('! ', endIndex);
      }
      if (boundary !== -1) {
        boundary += 1; // Include punctuation
      }
    }

    // If no clean sentence break found, break at nearest word space
    if (boundary === -1 || boundary <= startIndex + maxChunkLength * 0.5) {
      boundary = clean.lastIndexOf(' ', endIndex);
    }

    // Fallback to strict endIndex if no space found
    if (boundary === -1 || boundary <= startIndex) {
      boundary = endIndex;
    }

    chunks.push(clean.slice(startIndex, boundary).trim());
    // Move start index forward with overlap
    startIndex = Math.max(startIndex + 1, boundary - overlap);
  }

  return chunks.filter((c) => c.length > 50);
}

export class LocalProvider implements AIProvider {
  private endpoint: string;
  private model: string;
  private timeoutMs: number;

  constructor() {
    this.endpoint = (process.env.LOCAL_AI_URL || 'http://localhost:11434').replace(/\/+$/, '');
    this.model = process.env.LOCAL_MODEL || 'qwen2.5:7b-instruct';
    this.timeoutMs = parseInt(process.env.LOCAL_AI_TIMEOUT || '180000', 10); // 3 min default
  }

  /**
   * Helper to query Ollama generate endpoint
   */
  private async queryOllama(prompt: string, formatJson = false, numPredict = 2560): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: formatJson ? 'json' : undefined,
          options: {
            temperature: 0.2, // Low temperature for high factual accuracy and zero hallucination
            num_ctx: 8192,     // 8K context window
            num_predict: numPredict,
          },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Local Ollama server returned status ${res.status}: ${errBody}`);
      }

      const data: any = await res.json();
      return (data.response || '').trim();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Stage 1: Summarizes an individual chunk of the transcript into dense technical notes.
   * Generates max 384 tokens to keep stage fast (~8-12 seconds per chunk).
   */
  private async summarizeChunk(chunk: string, index: number, total: number): Promise<string> {
    console.log(`[LocalProvider] Processing transcript chunk ${index + 1}/${total} (${chunk.length} chars)...`);
    const prompt = buildChunkSummaryPrompt(chunk);
    const summary = await this.queryOllama(prompt, false, 384);
    return `### Section ${index + 1} Notes:\n${summary}`;
  }

  async generateStudyMaterial(
    text: string, 
    retryErrors?: string[],
    onProgress?: (percent: number, message: string) => void
  ): Promise<unknown> {
    let effectiveText = text.trim();

    // Long transcript chunking pipeline (> 10,000 characters ~ 2,000+ words)
    if (effectiveText.length > 10000) {
      const chunks = splitIntoChunks(effectiveText, 7000, 400);
      console.log(
        `[LocalProvider] Long lecture detected (${effectiveText.length} chars). Running 2-stage chunking across ${chunks.length} sections with ${this.model}...`
      );

      onProgress?.(12, `Dividing lecture into ${chunks.length} sections for local synthesis...`);

      const sectionSummaries: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const pct = Math.round(15 + (i / chunks.length) * 45);
        onProgress?.(pct, `Summarizing lecture section ${i + 1} of ${chunks.length}...`);
        const sectionSummary = await this.summarizeChunk(chunks[i], i, chunks.length);
        sectionSummaries.push(sectionSummary);
      }

      effectiveText = sectionSummaries.join('\n\n');
      console.log(
        `[LocalProvider] Chunking complete. Synthesized cohesive notes (${effectiveText.length} chars). Generating final study package JSON...`
      );
      onProgress?.(62, 'Synthesizing complete high-yield study package...');
    } else {
      console.log(
        `[LocalProvider] Analyzing lecture text (${effectiveText.length} chars) in one pass with ${this.model}...`
      );
      onProgress?.(25, 'Analyzing lecture content and extracting invariants...');
      onProgress?.(50, 'Synthesizing key concepts, exam radar & flashcards...');
    }

    // Stage 2: Final synthesis into full structured StudyMaterial JSON
    const prompt =
      buildAnalyzePrompt(effectiveText, retryErrors) +
      '\nIMPORTANT: Return ONLY the JSON object. Do not output preamble or commentary. Ensure all keys and strings are double-quoted.\n';

    onProgress?.(75, 'Generating structured exam questions and active recall items...');
    const responseText = await this.queryOllama(prompt, true, 2560);

    if (!responseText) {
      throw new Error('Local model returned an empty response.');
    }

    onProgress?.(92, 'Formatting & validating study material schema...');
    return extractJson(responseText);
  }
}
