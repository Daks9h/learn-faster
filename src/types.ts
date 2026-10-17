export type ScreenTab = 'home' | 'dashboard' | 'camp' | 'lecture' | 'radar' | 'flashcards' | 'quiz' | 'score' | 'auth' | 'profile';

export interface UserProfileSettings {
  targetCourse: string;
  gradeGoal: string;
  studyMode: string;
  examDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  institution?: string;
  level?: number;
  profileSettings?: UserProfileSettings;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface KeyConcept {
  id: string;
  title: string;
  explanation: string;
  importance: 'high' | 'medium' | 'low';
  keyPoints?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface ExamRadarItem {
  id: string;
  question: string;
  priority: 'very_likely' | 'important' | 'good_to_know';
  reason: string;
  concept: string;
  trapAlert?: string;
}

export interface FlashcardItem {
  id: string;
  question: string;
  answer: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  concept: string;
}

export interface StudyMaterial {
  courseTitle: string;
  quickTake: string[]; // 3 bullets
  keyConcepts: KeyConcept[];
  examRadar: ExamRadarItem[];
  flashcards: FlashcardItem[];
  quiz: QuizItem[];
  compression: {
    originalMinutes: number;
    revisionMinutes: number;
  };
}

export interface ConceptItem {
  id: string;
  name: string;
  category: string;
  mastery: number; // 0-100
  status: 'mastered' | 'learning' | 'weak';
  examProbability: number;
  priorityTier: 'very-likely' | 'important' | 'good-to-know';
  slideRef: string;
  pointsImpact: number;
  description: string;
  whyItMatters: string;
  recommendedAction: string;
  trapAlert?: string;
  formula?: string;
}

export interface UserStats {
  streakDays: number;
  xpCurrent: number;
  xpTarget: number;
  level: number;
  levelTitle: string;
  masteryOverall: number;
  weakTopicsCount: number;
  totalCardsReviewed: number;
}

