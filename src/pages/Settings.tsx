import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, User, Mail, Shield, Bell, Send, Eye, Palette, Globe, HelpCircle, AlertTriangle, LogOut 
} from 'lucide-react';
import { cn } from '../types';

export const SettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const sections = [
    {
      title: 'Account',
      items: [
        { label: 'Profile', icon: User },
        { label: 'Email', icon: Mail },
        { label: 'Security', icon: Shield },
      ]
    },
    {
      title: 'Notifications',
      items: [
        { label: 'Push Notifications', icon: Bell },
        { label: 'Email Alerts', icon: Send },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Appearance', icon: Palette, meta: 'Light' },
        { label: 'Language', icon: Globe, meta: 'English' },
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
      </header>

      <div className="pt-2">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 mb-8">
            <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop" 
                alt="Profile" 
                className="w-16 h-16 rounded-full border-2 border-primary object-cover"
            />
            <div>
                <h2 className="font-display text-lg text-on-surface font-bold">Alex Rivera</h2>
                <p className="text-sm font-semibold text-on-surface-variant">@alex_hooked</p>
            </div>
        </div>

        <div className="space-y-6">
            {sections.map((section) => (
                <section key={section.title}>
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-widest px-1 mb-2">
                        {section.title}
                    </h3>
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-surface-container">
                        {section.items.map((item, i) => (
                            <React.Fragment key={item.label}>
                                <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container transition-colors active:scale-[0.99]">
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn("w-5 h-5", item.color || "text-primary")} />
                                        <span className="text-sm font-semibold text-on-surface">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.meta && <span className="text-xs font-bold text-on-surface-variant">{item.meta}</span>}
                                        <ArrowLeft className="w-4 h-4 text-outline-variant rotate-180" />
                                    </div>
                                </button>
                                {i < section.items.length - 1 && <div className="h-[1px] bg-surface-container mx-4" />}
                            </React.Fragment>
                        ))}
                    </div>
                </section>
            ))}

            <button className="w-full mt-8 bg-error-container text-error p-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm">
                <LogOut className="w-5 h-5" />
                Logout
            </button>
            <p className="text-center text-[10px] font-bold text-outline uppercase tracking-widest mt-4">
                The Hook v2.4.1 (Build 8902)
            </p>
        </div>
      </div>
    </div>
  );
};
