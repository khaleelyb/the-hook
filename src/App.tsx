import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from './components/TopBar';
import { NavBar } from './components/NavBar';
import { HookCard } from './components/HookCard';
import { Hook, Category, cn } from './types';
import { Loader2, TrendingUp, Sparkles, Shirt, Cpu, Coffee } from 'lucide-react';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { DetailView } from './pages/DetailView';
import { CreatePage } from './pages/Create';
import { AuthPage } from './pages/Auth';
import { supabase, fetchHooks, getFollowingIds } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

const categoryConfig: { cat: Category; icon: React.ReactNode; label: string }[] = [
  { cat: 'For You',   icon: <Sparkles className="w-3.5 h-3.5" />,    label: 'For You' },
  { cat: 'Trending',  icon: <TrendingUp className="w-3.5 h-3.5" />,  label: 'Trending' },
  { cat: 'Style',     icon: <Shirt className="w-3.5 h-3.5" />,       label: 'Style' },
  { cat: 'Tech',      icon: <Cpu className="w-3.5 h-3.5" />,         label: 'Tech' },
  { cat: 'Lifestyle', icon: <Coffee className="w-3.5 h-3.5" />,      label: 'Life' },
];

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('feed');
  const [category, setCategory] = React.useState<Category>('For You');
  const [showSettings, setShowSettings] = React.useState(false);
  const [selectedHookId, setSelectedHookId] = React.useState<string | null>(null);
  const [viewProfileId, setViewProfileId] = React.useState<string | null>(null);
  const [hooks, setHooks] = React.useState<Hook[]>([]);
  const [loadingHooks, setLoadingHooks] = React.useState(false);
  const [hookError, setHookError] = React.useState<string | null>(null);
  const [followingIds, setFollowingIds] = React.useState<Set<string>>(new Set());

  // Auth
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!session?.user?.id) return;
    getFollowingIds(session.user.id).then(setFollowingIds);
  }, [session?.user?.id]);

  React.useEffect(() => {
    if (activeTab !== 'feed') return;
    setLoadingHooks(true);
    setHookError(null);
    fetchHooks(category, session?.user?.id)
      .then(setHooks)
      .catch((err) => setHookError(err.message ?? 'Failed to load'))
      .finally(() => setLoadingHooks(false));
  }, [activeTab, category, session]);

  const handleVote = async (hookId: string, optionId: string) => {
    if (!session) return;
    setHooks((prev) =>
      prev.map((h) =>
        h.id === hookId
          ? {
              ...h,
              has_voted: true,
              user_voted_option_id: optionId,
              total_votes: h.total_votes + 1,
              options: h.options?.map((o) =>
                o.id === optionId ? { ...o, vote_count: o.vote_count + 1 } : o
              ),
            }
          : h
      )
    );
    try {
      const { castVote } = await import('./lib/supabase');
      await castVote(session.user.id, hookId, optionId);
    } catch {
      fetchHooks(category, session.user.id).then(setHooks);
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center animate-pulse">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) return <AuthPage onAuth={() => {}} />;

  const selectedHook = hooks.find((h) => h.id === selectedHookId);
  const showingOverlay = showSettings || !!selectedHook || !!viewProfileId;

  const renderPage = () => {
    if (showSettings) {
      return <SettingsPage onBack={() => setShowSettings(false)} session={session} />;
    }
    if (viewProfileId) {
      return (
        <ProfilePage
          onSettings={() => setShowSettings(true)}
          session={session}
          viewUserId={viewProfileId}
          onBack={() => setViewProfileId(null)}
        />
      );
    }
    if (selectedHook) {
      return (
        <DetailView hook={selectedHook} onBack={() => setSelectedHookId(null)} session={session} />
      );
    }

    switch (activeTab) {
      case 'feed':
        return (
          <div>
            {/* Category pills — sticky under topbar */}
            <div className="sticky top-14 z-40 -mx-4 px-4 py-2.5"
              style={{ background: 'linear-gradient(to bottom, #0a0a0b 80%, transparent)' }}>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {categoryConfig.map(({ cat, icon, label }) => (
                  <motion.button
                    key={cat}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0',
                      category === cat
                        ? 'text-white'
                        : 'bg-surface-container text-on-surface-variant'
                    )}
                    style={category === cat ? {
                      background: 'linear-gradient(135deg, #7c3aed, #c026d3)',
                      boxShadow: '0 2px 12px rgba(124, 58, 237, 0.35)'
                    } : {}}
                  >
                    {icon}
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>

            {loadingHooks && (
              <div className="flex flex-col items-center py-16 gap-3">
                <Loader2 className="w-7 h-7 text-violet-500 animate-spin" />
                <p className="text-xs text-on-surface-variant">Loading hooks…</p>
              </div>
            )}

            {hookError && (
              <div className="text-center py-12">
                <p className="text-rose-400 text-sm">{hookError}</p>
              </div>
            )}

            {!loadingHooks && !hookError && hooks.length === 0 && (
              <div className="text-center py-20">
                <div className="text-4xl mb-3">⚡</div>
                <p className="text-on-surface font-semibold">No hooks yet</p>
                <p className="text-on-surface-variant text-sm mt-1">Be the first to post one</p>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {hooks.map((hook, index) => (
                <motion.div
                  key={hook.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => setSelectedHookId(hook.id)}
                >
                  <HookCard
                    hook={hook}
                    onVote={(optionId) => handleVote(hook.id, optionId)}
                    currentUserId={session.user.id}
                    initialFollowing={!!hook.creator?.id && followingIds.has(hook.creator.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        );

      case 'create':
        return (
          <CreatePage
            session={session}
            onCreated={() => {
              setActiveTab('feed');
              fetchHooks(category, session.user.id).then(setHooks);
            }}
          />
        );

      case 'profile':
        return (
          <ProfilePage onSettings={() => setShowSettings(true)} session={session} />
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
              <span className="text-3xl">🔔</span>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-on-surface">Activity</h2>
              <p className="text-on-surface-variant text-sm mt-1">Your notifications will appear here</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {!showingOverlay && <TopBar />}
      <main className={cn('px-4 max-w-lg mx-auto', !showingOverlay ? 'pt-14' : 'pt-0')}>
        {renderPage()}
      </main>
      {!showingOverlay && <NavBar activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}
