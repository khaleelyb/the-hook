import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from './components/TopBar';
import { NavBar } from './components/NavBar';
import { HookCard } from './components/HookCard';
import { Hook, Category, cn } from './types';
import { Plus, Heart } from 'lucide-react';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';

const MOCK_HOOKS: Hook[] = [
  {
    id: '1',
    creator_id: 'u1',
    question: "Which outfit for tonight's gala? 🥂",
    category: 'Style',
    type: 'visual',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    total_votes: 1250,
    creator: {
      id: 'u1',
      username: 'alex_vogue',
      full_name: 'Alex Vogue',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop',
      followers_count: 5200,
      following_count: 320,
      is_verified: true
    },
    options: [
      { id: 'o1', hook_id: '1', label: 'Option A', image_url: 'https://images.unsplash.com/photo-1594932224440-74ff9d4dcd1c?w=400&h=600&auto=format&fit=crop', vote_count: 600 },
      { id: 'o2', hook_id: '1', label: 'Option B', image_url: 'https://images.unsplash.com/photo-1598808503744-44d858ed529a?w=400&h=600&auto=format&fit=crop', vote_count: 650 }
    ]
  },
  {
    id: '2',
    creator_id: 'u2',
    question: "Best stack for a solo SaaS in 2024? 💻",
    category: 'Tech',
    type: 'text',
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    total_votes: 2450,
    creator: {
      id: 'u2',
      username: 'jordan_dev',
      full_name: 'Jordan Dev',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
      followers_count: 12000,
      following_count: 800,
      is_verified: true
    },
    options: [
      { id: 'o3', hook_id: '2', label: 'Next.js + Supabase + Tailwind', vote_count: 1029 },
      { id: 'o4', hook_id: '2', label: 'T3 Stack (create-t3-app)', vote_count: 1421 }
    ]
  },
  {
    id: '3',
    creator_id: 'u3',
    question: "Working from Bali or Lisbon this summer? 🌴",
    category: 'Lifestyle',
    type: 'visual',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    total_votes: 850,
    creator: {
        id: 'u3',
        username: 'nomad_nora',
        full_name: 'Nomad Nora',
        avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=256&h=256&auto=format&fit=crop',
        followers_count: 8500,
        following_count: 450,
        is_verified: false
    },
    options: [
        { id: 'o5', hook_id: '3', label: 'Bali', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop', vote_count: 400 },
        { id: 'o6', hook_id: '3', label: 'Lisbon', image_url: 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&auto=format&fit=crop', vote_count: 450 }
    ]
  }
];

import { DetailView } from './pages/DetailView';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('feed');
  const [category, setCategory] = React.useState<Category>('For You');
  const [showSettings, setShowSettings] = React.useState(false);
  const [selectedHookId, setSelectedHookId] = React.useState<string | null>(null);
  const categories: Category[] = ['For You', 'Trending', 'Style', 'Tech', 'Lifestyle'];

  const handleVote = (hookId: string, optionId: string) => {
    console.log('Voting for', optionId, 'in hook', hookId);
  };

  const selectedHook = MOCK_HOOKS.find(h => h.id === selectedHookId);

  const renderPage = () => {
    if (showSettings) {
        return <SettingsPage onBack={() => setShowSettings(false)} />;
    }

    if (selectedHook) {
        return <DetailView hook={selectedHook} onBack={() => setSelectedHookId(null)} />;
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
                    "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all",
                    category === cat 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <AnimatePresence mode="popLayout">
                {MOCK_HOOKS
                    .filter(h => category === 'For You' || h.category === category)
                    .map((hook, index) => (
                    <motion.div
                        key={hook.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedHookId(hook.id)}
                    >
                        <HookCard 
                            hook={hook} 
                            onVote={(optionId) => handleVote(hook.id, optionId)} 
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
          </div>
        );
      case 'create':
        return (
          <div className="flex flex-col gap-8 pb-12">
            <div className="space-y-4">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Question</span>
                <textarea 
                    className="w-full bg-surface-container-lowest border-none rounded-xl p-6 font-display text-2xl text-on-surface focus:ring-2 focus:ring-primary shadow-sm min-h-[140px] resize-none" 
                    placeholder="What's on your mind? Create a Hook..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="aspect-[4/5] bg-surface-container-high rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-all border-2 border-dashed border-outline-variant hover:border-primary group">
                    <Plus className="w-10 h-10 text-on-surface-variant group-hover:text-primary mb-2" />
                    <span className="text-xs font-bold text-on-surface-variant group-hover:text-primary">Upload Option A</span>
                </div>
                <div className="aspect-[4/5] bg-surface-container-high rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-all border-2 border-dashed border-outline-variant hover:border-secondary group">
                    <Plus className="w-10 h-10 text-on-surface-variant group-hover:text-secondary mb-2" />
                    <span className="text-xs font-bold text-on-surface-variant group-hover:text-secondary">Upload Option B</span>
                </div>
            </div>

            <button className="w-full py-5 bg-primary text-on-primary font-display text-xl rounded-full shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3">
                Post Hook
                <Plus className="w-6 h-6" />
            </button>
          </div>
        );
      case 'profile':
        return <ProfilePage onSettings={() => setShowSettings(true)} />;
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
      {!showSettings && !selectedHookId && <TopBar />}
      <main className={cn("px-4 max-w-lg mx-auto", (!showSettings && !selectedHookId) ? "pt-20" : "pt-4")}>
        {renderPage()}
      </main>
      
      {activeTab === 'feed' && !showSettings && !selectedHookId && (
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

      {!showSettings && !selectedHookId && <NavBar activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}
