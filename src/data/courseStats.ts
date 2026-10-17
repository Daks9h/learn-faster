import { ConceptItem, UserStats } from '../types';

/**
 * Berkeley CS 152 Demo Stats (Preserved exclusively for demo mode)
 */
export const DEMO_BERKELEY_STATS: UserStats = {
  streakDays: 4,
  xpCurrent: 820,
  xpTarget: 1000,
  level: 7,
  levelTitle: 'Concept Builder',
  masteryOverall: 82,
  weakTopicsCount: 2,
  totalCardsReviewed: 18,
};

/**
 * Clean personalized stats for new users and fresh sessions
 */
export const DEFAULT_NEW_USER_STATS: UserStats = {
  streakDays: 0,
  xpCurrent: 0,
  xpTarget: 100,
  level: 1,
  levelTitle: 'Novice Scholar',
  masteryOverall: 0,
  weakTopicsCount: 0,
  totalCardsReviewed: 0,
};

export const INITIAL_USER_STATS: UserStats = DEMO_BERKELEY_STATS;

const STATS_STORAGE_PREFIX = 'learnfaster_stats_';

export function getUserStats(user?: { id?: string; email?: string } | null, isDemo = false): UserStats {
  if (typeof window === 'undefined') return DEFAULT_NEW_USER_STATS;

  if (isDemo || (user?.email && user.email.toLowerCase().includes('scout@berkeley.edu'))) {
    const demoSaved = localStorage.getItem(`${STATS_STORAGE_PREFIX}demo_berkeley`);
    if (demoSaved) {
      try { return JSON.parse(demoSaved); } catch {}
    }
    return DEMO_BERKELEY_STATS;
  }

  const storageKey = user?.id ? `${STATS_STORAGE_PREFIX}${user.id}` : `${STATS_STORAGE_PREFIX}guest`;
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }

  return DEFAULT_NEW_USER_STATS;
}

export function saveUserStats(user: { id?: string; email?: string } | null | undefined, stats: UserStats, isDemo = false): void {
  if (typeof window === 'undefined') return;

  const storageKey = (isDemo || (user?.email && user.email.toLowerCase().includes('scout@berkeley.edu')))
    ? `${STATS_STORAGE_PREFIX}demo_berkeley`
    : user?.id 
    ? `${STATS_STORAGE_PREFIX}${user.id}` 
    : `${STATS_STORAGE_PREFIX}guest`;

  localStorage.setItem(storageKey, JSON.stringify(stats));
}

export const COURSE_INFO = {
  institution: 'UC Berkeley',
  courseCode: 'CS 152',
  courseName: 'Computer Architecture & Engineering',
  instructor: 'Prof. Krste Asanović',
};

export const LEGACY_CONCEPTS: ConceptItem[] = [
  {
    id: 'booths-recoding',
    name: "Booth's Multiplication Flowchart & Recoding",
    category: 'ALU Arithmetic',
    mastery: 40,
    status: 'learning',
    examProbability: 94,
    priorityTier: 'very-likely',
    slideRef: 'Slide 14–19',
    pointsImpact: 15,
    description: 'Hardware optimization that recodes binary multiplier words into signed digits {-1, 0, +1} to skip consecutive runs of ones.',
    whyItMatters: 'Tested on 6 out of 7 past midterms as a mandatory free-response problem requiring manual step tracing of partial products.',
    recommendedAction: 'Practice bit-pair tracing worksheet (3 exercises)',
    trapAlert: 'Implicit initialization of Q-1 to 0 is frequently forgotten by students under test pressure.',
    formula: '2^(k+m) - 2^k = Sum_{i=k}^{k+m-1} 2^i',
  },
  {
    id: 'ieee-rounding',
    name: 'IEEE 754 Rounding Modes (Guard, Round, Sticky)',
    category: 'Floating Point',
    mastery: 58,
    status: 'weak',
    examProbability: 78,
    priorityTier: 'important',
    slideRef: 'Slide 32–38',
    pointsImpact: 10,
    description: 'Specification of G, R, and S bits during right-shift normalization steps to guarantee unbiased Round-to-Nearest-Even behavior.',
    whyItMatters: 'High-frequency multiple-choice and short-answer trap. TAs test whether the Sticky bit latches any discarded 1 bit.',
    recommendedAction: 'Review tie-breaking rule when LSB is odd vs even',
    trapAlert: 'Common error: treating sticky bit as a regular shifting register rather than an OR-reduction latch.',
    formula: 'Sticky = OR(discarded_bits[k:0])',
  },
  {
    id: 'cache-hierarchy',
    name: 'Cache Hierarchy & Set Associativity',
    category: 'Memory Systems',
    mastery: 88,
    status: 'mastered',
    examProbability: 85,
    priorityTier: 'very-likely',
    slideRef: 'Slide 40–46',
    pointsImpact: 12,
    description: 'Tag, index, and offset bit allocation in multi-level caches with LRU replacement policies.',
    whyItMatters: 'Foundational concept appearing in both midterms and final exams with multi-step address decoding problems.',
    recommendedAction: 'Review LRU state transitions under 4-way set conflict scenarios',
    formula: 'Tag = Addr[31:Index+Offset]',
  },
  {
    id: 'pipelining-hazards',
    name: 'Pipelining Hazard Forwarding & Stalls',
    category: 'Core Pipelines',
    mastery: 74,
    status: 'learning',
    examProbability: 82,
    priorityTier: 'important',
    slideRef: 'Slide 22–29',
    pointsImpact: 10,
    description: 'Data forwarding paths from EX/MEM and MEM/WB pipeline registers to bypass ALU input stalls.',
    whyItMatters: 'Classic datapath diagram question requiring students to trace clock cycle instruction bubbles.',
    recommendedAction: 'Solidify load-use hazard interlock condition',
  },
  {
    id: 'microprogrammed-control',
    name: 'Microprogrammed Control Units & ROM Dispatch',
    category: 'Control Logic',
    mastery: 45,
    status: 'learning',
    examProbability: 42,
    priorityTier: 'good-to-know',
    slideRef: 'Slide 48–51',
    pointsImpact: 5,
    description: 'Horizontal vs vertical microcode storage and state-machine sequencing in non-pipelined processors.',
    whyItMatters: 'Typically tested as a conceptual comparison question rather than a complex calculation.',
    recommendedAction: 'Skim 2-page syllabus digest before exam week',
  },
];
