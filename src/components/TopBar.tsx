import React from 'react';
import { motion } from 'motion/react';
import { Bolt, Bell } from 'lucide-react';

export const TopBar: React.FC<{ title?: string; onSettings?: () => void }> = ({ title = "THE HOOK" }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface shadow-sm transition-all duration-300">
      <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform duration-150">
        <Bolt className="w-6 h-6 text-primary fill-primary" />
        <h1 className="font-display text-2xl italic font-black tracking-tighter text-primary">
          {title}
        </h1>
      </div>
      <motion.button 
        whileTap={{ scale: 0.9 }}
        className="p-2 text-on-surface-variant hover:opacity-80 transition-opacity"
      >
        <Bell className="w-6 h-6" />
      </motion.button>
    </header>
  );
};
