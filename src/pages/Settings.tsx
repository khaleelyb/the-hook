import React from 'react';
import {
  ArrowLeft, User, Mail, Shield, Bell, Send, Eye, Palette, Globe, HelpCircle, AlertTriangle, LogOut, Loader2
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
    getUserSettings(session.user.id)
      .then(setSettings)
      .finally(() => setLoading(false));
  }, [session]);

  const handleToggle = async (key: keyof UserSettings) => {
    if (!settings) return;
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    setSaving(true);
    try {
      await saveUserSettings(session.user.id, updated);
    } catch {
      setSettings(settings); // revert
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
    }
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
        { label: 'Push Notifications', icon: Bell, toggle: 'push_notifications' as const },
        { label: 'Email Alerts', icon: Send, toggle: 'email_alerts' as const },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Appearance', icon: Palette, meta: settings?.theme ?? 'light' },
        { label: 'Language', icon: Globe, meta: settings?.language ?? 'English' },
        { label: 'Show Vote Counts', icon: Eye, toggle: 'show_vote_counts' as const },
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', icon: HelpCircle },
        { label: 'Report an Issue', icon: AlertTriangle, color: 'text-error' },
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <header className="fixed top-0 left-0 w-full z-50 flex items-center gap-4 px-4 h-16 bg-surface shadow-sm">
        <button onClick={onBack} className="p-2 text-primary hover:opacity-80 active:scale-90 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-display text-xl text-on-surface font-bold">Settings</h1>
        {saving && <Loader2 className="w-4 h-4 text-primary animate-spin ml-auto" />}
      </header>

      <div className="pt-2">
        {/* Profile card */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 mb-8">
          <img
            src={meta?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-primary object-cover"
          />
          <div>
            <h2 className="font-display text-lg text-on-surface font-bold">{displayName}</h2>
            <p className="text-sm font-semibold text-on-surface-variant">@{username}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <section key={section.title}>
                <h3 className="text-[10px] font-black text-primary uppercase tracking-widest px-1 mb-2">
                  {section.title}
                </h3>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-surface-container">
                  {section.items.map((item, i) => (
                    <React.Fragment key={item.label}>
                      <div className="w-full flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <item.icon className={cn('w-5 h-5', (item as any).color || 'text-primary')} />
                          <span className="text-sm font-semibold text-on-surface">{item.label}</span>
                        </div>
                        {'toggle' in item && item.toggle && settings ? (
                          <button
                            onClick={() => handleToggle(item.toggle!)}
                            className={cn(
                              'w-11 h-6 rounded-full transition-all duration-200 relative',
                              settings[item.toggle] ? 'bg-primary' : 'bg-surface-container-high'
                            )}
                          >
                            <span className={cn(
                              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200',
                              settings[item.toggle] ? 'left-5' : 'left-0.5'
                            )} />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            {(item as any).meta && (
                              <span className="text-xs font-bold text-on-surface-variant truncate max-w-[120px]">
                                {(item as any).meta}
                              </span>
                            )}
                            <ArrowLeft className="w-4 h-4 text-outline-variant rotate-180" />
                          </div>
                        )}
                      </div>
                      {i < section.items.length - 1 && <div className="h-[1px] bg-surface-container mx-4" />}
                    </React.Fragment>
                  ))}
                </div>
              </section>
            ))}

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full mt-8 bg-error-container text-error p-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm disabled:opacity-60"
            >
              {signingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
              {signingOut ? 'Signing out...' : 'Logout'}
            </button>
            <p className="text-center text-[10px] font-bold text-outline uppercase tracking-widest mt-4">
              The Hook v1.0.0
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
