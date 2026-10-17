import React, { useState } from 'react';
import { StudyMaterial } from '../types';
import { 
  RotateCw, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Layers, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface FlashcardsViewProps {
  material: StudyMaterial | null;
  onEarnXp: (amount: number) => void;
  onGoToLecture?: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ 
  material, 
  onEarnXp,
  onGoToLecture 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  if (!material) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-surface border-2 border-border-dark rounded-2xl p-8 shadow-ink text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-accent-tint border-2 border-border-dark mx-auto flex items-center justify-center shadow-ink-sm">
            <Layers className="w-6 h-6 text-accent" />
          </div>
          <h2 className="font-display font-black text-xl text-navy">No Flashcards Available</h2>
          <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto">
            Synthesize or load a lecture to generate active recall flashcards.
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

  const uniqueConcepts = Array.from(new Set(material.flashcards.map((f) => f.concept)));

  const filteredCards = material.flashcards.filter((c) => {
    if (selectedTopic === 'all') return true;
    return c.concept === selectedTopic;
  });

  const card = filteredCards[currentIndex] || material.flashcards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleMasterCard = () => {
    if (card && !masteredCards.includes(card.id)) {
      setMasteredCards([...masteredCards, card.id]);
      onEarnXp(10);
    }
    handleNext();
  };

  const handleRepeatLater = () => {
    handleNext();
  };

  const difficultyLabel = card ? {
    easy: 'Foundation',
    medium: 'Midterm Target',
    hard: 'Advanced',
  }[card.difficulty] : 'Foundation';

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* 1. TOP STATUS & TOPIC FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-accent-tint border-2 border-border-dark flex items-center justify-center">
              <Layers className="w-4 h-4 text-accent" />
            </span>
            <h1 className="font-display font-black text-lg text-navy">
              Active Recall Deck
            </h1>
          </div>
          <p className="text-xs text-secondary mt-0.5">
            Card {currentIndex + 1} of {filteredCards.length}
          </p>
        </div>

        {/* Topic filter */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-page rounded-xl border border-border-dark text-xs font-mono font-bold">
          <button
            onClick={() => { setSelectedTopic('all'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedTopic === 'all'
                ? 'bg-surface text-navy border border-border-dark shadow-ink-press'
                : 'text-secondary'
            }`}
          >
            All ({material.flashcards.length})
          </button>
          {uniqueConcepts.map((concept) => (
            <button
              key={concept}
              onClick={() => { setSelectedTopic(concept); setCurrentIndex(0); setIsFlipped(false); }}
              className={`px-2.5 py-1 rounded-lg transition-all truncate max-w-[140px] ${
                selectedTopic === concept
                  ? 'bg-surface text-navy border border-border-dark shadow-ink-press'
                  : 'text-secondary'
              }`}
              title={concept}
            >
              {concept.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 2. THE 3D FLIP FLASHCARD CONTAINER */}
      {card && (
        <div 
          className="perspective-1000 w-full min-h-[300px] cursor-pointer select-none"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div 
            className={`relative w-full min-h-[300px] transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT OF CARD */}
            <div className="absolute inset-0 w-full h-full bg-[#141026] border-2 border-border-dark rounded-2xl p-6 sm:p-8 flex flex-col justify-between backface-hidden shadow-ink">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-secondary uppercase">
                  <span className="px-2 py-0.5 rounded bg-accent-tint border border-border text-navy font-bold">
                    {card.concept}
                  </span>
                  <RotateCw className="w-4 h-4 text-accent" />
                </div>

                <div className="my-8 text-center sm:text-left">
                  <p className="font-display font-extrabold text-lg sm:text-xl text-navy leading-snug">
                    "{card.question}"
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-border flex items-center justify-between text-xs font-mono text-secondary">
                <span className="px-2 py-0.5 bg-accent-tint rounded border border-border text-navy font-bold">
                  Level: {difficultyLabel}
                </span>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="absolute inset-0 w-full h-full bg-[#141026] border-2 border-accent rounded-2xl p-6 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180 shadow-ink">
              <div>
                <div className="flex items-center justify-between text-xs font-mono uppercase font-bold text-accent">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </div>

                <div className="my-6 space-y-3">
                  <p className="font-display font-black text-base sm:text-lg text-navy leading-relaxed">
                    {card.answer}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-border flex items-center justify-between text-xs font-mono text-secondary">
                <span>Concept: {card.concept}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTROLS: SIMPLE & DELIBERATE */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-page hover:bg-surface border-2 border-border-dark shadow-ink-press text-navy"
            title="Previous Card"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-page hover:bg-surface border-2 border-border-dark shadow-ink-press text-navy"
            title="Next Card"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-secondary ml-2">
            Card {currentIndex + 1} of {filteredCards.length}
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleRepeatLater}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-page hover:bg-surface text-navy font-display font-bold text-xs border-2 border-border-dark shadow-ink-press transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Repeat Later</span>
          </button>

          <button
            onClick={handleMasterCard}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-display font-black text-xs md:text-sm border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-ink-press transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>I Know This (+10 XP)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
