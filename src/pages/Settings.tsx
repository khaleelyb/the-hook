import React from 'react';
import {
  ArrowLeft, User, Mail, Shield, Bell, Send, Eye, Palette, Globe, HelpCircle, AlertTriangle, LogOut, Loader2, ChevronRight, Zap
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { cn } from '../types';
import { getUserSettings, saveUserSettings, signOut } from '../lib/supabase';
import type { UserSettings } from '../types';

interface SettingsPageProps {
  onBack: () => void;
  session: Session;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, session }) => {
  const [settings, setSettings] = React.useState<UserSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  React.useEffect(() => {
    getUserSettings(session.user.id).then(setSettings).finally(() => setLoading(false));
  }, [session]);

  const handleToggle = async (key: keyof UserSettings) => {
    if (!settings) return;
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    setSaving(true);
    try { await saveUserSettings(session.user.id, updated); }
    catch { setSettings(settings); }
    finally { setSaving(false); }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try { await signOut(); } catch { setSigningOut(false); }
  };

  const meta = session.user.user_metadata;
  const displayName = meta?.full_name || meta?.username || session.user.email?.split('@')[0] || 'User';
  const username = meta?.username || session.user.email?.split('@')[0];

  const sections = [
    {
      title: 'Account',
      items: [
        { label: 'Profile', icon: User },
        { label: 'Email', icon: Mail, meta: session.user.email },
        { label: 'Security', icon: Shield },
      ]
    },
    {
      title: 'Notifications',
      items: [
        { label: 'Push notifications', icon: Bell, toggle: 'push_notifications' as const },
        { label: 'Email alerts', icon: Send, toggle: 'email_alerts' as const },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Appearance', icon: Palette, meta: settings?.theme ?? 'light' },
        { label: 'Language', icon: Globe, meta: settings?.language ?? 'English' },
        { label: 'Show vote counts', icon: Eye, toggle: 'show_vote_counts' as const },
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help center', icon: HelpCircle },
        { label: 'Report an issue', icon: AlertTriangle, danger: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 sticky top-0 z-50"
        style={{ background: 'linear-gradient(to bottom, #0a0a0b 70%, transparent)' }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container text-on-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-on-surface">Settings</span>
        <div className="w-9">
          {saving && <Loader2 className="w-4 h-4 text-violet-500 animate-spin mx-auto" />}
        </div>
      </div>

      <div className="px-4 pt-2 space-y-6">
        {/* Profile card */}
        <div className="bg-surface-container rounded-2xl p-4 flex items-center gap-4 border border-outline-variant/20">
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
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
        </div>

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
                    return (
                      <React.Fragment key={item.label}>
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-8 h-8 rounded-xl flex items-center justify-center',
                              isDanger ? 'bg-rose-500/15' : 'bg-surface-container-high'
                            )}>
                              <item.icon className={cn('w-4 h-4', isDanger ? 'text-rose-400' : 'text-on-surface-variant')} />
                            </div>
                            <span className={cn('text-sm font-medium', isDanger ? 'text-rose-400' : 'text-on-surface')}>{item.label}</span>
                          </div>

                          {'toggle' in item && item.toggle && settings ? (
                            <button
                              onClick={() => handleToggle((item as any).toggle!)}
                              className={cn(
                                'w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0',
                                settings[(item as any).toggle] ? 'bg-violet-600' : 'bg-surface-container-highest'
                              )}
                            >
                              <span className={cn(
                                'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200',
                                settings[(item as any).toggle] ? 'left-5' : 'left-0.5'
                              )} />
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              {(item as any).meta && (
                                <span className="text-xs text-on-surface-variant truncate max-w-[100px] capitalize">{(item as any).meta}</span>
                              )}
                              <ChevronRight className="w-4 h-4 text-on-surface-variant/50" />
                            </div>
                          )}
                        </div>
                        {i < section.items.length - 1 && <div className="h-px bg-outline-variant/15 ml-[60px]" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Sign out */}
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
