import React from 'react';
import { motion } from 'motion/react';
import { Share2, Clock, CheckCircle2, MessageCircle, Heart } from 'lucide-react';
import { Hook, cn } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { FollowButton } from './FollowButton';

interface HookCardProps {
  hook: Hook;
  onVote: (optionId: string) => void;
  currentUserId?: string;
  initialFollowing?: boolean;
}

export const HookCard: React.FC<HookCardProps> = ({
  hook,
  onVote,
  currentUserId,
  initialFollowing = false,
}) => {
  const isExpired = new Date(hook.expires_at) < new Date();
  const msLeft = new Date(hook.expires_at).getTime() - Date.now();
  const hLeft = Math.max(0, Math.floor(msLeft / 3600000));
  const mLeft = Math.max(0, Math.floor((msLeft % 3600000) / 60000));
  const pctRemaining = Math.min(100, Math.max(0, (msLeft / (new Date(hook.expires_at).getTime() - new Date(hook.created_at).getTime())) * 100));

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-6 p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <img
            src={hook.creator?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${hook.creator?.username}`}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-primary-container object-cover"
          />
          <div>
            <p className="text-sm font-bold text-on-surface">@{hook.creator?.username ?? 'unknown'}</p>
            <p className="text-xs text-on-surface-variant">
              {hook.created_at ? formatDistanceToNow(new Date(hook.created_at)) + ' ago' : ''}
            </p>
          </div>
          {currentUserId && hook.creator?.id && (
            <FollowButton
              currentUserId={currentUserId}
              targetUserId={hook.creator.id}
              initialFollowing={initialFollowing}
              size="sm"
            />
          )}
        </div>

        {!isExpired && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-error font-bold flex items-center gap-1 uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              {hLeft}h {mLeft}m left
            </span>
            <div className="w-16 h-1 bg-surface-container mt-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-error transition-all"
                style={{ width: `${pctRemaining}%` }}
              />
            </div>
          </div>
        )}
        {isExpired && (
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider bg-surface-container px-2 py-1 rounded-full">
            Ended
          </span>
        )}
      </div>

      <h2 className="font-display text-xl leading-tight text-on-surface">{hook.question}</h2>

      {/* Options */}
      {hook.type === 'visual' ? (
        <div className="grid grid-cols-2 gap-3">
          {hook.options?.map((option) => {
            const pct = hook.total_votes > 0
              ? Math.round((option.vote_count / hook.total_votes) * 100)
              : 0;
            return (
              <motion.div
                key={option.id}
                whileTap={!hook.has_voted ? { scale: 0.98 } : {}}
                onClick={(e) => { e.stopPropagation(); if (!hook.has_voted) onVote(option.id); }}
                className={cn(
                  'relative group cursor-pointer aspect-[3/4] rounded-xl overflow-hidden bg-surface-variant',
                  hook.has_voted && hook.user_voted_option_id !== option.id ? 'opacity-75' : ''
                )}
              >
                {option.image_url ? (
                  <img
                    src={option.image_url}
                    alt={option.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container-high p-3">
                    <p className="text-xs font-bold text-on-surface-variant text-center">{option.label}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold uppercase tracking-wider">
                  {option.label}
                </div>
                {hook.has_voted && (
                  <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                    {hook.user_voted_option_id === option.id && (
                      <CheckCircle2 className="w-6 h-6 text-primary fill-white" />
                    )}
                    <span className="bg-black/50 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pct}%</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {hook.options?.map((option) => {
            const pct = hook.total_votes > 0
              ? Math.round((option.vote_count / hook.total_votes) * 100)
              : 0;
            return (
              <motion.button
                key={option.id}
                whileTap={!hook.has_voted ? { scale: 0.98 } : {}}
                onClick={(e) => { e.stopPropagation(); if (!hook.has_voted) onVote(option.id); }}
                className={cn(
                  'w-full flex flex-col p-4 rounded-xl border border-outline-variant/30 transition-all text-left',
                  hook.user_voted_option_id === option.id
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-low hover:bg-surface-container-high'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{option.label}</span>
                  {hook.has_voted && <span className="font-black text-sm">{pct}%</span>}
                </div>
                {hook.has_voted && (
                  <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-2">
        <span className="text-xs font-bold text-on-surface-variant">
          {hook.total_votes.toLocaleString()} votes
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-on-surface-variant hover:text-error transition-colors text-xs font-bold"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};
