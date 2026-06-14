import React from 'react';
import { motion } from 'motion/react';
import { Bell, Zap } from 'lucide-react';

export const TopBar: React.FC<{ title?: string; onSettings?: () => void }> = ({ title = "HOOK" }) => {
  const [hasNotif] = React.useState(true);

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 h-14"
      style={{ background: 'linear-gradient(to bottom, #f5f5f7 60%, transparent)' }}>
      <div className="flex items-center gap-1.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="font-display text-xl font-bold tracking-tight text-on-surface">
          {title}
        </span>
      </div>

      <motion.button
        whileTap={{ scale: 0.88 }}
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-surface-container"
      >
        <Bell className="w-5 h-5 text-on-surface" strokeWidth={1.8} />
        {hasNotif && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full ring-2 ring-background" />
        )}
      </motion.button>
    </header>
  );
};
