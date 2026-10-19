import { GoogleGenAI } from '@google/genai';
import { AIProvider } from './AIProvider.js';
import { buildAnalyzePrompt, buildChunkSummaryPrompt } from '../prompts/analyze.js';

function extractJson(responseText: string): unknown {
  const clean = responseText.trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(clean);
  } catch {}

  // 2. Extract within markdown code fences ```json ... ```
  const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
    try {
      const sanitized = codeBlockMatch[1].replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(sanitized.trim());
    } catch {}
  }

  // 3. Extract outermost JSON object { ... }
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonSubstring = clean.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonSubstring.trim());
    } catch {}
    try {
      const sanitized = jsonSubstring.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(sanitized.trim());
    } catch {}
  }

  throw new Error('Could not parse valid JSON from model output.');
}

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    const model = process.env.GEMINI_MODEL;
    if (!model) {
      throw new Error('GEMINI_MODEL environment variable is not configured.');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  /**
   * If text exceeds 60,000 characters, summarize in sequential chunks
   * before running structured analysis on the combined notes.
   */
  private async summarizeLargeText(text: string): Promise<string> {
    const CHUNK_SIZE = 40000;
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      chunks.push(text.slice(i, i + CHUNK_SIZE));
    }

    console.log(`[GeminiProvider] Text length (${text.length} chars) exceeds 60k threshold. Summarizing ${chunks.length} chunks...`);

    const summaries: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const prompt = buildChunkSummaryPrompt(chunks[i]);
      const res = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      const summaryText = res.text?.trim() || '';
      summaries.push(`--- Chunk ${i + 1} of ${chunks.length} ---\n${summaryText}`);
    }

    return summaries.join('\n\n');
  }

  async generateStudyMaterial(
    text: string, 
    retryErrors?: string[], 
    onProgress?: (percent: number, message: string) => void
  ): Promise<unknown> {
    onProgress?.(20, 'Analyzing lecture with Gemini...');
    let contentToAnalyze = text;
    if (text.length > 60000) {
      onProgress?.(35, 'Summarizing large lecture text...');
      contentToAnalyze = await this.summarizeLargeText(text);
    }

    onProgress?.(55, 'Generating structured study package & questions...');
    const isGemma = this.model.toLowerCase().includes('gemma');
    let prompt = buildAnalyzePrompt(contentToAnalyze, retryErrors);

    if (isGemma) {
      prompt += '\nCRITICAL INSTRUCTION: Return ONLY raw, valid JSON. Do not include any reasoning, thoughts, comments, or conversational text. Output must begin with { and end with }.\n';
    }

    const config: any = {};
    if (!isGemma) {
      config.responseMimeType = 'application/json';
    }

    // Schedule progressive heartbeats while waiting for Gemini to generate output
    const progressStages = [
      { delay: 1000, percent: 65, message: 'Extracting key concepts & invariants...' },
      { delay: 2500, percent: 75, message: 'Formulating exam radar & predictive targets...' },
      { delay: 4500, percent: 82, message: 'Synthesizing active recall flashcards...' },
      { delay: 6500, percent: 88, message: 'Processing adaptive combat quiz questions & options...' },
      { delay: 8500, percent: 92, message: 'Processing question explanations & answer validation...' },
    ];

    const timers = progressStages.map((stage) =>
      setTimeout(() => {
        onProgress?.(stage.percent, stage.message);
      }, stage.delay)
    );

    let response;
    try {
      response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        ...(Object.keys(config).length > 0 ? { config } : {}),
      });
    } finally {
      timers.forEach(clearTimeout);
    }

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Model returned an empty response.');
    }

    return extractJson(responseText);
  }
}
