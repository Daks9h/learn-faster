import React, { useState } from 'react';
import { StudyMaterial, ExamRadarItem } from '../types';
import { 
  Radar, 
  Flame, 
  Star, 
  Layers, 
  AlertTriangle, 
  ArrowRight
} from 'lucide-react';
import { RadarCompassGraphic } from './Illustrations';

interface ExamRadarViewProps {
  material: StudyMaterial | null;
  onTrainTopic: (conceptTitle: string) => void;
  onGoToLecture?: () => void;
}

export const ExamRadarView: React.FC<ExamRadarViewProps> = ({ 
  material, 
  onTrainTopic,
  onGoToLecture 
}) => {
  const [filterTier, setFilterTier] = useState<'all' | 'very_likely' | 'important' | 'good_to_know'>('all');

  if (!material) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-surface border-2 border-border-dark rounded-2xl p-8 shadow-ink text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-accent-tint border-2 border-border-dark mx-auto flex items-center justify-center shadow-ink-sm">
            <Radar className="w-6 h-6 text-accent" />
          </div>
          <h2 className="font-display font-black text-xl text-navy">No Exam Radar Available</h2>
          <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto">
            Synthesize or load a lecture first to generate predictive exam questions, priority tiers, and trap alerts.
          </p>
          <button
            onClick={onGoToLecture}
            className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-display font-black text-xs md:text-sm border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-flex items-center gap-2"
          >
            <span>Go to Lecture Tab</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const filteredConcepts = material.examRadar.filter((item) => {
    if (filterTier === 'all') return true;
    return item.priority === filterTier;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* 1. EXAM RADAR HERO BANNER */}
      <section className="bg-surface border-2 border-border-dark rounded-2xl p-5 md:p-7 shadow-ink relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-accent-tint border-2 border-border-dark flex items-center justify-center">
                <Radar className="w-5 h-5 text-accent" />
              </span>
            </div>

            <h1 className="font-display font-black text-xl md:text-2xl text-navy tracking-tight">
              Exam Radar: Midterm Bounty Board
            </h1>

            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 bg-accent-tint text-accent border border-accent/40 rounded-lg font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Very Likely</span>
              </span>
              <span className="px-2.5 py-1 bg-accent text-white border border-border-dark rounded-lg font-bold flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                <span>Important</span>
              </span>
              <span className="px-2.5 py-1 bg-accent-tint text-navy border border-border-dark rounded-lg font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Good to Know</span>
              </span>
            </div>
          </div>

          <div className="md:col-span-4 flex items-center justify-center">
            <div className="p-2 bg-page rounded-2xl border-2 border-border-dark shadow-ink-sm">
              <RadarCompassGraphic />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-4 border-t-2 border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-page rounded-xl border border-border-dark text-xs font-display font-bold">
            <button
              onClick={() => setFilterTier('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterTier === 'all'
                  ? 'bg-surface text-navy border border-border-dark shadow-ink-press'
                  : 'text-secondary hover:text-navy'
              }`}
            >
              All Topics ({material.examRadar.length})
            </button>
            <button
              onClick={() => setFilterTier('very_likely')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterTier === 'very_likely'
                  ? 'bg-surface text-navy border border-border-dark shadow-ink-press'
                  : 'text-secondary hover:text-navy'
              }`}
            >
              Very Likely
            </button>
            <button
              onClick={() => setFilterTier('important')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterTier === 'important'
                  ? 'bg-surface text-navy border border-border-dark shadow-ink-press'
                  : 'text-secondary hover:text-navy'
              }`}
            >
              Important
            </button>
            <button
              onClick={() => setFilterTier('good_to_know')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterTier === 'good_to_know'
                  ? 'bg-surface text-navy border border-border-dark shadow-ink-press'
                  : 'text-secondary hover:text-navy'
              }`}
            >
              Good to Know
            </button>
          </div>
        </div>
      </section>

      {/* 2. BOUNTY BOARD CARDS */}
      <section className="space-y-4">
        {filteredConcepts.map((item) => {
          const isVeryLikely = item.priority === 'very_likely';
          const isImportant = item.priority === 'important';
          const isGoodToKnow = item.priority === 'good_to_know';

          return (
            <div
              key={item.id}
              className={`border-2 border-border-dark rounded-xl p-4 md:p-5 shadow-ink transition-all ${
                isVeryLikely
                  ? 'bg-surface'
                  : isImportant
                  ? 'bg-surface'
                  : 'bg-page'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Metadata, Title, Why it matters */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Priority Tier Tag */}
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-mono font-black border border-border-dark flex items-center gap-1.5 ${
                        isVeryLikely
                          ? 'bg-accent-tint text-accent border border-accent/40'
                          : isImportant
                          ? 'bg-accent text-white'
                          : 'bg-surface text-secondary'
                      }`}
                    >
                      {isVeryLikely && <Flame className="w-3.5 h-3.5" />}
                      {isImportant && <Star className="w-3.5 h-3.5" />}
                      {isGoodToKnow && <Layers className="w-3.5 h-3.5" />}
                      <span>
                        {isVeryLikely
                          ? 'VERY LIKELY'
                          : isImportant
                          ? 'IMPORTANT'
                          : 'GOOD TO KNOW'}
                      </span>
                    </span>

                    <span className="text-xs font-mono font-bold text-accent bg-accent-tint px-2 py-0.5 rounded border border-border">
                      {item.concept}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-base md:text-lg text-navy">
                    {item.question}
                  </h3>

                  <p className="text-xs md:text-sm text-navy/80 leading-relaxed max-w-3xl">
                    <strong className="text-navy">Why it matters:</strong> {item.reason}
                  </p>

                  {/* Trap Alert if present */}
                  {item.trapAlert && (
                    <div className="p-2.5 bg-incorrect-tint rounded-lg border border-incorrect/40 text-xs font-mono text-incorrect flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-incorrect flex-shrink-0" />
                      <span>
                        <strong>Exam Trap Flagged:</strong> {item.trapAlert}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                  <button
                    onClick={() => onTrainTopic(item.concept)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-display font-black text-xs md:text-sm border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-ink-press transition-all"
                  >
                    <span>TRAIN THIS</span>
                    <span className="font-mono text-[10px] bg-accent-hover px-1.5 py-0.5 rounded text-white">
                      +{isVeryLikely ? '25 XP' : '15 XP'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
