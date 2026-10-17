export function buildAnalyzePrompt(lectureText: string, retryErrors?: string[]): string {
  const retryFeedback = retryErrors && retryErrors.length > 0
    ? `\n\nCRITICAL FIX REQUIRED: The previous attempt failed validation with these issues:
${retryErrors.map((err) => `- ${err}`).join('\n')}
You MUST fix all of these issues while maintaining the exact required JSON structure.\n`
    : '';

  return `You are Learn Faster AI, an expert academic synthesis and exam-readiness engine.
Your task is to analyze the provided lecture text and extract a structured study package.

${retryFeedback}
LECTURE CONTENT:
"""
${lectureText}
"""

INSTRUCTIONS & STRICT RULES:
1. ONLY use information directly stated or derived in the lecture text. Do NOT invent facts or hallucinate content.
2. Use clear, engaging, student-friendly language suitable for rigorous university revision.
3. OUTPUT FORMAT: Respond ONLY with valid JSON matching the schema below. Do not wrap in markdown quotes if possible, or use standard application/json.
4. DO NOT generate "id" fields or "compression" fields. The server assigns all IDs and compression metrics.
5. CONCISENESS & SPEED DIRECTIVE: Be dense, punchy, and high-yield. Do not write filler or lengthy background essays. Keep explanations to 1-2 sharp sentences.

JSON OUTPUT STRUCTURE:
{
  "courseTitle": "Course name/code and lecture title extracted or inferred from text",
  "quickTake": [
    "High-yield takeaway 1 (one concise sentence)",
    "High-yield takeaway 2 (one concise sentence)",
    "High-yield takeaway 3 (one concise sentence)"
  ],
  "keyConcepts": [
    {
      "title": "Exact Title of Concept 1",
      "explanation": "Clear, dense explanation (1-2 sentences maximum)",
      "importance": "high" | "medium" | "low",
      "keyPoints": ["Concise technical bullet 1", "Concise technical bullet 2"]
    }
  ],
  "examRadar": [
    {
      "question": "Specific question or problem formulation likely to be tested (1 sentence)",
      "priority": "very_likely" | "important" | "good_to_know",
      "reason": "Clear 1-sentence explanation of why this concept matters. NEVER cite historical statistics, percentages, probabilities, or past-exam lore.",
      "concept": "Must EXACTLY match one of the keyConcepts titles above",
      "trapAlert": "Optional common misunderstanding or edge case (1 sentence)"
    }
  ],
  "flashcards": [
    {
      "question": "Focused prompt or challenge (1 sentence)",
      "answer": "Definitive, concise solution or invariant (1 sentence)",
      "concept": "Must EXACTLY match one of the keyConcepts titles above",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

SPECIFIC CONSTRAINTS:
- "quickTake": Exactly 3 concise items.
- "keyConcepts": 3 to 4 items (1-2 punchy sentences each, max 2 keyPoints each). Include a "table" ONLY when the lecture presents a clear tabular mapping, truth table, or state transition rule; otherwise omit "table".
- "examRadar": 3 to 4 items. Rank priority ("very_likely", "important", "good_to_know"). The "reason" must be 1 concise sentence and never claim probabilities or percentages.
- "flashcards": 4 to 5 cards. Keep questions and answers to 1 concise sentence each.
- EVERY item in "examRadar" and "flashcards" MUST have a "concept" field that EXACTLY matches one of the "title" strings in "keyConcepts".
- DO NOT generate a "quiz" field. Quiz generation is bypassed to deliver ultra-fast outputs.
`;
}

export function buildChunkSummaryPrompt(chunkText: string): string {
  return `You are an academic transcription assistant.
Summarize this section of a lecture text into dense, technically rigorous notes.
Preserve all definitions, terminology, equations, algorithms, step-by-step logic, hardware invariants, and instructor emphasis.
Be concise: write 4 to 6 punchy bullet points (under 150 words total). Do NOT include preamble, introduction, or commentary.

LECTURE SECTION:
"""
${chunkText}
"""

CONCISE TECHNICAL NOTES:`;
}
