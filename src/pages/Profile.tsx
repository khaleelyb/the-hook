import React from 'react';
import { motion } from 'motion/react';
import { Settings, BadgeCheck, BarChart3, Vote, Star, Trophy, Timer, CheckCircle2 } from 'lucide-react';
import { Profile, Hook, cn } from '../types';

const MOCK_PROFILE: Profile = {
  id: 'u1',
  username: 'arivera',
  full_name: 'Alex Rivera',
  avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop',
  followers_count: 1200,
  following_count: 482,
  is_verified: true
};

const PAST_HOOKS: Hook[] = [
  { id: 'h1', creator_id: 'u1', question: 'Tech Poll', type: 'visual', category: 'Tech', created_at: '', expires_at: '', total_votes: 100 },
  { id: 'h2', creator_id: 'u1', question: 'Car Battle', type: 'visual', category: 'Lifestyle', created_at: '', expires_at: '', total_votes: 50 },
  { id: 'h3', creator_id: 'u1', question: 'Pool View', type: 'visual', category: 'Lifestyle', created_at: '', expires_at: '', total_votes: 80 },
  { id: 'h4', creator_id: 'u1', question: 'Avocado Toast', type: 'visual', category: 'Style', created_at: '', expires_at: '', total_votes: 120 },
];

export const ProfilePage: React.FC<{ onSettings: () => void }> = ({ onSettings }) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center -mx-4 px-4 h-16 bg-surface sticky top-0 z-50">
        <h1 className="font-display text-2xl text-primary font-black">Profile</h1>
        <button onClick={onSettings} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* User Info */}
      <section className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary-container">
            <img 
              src={MOCK_PROFILE.avatar_url} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full border-4 border-surface" 
            />
          </div>
          <div className="absolute bottom-1 right-1 bg-primary text-white p-1 rounded-full border-2 border-surface">
            <BadgeCheck className="w-4 h-4 fill-current" />
          </div>
        </div>
        
        <div>
          <h2 className="font-display text-2xl text-on-surface font-bold">{MOCK_PROFILE.full_name}</h2>
          <p className="text-sm font-semibold text-on-surface-variant">@{MOCK_PROFILE.username}</p>
        </div>

        <div className="flex gap-12 justify-center w-full">
          <div>
            <p className="font-display text-xl text-on-surface font-bold">1.2k</p>
            <p className="text-xs font-medium text-on-surface-variant">Followers</p>
          </div>
          <div>
            <p className="font-display text-xl text-on-surface font-bold">482</p>
            <p className="text-xs font-medium text-on-surface-variant">Following</p>
          </div>
        </div>

        <button className="w-full py-3 bg-surface-container-high text-primary font-bold rounded-full shadow-sm hover:opacity-80 transition-all active:scale-95">
          Edit Profile
        </button>
      </section>

      {/* Stats Section */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Engagement Stats</h3>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
          <div className="min-w-[140px] bg-surface shadow-sm rounded-xl p-4 border-b-4 border-primary">
            <BarChart3 className="w-5 h-5 text-primary mb-2" />
            <p className="font-display text-xl text-on-surface font-bold">42</p>
            <p className="text-[10px] font-semibold text-on-surface-variant">Total Hooks</p>
          </div>
          <div className="min-w-[140px] bg-surface shadow-sm rounded-xl p-4 border-b-4 border-secondary">
            <Vote className="w-5 h-5 text-secondary mb-2" />
            <p className="font-display text-xl text-on-surface font-bold">12.4k</p>
            <p className="text-[10px] font-semibold text-on-surface-variant">Total Votes</p>
          </div>
          <div className="min-w-[140px] bg-surface shadow-sm rounded-xl p-4 border-b-4 border-tertiary-container">
            <Star className="w-5 h-5 text-tertiary-container mb-2" />
            <p className="font-display text-xl text-on-surface font-bold">Lifestyle</p>
            <p className="text-[10px] font-semibold text-on-surface-variant">Top Category</p>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section>
        <div className="flex border-b border-outline-variant mb-4">
          <button className="flex-1 py-3 text-center text-sm font-bold border-b-2 border-primary text-primary transition-colors">
            My Hooks
          </button>
          <button className="flex-1 py-3 text-center text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors">
            Saved
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {PAST_HOOKS.map((hook, index) => (
            <motion.div 
              key={hook.id}
              whileHover={{ scale: 1.02 }}
              className="group relative aspect-square rounded-xl overflow-hidden shadow-sm bg-surface-container"
            >
              <img 
                src={`https://picsum.photos/seed/${hook.id}/400/400`} 
                alt="Hook" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full shadow-md bg-opacity-90">
                {index === 0 ? (
                  <div className="bg-tertiary-container text-white flex items-center gap-1 rounded-full px-2 py-0.5">
                    <Trophy className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Winner</span>
                  </div>
                ) : index === 1 ? (
                  <div className="bg-error text-white flex items-center gap-1 rounded-full px-2 py-0.5 animate-pulse">
                    <Timer className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-wider">02:14:10</span>
                  </div>
                ) : (
                  <div className="bg-surface/90 text-on-surface flex items-center gap-1 rounded-full px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Ended</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
