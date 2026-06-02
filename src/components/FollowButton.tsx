import React from 'react';
import { motion } from 'motion/react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { cn } from '../types';
import { followUser, unfollowUser } from '../lib/supabase';

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  initialFollowing: boolean;
  onFollowChange?: (following: boolean) => void;
  size?: 'sm' | 'md';
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  currentUserId,
  targetUserId,
  initialFollowing,
  onFollowChange,
  size = 'md',
}) => {
  const [following, setFollowing] = React.useState(initialFollowing);
  const [loading, setLoading] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  // Don't show button for own profile
  if (currentUserId === targetUserId) return null;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const next = !following;
    setFollowing(next);
    onFollowChange?.(next);
    try {
      if (next) {
        await followUser(currentUserId, targetUserId);
      } else {
        await unfollowUser(currentUserId, targetUserId);
      }
    } catch {
      // revert on error
      setFollowing(!next);
      onFollowChange?.(!next);
    } finally {
      setLoading(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'flex items-center gap-1.5 font-black uppercase tracking-widest transition-all rounded-full',
        isSmall ? 'text-[10px] px-3 py-1.5' : 'text-xs px-4 py-2',
        following
          ? hovered
            ? 'bg-error-container text-error border border-error/30'
            : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
          : 'bg-primary text-on-primary shadow-lg shadow-primary/20'
      )}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', isSmall ? 'w-3 h-3' : 'w-4 h-4')} />
      ) : following ? (
        <>
          <UserCheck className={cn(isSmall ? 'w-3 h-3' : 'w-4 h-4')} />
          <span>{hovered ? 'Unfollow' : 'Following'}</span>
        </>
      ) : (
        <>
          <UserPlus className={cn(isSmall ? 'w-3 h-3' : 'w-4 h-4')} />
          <span>Follow</span>
        </>
      )}
    </motion.button>
  );
};
