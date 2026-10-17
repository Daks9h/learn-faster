import React from 'react';
import { ScreenTab, UserStats, User } from '../types';
import { 
  Compass, 
  BookOpen, 
  Radar, 
  Layers, 
  HelpCircle, 
  Activity, 
  Flame, 
  Zap,
  Menu,
  X,
  KeyRound
} from 'lucide-react';
import { ScoutMark } from './Illustrations';

interface HeaderProps {
  activeTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  stats: UserStats;
  currentUser?: User | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, stats, currentUser }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: ScreenTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Camp', icon: Compass },
    { id: 'lecture', label: 'Lecture', icon: BookOpen },
    { id: 'radar', label: 'Exam Radar', icon: Radar },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'quiz', label: 'Quiz Arena', icon: HelpCircle },
    { id: 'score', label: 'Knowledge Map', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b0a14]/90 border-b border-border-dark px-4 md:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Wordmark & Course Context */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-lg border-2 border-border-dark bg-accent-tint flex items-center justify-center shadow-ink-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <ScoutMark size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-lg tracking-tight text-navy">
                  LectureAI
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono font-semibold text-secondary">
                  CS 152
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean single line, icon + text, zero pills) */}
        <nav className="hidden lg:flex items-center gap-1 font-display font-bold text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-lg border-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-accent text-white border-border-dark shadow-ink-sm'
                    : 'border-transparent text-navy hover:border-border hover:bg-accent-tint/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-accent'}`} strokeWidth={2.2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Player Learning Status (Streak, XP, Profile) */}
        <div className="flex items-center gap-2.5">
          {/* 4-Day Streak */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-tint border-2 border-border-dark shadow-ink-sm font-mono text-xs font-bold"
            title={`${stats.streakDays}-Day Spaced Repetition Streak`}
          >
            <Flame className="w-4 h-4 text-accent" strokeWidth={2.5} />
            <span className="text-navy whitespace-nowrap">{stats.streakDays}D STREAK</span>
          </div>

          {/* XP Progress Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface border-2 border-border-dark shadow-ink-sm font-mono text-xs font-bold">
            <Zap className="w-4 h-4 text-accent" strokeWidth={2.5} />
            <span className="text-accent">{stats.xpCurrent} XP</span>
          </div>

          {/* User Profile / Auth Badge */}
          {currentUser ? (
            <button
              onClick={() => onSelectTab('profile')}
              className={`w-8 h-8 rounded-lg border-2 border-border-dark shadow-ink-sm font-display font-black text-xs flex items-center justify-center transition-all hover:translate-x-0.5 hover:translate-y-0.5 select-none ${
                activeTab === 'profile' ? 'bg-navy text-white ring-2 ring-accent' : 'bg-accent text-white'
              }`}
              title={`${currentUser.name} (${currentUser.email}) · Scholar Profile`}
            >
              {currentUser.name.slice(0, 2).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('auth')}
              className={`px-3 py-1 rounded-lg border-2 border-border-dark shadow-ink-sm font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'auth' ? 'bg-navy text-white' : 'bg-accent hover:bg-accent-hover text-white'
              }`}
              title="Sign in with your academic account"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg border-2 border-border-dark bg-surface hover:bg-accent-tint/40 text-navy"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t-2 border-border-dark/20 flex flex-wrap gap-1.5 pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg border-2 flex items-center gap-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-accent text-white border-border-dark shadow-ink-sm'
                    : 'bg-surface border-border-dark text-navy'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              onSelectTab(currentUser ? 'profile' : 'auth');
              setMobileMenuOpen(false);
            }}
            className={`px-3 py-2 rounded-lg border-2 flex items-center gap-2 text-xs font-bold transition-all ${
              (activeTab === 'profile' || activeTab === 'auth')
                ? 'bg-accent text-white border-border-dark shadow-ink-sm'
                : 'bg-surface border-border-dark text-navy'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>{currentUser ? 'Scholar Profile' : 'Sign In'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
