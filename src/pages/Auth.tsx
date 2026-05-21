import React from 'react';
import { motion } from 'motion/react';
import { Bolt, Mail, Lock, User, Loader2 } from 'lucide-react';
import { signIn, signUp } from '../lib/supabase';
import { cn } from '../types';

export const AuthPage: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
      onAuth();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="flex flex-col items-center gap-2">
          <Bolt className="w-10 h-10 text-primary fill-primary" />
          <h1 className="font-display text-4xl font-black italic text-primary tracking-tighter">THE HOOK</h1>
          <p className="text-sm text-on-surface-variant font-medium">Vote. Battle. Decide.</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex rounded-xl overflow-hidden border border-outline-variant/30">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={cn(
                  'flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-all',
                  mode === m ? 'bg-primary text-white' : 'bg-transparent text-on-surface-variant'
                )}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-container pl-10 pr-4 py-3 rounded-xl text-sm font-medium border-none focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container pl-10 pr-4 py-3 rounded-xl text-sm font-medium border-none focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-surface-container pl-10 pr-4 py-3 rounded-xl text-sm font-medium border-none focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {error && (
            <p className="text-xs text-error font-semibold bg-error-container rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary font-display text-lg rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
