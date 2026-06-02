import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from './components/TopBar';
import { NavBar } from './components/NavBar';
import { HookCard } from './components/HookCard';
import { Hook, Category, cn } from './types';
import { Plus, Heart, Loader2 } from 'lucide-react';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { DetailView } from './pages/DetailView';
import { CreatePage } from './pages/Create';
import { AuthPage } from './pages/Auth';
import { supabase, fetchHooks, getFollowingIds } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

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

  const categories: Category[] = ['For You', 'Trending', 'Style', 'Tech', 'Lifestyle'];

  // Auth state
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load following IDs whenever session changes
  React.useEffect(() => {
    if (!session?.user?.id) return;
    getFollowingIds(session.user.id).then(setFollowingIds);
  }, [session?.user?.id]);

  // Fetch hooks
  React.useEffect(() => {
    if (activeTab !== 'feed') return;
    setLoadingHooks(true);
    setHookError(null);
    fetchHooks(category, session?.user?.id)
      .then(setHooks)
      .catch((err) => setHookError(err.message ?? 'Failed to load hooks'))
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
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthPage onAuth={() => {}} />;
  }

  const selectedHook = hooks.find((h) => h.id === selectedHookId);
  const showingDetail = !!selectedHook;
  const showingProfile = !!viewProfileId;
  const showingOverlay = showSettings || showingDetail || showingProfile;

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
        <DetailView
          hook={selectedHook}
          onBack={() => setSelectedHookId(null)}
          session={session}
        />
      );
    }

    switch (activeTab) {
      case 'feed':
        return (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2 sticky top-[72px] bg-background/90 backdrop-blur-md z-40 -mx-4 px-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all',
                    category === cat
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loadingHooks && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}

            {hookError && (
              <div className="text-center py-12 text-error text-sm font-semibold">{hookError}</div>
            )}

            {!loadingHooks && !hookError && hooks.length === 0 && (
              <div className="text-center py-16 text-on-surface-variant text-sm font-semibold">
                No hooks here yet. Be the first to post!
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {hooks.map((hook, index) => (
                <motion.div
                  key={hook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
          <ProfilePage
            onSettings={() => setShowSettings(true)}
            session={session}
          />
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Heart className="w-12 h-12 text-error mb-4" />
            <h2 className="text-xl font-bold mb-1">Activity Feed</h2>
            <p className="text-on-surface-variant text-sm">Stay tuned for the latest votes and comments!</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {!showingOverlay && <TopBar />}
      <main className={cn('px-4 max-w-lg mx-auto', !showingOverlay ? 'pt-20' : 'pt-4')}>
        {renderPage()}
      </main>

      {activeTab === 'feed' && !showingOverlay && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab('create')}
          className="fixed right-6 bottom-24 w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl shadow-primary/20 flex items-center justify-center z-40"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      )}

      {!showingOverlay && <NavBar activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}
