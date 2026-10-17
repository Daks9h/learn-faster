import React from 'react';
import { ScreenTab, UserStats, ConceptItem } from '../types';
import { COURSE_INFO } from '../data/courseStats';
import { 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  Clock, 
  ShieldAlert, 
  BookOpen, 
  Radar, 
  Layers, 
  HelpCircle,
  Activity,
  Flame,
  Award
} from 'lucide-react';
import { ScoutMark, RadarCompassGraphic } from './Illustrations';

import { StudyMaterial, User } from '../types';

interface HomeViewProps {
  stats: UserStats;
  weakConcept: ConceptItem;
  material?: StudyMaterial | null;
  isDemoActive?: boolean;
  currentUser?: User | null;
  onNavigate: (tab: ScreenTab) => void;
  onTargetRevision: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  weakConcept,
  material,
  isDemoActive,
  currentUser,
  onNavigate,
  onTargetRevision,
}) => {
  const questTitle = material
    ? `Master ${material.courseTitle}: ${material.keyConcepts[0]?.title || 'Core Principles'}`
    : isDemoActive
    ? "Master Computer Architecture: Booth's Multiplier & IEEE 754 (Demo)"
    : "Synthesize Your First Lecture to Begin Quest Progression";

  const questSub = material
    ? `${material.keyConcepts.length} Key Concepts · High-Yield Target`
    : isDemoActive
    ? "UC Berkeley CS 152 · High-Yield Target"
    : "Paste a lecture recording or notes to generate your personal study package";

  const questProgress = material
    ? `${stats.masteryOverall}% completed · +${Math.max(20, stats.xpTarget - stats.xpCurrent)} XP to Level ${stats.level + 1}`
    : isDemoActive
    ? "62% completed · +120 XP Reward"
    : "Ready for Intake · +50 XP Reward";

  const questButtonText = material || isDemoActive ? "RESUME QUEST" : "START INTAKE";
  const handleQuestAction = () => onNavigate(isDemoActive ? 'quiz' : (material ? 'radar' : 'lecture'));

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* 1. HERO EXPEDITION BRIEF & SCOUT'S GUIDANCE */}
      <section className="relative bg-surface rounded-2xl border-2 border-border-dark shadow-ink-lg p-5 md:p-7 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Scout Character Spotlight */}
          <div className="lg:col-span-3 flex items-center gap-4">
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
              <div className="w-full h-full rounded-2xl border-2 border-border-dark shadow-ink bg-accent-tint flex items-center justify-center p-2">
                <ScoutMark size={56} />
              </div>
              <span className="absolute -bottom-2 -right-1 bg-accent-tint text-navy font-mono font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-border-dark shadow-ink-press">
                SCOUT
              </span>
            </div>
          </div>

          {/* Active Quest Card: What should I learn next? */}
          <div className="lg:col-span-9 bg-page border-2 border-border-dark rounded-xl p-4 shadow-ink-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-accent text-white border border-border-dark">
                  ACTIVE QUEST
                </span>
                <span className="text-xs font-mono font-semibold text-secondary">
                  {questSub}
                </span>
              </div>
              <h1 className="text-base md:text-lg font-display font-extrabold text-navy tracking-tight">
                {questTitle}
              </h1>
              <p className="text-xs text-secondary">
                {questProgress}
              </p>
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={handleQuestAction}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-display font-black text-xs md:text-sm border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-ink-press transition-all"
              >
                <span>{questButtonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 6-Step Learning Path Stepper */}
        <div className="mt-6 pt-5 border-t-2 border-border">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono font-extrabold text-navy uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-accent" />
              SYLLABUS PROGRESSION
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { num: '1', title: 'Intake', state: 'done', xp: '+20 XP', tab: 'lecture' as ScreenTab },
              { num: '2', title: 'Quick Take', state: 'done', xp: '+15 XP', tab: 'lecture' as ScreenTab },
              { num: '3', title: 'Concept Tree', state: 'done', xp: '+25 XP', tab: 'score' as ScreenTab },
              { num: '4', title: 'Exam Radar', state: 'active', xp: 'In Progress', tab: 'radar' as ScreenTab },
              { num: '5', title: 'Combat Arena', state: 'next', xp: '+20 XP', tab: 'quiz' as ScreenTab },
              { num: '6', title: 'Mastery', state: 'locked', xp: 'Requires 90%', tab: 'score' as ScreenTab },
            ].map((step) => {
              const isDone = step.state === 'done';
              const isActive = step.state === 'active';
              return (
                <button
                  key={step.num}
                  onClick={() => onNavigate(step.tab)}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                    isActive
                      ? 'bg-accent-tint border-border-dark shadow-ink ring-2 ring-accent/40'
                      : isDone
                      ? 'bg-surface border-border-dark hover:bg-accent-tint/30'
                      : 'bg-page border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-secondary">
                      0{step.num}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    ) : isActive ? (
                      <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                    ) : null}
                  </div>
                  <div className="font-display font-bold text-xs text-navy mt-1">
                    {step.title}
                  </div>
                  <div className="text-[10px] font-mono text-secondary mt-0.5">
                    {step.xp}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. THE SIGNATURE "NEXT MOVE" TACTICAL BANNER */}
      <section className="bg-accent-tint border-2 border-border-dark rounded-xl p-4 md:p-5 shadow-ink flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent text-white border-2 border-border-dark shadow-ink-sm flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black uppercase text-accent">
                High Danger Alert
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border-dark font-bold text-navy">
                Midterm Impact: ~{weakConcept.pointsImpact} Pts
              </span>
            </div>
            <p className="font-display font-bold text-sm md:text-base text-navy">
              {weakConcept.name} dropped to {weakConcept.mastery}% retention. Defeat this weak topic before the exam!
            </p>
          </div>
        </div>

        <button
          onClick={onTargetRevision}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-display font-black text-xs md:text-sm border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-ink-press transition-all flex-shrink-0"
        >
          <span>FIX WEAK TOPIC (3 MIN)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 3. VISUAL RHYTHM: CONTENT SNAPSHOT & 4 WORKFLOW HUBS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hub 1: Synthesize Lecture */}
        <div 
          onClick={() => onNavigate('lecture')}
          className="bg-surface border-2 border-border-dark rounded-xl p-4 shadow-ink-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-accent-tint border-2 border-border-dark flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div className="text-[11px] font-mono text-secondary uppercase font-bold">Step 01</div>
            <h3 className="font-display font-black text-sm text-navy mt-0.5">
              Lecture Intake
            </h3>
          </div>
          <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs font-mono font-bold text-accent">
            <span>Open Portal</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Hub 2: Exam Radar (Signature) */}
        <div 
          onClick={() => onNavigate('radar')}
          className="bg-surface border-2 border-border-dark rounded-xl p-4 shadow-ink-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-accent-tint border-2 border-border-dark flex items-center justify-center mb-3">
              <Radar className="w-5 h-5 text-accent" />
            </div>
            <div className="text-[11px] font-mono text-secondary uppercase font-bold">Step 02 · Signature</div>
            <h3 className="font-display font-black text-sm text-navy mt-0.5">
              Exam Radar
            </h3>
          </div>
          <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs font-mono font-bold text-accent">
            <span>View Radar</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Hub 3: Flashcards */}
        <div 
          onClick={() => onNavigate('flashcards')}
          className="bg-surface border-2 border-border-dark rounded-xl p-4 shadow-ink-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-accent-tint border-2 border-border-dark flex items-center justify-center mb-3">
              <Layers className="w-5 h-5 text-accent" />
            </div>
            <div className="text-[11px] font-mono text-secondary uppercase font-bold">Step 03</div>
            <h3 className="font-display font-black text-sm text-navy mt-0.5">
              Active Recall Deck
            </h3>
          </div>
          <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs font-mono font-bold text-accent">
            <span>Flip Cards</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Hub 4: Combat Quiz */}
        <div 
          onClick={() => onNavigate('quiz')}
          className="bg-surface border-2 border-border-dark rounded-xl p-4 shadow-ink-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-accent-tint border-2 border-border-dark flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5 text-accent" />
            </div>
            <div className="text-[11px] font-mono text-secondary uppercase font-bold">Step 04</div>
            <h3 className="font-display font-black text-sm text-navy mt-0.5">
              Adaptive Combat Quiz
            </h3>
          </div>
          <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs font-mono font-bold text-accent">
            <span>Start Test (+20 XP)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 4. TODAY'S SNAPSHOT & SUBTLE STATS */}
      <section className="bg-surface border-2 border-border-dark rounded-xl p-5 shadow-ink-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="text-xs font-mono font-bold text-secondary uppercase">
            Today's Academic Snapshot
          </div>
          <h2 className="text-base font-display font-black text-navy">
            {COURSE_INFO.courseCode}: {COURSE_INFO.courseName}
          </h2>
          <p className="text-xs text-secondary">
            {COURSE_INFO.instructor}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-mono text-secondary">Overall Exam Readiness</div>
            <div className="text-xl font-display font-black text-accent">
              {stats.masteryOverall}% Prepared
            </div>
          </div>
          <button
            onClick={() => onNavigate('score')}
            className="px-3.5 py-2 rounded-lg bg-page hover:bg-surface border-2 border-border-dark text-xs font-display font-bold text-navy shadow-ink-press"
          >
            Inspect Knowledge Map
          </button>
        </div>
      </section>
    </div>
  );
};
