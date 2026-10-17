import React, { useState, useEffect } from 'react';
import { StudyMaterial } from '../types';
import { analyzeLecture } from '../services/aiService';
import { 
  CheckCircle2, 
  Clock, 
  Zap, 
  ArrowRight, 
  Link as LinkIcon, 
  FileText,
  ChevronRight,
  BookOpen,
  Loader2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface LectureViewProps {
  material: StudyMaterial | null;
  status: 'idle' | 'processing' | 'ready' | 'error';
  onStatusChange: (status: 'idle' | 'processing' | 'ready' | 'error') => void;
  onMaterialLoaded: (material: StudyMaterial) => void;
  onExploreConcept: (conceptId: string) => void;
  onOpenRadar: () => void;
}

const PROCESSING_STEPS = [
  'Reading lecture',
  'Identifying key concepts',
  'Building exam radar',
  'Preparing flashcards',
  'Creating quiz',
];

export const LectureView: React.FC<LectureViewProps> = ({ 
  material, 
  status,
  onStatusChange,
  onMaterialLoaded,
  onExploreConcept, 
  onOpenRadar 
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'yt' | 'pdf' | 'preset'>('preset');
  const [inputValue, setInputValue] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStage, setProgressStage] = useState('Initializing synthesis pipeline...');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isProcessing = status === 'processing';

  // Elapsed seconds timer during synthesis
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isProcessing) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isProcessing]);

  // Smoothly increment percent between server updates to keep the meter dynamic and lively
  useEffect(() => {
    let ticker: NodeJS.Timeout | null = null;
    if (isProcessing) {
      ticker = setInterval(() => {
        setProgressPercent((current) => {
          if (current < 94) {
            const step = current < 30 ? 1.2 : current < 60 ? 0.6 : current < 85 ? 0.3 : 0.1;
            return Math.min(94, parseFloat((current + step).toFixed(1)));
          }
          return current;
        });
      }, 500);
    }
    return () => {
      if (ticker) clearInterval(ticker);
    };
  }, [isProcessing]);

  const runSynthesis = async (isDemo = false) => {
    setValidationError(null);
    setErrorMessage(null);

    const isPreset = isDemo || activeInputTab === 'preset';

    if (!isPreset) {
      if (activeInputTab === 'yt') {
        if (!inputValue.trim()) {
          setValidationError('Paste a lecture link or select Lecture Notes.');
          return;
        }
      } else {
        if (!inputValue.trim() || inputValue.trim().length < 200) {
          setValidationError('Paste at least a few paragraphs of lecture text.');
          return;
        }
      }
    }

    onStatusChange('processing');
    setProgressPercent(8);
    setProgressStage('Connecting to local AI engine...');
    setAllStepsCompleted(false);

    try {
      const result = await analyzeLecture(
        {
          demo: isPreset,
          youtubeUrl: activeInputTab === 'yt' ? inputValue.trim() : undefined,
          text: activeInputTab === 'pdf' ? inputValue.trim() : undefined,
        },
        (percent, message) => {
          setProgressPercent((prev) => Math.max(prev, percent));
          if (message) setProgressStage(message);
        }
      );

      // Mark complete once response arrives
      setProgressPercent(100);
      setProgressStage('Lecture synthesis complete!');
      setAllStepsCompleted(true);

      // Brief delay so user sees 100% completion meter
      setTimeout(() => {
        onMaterialLoaded(result);
        onStatusChange('ready');
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "We couldn't analyze this lecture.";
      setErrorMessage(msg);
      onStatusChange('error');
    }
  };

  const handleTabChange = (tab: 'yt' | 'pdf' | 'preset') => {
    setActiveInputTab(tab);
    setValidationError(null);
    setErrorMessage(null);

    if (tab === 'yt') {
      setInputValue('https://youtu.be/CS152_Lec04_Radix4_Multiplication');
    } else if (tab === 'pdf') {
      setInputValue('');
    } else {
      setInputValue('CS152_Fall24_Syllabus_Demo_Preset');
    }
  };

  const originalMins = material?.compression.originalMinutes ?? 52;
  const revisionMins = material?.compression.revisionMinutes ?? 8;
  const timeSavedMins = Math.max(0, originalMins - revisionMins);
  const timeSavedPercent = Math.round((timeSavedMins / originalMins) * 100);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* 1. LECTURE EXPEDITION PORTAL: INTAKE & COMPRESSION */}
      <section className="bg-surface border-2 border-border-dark rounded-2xl p-5 md:p-6 shadow-ink">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-accent-tint border-2 border-border-dark flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-accent" />
              </span>
              <h1 className="font-display font-black text-lg md:text-xl text-navy">
                Lecture Intake & High-Yield Synthesis
              </h1>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              {material?.courseTitle ?? 'UC Berkeley CS 152: Computer Architecture & Engineering'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-mono font-bold text-accent bg-accent-tint px-3 py-1 rounded-lg border border-border-dark shadow-ink-press flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span>{timeSavedPercent}% STUDY TIME SAVED</span>
            </span>
          </div>
        </div>

        {/* Ingestion Source Switcher */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2 p-1 bg-page rounded-xl border-2 border-border-dark w-fit text-xs font-display font-bold">
            <button
              type="button"
              onClick={() => handleTabChange('yt')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeInputTab === 'yt'
                  ? 'bg-surface text-navy border-border-dark shadow-ink-press'
                  : 'text-secondary border-transparent hover:text-navy'
              }`}
            >
              YouTube URL
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('pdf')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeInputTab === 'pdf'
                  ? 'bg-surface text-navy border-border-dark shadow-ink-press'
                  : 'text-secondary border-transparent hover:text-navy'
              }`}
            >
              Lecture Notes / Text
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('preset')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeInputTab === 'preset'
                  ? 'bg-surface text-navy border-border-dark shadow-ink-press'
                  : 'text-secondary border-transparent hover:text-navy'
              }`}
            >
              Berkeley CS 152 Demo
            </button>
          </div>

          {/* Input field + Synthesize trigger */}
          <div className="mt-3 flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-3 text-secondary">
                  {activeInputTab === 'pdf' ? <FileText className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                </span>

                {activeInputTab === 'pdf' ? (
                  <textarea
                    rows={4}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Paste lecture transcript or text here (minimum 200 characters)..."
                    className="w-full pl-9 pr-4 py-2.5 bg-page border-2 border-border-dark rounded-xl font-mono text-xs md:text-sm text-navy focus:outline-none focus:ring-0 focus:border-accent resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={activeInputTab === 'preset' ? 'UC Berkeley CS 152: High-Speed Arithmetic & IEEE 754 (Demo Preset)' : inputValue}
                    readOnly={activeInputTab === 'preset'}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder={activeInputTab === 'yt' ? 'Paste YouTube class recording link...' : 'Paste lecture notes or reference...'}
                    className="w-full pl-9 pr-4 py-2.5 bg-page border-2 border-border-dark rounded-xl font-mono text-xs md:text-sm text-navy focus:outline-none focus:ring-0 focus:border-accent"
                  />
                )}
              </div>

              <div className="flex-shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => runSynthesis(activeInputTab === 'preset')}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-display font-bold text-xs md:text-sm rounded-xl border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-ink-press transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Synthesize Lecture</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Validation Message */}
            {validationError && (
              <p className="text-xs font-mono font-bold text-incorrect flex items-center gap-1.5 pl-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{validationError}</span>
              </p>
            )}
          </div>
        </div>

        {/* ERROR STATE CARD (Inline visual style with Try Again and Use Demo) */}
        {status === 'error' && (
          <div className="mt-5 p-4 md:p-5 bg-incorrect-tint border-2 border-border-dark rounded-xl shadow-ink space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-incorrect text-white border-2 border-border-dark flex items-center justify-center flex-shrink-0 shadow-ink-sm">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-sm text-navy">Analysis Error</h3>
                <p className="text-xs font-mono text-incorrect leading-relaxed">
                  {errorMessage || "We couldn't analyze this lecture."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => runSynthesis(activeInputTab === 'preset')}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg bg-page hover:bg-surface text-navy font-display font-bold text-xs border-2 border-border-dark shadow-ink-press transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveInputTab('preset');
                  runSynthesis(true);
                }}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Use demo lecture</span>
              </button>
            </div>
          </div>
        )}

        {/* REAL-TIME PROGRESS PERCENT METER */}
        {isProcessing && (
          <div className="mt-5 p-5 md:p-6 bg-page border-2 border-border-dark shadow-ink space-y-4">
            {/* Header: Title, Engine Badge, Elapsed & Percentage */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-accent-tint border border-border-dark flex items-center justify-center text-accent">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </span>
                  <span className="font-display font-black text-sm md:text-base text-navy">
                    Synthesizing Lecture & Structuring Exam Intelligence
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-secondary">
                  <span className="flex items-center gap-1.5 text-navy font-bold">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>Elapsed: {elapsedSeconds}s</span>
                  </span>
                  <span>•</span>
                  <span className="text-accent font-bold">
                    Local Qwen2.5 7B (NVIDIA RTX 3050)
                  </span>
                </div>
              </div>

              {/* Big Bold Percentage Meter Display */}
              <div className="flex items-baseline gap-1 self-start sm:self-auto bg-surface px-4 py-2 border-2 border-border-dark shadow-ink-press">
                <span className="font-mono font-black text-2xl md:text-3xl text-accent">
                  {Math.round(progressPercent)}
                </span>
                <span className="font-mono font-black text-sm text-accent">%</span>
              </div>
            </div>

            {/* Visual Progress Meter Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-4 bg-surface border-2 border-border-dark overflow-hidden p-0.5">
                <div
                  className="h-full bg-accent transition-all duration-300 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(2, progressPercent))}%`,
                    background: 'linear-gradient(90deg, #9d5a22, #c9813c, #e09b55)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-navy font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-accent inline-block" />
                  <span>{progressStage}</span>
                </span>
                <span className="text-secondary font-bold">
                  {progressPercent >= 100 ? '100% Complete' : `${Math.round(progressPercent)}% completed`}
                </span>
              </div>
            </div>

            {/* Step Pills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
              {PROCESSING_STEPS.map((step, idx) => {
                const stepThreshold = (idx + 1) * 20;
                const isDone = allStepsCompleted || progressPercent >= stepThreshold;
                const isCurrent = !allStepsCompleted && progressPercent >= idx * 20 && progressPercent < stepThreshold;

                return (
                  <div
                    key={step}
                    className={`p-2 border-2 text-xs font-mono transition-all flex items-center gap-2 ${
                      isDone
                        ? 'bg-accent-tint border-border-dark text-accent font-bold shadow-ink-press'
                        : isCurrent
                        ? 'bg-accent-tint border-border-dark text-accent font-bold ring-2 ring-accent/50'
                        : 'bg-surface border-border text-secondary opacity-50'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 text-accent animate-spin flex-shrink-0" />
                    ) : (
                      <span className="w-2 h-2 bg-border flex-shrink-0" />
                    )}
                    <span className="truncate">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SIGNATURE COMPRESSION CHRONOMETER METER */}
        {material && !isProcessing && (
          <div className="mt-5 p-4 bg-page rounded-xl border-2 border-border-dark">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono font-bold mb-2 gap-1">
              <span className="text-navy flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-secondary" />
                <span>Raw Lecture: {originalMins} mins</span>
              </span>
              <span className="text-accent flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-accent" />
                <span>Synthesized: {revisionMins} mins High-Yield</span>
              </span>
            </div>

            {/* Visual Dual Scale Bar */}
            <div className="relative w-full h-5 bg-page rounded-full border-2 border-border-dark overflow-hidden flex">
              <div 
                className="bg-accent h-full border-r-2 border-border-dark flex items-center justify-center text-[10px] font-mono font-bold text-white px-1 whitespace-nowrap" 
                style={{ width: `${Math.max(10, Math.round((revisionMins / originalMins) * 100))}%` }}
              >
                0{revisionMins}:00
              </div>
              <div className="flex-1 bg-border flex items-center justify-center text-[10px] font-mono font-bold text-secondary uppercase tracking-tight">
                -{timeSavedMins}m filler, intro & banter eliminated
              </div>
            </div>
          </div>
        )}
      </section>

      {/* EMPTY STATE IF NO MATERIAL YET */}
      {!material && !isProcessing && status !== 'error' && (
        <section className="bg-surface border-2 border-border-dark rounded-2xl p-8 shadow-ink text-center space-y-3">
          <BookOpen className="w-10 h-10 text-accent mx-auto" />
          <h2 className="font-display font-black text-lg text-navy">
            No Lecture Synthesized Yet
          </h2>
          <p className="text-xs text-secondary max-w-md mx-auto">
            Paste lecture notes above or choose the Berkeley CS 152 Demo to generate high-yield Quick Take, Key Concepts, Exam Radar, Flashcards, and Combat Quiz.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveInputTab('preset');
              runSynthesis(true);
            }}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-display font-bold rounded-xl border-2 border-border-dark shadow-ink"
          >
            Load Berkeley CS 152 Demo
          </button>
        </section>
      )}

      {/* 2. QUICK TAKE (3-BULLET CORE SUMMARY) */}
      {material && !isProcessing && (
        <section className="bg-[#141026] border-2 border-border-dark rounded-2xl p-5 md:p-6 shadow-ink space-y-3">
          <div className="flex items-center justify-between border-b-2 border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-accent px-2 py-0.5 rounded bg-accent-tint border border-border-dark">
                Quick Take
              </span>
              <h2 className="font-display font-black text-base text-navy">
                Core Invariants for Exam Readiness
              </h2>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {material.quickTake.map((take, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-page rounded-xl border border-border"
              >
                <div className="w-5 h-5 rounded-full bg-accent-tint text-accent font-mono font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-border-dark">
                  {index + 1}
                </div>
                <p className="text-xs md:text-sm text-navy leading-relaxed">
                  {take}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. KEY ARCHITECTURAL CONCEPTS & TRUTH TABLE */}
      {material && !isProcessing && (
        <section className="bg-[#141026] border-2 border-border-dark rounded-2xl p-5 md:p-6 shadow-ink space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-border pb-3">
            <div>
              <h2 className="font-display font-black text-base md:text-lg text-navy">
                Key Concepts & Structural Invariants
              </h2>
            </div>

            <button
              type="button"
              onClick={onOpenRadar}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-tint hover:bg-border border-2 border-border-dark text-xs font-display font-bold text-navy shadow-ink-press"
            >
              <span>See Exam Probability On Radar</span>
              <ArrowRight className="w-3.5 h-3.5 text-accent" />
            </button>
          </div>

          <div className="space-y-4">
            {material.keyConcepts.map((concept) => (
              <div key={concept.id} className="p-4 bg-page rounded-xl border-2 border-border-dark space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] font-bold text-accent uppercase">
                      Importance: {concept.importance.toUpperCase()}
                    </span>
                    <h3 className="font-display font-extrabold text-sm md:text-base text-navy">
                      {concept.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onExploreConcept(concept.id)}
                    className="text-xs font-mono font-bold text-accent hover:underline flex items-center gap-1"
                  >
                    <span>Explore Concept</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-secondary leading-relaxed">
                  {concept.explanation}
                </p>

                {concept.keyPoints && concept.keyPoints.length > 0 && (
                  <ul className="space-y-1 pl-4 list-disc text-xs text-navy/80">
                    {concept.keyPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                )}

                {/* Optional Table */}
                {concept.table && (
                  <div className="overflow-x-auto pt-1">
                    <table className="w-full text-left text-xs font-mono border-2 border-border-dark bg-surface">
                      <thead className="bg-page border-b-2 border-border-dark text-[11px]">
                        <tr>
                          {concept.table.headers.map((h, i) => (
                            <th key={i} className="p-2 border-r border-border-dark last:border-r-0 font-bold text-navy">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-[11px]">
                        {concept.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-page' : 'bg-surface'}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2 border-r border-border-dark last:border-r-0">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
