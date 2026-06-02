import React from 'react';
import { motion } from 'motion/react';
import { Settings, BadgeCheck, BarChart3, Vote, Star, Trophy, Timer, CheckCircle2, Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { Profile, Hook, cn } from '../types';
import { getProfile, fetchUserHooks, isFollowing } from '../lib/supabase';
import { FollowButton } from '../components/FollowButton';
import { FollowList } from '../components/FollowList';

interface ProfilePageProps {
  onSettings: () => void;
  session: Session;
  /** When set, shows another user's profile instead of the logged-in user's */
  viewUserId?: string;
  onBack?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onSettings,
  session,
  viewUserId,
  onBack,
}) => {
  const targetId = viewUserId ?? session.user.id;
  const isOwnProfile = targetId === session.user.id;

  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [hooks, setHooks] = React.useState<Hook[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentlyFollowing, setCurrentlyFollowing] = React.useState(false);
  const [followListMode, setFollowListMode] = React.useState<'followers' | 'following' | null>(null);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [p, h] = await Promise.all([
        getProfile(targetId),
        fetchUserHooks(targetId),
      ]);
      setProfile(p);
      setHooks(h);

      if (!isOwnProfile) {
        const f = await isFollowing(session.user.id, targetId);
        setCurrentlyFollowing(f);
      }
      setLoading(false);
    };
    load();
  }, [targetId, session, isOwnProfile]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12 text-on-surface-variant text-sm">Profile not found.</div>;
  }

  const totalVotes = hooks.reduce((sum, h) => sum + (h.total_votes ?? 0), 0);
  const topCategory = hooks.length
    ? Object.entries(
        hooks.reduce((acc, h) => {
          acc[h.category] = (acc[h.category] ?? 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : '—';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center -mx-4 px-4 h-16 bg-surface sticky top-0 z-50">
        {onBack ? (
          <button onClick={onBack} className="p-2 text-primary">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <h1 className="font-display text-2xl text-primary font-black">Profile</h1>
        )}
        {isOwnProfile && (
          <button onClick={onSettings} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* User Info */}
      <section className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary-container">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-4 border-surface"
            />
          </div>
          {profile.is_verified && (
            <div className="absolute bottom-1 right-1 bg-primary text-white p-1 rounded-full border-2 border-surface">
              <BadgeCheck className="w-4 h-4 fill-current" />
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display text-2xl text-on-surface font-bold">{profile.full_name}</h2>
          <p className="text-sm font-semibold text-on-surface-variant">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-on-surface-variant mt-2 max-w-xs">{profile.bio}</p>
          )}
        </div>

        {/* Follower / Following counts — tappable */}
        <div className="flex gap-12 justify-center w-full">
          <button
            onClick={() => setFollowListMode('followers')}
            className="flex flex-col items-center active:scale-95 transition-transform"
          >
            <p className="font-display text-xl text-on-surface font-bold">
              {profile.followers_count >= 1000
                ? `${(profile.followers_count / 1000).toFixed(1)}k`
                : profile.followers_count}
            </p>
            <p className="text-xs font-medium text-on-surface-variant">Followers</p>
          </button>
          <button
            onClick={() => setFollowListMode('following')}
            className="flex flex-col items-center active:scale-95 transition-transform"
          >
            <p className="font-display text-xl text-on-surface font-bold">{profile.following_count}</p>
            <p className="text-xs font-medium text-on-surface-variant">Following</p>
          </button>
        </div>

        {/* Follow or Edit button */}
        {isOwnProfile ? (
          <button className="w-full py-3 bg-surface-container-high text-primary font-bold rounded-full shadow-sm hover:opacity-80 transition-all active:scale-95">
            Edit Profile
          </button>
        ) : (
          <FollowButton
            currentUserId={session.user.id}
            targetUserId={targetId}
            initialFollowing={currentlyFollowing}
            onFollowChange={(f) => {
              setCurrentlyFollowing(f);
              setProfile((prev) =>
                prev
                  ? {
                      ...prev,
                      followers_count: prev.followers_count + (f ? 1 : -1),
                    }
                  : prev
              );
            }}
          />
        )}
      </section>

      {/* Stats */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Engagement Stats</h3>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
          <div className="min-w-[140px] bg-surface shadow-sm rounded-xl p-4 border-b-4 border-primary">
            <BarChart3 className="w-5 h-5 text-primary mb-2" />
            <p className="font-display text-xl text-on-surface font-bold">{hooks.length}</p>
            <p className="text-[10px] font-semibold text-on-surface-variant">Total Hooks</p>
          </div>
          <div className="min-w-[140px] bg-surface shadow-sm rounded-xl p-4 border-b-4 border-secondary">
            <Vote className="w-5 h-5 text-secondary mb-2" />
            <p className="font-display text-xl text-on-surface font-bold">
              {totalVotes >= 1000 ? `${(totalVotes / 1000).toFixed(1)}k` : totalVotes}
            </p>
            <p className="text-[10px] font-semibold text-on-surface-variant">Total Votes</p>
          </div>
          <div className="min-w-[140px] bg-surface shadow-sm rounded-xl p-4 border-b-4 border-tertiary-container">
            <Star className="w-5 h-5 text-tertiary-container mb-2" />
            <p className="font-display text-xl text-on-surface font-bold truncate">{topCategory}</p>
            <p className="text-[10px] font-semibold text-on-surface-variant">Top Category</p>
          </div>
        </div>
      </section>

      {/* Hooks grid */}
      <section>
        <div className="flex border-b border-outline-variant mb-4">
          <button className="flex-1 py-3 text-center text-sm font-bold border-b-2 border-primary text-primary">
            {isOwnProfile ? 'My Hooks' : `${profile.username}'s Hooks`}
          </button>
          {isOwnProfile && (
            <button className="flex-1 py-3 text-center text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors">
              Saved
            </button>
          )}
        </div>

        {hooks.length === 0 && (
          <p className="text-center text-on-surface-variant text-sm py-8">No hooks yet.</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {hooks.map((hook, index) => {
            const isExpiredHook = new Date(hook.expires_at) < new Date();
            const isLive = !isExpiredHook;
            const msLeft = new Date(hook.expires_at).getTime() - Date.now();
            const hLeft = Math.floor(msLeft / 3600000);
            const mLeft = Math.floor((msLeft % 3600000) / 60000);

            return (
              <motion.div
                key={hook.id}
                whileHover={{ scale: 1.02 }}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-sm bg-surface-container"
              >
                {hook.options?.[0]?.image_url ? (
                  <img
                    src={hook.options[0].image_url}
                    alt="Hook"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container-high p-3">
                    <p className="text-xs font-bold text-on-surface-variant text-center line-clamp-4">{hook.question}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute top-2 left-2">
                  {index === 0 && hooks.length > 1 ? (
                    <div className="bg-tertiary-container text-white flex items-center gap-1 rounded-full px-2 py-0.5">
                      <Trophy className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Top</span>
                    </div>
                  ) : isLive ? (
                    <div className="bg-error text-white flex items-center gap-1 rounded-full px-2 py-0.5 animate-pulse">
                      <Timer className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{hLeft}h {mLeft}m</span>
                    </div>
                  ) : (
                    <div className="bg-surface/90 text-on-surface flex items-center gap-1 rounded-full px-2 py-0.5">
                      <CheckCircle2 className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Ended</span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-[10px] font-bold truncate">{hook.total_votes} votes</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Follow list bottom sheet */}
      {followListMode && (
        <FollowList
          userId={targetId}
          currentUserId={session.user.id}
          mode={followListMode}
          onClose={() => setFollowListMode(null)}
        />
      )}
    </div>
  );
};
