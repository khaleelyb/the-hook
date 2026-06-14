import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '../lib/supabase';
import { cn } from '../types';

export const AuthPage: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') await signIn(email, password);
      else await signUp(email, password, username);
      onAuth();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Gradient blob bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-20 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute top-20 -right-20 w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #f43f5e 0%, transparent 70%)' }} />
      </div>

      <div className="relative flex flex-col flex-1 items-center justify-center px-6 py-12">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ boxShadow: '0 0 40px rgba(124, 58, 237, 0.4)' }}>
            <Zap className="w-9 h-9 text-white fill-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight">The Hook</h1>
          <p className="text-on-surface-variant text-sm mt-1.5">Vote on what matters. Decide everything.</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="w-full max-w-sm"
        >
          {/* Mode toggle */}
          <div className="flex rounded-2xl overflow-hidden bg-surface-container p-1 mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <motion.button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={cn(
                  'flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all',
                  mode === m ? 'bg-surface-container-highest text-white shadow-sm' : 'text-on-surface-variant'
                )}
              >
                {m === 'login' ? 'Log in' : 'Sign up'}
              </motion.button>
            ))}
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/30 text-on-surface pl-10 pr-4 py-3.5 rounded-xl text-sm placeholder-on-surface-variant focus:outline-none focus:border-violet-500 focus:bg-surface-container-high transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface pl-10 pr-4 py-3.5 rounded-xl text-sm placeholder-on-surface-variant focus:outline-none focus:border-violet-500 focus:bg-surface-container-high transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface pl-10 pr-12 py-3.5 rounded-xl text-sm placeholder-on-surface-variant focus:outline-none focus:border-violet-500 focus:bg-surface-container-high transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all mt-2"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)', boxShadow: '0 4px 20px rgba(124, 58, 237, 0.35)' }}
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <>
                  <span>{mode === 'login' ? 'Continue' : 'Create account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              }
            </motion.button>
          </div>

          <p className="text-center text-xs text-on-surface-variant mt-6">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-violet-400 font-semibold">
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </motion.div>
      </div>

      <p className="text-center text-[11px] text-on-surface-variant/50 pb-8">
        By continuing, you agree to our Terms & Privacy Policy
      </p>
    </div>
  );
};
