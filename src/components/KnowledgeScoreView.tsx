import React from 'react';
import { LEGACY_CONCEPTS as CONCEPTS } from '../data/courseStats';
import { UserStats, ScreenTab } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Target
} from 'lucide-react';

interface KnowledgeScoreViewProps {
  stats: UserStats;
  onLaunchRevision: (conceptId: string) => void;
  onNavigate: (tab: ScreenTab) => void;
}

export const KnowledgeScoreView: React.FC<KnowledgeScoreViewProps> = ({
  stats,
  onLaunchRevision,
  onNavigate,
}) => {
  const masteredConcepts = CONCEPTS.filter((c) => c.status === 'mastered');
  const weakConcepts = CONCEPTS.filter((c) => c.status === 'weak' || c.status === 'learning');

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* 1. SCORE OVERVIEW HEADER */}
      <section className="bg-surface border-2 border-border-dark rounded-2xl p-5 md:p-7 shadow-ink flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="font-display font-black text-xl md:text-2xl text-navy tracking-tight">
            CS 152 Knowledge Map & Score
          </h1>
        </div>

        {/* Large Score Dial Card */}
        <div className="bg-page border-2 border-border-dark rounded-xl p-5 text-center min-w-[200px] shadow-ink-sm flex-shrink-0">
          <div className="text-[11px] font-mono text-secondary uppercase font-bold">
            Predicted Midterm Score
          </div>
          <div className="text-4xl font-display font-black text-accent my-1">
            {stats.masteryOverall}%
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-accent bg-accent-tint px-2 py-0.5 rounded border border-accent/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Grade Projection: A-</span>
          </div>
        </div>
      </section>

      {/* 2. THE SIGNATURE LEARNING LOOP ARCHITECTURE */}
      <section className="bg-page border-2 border-border-dark rounded-xl p-5 shadow-ink-sm space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-xs font-mono font-extrabold uppercase text-navy flex items-center gap-1.5">
            <Target className="w-4 h-4 text-accent" />
            THE LECTUREAI LEARNING LOOP
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {[
            { step: '01', title: 'WATCH', tab: 'lecture' as ScreenTab },
            { step: '02', title: 'UNDERSTAND', tab: 'lecture' as ScreenTab },
            { step: '03', title: 'TEST', tab: 'quiz' as ScreenTab },
            { step: '04', title: 'FIX', tab: 'radar' as ScreenTab },
            { step: '05', title: 'REVISE', tab: 'flashcards' as ScreenTab },
          ].map((item, idx) => (
            <button
              key={item.step}
              onClick={() => onNavigate(item.tab)}
              className="p-3 bg-surface border-2 border-border-dark rounded-xl text-left hover:bg-accent-tint transition-all shadow-ink-press"
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-secondary">
                <span>{item.step}</span>
                {idx < 3 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </div>
              <div className="font-display font-black text-xs text-navy mt-1">
                {item.title}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. SYLLABUS BRANCHES: MASTERED VS WEAK NODES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Strong / Mastered Concepts */}
        <section className="bg-surface border-2 border-border-dark rounded-2xl p-5 shadow-ink space-y-4">
          <div className="flex items-center justify-between border-b-2 border-border pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-correct" />
              <h2 className="font-display font-black text-base text-navy">
                Mastered Topics ({masteredConcepts.length})
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {masteredConcepts.map((concept) => (
              <div 
                key={concept.id}
                className="p-3.5 bg-page border-2 border-border-dark rounded-xl space-y-2 shadow-ink-press"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-navy">
                    {concept.name}
                  </h3>
                  <span className="text-xs font-mono font-bold text-correct">
                    {concept.mastery}%
                  </span>
                </div>
                <div className="w-full h-2 bg-border rounded-full border border-border-dark overflow-hidden">
                  <div className="bg-correct h-full rounded-full" style={{ width: `${concept.mastery}%` }} />
                </div>
                <p className="text-[11px] text-secondary">
                  {concept.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Weak / Targeted Revision Needed */}
        <section className="bg-surface border-2 border-border-dark rounded-2xl p-5 shadow-ink space-y-4">
          <div className="flex items-center justify-between border-b-2 border-border pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-incorrect" />
              <h2 className="font-display font-black text-base text-navy">
                Priority Revision Topics ({weakConcepts.length})
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {weakConcepts.map((concept) => (
              <div 
                key={concept.id}
                className="p-3.5 bg-surface border-2 border-border-dark rounded-xl space-y-2.5 shadow-ink-press"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm text-navy">
                      {concept.name}
                    </h3>
                    <span className="text-[10px] font-mono text-incorrect font-bold">
                      Exam Probability: {concept.examProbability}% · ~{concept.pointsImpact} Pts
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-incorrect">
                    {concept.mastery}%
                  </span>
                </div>

                <div className="w-full h-2 bg-page rounded-full border border-border-dark overflow-hidden">
                  <div className="bg-incorrect h-full rounded-full" style={{ width: `${concept.mastery}%` }} />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-secondary">
                    {concept.recommendedAction}
                  </span>
                  <button
                    onClick={() => onLaunchRevision(concept.id)}
                    className="px-3 py-1 bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs rounded-lg border border-border-dark shadow-ink-press flex items-center gap-1"
                  >
                    <span>Fix Topic</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. CLEAR PRIMARY NEXT MOVE DIRECTIVE */}
      <section className="bg-surface-solid border-2 border-border-dark text-white rounded-2xl p-6 md:p-7 shadow-ink-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <h2 className="text-lg md:text-xl font-display font-black text-white">
            Ready to close the remaining 18% gap?
          </h2>
        </div>

        <button
          onClick={() => onLaunchRevision('ieee-rounding')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-display font-black text-xs md:text-sm border-2 border-white/40 shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex-shrink-0"
        >
          <span>LAUNCH 3-MIN TARGETED REVISION</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};

