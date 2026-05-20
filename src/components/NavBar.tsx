import React from 'react';
import { motion } from 'motion/react';
import { Compass, PlusCircle, Heart, User } from 'lucide-react';
import { cn } from '../types';

interface NavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'feed', icon: Compass, label: 'Feed' },
    { id: 'create', icon: PlusCircle, label: 'Create' },
    { id: 'activity', icon: Heart, label: 'Activity' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 pb-safe bg-surface-container shadow-lg rounded-t-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 ease-out",
              isActive 
                ? "bg-primary-container text-on-primary-container rounded-full scale-110" 
                : "text-on-surface-variant hover:text-primary"
            )}
          >
            <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
            <span className="text-[10px] font-semibold mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
