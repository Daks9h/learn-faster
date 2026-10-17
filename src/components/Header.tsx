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
  KeyRound,
  Home as HomeIcon,
  User as UserIcon
} from 'lucide-react';
import { ScoutMark } from './Illustrations';

interface HeaderProps {
  activeTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  stats: UserStats;
  currentUser?: User | null;
  courseBadge?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, stats, currentUser, courseBadge }) => {
  if (!currentUser) {
    return null;
  }

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: ScreenTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'camp', label: 'Camp', icon: Compass },
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
            className={`flex items-center gap-2.5 text-left group p-1 rounded-xl transition-all ${
              activeTab === 'home' || activeTab === 'dashboard' ? 'ring-2 ring-accent/60 bg-accent-tint/30' : 'hover:opacity-95'
            }`}
            title="Learn Faster — Home"
          >
            <div className="w-9 h-9 border-2 border-border-dark bg-accent-tint/30 flex items-center justify-center shadow-ink-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform overflow-hidden">
              <img src="/logo.png" alt="Learn Faster" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-tight text-navy">
                Learn Faster
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean single line, icon + text, zero pills) */}
        <nav className="hidden lg:flex items-center gap-1 font-display font-bold text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'home' && activeTab === 'dashboard');
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

          {/* General User Profile Icon Button */}
          <button
            onClick={() => onSelectTab('profile')}
            className={`w-8 h-8 rounded-lg border-2 border-border-dark shadow-ink-sm flex items-center justify-center transition-all hover:translate-x-0.5 hover:translate-y-0.5 select-none ${
              activeTab === 'profile'
                ? 'bg-surface text-accent ring-2 ring-accent border-accent'
                : 'bg-accent text-white hover:bg-accent-hover'
            }`}
            title={currentUser ? `${currentUser.name} (${currentUser.email}) · Scholar Profile` : 'Scholar Profile'}
            aria-label="Scholar Profile"
          >
            <UserIcon className="w-4 h-4 text-white" strokeWidth={2.4} />
          </button>

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
