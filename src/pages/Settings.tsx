import React from 'react';
import {
  ArrowLeft, User, Mail, Lock, Shield, Eye, Palette, Globe,
  HelpCircle, AlertTriangle, LogOut, Loader2, ChevronRight, Zap,
  Sun, Moon, Monitor, Check, Camera, Save, X, EyeOff, KeyRound
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { cn } from '../types';
import { getUserSettings, saveUserSettings, signOut, getProfile, updateProfile, uploadImage } from '../lib/supabase';
import type { UserSettings, Profile } from '../types';

interface SettingsPageProps {
  onBack: () => void;
  session: Session;
}

type Panel = null | 'appearance' | 'profile' | 'password';

// ── Appearance Panel ───────────────────────────────────────────────
const AppearancePanel: React.FC<{
  current: UserSettings['theme'];
  onSave: (theme: UserSettings['theme']) => void;
  onBack: () => void;
}> = ({ current, onSave, onBack }) => {
  const [selected, setSelected] = React.useState<UserSettings['theme']>(current);

  const themes: { id: UserSettings['theme']; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'dark',   label: 'Dark',   desc: 'Easy on the eyes at night',  icon: <Moon className="w-5 h-5" /> },
    { id: 'light',  label: 'Light',  desc: 'Clean and bright',            icon: <Sun className="w-5 h-5" /> },
    { id: 'system', label: 'System', desc: 'Follows your device setting', icon: <Monitor className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between px-4 h-14 sticky top-0 z-50"
        style={{ background: 'linear-gradient(to bottom, #f5f5f7 70%, transparent)' }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container text-on-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-on-surface">Appearance</span>
        <button
          onClick={() => onSave(selected)}
          className="px-4 py-1.5 rounded-full text-white text-xs font-semibold"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}
        >
          Save
        </button>
      </div>

      <div className="px-4 pt-4 space-y-3">
        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest px-1 mb-3">Theme</p>
        {themes.map(({ id, label, desc, icon }) => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
              selected === id
                ? 'border-violet-500 bg-violet-500/10'
                : 'border-outline-variant/20 bg-surface-container'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              selected === id ? 'bg-violet-500 text-white' : 'bg-surface-container-high text-on-surface-variant'
            )}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface">{label}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
            </div>
            {selected === id && (
              <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </button>
        ))}

        <div className="mt-6">
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest px-1 mb-3">Display</p>
          <div className="bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface-container-high flex items-center justify-center">
                  <Eye className="w-4 h-4 text-on-surface-variant" />
                </div>
                <span className="text-sm font-medium text-on-surface">Show vote counts</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-violet-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Edit Profile Panel ─────────────────────────────────────────────
const EditProfilePanel: React.FC<{
  session: Session;
  onBack: () => void;
  onSaved: () => void;
}> = ({ session, onBack, onSaved }) => {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [fullName, setFullName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    getProfile(session.user.id).then((p) => {
      if (p) {
        setProfile(p);
        setFullName(p.full_name ?? '');
        setUsername(p.username ?? '');
        setBio(p.bio ?? '');
        setWebsite(p.website ?? '');
      }
      setLoading(false);
    });
  }, [session.user.id]);

  const handleSave = async () => {
    if (!fullName.trim() || !username.trim()) { setError('Name and username are required.'); return; }
    setSaving(true);
    setError(null);
    try {
      let avatar_url = profile?.avatar_url;
      if (avatarFile) {
        avatar_url = await uploadImage(avatarFile, `avatars/${session.user.id}-${Date.now()}`);
      }
      await updateProfile(session.user.id, {
        full_name: fullName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        website: website.trim(),
        avatar_url,
      });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onSaved(); }, 800);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between px-4 h-14 sticky top-0 z-50"
        style={{ background: 'linear-gradient(to bottom, #f5f5f7 70%, transparent)' }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container text-on-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-on-surface">Edit Profile</span>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-semibold disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : success ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {success ? 'Saved!' : 'Save'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-violet-500 animate-spin" /></div>
      ) : (
        <div className="px-4 pt-4 space-y-5 pb-12">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full p-0.5" style={{ background: 'linear-gradient(135deg, #7c3aed, #f43f5e)' }}>
                <img
                  src={avatarPreview ?? profile?.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`}
                  alt=""
                  className="w-full h-full rounded-full object-cover border-2 border-background"
                />
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}>
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            </div>
            <p className="text-xs text-on-surface-variant">Tap to change photo</p>
          </div>

          {[
            { label: 'Display name', value: fullName, set: setFullName, placeholder: 'Your name', max: 50, type: 'text' },
            { label: 'Username', value: username, set: setUsername, placeholder: 'username', max: 30, type: 'text' },
            { label: 'Website', value: website, set: setWebsite, placeholder: 'https://yoursite.com', max: 200, type: 'url' },
          ].map(({ label, value, set, placeholder, max, type }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                maxLength={max}
                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder-on-surface-variant/50"
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about yourself…"
              maxLength={150}
              rows={3}
              className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none placeholder-on-surface-variant/50"
            />
            <p className="text-right text-[10px] text-on-surface-variant">{bio.length}/150</p>
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};

// ── Change Password Panel ──────────────────────────────────────────
const ChangePasswordPanel: React.FC<{
  session: Session;
  onBack: () => void;
}> = ({ session, onBack }) => {
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNext, setShowNext] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const strength = (() => {
    if (!next) return 0;
    let s = 0;
    if (next.length >= 8) s++;
    if (/[A-Z]/.test(next)) s++;
    if (/[0-9]/.test(next)) s++;
    if (/[^A-Za-z0-9]/.test(next)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'][strength];

  const handleSave = async () => {
    setError(null);
    if (!current || !next || !confirm) { setError('Please fill in all fields.'); return; }
    if (next.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (next !== confirm) { setError('Passwords do not match.'); return; }

    setSaving(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: current,
      });
      if (signInErr) throw new Error('Current password is incorrect.');

      const { error: updateErr } = await supabase.auth.updateUser({ password: next });
      if (updateErr) throw updateErr;

      setSuccess(true);
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err: any) {
      setError(err.message ?? 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between px-4 h-14 sticky top-0 z-50"
        style={{ background: 'linear-gradient(to bottom, #f5f5f7 70%, transparent)' }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container text-on-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-on-surface">Change Password</span>
        <div className="w-9" />
      </div>

      <div className="px-4 pt-6 space-y-5 pb-12">
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}>
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-on-surface-variant text-center">
            Choose a strong password to keep your account secure.
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-400 font-medium">Password updated successfully!</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Current password</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl px-4 pr-12 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder-on-surface-variant/50"
            />
            <button type="button" onClick={() => setShowCurrent(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">New password</label>
          <div className="relative">
            <input
              type={showNext ? 'text' : 'password'}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl px-4 pr-12 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder-on-surface-variant/50"
            />
            <button type="button" onClick={() => setShowNext(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {next.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-300',
                    i <= strength ? strengthColor : 'bg-surface-container-high'
                  )} />
                ))}
              </div>
              <p className={cn('text-[10px] font-semibold', ['', 'text-rose-400', 'text-amber-400', 'text-yellow-400', 'text-emerald-400'][strength])}>
                {strengthLabel}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Confirm new password</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Repeat new password"
              className={cn(
                'w-full bg-surface-container border text-on-surface rounded-xl px-4 pr-12 py-3 text-sm focus:outline-none transition-colors placeholder-on-surface-variant/50',
                confirm && next && confirm !== next
                  ? 'border-rose-500/50 focus:border-rose-500'
                  : confirm && next && confirm === next
                  ? 'border-emerald-500/50 focus:border-emerald-500'
                  : 'border-outline-variant/30 focus:border-violet-500'
              )}
            />
            <button type="button" onClick={() => setShowConfirm(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {confirm && next && confirm === next && (
              <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <X className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-rose-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </div>
  );
};

// ── Main Settings Page ─────────────────────────────────────────────
export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, session }) => {
  const [settings, setSettings] = React.useState<UserSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const [panel, setPanel] = React.useState<Panel>(null);

  React.useEffect(() => {
    getUserSettings(session.user.id).then(setSettings).finally(() => setLoading(false));
  }, [session]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try { await signOut(); } catch { setSigningOut(false); }
  };

  const handleThemeSave = async (theme: UserSettings['theme']) => {
    if (!settings) return;
    const updated = { ...settings, theme };
    setSettings(updated);
    setSaving(true);
    try { await saveUserSettings(session.user.id, updated); }
    catch { /* revert silently */ }
    finally { setSaving(false); setPanel(null); }
  };

  const meta = session.user.user_metadata;
  const displayName = meta?.full_name || meta?.username || session.user.email?.split('@')[0] || 'User';
  const username = meta?.username || session.user.email?.split('@')[0];

  if (panel === 'appearance') {
    return <AppearancePanel current={settings?.theme ?? 'dark'} onSave={handleThemeSave} onBack={() => setPanel(null)} />;
  }
  if (panel === 'profile') {
    return <EditProfilePanel session={session} onBack={() => setPanel(null)} onSaved={() => setPanel(null)} />;
  }
  if (panel === 'password') {
    return <ChangePasswordPanel session={session} onBack={() => setPanel(null)} />;
  }

  const sections = [
    {
      title: 'Account',
      items: [
        { label: 'Edit Profile',    icon: User,  action: () => setPanel('profile') as void },
        { label: 'Change Password', icon: Lock,  action: () => setPanel('password') as void },
        { label: 'Email',           icon: Mail,  meta: session.user.email, action: null },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Appearance', icon: Palette, meta: settings?.theme ?? '—', action: () => setPanel('appearance') as void },
        { label: 'Language',   icon: Globe,   meta: settings?.language ?? 'English', action: null },
        { label: 'Privacy',    icon: Shield,  meta: null, action: null },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help center',     icon: HelpCircle,    danger: false, action: null },
        { label: 'Report an issue', icon: AlertTriangle, danger: true,  action: null },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-12">
      <div className="flex items-center justify-between px-4 h-14 sticky top-0 z-50"
        style={{ background: 'linear-gradient(to bottom, #f5f5f7 70%, transparent)' }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container text-on-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-on-surface">Settings</span>
        <div className="w-9">
          {saving && <Loader2 className="w-4 h-4 text-violet-500 animate-spin mx-auto" />}
        </div>
      </div>

      <div className="px-4 pt-2 space-y-6">
        <button
          onClick={() => setPanel('profile')}
          className="w-full bg-surface-container rounded-2xl p-4 flex items-center gap-4 border border-outline-variant/20 text-left"
        >
          <div className="w-14 h-14 rounded-full p-0.5 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #f43f5e)' }}>
            <img
              src={meta?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
              alt=""
              className="w-full h-full rounded-full object-cover border-2 border-background"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-on-surface truncate">{displayName}</p>
            <p className="text-sm text-on-surface-variant truncate">@{username}</p>
            <p className="text-xs text-violet-400 mt-0.5">Edit profile →</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
        </button>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-violet-500 animate-spin" /></div>
        ) : (
          <>
            {sections.map((section) => (
              <div key={section.title}>
                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest px-1 mb-2">{section.title}</p>
                <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/20">
                  {section.items.map((item, i) => {
                    const isDanger = (item as any).danger;
                    const hasAction = !!(item as any).action;
                    return (
                      <React.Fragment key={item.label}>
                        <button
                          className="w-full flex items-center justify-between p-4 text-left disabled:cursor-default"
                          onClick={(item as any).action ?? undefined}
                          disabled={!(item as any).action}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-8 h-8 rounded-xl flex items-center justify-center',
                              isDanger ? 'bg-rose-500/15' : 'bg-surface-container-high'
                            )}>
                              <item.icon className={cn('w-4 h-4', isDanger ? 'text-rose-400' : 'text-on-surface-variant')} />
                            </div>
                            <span className={cn('text-sm font-medium', isDanger ? 'text-rose-400' : 'text-on-surface')}>{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {(item as any).meta && (
                              <span className="text-xs text-on-surface-variant truncate max-w-[110px] capitalize">{(item as any).meta}</span>
                            )}
                            {hasAction && <ChevronRight className="w-4 h-4 text-on-surface-variant/50 flex-shrink-0" />}
                          </div>
                        </button>
                        {i < section.items.length - 1 && <div className="h-px bg-outline-variant/15 ml-[60px]" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all bg-rose-500/10 text-rose-400 border border-rose-500/20 disabled:opacity-60"
            >
              {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              {signingOut ? 'Signing out…' : 'Log out'}
            </button>

            <p className="text-center text-[11px] text-on-surface-variant/40 font-medium">The Hook v1.0.0</p>
          </>
        )}
      </div>
    </div>
  );
};
