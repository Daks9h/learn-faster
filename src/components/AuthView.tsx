import React, { useState } from 'react';
import { User } from '../types';
import { authService, decodeJwt } from '../services/authService';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Building, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  Fingerprint,
  Clock,
  Compass
} from 'lucide-react';
import { ScoutMark } from './Illustrations';

interface AuthViewProps {
  currentUser: User | null;
  onAuthSuccess: (user: User) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  currentUser,
  onAuthSuccess,
  onLogout,
  onNavigateHome,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('UC Berkeley');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-fill demo credentials
  const handleFillDemo = () => {
    setMode('login');
    setEmail('scout@berkeley.edu');
    setPassword('password123');
    setError(null);
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
        setSuccessMessage(`Welcome back, ${session.user.name}!`);
        setTimeout(() => {
          onAuthSuccess(session.user);
        }, 600);
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
        setSuccessMessage(`Account created for ${session.user.name}!`);
        setTimeout(() => {
          onAuthSuccess(session.user);
        }, 600);
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

  // Inspect JWT details if user is logged in
  const currentToken = currentUser ? authService.getToken() : null;
  const decodedToken = currentToken ? decodeJwt(currentToken) : null;

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      {/* 1. TOP CONTEXT BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border-2 border-border-dark text-xs font-mono font-bold text-navy shadow-ink-press hover:bg-accent-tint transition-all"
        >
          <Compass className="w-3.5 h-3.5 text-accent" />
          <span>Return To Camp</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-accent-tint border-2 border-border-dark text-[11px] font-mono font-bold text-navy shadow-ink-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>JWT Standard Auth</span>
        </div>
      </div>

      {/* 2. AUTHENTICATED PROFILE VIEW (IF LOGGED IN) */}
      {currentUser ? (
        <div className="bg-surface border-2 border-border-dark rounded-2xl p-6 md:p-8 shadow-ink space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-border pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent text-white border-2 border-border-dark flex items-center justify-center font-display font-black text-xl shadow-ink-sm flex-shrink-0">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-black text-xl text-navy">
                    {currentUser.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-accent text-white border border-border-dark">
                    LVL {currentUser.level || 7}
                  </span>
                </div>
                <div className="text-xs font-mono text-secondary">
                  {currentUser.email} · {currentUser.institution || 'UC Berkeley'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-incorrect-tint border-2 border-incorrect text-xs font-display font-bold text-incorrect shadow-ink-press hover:bg-incorrect hover:text-white transition-all flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* ACTIVE JWT TELEMETRY PANEL */}
          <div className="bg-page border-2 border-border-dark rounded-xl p-4 md:p-5 space-y-3 shadow-ink-press">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-accent" />
                <h2 className="font-display font-black text-xs text-navy uppercase tracking-wider">
                  Active JWT Token Session
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-correct bg-correct-tint px-2 py-0.5 rounded border border-correct/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified HS256</span>
              </span>
            </div>

            {decodedToken?.payload && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs font-mono">
                <div className="p-2.5 bg-surface rounded-lg border border-border">
                  <span className="text-secondary block text-[10px]">SUBJECT (ID)</span>
                  <span className="text-navy font-bold">{decodedToken.payload.sub}</span>
                </div>
                <div className="p-2.5 bg-surface rounded-lg border border-border">
                  <span className="text-secondary block text-[10px]">ISSUER</span>
                  <span className="text-navy font-bold">{decodedToken.payload.iss || 'lectureai-auth'}</span>
                </div>
                <div className="p-2.5 bg-surface rounded-lg border border-border">
                  <span className="text-secondary block text-[10px]">EXPIRES</span>
                  <span className="text-navy font-bold">
                    {decodedToken.payload.exp 
                      ? new Date(decodedToken.payload.exp * 1000).toLocaleDateString()
                      : '7 Days'}
                  </span>
                </div>
                <div className="p-2.5 bg-surface rounded-lg border border-border">
                  <span className="text-secondary block text-[10px]">STORAGE LOCATION</span>
                  <span className="text-navy font-bold">Bearer Authorization</span>
                </div>
              </div>
            )}

            <div className="pt-1">
              <div className="text-[10px] font-mono text-secondary mb-1">RAW JWT STRING PREVIEW</div>
              <div className="p-2 bg-surface rounded-lg border border-border font-mono text-[10px] text-secondary break-all select-all">
                {currentToken ? `${currentToken.slice(0, 48)}...${currentToken.slice(-24)}` : 'No token active'}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-display font-black text-sm border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <span>Continue To Study Basecamp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* 3. SIGN IN / SIGN UP FORM CARD */
        <div className="bg-surface border-2 border-border-dark rounded-2xl p-6 md:p-8 shadow-ink space-y-6">
          {/* Card Header & Brand Mark */}
          <div className="flex items-center justify-between border-b-2 border-border pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-accent-tint border-2 border-border-dark flex items-center justify-center shadow-ink-sm flex-shrink-0">
                <ScoutMark size={32} />
              </div>
              <div>
                <h1 className="font-display font-black text-xl text-navy">
                  {mode === 'login' ? 'Student Sign In' : 'Create Scholar Account'}
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFillDemo}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-tint hover:bg-border border-2 border-border-dark text-xs font-mono font-bold text-navy shadow-ink-press transition-all"
              title="Auto-fill verified demo student credentials"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Fill Demo</span>
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-page p-1 rounded-xl border-2 border-border-dark">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 text-xs font-display font-black rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-accent text-white shadow-ink-press'
                  : 'text-secondary hover:text-navy'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2 text-xs font-display font-black rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-accent text-white shadow-ink-press'
                  : 'text-secondary hover:text-navy'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Alert / Feedback Messages */}
          {error && (
            <div className="p-3.5 bg-incorrect-tint rounded-xl border-2 border-incorrect text-xs font-mono text-incorrect flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-correct-tint rounded-xl border-2 border-correct text-xs font-mono text-correct flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-mono font-bold text-navy uppercase mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Daksh Shah"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-border-dark bg-page text-navy text-sm font-sans focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold text-navy uppercase mb-1.5">
                University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scout@berkeley.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-border-dark bg-page text-navy text-sm font-sans focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-mono font-bold text-navy uppercase mb-1.5">
                  Institution / Campus
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="UC Berkeley"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-border-dark bg-page text-navy text-sm font-sans focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold text-navy uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? '••••••••' : 'At least 6 characters'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-border-dark bg-page text-navy text-sm font-sans focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-display font-black text-sm border-2 border-border-dark shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In To Basecamp' : 'Initialize Scholar Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Helper for Mobile */}
          <div className="sm:hidden pt-1 border-t border-border flex justify-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-mono text-accent hover:underline flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use 1-Click Demo Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
