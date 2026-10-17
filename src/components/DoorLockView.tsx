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
      setSuccessMessage('Demo key accepted! Opening the door...');
      setTimeout(() => {
        onAuthSuccess(session.user, true);
      }, 500);
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
          throw new Error('Please enter both your academic email and password.');
        }
        const session = await authService.login(email, password);
        const isDemo = email.trim().toLowerCase() === 'scout@berkeley.edu';
        setSuccessMessage(`Credentials verified. Opening the door for ${session.user.name}...`);
        setTimeout(() => {
          onAuthSuccess(session.user, isDemo);
        }, 500);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please provide a valid university email address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        const session = await authService.register(name, email, password, institution);
        setSuccessMessage(`Scholar account created! Opening the door for ${session.user.name}...`);
        setTimeout(() => {
          onAuthSuccess(session.user, false);
        }, 500);
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
    <div className="min-h-screen bg-page flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Ambience Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-accent/15 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-lg z-10 space-y-5">
        {/* DOOR LOCK STATUS BANNER */}
        <div className="flex items-center justify-between px-4 py-2 bg-surface border-2 border-border-dark shadow-ink">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent animate-pulse" />
            <span className="font-mono text-xs font-black tracking-wider text-accent uppercase">
              SECURITY DOOR LOCK // ACTIVE
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-secondary">
            <Lock className="w-3.5 h-3.5 text-accent" />
            <span>PORTAL LOCKED</span>
          </div>
        </div>

        {/* VAULT / ENTRY GATEWAY CARD */}
        <div className="bg-surface border-2 border-border-dark shadow-ink-lg p-6 sm:p-8 space-y-6">
          {/* Header Mark & Title */}
          <div className="text-center space-y-3 border-b-2 border-border-dark pb-6">
            <div className="w-14 h-14 mx-auto bg-accent-tint border-2 border-border-dark flex items-center justify-center shadow-ink-sm">
              <ScoutMark size={38} />
            </div>

            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-navy tracking-tight">
                Learn Faster
              </h1>
              <p className="text-xs font-mono text-accent font-bold mt-0.5 uppercase tracking-wider">
                Academic Gateway & Lecture AI
              </p>
            </div>

            <p className="text-xs sm:text-sm text-secondary font-sans max-w-sm mx-auto">
              Access is locked. Sign in or engage the 1-Click Demo Key to unlock the top navigation and enter your study workspace.
            </p>
          </div>

          {/* 1-CLICK FAST UNLOCK FOR DEMO */}
          <div className="p-4 bg-surface-reading border-2 border-border-dark shadow-ink space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-black text-navy flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-accent" />
                <span>FAST UNLOCK // DEMO ACCESS</span>
              </span>
              <span className="text-[10px] text-accent font-bold px-1.5 py-0.5 bg-accent-tint border border-accent/40">
                UC Berkeley CS 152
              </span>
            </div>

            <p className="text-[11px] text-secondary font-sans leading-relaxed">
              Instantly open the door with verified guest credentials (<code className="text-navy font-mono">scout@berkeley.edu</code>) and preloaded Computer Architecture lecture materials.
            </p>

            <button
              type="button"
              onClick={handle1ClickDemo}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white font-display font-black text-xs sm:text-sm border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{loading ? 'UNLOCKING DOOR...' : '1-CLICK DEMO ACCESS (OPEN DOOR)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* DIVIDER */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border-dark"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono font-bold text-secondary uppercase tracking-wider">
              Or Unlock With Scholar Account
            </span>
            <div className="flex-grow border-t border-border-dark"></div>
          </div>

          {/* MODE SWITCHER */}
          <div className="grid grid-cols-2 gap-2 bg-page p-1 border-2 border-border-dark">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 text-xs font-display font-black transition-all ${
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
              className={`py-2 text-xs font-display font-black transition-all ${
                mode === 'register'
                  ? 'bg-accent text-white shadow-ink-press'
                  : 'text-secondary hover:text-navy'
              }`}
            >
              New Scholar Key
            </button>
          </div>

          {/* ALERTS */}
          {error && (
            <div className="p-3 bg-incorrect-tint border-2 border-incorrect text-xs font-mono text-incorrect flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-correct-tint border-2 border-correct text-xs font-mono text-correct flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-mono font-bold text-navy uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Turing"
                    className="w-full pl-9 pr-3 py-2.5 border-2 border-border-dark bg-page text-navy text-sm font-sans focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold text-navy uppercase mb-1">
                University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@university.edu"
                  className="w-full pl-9 pr-3 py-2.5 border-2 border-border-dark bg-page text-navy text-sm font-sans focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-mono font-bold text-navy uppercase mb-1">
                  Institution / Campus
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. UC Berkeley, Stanford, MIT"
                    className="w-full pl-9 pr-3 py-2.5 border-2 border-border-dark bg-page text-navy text-sm font-sans focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold text-navy uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? '••••••••' : 'At least 6 characters'}
                  className="w-full pl-9 pr-10 py-2.5 border-2 border-border-dark bg-page text-navy text-sm font-sans focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-navy p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-display font-black text-sm border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'UNLOCK DOOR & ENTER' : 'CREATE ACCOUNT & ENTER'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* FOOTER NOTICE */}
          <div className="pt-2 border-t border-border flex items-center justify-center gap-2 text-[11px] font-mono text-secondary">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>HS256 JWT ENCRYPTION · DOOR LOCK ENFORCED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
