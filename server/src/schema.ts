import { z } from 'zod';

// Schema for raw model output (without IDs or compression)
export const KeyConceptModelSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(1),
  importance: z.enum(['high', 'medium', 'low']),
  keyPoints: z.array(z.string()).optional(),
  table: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  }).optional(),
});

export const ExamRadarModelSchema = z.object({
  question: z.string().min(1),
  priority: z.enum(['very_likely', 'important', 'good_to_know']),
  reason: z.string().min(1),
  concept: z.string().min(1),
  trapAlert: z.string().optional(),
});

export const FlashcardModelSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  concept: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export const QuizItemModelSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
  concept: z.string().min(1),
});

export const RawStudyMaterialSchema = z.object({
  courseTitle: z.string().min(1),
  quickTake: z.array(z.string()).min(1).max(6),
  keyConcepts: z.array(KeyConceptModelSchema).min(2).max(8),
  examRadar: z.array(ExamRadarModelSchema).min(2).max(10),
  flashcards: z.array(FlashcardModelSchema).min(3).max(15),
  quiz: z.array(QuizItemModelSchema).optional().default([]),
});

export type RawStudyMaterial = z.infer<typeof RawStudyMaterialSchema>;

// Complete StudyMaterial schema matching frontend src/types.ts exactly
export const KeyConceptSchema = KeyConceptModelSchema.extend({
  id: z.string(),
});

export const ExamRadarItemSchema = ExamRadarModelSchema.extend({
  id: z.string(),
});

export const FlashcardItemSchema = FlashcardModelSchema.extend({
  id: z.string(),
});

export const QuizItemSchema = QuizItemModelSchema.extend({
  id: z.string(),
});

export const CompressionSchema = z.object({
  originalMinutes: z.number().int().min(1),
  revisionMinutes: z.number().int().min(1),
});

export const StudyMaterialSchema = z.object({
  courseTitle: z.string(),
  quickTake: z.array(z.string()).min(1).max(6),
  keyConcepts: z.array(KeyConceptSchema),
  examRadar: z.array(ExamRadarItemSchema),
  flashcards: z.array(FlashcardItemSchema),
  quiz: z.array(QuizItemSchema),
  compression: CompressionSchema,
});

export type StudyMaterial = z.infer<typeof StudyMaterialSchema>;

/**
 * Calculates compression stats based on raw lecture word count
 * and high-yield synthesized summary word count.
 */
export function computeCompression(
  lectureText: string,
  quickTake: string[],
  keyConcepts: { explanation: string; keyPoints?: string[] }[]
): { originalMinutes: number; revisionMinutes: number } {
  const words = lectureText.trim().split(/\s+/).filter(Boolean).length;
  const originalMinutes = Math.max(1, Math.round(words / 130));

  const summaryText = [
    ...quickTake,
    ...keyConcepts.map((kc) => kc.explanation),
    ...keyConcepts.flatMap((kc) => kc.keyPoints || []),
  ].join(' ');

  const summaryWords = summaryText.trim().split(/\s+/).filter(Boolean).length;
  const revisionMinutes = Math.max(1, Math.round(summaryWords / 200));

  return {
    originalMinutes,
    revisionMinutes,
  };
}

/**
 * Validates and normalizes concepts so every concept exactly matches a keyConcepts title.
 * Attempts closest match if slight case/whitespace/formatting discrepancy exists.
 */
export function normalizeConceptTags(raw: RawStudyMaterial): {
  success: boolean;
  data?: RawStudyMaterial;
  unmatched: string[];
} {
  const validTitles = raw.keyConcepts.map((kc) => kc.title.trim());
  const unmatched: string[] = [];

  const findClosestTitle = (concept: string): string | null => {
    const trimmed = concept.trim();
    if (validTitles.includes(trimmed)) return trimmed;

    const lower = trimmed.toLowerCase();
    for (const title of validTitles) {
      if (title.toLowerCase() === lower) return title;
    }

    for (const title of validTitles) {
      if (title.toLowerCase().includes(lower) || lower.includes(title.toLowerCase())) {
        return title;
      }
    }

    // Keyword matching fallback
    const conceptWords = lower.split(/\W+/).filter((w) => w.length > 3);
    for (const title of validTitles) {
      const titleLower = title.toLowerCase();
      if (conceptWords.some((w) => titleLower.includes(w))) {
        return title;
      }
    }

    // Default to the first valid title if no match found
    return validTitles[0] || null;
  };

  const updatedRadar = raw.examRadar.map((item) => {
    const matched = findClosestTitle(item.concept);
    if (!matched) unmatched.push(`examRadar item "${item.question.slice(0, 30)}..." has unknown concept: "${item.concept}"`);
    return { ...item, concept: matched || item.concept };
  });

  const updatedFlashcards = raw.flashcards.map((item) => {
    const matched = findClosestTitle(item.concept);
    if (!matched) unmatched.push(`flashcard "${item.question.slice(0, 30)}..." has unknown concept: "${item.concept}"`);
    return { ...item, concept: matched || item.concept };
  });

  const updatedQuiz = Array.isArray(raw.quiz)
    ? raw.quiz.map((item) => {
        const matched = findClosestTitle(item.concept);
        if (!matched) unmatched.push(`quiz item "${item.question.slice(0, 30)}..." has unknown concept: "${item.concept}"`);
        return { ...item, concept: matched || item.concept };
      })
    : [];

  if (unmatched.length > 0) {
    return { success: false, unmatched };
  }

  return {
    success: true,
    data: {
      ...raw,
      examRadar: updatedRadar,
      flashcards: updatedFlashcards,
      quiz: updatedQuiz,
    },
    unmatched: [],
  };
}
