import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { Profile } from '../types';
import { getFollowers, getFollowing, isFollowing } from '../lib/supabase';
import { FollowButton } from './FollowButton';

interface FollowListProps {
  userId: string;
  currentUserId: string;
  mode: 'followers' | 'following';
  onClose: () => void;
  onViewProfile?: (userId: string) => void;
}

export const FollowList: React.FC<FollowListProps> = ({
  userId,
  currentUserId,
  mode,
  onClose,
  onViewProfile,
}) => {
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [followingIds, setFollowingIds] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [list, following] = await Promise.all([
        mode === 'followers' ? getFollowers(userId) : getFollowing(userId),
        getFollowing(currentUserId),
      ]);
      setUsers(list);
      setFollowingIds(new Set(following.map((p) => p.id)));
      setLoading(false);
    };
    load();
  }, [userId, currentUserId, mode]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-surface rounded-t-3xl overflow-hidden"
          style={{ maxHeight: '80vh' }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-outline-variant rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
            <h2 className="font-display text-lg font-bold text-on-surface capitalize">
              {mode}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant text-sm font-semibold">
                {mode === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
              </div>
            ) : (
              <ul className="divide-y divide-outline-variant/10">
                {users.map((user) => (
                  <li key={user.id} className="flex items-center gap-3 px-6 py-4">
                    <button
                      onClick={() => onViewProfile?.(user.id)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.username}
                        className="w-11 h-11 rounded-full object-cover border-2 border-primary-container flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">{user.full_name}</p>
                        <p className="text-xs text-on-surface-variant font-semibold truncate">@{user.username}</p>
                      </div>
                    </button>
                    <FollowButton
                      currentUserId={currentUserId}
                      targetUserId={user.id}
                      initialFollowing={followingIds.has(user.id)}
                      onFollowChange={(f) => {
                        setFollowingIds((prev) => {
                          const next = new Set(prev);
                          if (f) next.add(user.id); else next.delete(user.id);
                          return next;
                        });
                      }}
                      size="sm"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
