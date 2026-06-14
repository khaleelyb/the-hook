import React from 'react';
import { motion } from 'motion/react';
import { Compass, PlusSquare, Bell, User } from 'lucide-react';
import { cn } from '../types';

interface NavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'feed',     icon: Compass,     label: 'Feed' },
  { id: 'create',   icon: PlusSquare,  label: 'Create' },
  { id: 'activity', icon: Bell,        label: 'Inbox' },
  { id: 'profile',  icon: User,        label: 'Me' },
];

export const NavBar: React.FC<NavBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 pb-safe border-t border-outline-variant/40"
      style={{ background: 'linear-gradient(to top, #f5f5f7 70%, transparent)' }}>
      <div className="flex justify-around items-center px-2 py-3 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const isCreate = tab.id === 'create';

          if (isCreate) {
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange(tab.id)}
                className="relative flex items-center justify-center"
              >
                <div className={cn(
                  'w-12 h-8 rounded-lg flex items-center justify-center transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-80'
                )}>
                  <span className="absolute -left-0.5 top-0 bottom-0 rounded-l-lg bg-cyan-400 opacity-70" style={{ width: '5px' }} />
                  <span className="absolute -right-0.5 top-0 bottom-0 rounded-r-lg bg-rose-500 opacity-70" style={{ width: '5px' }} />
                  <Icon className="w-5 h-5 text-white relative z-10" strokeWidth={2} />
                </div>
              </motion.button>
            );
          }

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 px-3 py-1"
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all duration-200',
                    isActive ? 'text-primary' : 'text-on-surface-variant'
                  )}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(109, 40, 217, 0.5))' } : {}}
                />
                {tab.id === 'activity' && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-secondary rounded-full" />
                )}
              </div>
              <span className={cn(
                'text-[10px] font-semibold tracking-wide transition-colors',
                isActive ? 'text-primary' : 'text-on-surface-variant'
              )}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
