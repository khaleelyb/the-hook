import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { Profile } from '../types';
import { getFollowers, getFollowing } from '../lib/supabase';
import { FollowButton } from './FollowButton';

interface FollowListProps {
  userId: string;
  currentUserId: string;
  mode: 'followers' | 'following';
  onClose: () => void;
  onViewProfile?: (userId: string) => void;
}

export const FollowList: React.FC<FollowListProps> = ({
  userId, currentUserId, mode, onClose, onViewProfile,
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
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-surface-container-lowest rounded-t-3xl overflow-hidden border-t border-outline-variant/30"
          style={{ maxHeight: '80vh' }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-outline-variant rounded-full" />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/20">
            <h2 className="font-display text-base font-bold text-on-surface capitalize">{mode}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-violet-500 animate-spin" /></div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant text-sm">
                {mode === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
              </div>
            ) : (
              <ul>
                {users.map((user) => (
                  <li key={user.id} className="flex items-center gap-3 px-5 py-3 border-b border-outline-variant/10">
                    <button onClick={() => onViewProfile?.(user.id)} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-full p-0.5 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #f43f5e)' }}>
                        <img
                          src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          alt=""
                          className="w-full h-full rounded-full object-cover border-2 border-background"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">{user.full_name}</p>
                        <p className="text-xs text-on-surface-variant truncate">@{user.username}</p>
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
