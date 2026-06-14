import React from 'react';
import { motion } from 'motion/react';
import { Share2, Clock, CheckCircle2, MessageCircle, Heart, Bookmark, MoreHorizontal } from 'lucide-react';
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
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(Math.floor(Math.random() * 980) + 20);
  const [saved, setSaved] = React.useState(false);

  const isExpired = new Date(hook.expires_at) < new Date();
  const msLeft = new Date(hook.expires_at).getTime() - Date.now();
  const hLeft = Math.max(0, Math.floor(msLeft / 3600000));
  const mLeft = Math.max(0, Math.floor((msLeft % 3600000) / 60000));
  const isUrgent = msLeft < 3600000 * 2;

  return (
    <article className="rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar with gradient ring */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full p-[2px]"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #f43f5e)' }}>
              <img
                src={hook.creator?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${hook.creator?.username}`}
                alt=""
                className="w-full h-full rounded-full object-cover border-2 border-background"
              />
            </div>
            {!isExpired && isUrgent && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-secondary rounded-full border-2 border-background relative live-dot" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-on-surface leading-none">
              @{hook.creator?.username ?? 'unknown'}
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {hook.created_at ? formatDistanceToNow(new Date(hook.created_at)) + ' ago' : ''}
            </p>
          </div>

          {currentUserId && hook.creator?.id && currentUserId !== hook.creator.id && (
            <FollowButton
              currentUserId={currentUserId}
              targetUserId={hook.creator.id}
              initialFollowing={initialFollowing}
              size="sm"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Timer badge */}
          {!isExpired ? (
            <span className={cn(
              'flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide',
              isUrgent
                ? 'bg-secondary/15 text-secondary border border-secondary/30'
                : 'bg-surface-container text-on-surface-variant'
            )}>
              <Clock className="w-3 h-3" />
              {hLeft > 0 ? `${hLeft}h ${mLeft}m` : `${mLeft}m`}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
              Ended
            </span>
          )}
          <button className="text-on-surface-variant p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="px-4 pb-4">
        <h2 className="font-display text-[17px] font-bold text-on-surface leading-snug">{hook.question}</h2>
      </div>

      {/* Vote options */}
      {hook.type === 'visual' ? (
        <div className="grid grid-cols-2 gap-0.5 mx-0">
          {hook.options?.map((option, i) => {
            const pct = hook.total_votes > 0
              ? Math.round((option.vote_count / hook.total_votes) * 100)
              : 0;
            const isVoted = hook.user_voted_option_id === option.id;
            const colors = ['from-violet-600 to-purple-700', 'from-rose-600 to-pink-700'];

            return (
              <motion.div
                key={option.id}
                whileTap={!hook.has_voted ? { scale: 0.97 } : {}}
                onClick={(e) => { e.stopPropagation(); if (!hook.has_voted) onVote(option.id); }}
                className={cn(
                  'relative cursor-pointer overflow-hidden',
                  i === 0 ? 'rounded-bl-2xl' : 'rounded-br-2xl',
                  hook.has_voted && !isVoted ? 'opacity-60' : '',
                )}
                style={{ aspectRatio: '4/5' }}
              >
                {option.image_url ? (
                  <img
                    src={option.image_url}
                    alt={option.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={cn('w-full h-full flex items-center justify-center bg-gradient-to-br', colors[i])}>
                    <p className="text-white font-display font-bold text-center px-3 text-sm">{option.label}</p>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Option label & result */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className={cn(
                        'text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 inline-block',
                        `bg-gradient-to-r ${colors[i]} text-white`
                      )}>
                        {i === 0 ? 'A' : 'B'}
                      </span>
                      <p className="text-white font-bold text-sm leading-tight">{option.label}</p>
                    </div>

                    {hook.has_voted && (
                      <div className="text-right">
                        {isVoted && <CheckCircle2 className="w-5 h-5 text-white fill-white/30 mb-0.5 ml-auto" />}
                        <span className="text-white font-display font-black text-xl leading-none">{pct}%</span>
                      </div>
                    )}
                  </div>

                  {hook.has_voted && (
                    <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full vote-bar"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Voted glow border */}
                {isVoted && (
                  <div className="absolute inset-0 border-2 border-white/60 rounded-none pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 px-4 pb-2">
          {hook.options?.map((option, i) => {
            const pct = hook.total_votes > 0
              ? Math.round((option.vote_count / hook.total_votes) * 100)
              : 0;
            const isVoted = hook.user_voted_option_id === option.id;

            return (
              <motion.button
                key={option.id}
                whileTap={!hook.has_voted ? { scale: 0.98 } : {}}
                onClick={(e) => { e.stopPropagation(); if (!hook.has_voted) onVote(option.id); }}
                className={cn(
                  'w-full relative overflow-hidden rounded-xl border transition-all text-left p-4',
                  isVoted
                    ? 'border-violet-500/60 bg-violet-500/10'
                    : hook.has_voted
                    ? 'border-outline-variant/20 bg-surface-container opacity-70'
                    : 'border-outline-variant/30 bg-surface-container hover:border-violet-500/40 hover:bg-surface-container-high'
                )}
              >
                {hook.has_voted && (
                  <div
                    className={cn('absolute inset-0 opacity-10 rounded-xl', isVoted ? 'bg-violet-500' : 'bg-surface-container-high')}
                    style={{ width: `${pct}%` }}
                  />
                )}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0',
                      isVoted ? 'bg-violet-500 text-white' : 'bg-surface-container-high text-on-surface-variant'
                    )}>
                      {i === 0 ? 'A' : 'B'}
                    </span>
                    <span className={cn('text-sm font-semibold', isVoted ? 'text-violet-300' : 'text-on-surface')}>
                      {option.label}
                    </span>
                  </div>
                  {hook.has_voted && (
                    <div className="flex items-center gap-2">
                      <span className={cn('font-display font-bold text-sm', isVoted ? 'text-violet-400' : 'text-on-surface-variant')}>
                        {pct}%
                      </span>
                      {isVoted && <CheckCircle2 className="w-4 h-4 text-violet-400 fill-violet-400/20" />}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between px-4 pt-3 pb-4">
        <span className="text-xs font-semibold text-on-surface-variant">
          {hook.total_votes.toLocaleString()} votes
        </span>

        <div className="flex items-center gap-1">
          {/* Like */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              setLiked(l => !l);
              setLikeCount(c => c + (liked ? -1 : 1));
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors"
          >
            <Heart className={cn('w-5 h-5 transition-all', liked ? 'text-rose-500 fill-rose-500' : 'text-on-surface-variant')} />
            <span className={cn('text-xs font-semibold tabular-nums', liked ? 'text-rose-500' : 'text-on-surface-variant')}>
              {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
            </span>
          </motion.button>

          {/* Comment */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-on-surface-variant"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-semibold">{Math.floor(Math.random() * 80) + 5}</span>
          </motion.button>

          {/* Save */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={(e) => { e.stopPropagation(); setSaved(s => !s); }}
            className="px-3 py-2 rounded-xl text-on-surface-variant"
          >
            <Bookmark className={cn('w-5 h-5 transition-all', saved ? 'text-violet-400 fill-violet-400' : '')} />
          </motion.button>

          {/* Share */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-2 rounded-xl text-on-surface-variant"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </article>
  );
};
