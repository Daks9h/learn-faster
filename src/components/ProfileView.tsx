import React, { useState } from 'react';
import { User, UserProfileSettings, ScreenTab, UserStats } from '../types';
import { authService, decodeJwt } from '../services/authService';
import { 
  User as UserIcon, 
  BookOpen, 
  Target, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Fingerprint, 
  LogOut, 
  Flame, 
  Zap, 
  HelpCircle, 
  Radar, 
  Layers, 
  CheckCircle2, 
  GraduationCap
} from 'lucide-react';
import { ScoutMark } from './Illustrations';

interface ProfileViewProps {
  user: User;
  stats: UserStats;
  onUpdateUser: (updatedUser: User) => void;
  onNavigate: (tab: ScreenTab) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stats,
  onUpdateUser,
  onNavigate,
  onLogout,
}) => {
  const isBerkeley = Boolean(user.email && user.email.toLowerCase().includes('berkeley'));
  const currentSettings: UserProfileSettings = user.profileSettings || {
    targetCourse: isBerkeley ? 'CS 152: Computer Architecture' : 'General Course Studies',
    gradeGoal: 'A (Top 10%)',
    studyMode: 'High-Yield (Audio + Exam Radar)',
    examDate: isBerkeley ? 'Midterm 2 · 12 Days Remaining' : 'Upcoming Exam',
  };

  const [targetCourse, setTargetCourse] = useState(currentSettings.targetCourse);
  const [gradeGoal, setGradeGoal] = useState(currentSettings.gradeGoal);
  const [studyMode, setStudyMode] = useState(currentSettings.studyMode);
  const [examDate, setExamDate] = useState(currentSettings.examDate || (isBerkeley ? 'Midterm 2 · 12 Days Remaining' : 'Upcoming Exam'));
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = authService.saveProfileSettings({
      targetCourse,
      gradeGoal,
      studyMode,
      examDate,
    });
    if (updated) {
      onUpdateUser(updated);
      setSavedSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const token = authService.getToken();
  const decoded = token ? decodeJwt(token) : null;

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-6">
      {/* 1. PERSONAL SCHOLAR BANNER */}
      <section id="scholar-profile" className="bg-surface border-2 border-border-dark rounded-2xl p-6 md:p-8 shadow-ink flex flex-col md:flex-row md:items-center justify-between gap-6 scroll-mt-20">
        <div className="flex items-start sm:items-center gap-4 md:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-accent text-white border-2 border-border-dark flex items-center justify-center shadow-ink-sm flex-shrink-0">
            <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.2} />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display font-black text-2xl md:text-3xl text-navy">
                {user.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-accent text-white border border-border-dark">
                LVL {user.level || stats.level || 7} SCHOLAR
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-accent bg-accent-tint px-2 py-0.5 rounded border border-accent/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>JWT Verified</span>
              </span>
            </div>

            <div className="text-xs sm:text-sm font-mono text-secondary flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{user.email}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-navy" />
                {user.institution || (isBerkeley ? 'UC Berkeley' : 'Academic Scholar')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => onNavigate('camp')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-display font-black text-xs sm:text-sm border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <span>ENTER BASECAMP</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="p-2.5 rounded-xl bg-surface hover:bg-incorrect-tint border-2 border-border-dark text-secondary hover:text-incorrect shadow-ink-press transition-all"
            title="Sign Out of Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 2. PERSONALIZED ACADEMIC ALIGNMENT (COURSE & EXAM FOCUS) */}
      <section className="bg-surface border-2 border-border-dark rounded-2xl p-6 md:p-7 shadow-ink space-y-5">
        <div className="flex items-center justify-between border-b-2 border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-tint border-2 border-border-dark flex items-center justify-center shadow-ink-sm">
              <ScoutMark size={24} />
            </div>
            <div>
              <h2 className="font-display font-black text-base md:text-lg text-navy">
                Learn Faster Course Alignment
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-lg border-2 border-border-dark bg-page hover:bg-accent-tint text-xs font-mono font-bold text-navy shadow-ink-press transition-all"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Alignment'}
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-correct-tint border-2 border-correct rounded-xl text-xs font-mono text-correct flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Course alignment preferences saved for your account!</span>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSaveSettings} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-navy uppercase mb-1">
                  Primary Course
                </label>
                <input
                  type="text"
                  value={targetCourse}
                  onChange={(e) => setTargetCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border-dark bg-page text-navy text-sm font-sans focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                  placeholder="e.g. CS 152: Computer Architecture"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-navy uppercase mb-1">
                  Target Midterm Grade
                </label>
                <select
                  value={gradeGoal}
                  onChange={(e) => setGradeGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border-dark bg-page text-navy text-sm font-sans focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                >
                  <option value="A (Top 10%)">A (Top 10% · 92%+)</option>
                  <option value="A- (Top 20%)">A- (Top 20% · 85%+)</option>
                  <option value="B+ (Solid Mastery)">B+ (Solid Mastery · 80%+)</option>
                  <option value="P / Pass Course">P / Pass Course</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-navy uppercase mb-1">
                  Exam Countdown
                </label>
                <input
                  type="text"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border-dark bg-page text-navy text-sm font-sans focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                  placeholder="Midterm 2 · 12 Days Remaining"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-navy uppercase mb-1">
                  Study Strategy
                </label>
                <select
                  value={studyMode}
                  onChange={(e) => setStudyMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border-dark bg-page text-navy text-sm font-sans focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                >
                  <option value="High-Yield (Audio + Exam Radar)">High-Yield (Audio + Exam Radar)</option>
                  <option value="Derivation & Deep HW Invariants">Derivation & Deep HW Invariants</option>
                  <option value="Rapid Combat Drills Only">Rapid Combat Drills Only</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs border-2 border-border-dark shadow-ink transition-all"
              >
                Save Preferences
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-page border-2 border-border-dark rounded-xl space-y-1 shadow-ink-sm">
              <div className="flex items-center gap-1.5 text-xs font-mono text-secondary">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                <span>ACTIVE COURSE</span>
              </div>
              <div className="font-display font-black text-sm text-navy">
                {targetCourse}
              </div>
            </div>

            <div className="p-3.5 bg-page border-2 border-border-dark rounded-xl space-y-1 shadow-ink-sm">
              <div className="flex items-center gap-1.5 text-xs font-mono text-secondary">
                <Target className="w-3.5 h-3.5 text-accent" />
                <span>MIDTERM GOAL</span>
              </div>
              <div className="font-display font-black text-sm text-navy">
                {gradeGoal}
              </div>
            </div>

            <div className="p-3.5 bg-page border-2 border-border-dark rounded-xl space-y-1 shadow-ink-sm">
              <div className="flex items-center gap-1.5 text-xs font-mono text-secondary">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span>TARGET TIMELINE</span>
              </div>
              <div className="font-display font-black text-sm text-navy">
                {examDate}
              </div>
            </div>

            <div className="p-3.5 bg-page border-2 border-border-dark rounded-xl space-y-1 shadow-ink-sm">
              <div className="flex items-center gap-1.5 text-xs font-mono text-secondary">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>SESSION PACE</span>
              </div>
              <div className="font-display font-black text-sm text-navy truncate" title={studyMode}>
                {studyMode}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. SCHOLAR TELEMETRY CARDS */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-surface border-2 border-border-dark rounded-xl space-y-1 shadow-ink-sm">
          <div className="flex items-center justify-between text-xs font-mono text-secondary">
            <span>STREAK</span>
            <Flame className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-display font-black text-navy">
            {stats.streakDays} Days
          </div>
        </div>

        <div className="p-4 bg-surface border-2 border-border-dark rounded-xl space-y-1 shadow-ink-sm">
          <div className="flex items-center justify-between text-xs font-mono text-secondary">
            <span>XP EARNED</span>
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-display font-black text-accent">
            {stats.xpCurrent}
          </div>
        </div>

        <div className="p-4 bg-surface border-2 border-border-dark rounded-xl space-y-1 shadow-ink-sm">
          <div className="flex items-center justify-between text-xs font-mono text-secondary">
            <span>MASTERY</span>
            <Target className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-display font-black text-navy">
            {stats.masteryOverall}%
          </div>
        </div>

        <div className="p-4 bg-surface border-2 border-border-dark rounded-xl space-y-1 shadow-ink-sm">
          <div className="flex items-center justify-between text-xs font-mono text-secondary">
            <span>WEAK AREAS</span>
            <span className="w-2 h-2 rounded-full bg-incorrect" />
          </div>
          <div className="text-2xl font-display font-black text-incorrect">
            {stats.weakTopicsCount} Flagged
          </div>
        </div>
      </section>

      {/* 4. ACTIVE JWT SECURITY TELEMETRY */}
      <section className="bg-surface border-2 border-border-dark rounded-2xl p-5 md:p-6 shadow-ink space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-accent" />
            <h3 className="font-display font-black text-xs text-navy uppercase tracking-wider">
              Cryptographic JWT Session Token
            </h3>
          </div>
          <span className="text-[11px] font-mono text-secondary font-bold">
            RFC 7519 · HS256 Signed
          </span>
        </div>

        {decoded?.payload && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono pt-1">
            <div className="p-2.5 bg-page rounded-lg border border-border">
              <span className="text-secondary text-[10px] block">SUBJECT / USER ID</span>
              <span className="text-navy font-bold">{decoded.payload.sub || user.id}</span>
            </div>
            <div className="p-2.5 bg-page rounded-lg border border-border">
              <span className="text-secondary text-[10px] block">ISSUED BY</span>
              <span className="text-navy font-bold">{decoded.payload.iss || 'lectureai-auth'}</span>
            </div>
            <div className="p-2.5 bg-page rounded-lg border border-border">
              <span className="text-secondary text-[10px] block">SESSION EXPIRATION</span>
              <span className="text-navy font-bold">
                {decoded.payload.exp 
                  ? new Date(decoded.payload.exp * 1000).toLocaleDateString()
                  : 'Valid for 7 Days'}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 5. FAST LAUNCH ACTION HUB */}
      <section className="bg-surface-solid border-2 border-border-dark text-white rounded-2xl p-6 md:p-7 shadow-ink-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <h3 className="text-lg md:text-xl font-display font-black text-white">
            Ready to train for {targetCourse}?
          </h3>
          <p className="text-xs sm:text-sm text-white/80">
            Launch into your personalized study basecamp or drill directly into weak-node flashcards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => onNavigate('quiz')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Combat Quiz</span>
          </button>

          <button
            onClick={() => onNavigate('radar')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Exam Radar</span>
          </button>

          <button
            onClick={() => onNavigate('camp')}
            className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-display font-black text-xs sm:text-sm border-2 border-white/40 shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span>LAUNCH BASECAMP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
