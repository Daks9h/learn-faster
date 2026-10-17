import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { 
  Lock, 
  KeyRound, 
  Mail, 
  User as UserIcon, 
  Building, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { ScoutMark } from './Illustrations';

interface DoorLockViewProps {
  onAuthSuccess: (user: User, isDemo?: boolean) => void;
}

export const DoorLockView: React.FC<DoorLockViewProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1-Click Fast Unlock using the verified Berkeley CS 152 Demo credentials
  const handle1ClickDemo = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const session = await authService.login('scout@berkeley.edu', 'password123');
      setSuccessMessage('Demo key accepted! Opening door...');
      setTimeout(() => {
        onAuthSuccess(session.user, true);
      }, 450);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to engage demo key.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        const session = await authService.login(email, password);
        const isDemo = email.trim().toLowerCase() === 'scout@berkeley.edu';
        setSuccessMessage(`Credentials verified. Opening door for ${session.user.name}...`);
        setTimeout(() => {
          onAuthSuccess(session.user, isDemo);
        }, 450);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please provide a valid email address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const session = await authService.register(name, email, password, institution);
        setSuccessMessage(`Account created! Opening door for ${session.user.name}...`);
        setTimeout(() => {
          onAuthSuccess(session.user, false);
        }, 450);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected authentication error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen bg-page flex flex-col justify-center items-center px-4 py-4 md:py-6 relative overflow-hidden">
      {/* Background Ambience Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-accent/15 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-4xl z-10 space-y-3">
        {/* DOOR LOCK STATUS BANNER */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-surface border-2 border-border-dark shadow-ink-sm text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-accent animate-pulse" />
            <span className="font-black text-accent uppercase tracking-wider">
              SECURITY DOOR LOCK // ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-secondary">
            <Lock className="w-3.5 h-3.5 text-accent" />
            <span>ACCESS RESTRICTED</span>
          </div>
        </div>

        {/* WIDE 2-COLUMN VAULT CARD */}
        <div className="bg-surface border-2 border-border-dark shadow-ink-lg grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column (5 cols): Identity & 1-Click Fast Unlock */}
          <div className="md:col-span-5 p-5 md:p-6 bg-surface-solid border-b-2 md:border-b-0 md:border-r-2 border-border-dark flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-accent-tint/30 border-2 border-border-dark flex items-center justify-center shadow-ink-sm flex-shrink-0 overflow-hidden">
                  <img src="/logo.png" alt="Learn Faster" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <h1 className="font-display font-black text-xl text-navy tracking-tight leading-tight">
                    Learn Faster
                  </h1>
                  <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider">
                    Autonomous Lecture AI
                  </span>
                </div>
              </div>

              <p className="text-xs text-secondary font-sans leading-relaxed">
                Workspace is locked. Sign in or use the 1-Click Demo Key to unlock the top navigation bar.
              </p>

              {/* 1-Click Fast Unlock for Demo */}
              <div className="p-3.5 bg-page border-2 border-border-dark shadow-ink-press space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-black text-navy flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-accent" />
                    <span>1-CLICK DEMO KEY</span>
                  </span>
                  <span className="text-[9px] text-accent font-bold px-1.5 py-0.5 bg-accent-tint border border-accent/30">
                    CS 152
                  </span>
                </div>

                <p className="text-[11px] text-secondary">
                  Instant entry with verified UC Berkeley demo materials.
                </p>

                <button
                  type="button"
                  onClick={handle1ClickDemo}
                  disabled={loading}
                  className="w-full py-2 px-3 bg-accent hover:bg-accent-hover text-white font-display font-black text-xs border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>{loading ? 'UNLOCKING...' : 'OPEN WITH DEMO KEY'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-secondary pt-2 border-t border-border">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>HS256 JWT DOOR LOCK ENFORCED</span>
            </div>
          </div>

          {/* Right Column (7 cols): Authentication Form */}
          <div className="md:col-span-7 p-5 md:p-6 flex flex-col justify-between gap-3">
            <div className="space-y-3">
              {/* Mode Switcher */}
              <div className="grid grid-cols-2 gap-1.5 bg-page p-1 border-2 border-border-dark">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className={`py-1.5 text-xs font-display font-black transition-all ${
                    mode === 'login'
                      ? 'bg-accent text-white shadow-ink-press'
                      : 'text-secondary hover:text-navy'
                  }`}
                >
                  Unlock / Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className={`py-1.5 text-xs font-display font-black transition-all ${
                    mode === 'register'
                      ? 'bg-accent text-white shadow-ink-press'
                      : 'text-secondary hover:text-navy'
                  }`}
                >
                  New Scholar Key
                </button>
              </div>

              {/* Alerts */}
              {error && (
                <div className="p-2.5 bg-incorrect-tint border-2 border-incorrect text-xs font-mono text-incorrect flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 bg-correct-tint border-2 border-correct text-xs font-mono text-correct flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-navy uppercase mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-3.5 h-3.5 text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Alex Turing"
                          className="w-full pl-8 pr-2.5 py-1.5 border-2 border-border-dark bg-page text-navy text-xs font-sans focus:outline-none focus:bg-surface focus:ring-1 focus:ring-accent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-navy uppercase mb-1">
                        Institution
                      </label>
                      <div className="relative">
                        <Building className="w-3.5 h-3.5 text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          placeholder="e.g. Berkeley, MIT"
                          className="w-full pl-8 pr-2.5 py-1.5 border-2 border-border-dark bg-page text-navy text-xs font-sans focus:outline-none focus:bg-surface focus:ring-1 focus:ring-accent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono font-bold text-navy uppercase mb-1">
                    University Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scholar@university.edu"
                      className="w-full pl-8 pr-2.5 py-2 border-2 border-border-dark bg-page text-navy text-xs sm:text-sm font-sans focus:outline-none focus:bg-surface focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-navy uppercase mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'login' ? '••••••••' : 'At least 6 characters'}
                      className="w-full pl-8 pr-8 py-2 border-2 border-border-dark bg-page text-navy text-xs sm:text-sm font-sans focus:outline-none focus:bg-surface focus:ring-1 focus:ring-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-navy p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-2.5 px-4 bg-accent hover:bg-accent-hover text-white font-display font-black text-xs sm:text-sm border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'UNLOCK DOOR & ENTER' : 'CREATE KEY & ENTER'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
