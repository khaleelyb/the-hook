import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, BadgeCheck, BarChart3, Vote, Star, Trophy,
  Timer, CheckCircle2, Loader2, Camera, Link, Edit3,
  Grid3X3, Bookmark, ArrowLeft, X, Save
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { Profile, Hook, cn } from '../types';
import { getProfile, fetchUserHooks, isFollowing, updateProfile, uploadImage } from '../lib/supabase';
import { FollowButton } from '../components/FollowButton';
import { FollowList } from '../components/FollowList';

interface ProfilePageProps {
  onSettings: () => void;
  session: Session;
  viewUserId?: string;
  onBack?: () => void;
}

// ── Edit Profile Modal ──────────────────────────────────────────────
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

  const handleAvatarChange = (file: File | null) => {
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!fullName.trim() || !username.trim()) {
      setError('Name and username are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let avatar_url = profile.avatar_url;
      if (avatarFile) {
        avatar_url = await uploadImage(avatarFile, `avatars/${userId}-${Date.now()}`);
      }
      const updated = await updateProfile(userId, {
        full_name: fullName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        website: website.trim(),
        avatar_url,
      });
      onSave(updated);
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-surface rounded-t-3xl overflow-hidden"
        style={{ maxHeight: '92vh' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-outline-variant rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/20">
          <button onClick={onClose} className="p-2 text-on-surface-variant">
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-display text-lg font-bold text-on-surface">Edit Profile</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-black uppercase tracking-widest disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-6 space-y-6" style={{ maxHeight: 'calc(92vh - 90px)' }}>
          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <img
                src={avatarPreview ?? profile.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary-container"
              />
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <p className="text-xs text-on-surface-variant font-semibold">Tap camera to change photo</p>
          </div>

          {/* Text fields */}
          {[
            { label: 'Full Name', value: fullName, set: setFullName, placeholder: 'Your display name', max: 50, type: 'text' },
            { label: 'Username', value: username, set: setUsername, placeholder: 'username', max: 30, type: 'text' },
          ].map(({ label, value, set, placeholder, max, type }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                maxLength={max}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-medium border-none focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about yourself…"
              maxLength={150}
              rows={3}
              className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-medium border-none focus:ring-2 focus:ring-primary outline-none resize-none"
            />
            <p className="text-right text-[10px] text-on-surface-variant">{bio.length}/150</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Link className="w-3 h-3" /> Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
              className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-medium border-none focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {error && (
            <p className="text-xs text-error font-semibold bg-error-container rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Profile Page ───────────────────────────────────────────────
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

  const totalVotes = hooks.reduce((s, h) => s + (h.total_votes ?? 0), 0);
  const liveHooks = hooks.filter((h) => new Date(h.expires_at) > new Date()).length;
  const topCat = hooks.length
    ? Object.entries(
        hooks.reduce((a, h) => { a[h.category] = (a[h.category] ?? 0) + 1; return a; }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    : '—';

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="flex justify-between items-center h-14 sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-outline-variant/10 -mx-4 px-4">
        {onBack ? (
          <button onClick={onBack} className="p-2 text-primary active:scale-90 transition-transform">
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <h1 className="font-display text-xl text-primary font-black italic tracking-tight">Profile</h1>
        )}
        <div className="flex items-center gap-1">
          {isOwnProfile && (
            <>
              <button onClick={() => setShowEdit(true)} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <Edit3 className="w-5 h-5" />
              </button>
              <button onClick={onSettings} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cover + Avatar */}
      <div className="relative -mx-4 mb-14">
        <div className="h-36 bg-gradient-to-br from-primary/40 via-primary-container to-secondary-container relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-primary/10" />
          <div className="absolute -bottom-4 left-8 w-24 h-24 rounded-full bg-secondary/10" />
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-10 left-5">
          <div className="relative w-20 h-20 rounded-full ring-4 ring-surface overflow-hidden bg-primary-container shadow-xl">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          </div>
          {profile.is_verified && (
            <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full ring-2 ring-surface">
              <BadgeCheck className="w-3.5 h-3.5 fill-current" />
            </div>
          )}
        </div>

        {/* CTA top-right */}
        <div className="absolute bottom-[-40px] right-4">
          {isOwnProfile ? (
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-outline-variant bg-surface text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
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
        </div>
      </div>

      {/* Identity */}
      <div className="px-1 mb-4 space-y-0.5">
        <h2 className="font-display text-2xl text-on-surface font-black leading-tight">{profile.full_name}</h2>
        <p className="text-sm font-semibold text-on-surface-variant">@{profile.username}</p>
        {profile.bio && <p className="text-sm text-on-surface leading-relaxed pt-1.5">{profile.bio}</p>}
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary pt-1"
          >
            <Link className="w-3 h-3" />
            {profile.website.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>

      {/* Follow counts */}
      <div className="flex gap-6 px-1 mb-6">
        {[
          { label: 'Followers', value: profile.followers_count, action: () => setFollowListMode('followers') },
          { label: 'Following', value: profile.following_count, action: () => setFollowListMode('following') },
          { label: 'Hooks', value: hooks.length, action: undefined },
        ].map(({ label, value, action }) => (
          <button
            key={label}
            onClick={action}
            disabled={!action}
            className="flex flex-col items-start disabled:cursor-default active:scale-95 transition-transform"
          >
            <span className="font-display text-xl text-on-surface font-black">
              {typeof value === 'number' && value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            </span>
            <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {[
          { Icon: Vote, val: totalVotes >= 1000 ? `${(totalVotes / 1000).toFixed(1)}k` : String(totalVotes), lbl: 'Total Votes', border: 'border-primary', color: 'text-primary' },
          { Icon: BarChart3, val: String(liveHooks), lbl: 'Live Now', border: 'border-error', color: 'text-error' },
          { Icon: Star, val: topCat, lbl: 'Top Category', border: 'border-secondary', color: 'text-secondary' },
        ].map(({ Icon, val, lbl, border, color }) => (
          <div key={lbl} className={cn('bg-surface-container-lowest rounded-2xl p-3 border-b-[3px] shadow-sm', border)}>
            <Icon className={cn('w-4 h-4 mb-1.5', color)} />
            <p className="font-display text-base text-on-surface font-black leading-none truncate">{val}</p>
            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5 leading-tight">{lbl}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 mb-4">
        {([['hooks', Grid3X3, 'Hooks'], ...(isOwnProfile ? [['saved', Bookmark, 'Saved']] : [])] as [string, any, string][]).map(([id, Icon, label]) => (
          <button
            key={id}
            onClick={() => setGridTab(id as any)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all',
              gridTab === id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Grid content */}
      <AnimatePresence mode="wait">
        {gridTab === 'hooks' && (
          <motion.div key="hooks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {hooks.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-on-surface-variant">
                <BarChart3 className="w-10 h-10 opacity-25" />
                <p className="text-sm font-semibold">No hooks yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {hooks.map((hook, i) => {
                  const expired = new Date(hook.expires_at) < new Date();
                  const msLeft = new Date(hook.expires_at).getTime() - Date.now();
                  const hLeft = Math.max(0, Math.floor(msLeft / 3600000));
                  const mLeft = Math.max(0, Math.floor((msLeft % 3600000) / 60000));

                  return (
                    <motion.div
                      key={hook.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container cursor-pointer shadow-sm"
                    >
                      {hook.options?.[0]?.image_url ? (
                        <img src={hook.options[0].image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-container to-surface-container-high p-4">
                          <p className="text-xs font-bold text-on-surface text-center line-clamp-4 leading-snug">{hook.question}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                      <div className="absolute top-2 left-2">
                        {i === 0 && hooks.length > 1 ? (
                          <span className="bg-amber-500 text-white flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black">
                            <Trophy className="w-3 h-3 fill-current" /> Top
                          </span>
                        ) : !expired ? (
                          <span className="bg-error text-white flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black animate-pulse">
                            <Timer className="w-3 h-3" /> {hLeft}h {mLeft}m
                          </span>
                        ) : (
                          <span className="bg-black/40 text-white flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <p className="text-white text-[10px] font-black">
                          {hook.total_votes >= 1000 ? `${(hook.total_votes / 1000).toFixed(1)}k` : hook.total_votes} votes
                        </p>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {hook.category}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {gridTab === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center py-16 gap-3 text-on-surface-variant"
          >
            <Bookmark className="w-10 h-10 opacity-25" />
            <p className="text-sm font-semibold">Saved hooks coming soon.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Follow list sheet */}
      {followListMode && (
        <FollowList
          userId={targetId}
          currentUserId={session.user.id}
          mode={followListMode}
          onClose={() => setFollowListMode(null)}
        />
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {showEdit && (
          <EditProfileModal
            profile={profile}
            userId={session.user.id}
            onClose={() => setShowEdit(false)}
            onSave={(updated) => setProfile(updated)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
