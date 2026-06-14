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

  if (currentUserId === targetUserId) return null;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const next = !following;
    setFollowing(next);
    onFollowChange?.(next);
    try {
      if (next) await followUser(currentUserId, targetUserId);
      else await unfollowUser(currentUserId, targetUserId);
    } catch {
      setFollowing(!next);
      onFollowChange?.(!next);
    } finally {
      setLoading(false);
    }
  };

  const isSmall = size === 'sm';

  if (following) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          'flex items-center gap-1 font-semibold rounded-lg border border-outline-variant/40 text-on-surface-variant bg-surface-container transition-colors hover:border-secondary/40 hover:text-secondary',
          isSmall ? 'text-xs px-2.5 py-1' : 'text-sm px-4 py-2'
        )}
      >
        {loading ? <Loader2 className={cn('animate-spin', isSmall ? 'w-3 h-3' : 'w-4 h-4')} /> : (
          <UserCheck className={cn(isSmall ? 'w-3 h-3' : 'w-4 h-4')} />
        )}
        <span>Following</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'flex items-center gap-1 font-semibold rounded-lg text-white transition-all',
        'bg-gradient-to-r from-violet-600 to-fuchsia-600',
        isSmall ? 'text-xs px-2.5 py-1' : 'text-sm px-4 py-2'
      )}
    >
      {loading ? <Loader2 className={cn('animate-spin', isSmall ? 'w-3 h-3' : 'w-4 h-4')} /> : (
        <UserPlus className={cn(isSmall ? 'w-3 h-3' : 'w-4 h-4')} />
      )}
      <span>Follow</span>
    </motion.button>
  );
};
