import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, BadgeCheck, BarChart3, Vote, Star, Trophy,
  Timer, CheckCircle2, Loader2, Camera, Link, Edit3,
  Grid3X3, Bookmark, ArrowLeft, X, Save, Zap
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { Profile, Hook, cn } from '../types';
import { getProfile, fetchUserHooks, fetchSavedHooks, isFollowing, updateProfile, uploadImage } from '../lib/supabase';
import { FollowButton } from '../components/FollowButton';
import { FollowList } from '../components/FollowList';

interface ProfilePageProps {
  onSettings: () => void;
  session: Session;
  viewUserId?: string;
  onBack?: () => void;
}

interface EditModalProps {
  profile: Profile;
  onClose: () => void;
  onSave: (updated: Profile) => void;
  userId: string;
}

const EditProfileModal: React.FC<EditModalProps> = ({ profile, onClose, onSave, userId }) => {
  const [fullName, setFullName] = React.useState(profile.full_name ?? '');
  const [username, setUsername] = React.useState(profile.username ?? '');
  const [bio, setBio] = React.useState(profile.bio ?? '');
  const [website, setWebsite] = React.useState(profile.website ?? '');
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = async () => {
    if (!fullName.trim() || !username.trim()) { setError('Name and username required.'); return; }
    setSaving(true);
    setError(null);
    try {
      let avatar_url = profile.avatar_url;
      if (avatarFile) {
        avatar_url = await uploadImage(avatarFile, `avatars/${userId}-${Date.now()}`);
      }
      const updated = await updateProfile(userId, { full_name: fullName.trim(), username: username.trim(), bio: bio.trim(), website: website.trim(), avatar_url });
      onSave(updated);
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
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
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-surface-container-lowest rounded-t-3xl overflow-hidden border-t border-outline-variant/30"
        style={{ maxHeight: '92vh' }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-outline-variant rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/20">
          <button onClick={onClose} className="p-2 text-on-surface-variant"><X className="w-5 h-5" /></button>
          <h2 className="font-display text-base font-bold text-on-surface">Edit Profile</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-6 space-y-5" style={{ maxHeight: 'calc(92vh - 90px)' }}>
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full p-0.5" style={{ background: 'linear-gradient(135deg, #7c3aed, #f43f5e)' }}>
                <img
                  src={avatarPreview ?? profile.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                  alt=""
                  className="w-full h-full rounded-full object-cover border-2 border-background"
                />
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}>
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            </div>
          </div>

          {[
            { label: 'Display name', value: fullName, set: setFullName, placeholder: 'Your name', max: 50 },
            { label: 'Username', value: username, set: setUsername, placeholder: 'username', max: 30 },
          ].map(({ label, value, set, placeholder, max }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{label}</label>
              <input
                type="text" value={value} onChange={(e) => set(e.target.value)}
                placeholder={placeholder} maxLength={max}
                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Bio</label>
            <textarea
              value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about yourself…" maxLength={150} rows={3}
              className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
            <p className="text-right text-[10px] text-on-surface-variant">{bio.length}/150</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1"><Link className="w-3 h-3" /> Website</label>
            <input
              type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
              className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{error}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Mini Hook card for grid ────────────────────────────────────────
const HookGridItem: React.FC<{ hook: Hook; index: number }> = ({ hook, index }) => {
  const expired = new Date(hook.expires_at) < new Date();
  const msLeft = new Date(hook.expires_at).getTime() - Date.now();
  const hLeft = Math.max(0, Math.floor(msLeft / 3600000));

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className="relative aspect-square overflow-hidden cursor-pointer bg-surface-container"
    >
      {hook.options?.[0]?.image_url ? (
        <img src={hook.options[0].image_url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2" style={{ background: 'linear-gradient(135deg, #2d1b69, #1c0a2e)' }}>
          <p className="text-[10px] font-semibold text-violet-300 text-center line-clamp-3 leading-tight">{hook.question}</p>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute top-1.5 left-1.5">
        {index === 0 ? (
          <span className="bg-amber-500 text-white rounded-md px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-0.5">
            <Trophy className="w-2.5 h-2.5" /> Top
          </span>
        ) : !expired ? (
          <span className="bg-rose-600 text-white rounded-md px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-0.5">
            <Timer className="w-2.5 h-2.5" /> {hLeft}h
          </span>
        ) : (
          <span className="bg-black/50 text-white/70 rounded-md px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" /> Done
          </span>
        )}
      </div>
      <div className="absolute bottom-1.5 left-1.5">
        <span className="text-white text-[9px] font-bold">
          {hook.total_votes >= 1000 ? `${(hook.total_votes / 1000).toFixed(1)}k` : hook.total_votes}
        </span>
      </div>
    </motion.div>
  );
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ onSettings, session, viewUserId, onBack }) => {
  const targetId = viewUserId ?? session.user.id;
  const isOwnProfile = targetId === session.user.id;

  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [hooks, setHooks] = React.useState<Hook[]>([]);
  const [savedHooks, setSavedHooks] = React.useState<Hook[]>([]);
  const [loadingSaved, setLoadingSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [following, setFollowing] = React.useState(false);
  const [followListMode, setFollowListMode] = React.useState<'followers' | 'following' | null>(null);
  const [showEdit, setShowEdit] = React.useState(false);
  const [gridTab, setGridTab] = React.useState<'hooks' | 'saved'>('hooks');

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      getProfile(targetId),
      fetchUserHooks(targetId),
      !isOwnProfile ? isFollowing(session.user.id, targetId) : Promise.resolve(false),
    ]).then(([p, h, f]) => {
      setProfile(p as Profile);
      setHooks(h as Hook[]);
      setFollowing(f as boolean);
      setLoading(false);
    });
  }, [targetId, session.user.id, isOwnProfile]);

  // Lazy-load saved hooks when tab is selected
  React.useEffect(() => {
    if (gridTab !== 'saved' || !isOwnProfile) return;
    setLoadingSaved(true);
    fetchSavedHooks(session.user.id)
      .then(setSavedHooks)
      .finally(() => setLoadingSaved(false));
  }, [gridTab, isOwnProfile, session.user.id]);

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-violet-500 animate-spin" /></div>;
  }
  if (!profile) {
    return <div className="text-center py-12 text-on-surface-variant text-sm">Profile not found.</div>;
  }

  const totalVotes = hooks.reduce((s, h) => s + (h.total_votes ?? 0), 0);
  const liveHooks = hooks.filter((h) => new Date(h.expires_at) > new Date()).length;
  const topCat = hooks.length
    ? Object.entries(hooks.reduce((a, h) => { a[h.category] = (a[h.category] ?? 0) + 1; return a; }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    : '—';

  return (
    <div className="pb-12 min-h-screen">
      {/* Header bar */}
      <div className="flex justify-between items-center h-14 sticky top-0 z-50 -mx-4 px-4"
        style={{ background: 'linear-gradient(to bottom, #0a0a0b 70%, transparent)' }}>
        {onBack ? (
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container text-on-surface">
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-on-surface">Profile</span>
          </div>
        )}
        {isOwnProfile && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEdit(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={onSettings} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Profile hero */}
      <div className="px-4 pt-2 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-0.5" style={{ background: 'linear-gradient(135deg, #7c3aed, #f43f5e)' }}>
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                alt=""
                className="w-full h-full rounded-full object-cover border-2 border-background"
              />
            </div>
            {profile.is_verified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-background"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}>
                <BadgeCheck className="w-4 h-4 text-white fill-white" />
              </div>
            )}
          </div>

          {!isOwnProfile && (
            <FollowButton
              currentUserId={session.user.id}
              targetUserId={targetId}
              initialFollowing={following}
              onFollowChange={(f) => {
                setFollowing(f);
                setProfile((p) => p ? { ...p, followers_count: p.followers_count + (f ? 1 : -1) } : p);
              }}
            />
          )}

          {isOwnProfile && (
            <button
              onClick={() => setShowEdit(true)}
              className="px-5 py-2 rounded-xl border border-outline-variant/40 text-sm font-semibold text-on-surface"
            >
              Edit profile
            </button>
          )}
        </div>

        {/* Identity */}
        <div className="mb-4">
          <h2 className="font-display text-xl font-bold text-on-surface leading-tight">{profile.full_name}</h2>
          <p className="text-sm text-on-surface-variant">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-on-surface mt-2 leading-relaxed">{profile.bio}</p>}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-violet-400 mt-1.5">
              <Link className="w-3 h-3" />
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-6">
          <button onClick={() => setFollowListMode('followers')} className="flex flex-col items-center">
            <span className="font-display text-lg font-bold text-on-surface leading-none">
              {profile.followers_count >= 1000 ? `${(profile.followers_count / 1000).toFixed(1)}k` : profile.followers_count}
            </span>
            <span className="text-xs text-on-surface-variant mt-0.5">Followers</span>
          </button>
          <button onClick={() => setFollowListMode('following')} className="flex flex-col items-center">
            <span className="font-display text-lg font-bold text-on-surface leading-none">
              {profile.following_count >= 1000 ? `${(profile.following_count / 1000).toFixed(1)}k` : profile.following_count}
            </span>
            <span className="text-xs text-on-surface-variant mt-0.5">Following</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="font-display text-lg font-bold text-on-surface leading-none">{hooks.length}</span>
            <span className="text-xs text-on-surface-variant mt-0.5">Hooks</span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2.5 px-4 mb-1">
        {[
          { icon: <Vote className="w-4 h-4 text-violet-400" />, val: totalVotes >= 1000 ? `${(totalVotes / 1000).toFixed(1)}k` : String(totalVotes), lbl: 'Votes' },
          { icon: <div className="relative w-4 h-4"><span className="absolute inset-0 flex items-center justify-center text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-500 absolute live-dot" /></span></div>, val: String(liveHooks), lbl: 'Live' },
          { icon: <Star className="w-4 h-4 text-amber-400" />, val: topCat, lbl: 'Top' },
        ].map(({ icon, val, lbl }) => (
          <div key={lbl} className="bg-surface-container rounded-2xl p-3 text-center">
            <div className="flex justify-center mb-1.5">{icon}</div>
            <p className="font-display text-sm font-bold text-on-surface truncate">{val}</p>
            <p className="text-[10px] text-on-surface-variant mt-0.5">{lbl}</p>
          </div>
        ))}
      </div>

      {/* Grid tabs */}
      <div className="flex border-b border-outline-variant/20 mt-4">
        {([['hooks', Grid3X3], ...(isOwnProfile ? [['saved', Bookmark]] : [])] as [string, any][]).map(([id, Icon]) => (
          <button
            key={id}
            onClick={() => setGridTab(id as any)}
            className={cn(
              'flex-1 flex items-center justify-center py-3 transition-all border-b-2',
              gridTab === id ? 'border-violet-500 text-violet-400' : 'border-transparent text-on-surface-variant'
            )}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Grid content */}
      <AnimatePresence mode="wait">
        {gridTab === 'hooks' && (
          <motion.div key="hooks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-0.5 pt-0.5">
            {hooks.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-on-surface-variant">
                <BarChart3 className="w-10 h-10 opacity-20" />
                <p className="text-sm font-semibold text-on-surface">No hooks yet</p>
                <p className="text-xs text-on-surface-variant">
                  {isOwnProfile ? 'Create your first hook to get the debate started.' : 'This user hasn\'t posted any hooks yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5">
                {hooks.map((hook, i) => (
                  <HookGridItem key={hook.id} hook={hook} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {gridTab === 'saved' && isOwnProfile && (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-0.5 pt-0.5">
            {loadingSaved ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-7 h-7 text-violet-500 animate-spin" />
              </div>
            ) : savedHooks.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
                  <Bookmark className="w-8 h-8 text-on-surface-variant opacity-30" />
                </div>
                <p className="text-sm font-semibold text-on-surface">Nothing saved yet</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Tap the bookmark icon on any hook to save it here for later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5">
                {savedHooks.map((hook, i) => (
                  <HookGridItem key={hook.id} hook={hook} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {followListMode && (
        <FollowList userId={targetId} currentUserId={session.user.id} mode={followListMode} onClose={() => setFollowListMode(null)} />
      )}

      <AnimatePresence>
        {showEdit && (
          <EditProfileModal profile={profile} userId={session.user.id} onClose={() => setShowEdit(false)} onSave={(u) => setProfile(u)} />
        )}
      </AnimatePresence>
    </div>
  );
};
