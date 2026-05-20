import React from 'react';
import { motion } from 'motion/react';
import { Share2, Clock, CheckCircle2, MessageCircle, Heart } from 'lucide-react';
import { Hook, cn } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface HookCardProps {
  hook: Hook;
  onVote: (optionId: string) => void;
}

export const HookCard: React.FC<HookCardProps> = ({ hook, onVote }) => {
  const isExpired = new Date(hook.expires_at) < new Date();
  
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-6 p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <img 
            src={hook.creator?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${hook.creator?.username}`} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-primary-container object-cover"
          />
          <div>
            <p className="text-sm font-bold text-on-surface">@{hook.creator?.username}</p>
            <p className="text-xs text-on-surface-variant">
              {formatDistanceToNow(new Date(hook.created_at))} ago
            </p>
          </div>
        </div>
        
        {!isExpired && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-error font-bold flex items-center gap-1 uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              18h left
            </span>
            <div className="w-16 h-1 bg-surface-container mt-1 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-error" 
                style={{ width: '60%' }}
              />
            </div>
          </div>
        )}
      </div>

      <h2 className="font-display text-xl leading-tight text-on-surface">
        {hook.question}
      </h2>

      {/* Options */}
      {hook.type === 'visual' ? (
        <div className="grid grid-cols-2 gap-3">
          {hook.options?.map((option) => (
            <motion.div 
              key={option.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onVote(option.id)}
              className="relative group cursor-pointer aspect-[3/4] rounded-xl overflow-hidden bg-surface-variant"
            >
              <img 
                src={option.image_url} 
                alt={option.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold uppercase tracking-wider">
                {option.label}
              </div>
              
              {hook.user_voted_option_id === option.id && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-6 h-6 text-primary fill-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {hook.options?.map((option) => (
            <motion.button
              key={option.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onVote(option.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border border-outline-variant/30 transition-all group",
                hook.user_voted_option_id === option.id 
                  ? "bg-primary-container text-on-primary-container" 
                  : "bg-surface-container-low hover:bg-surface-container-high"
              )}
            >
              <span className="text-sm font-semibold">{option.label}</span>
              {hook.has_voted && (
                <span className="font-bold">
                  {Math.round((option.vote_count / Math.max(1, hook.total_votes)) * 100)}%
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <img 
              key={i}
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
              alt="Voter"
              className="w-6 h-6 rounded-full border-2 border-surface bg-surface-container-high"
            />
          ))}
          <div className="w-6 h-6 rounded-full border-2 border-surface bg-primary-container text-[8px] flex items-center justify-center text-on-primary-container font-black">
            +128
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold">
            <MessageCircle className="w-4 h-4" />
            84
          </button>
          <button className="flex items-center gap-1 text-on-surface-variant hover:text-error transition-colors text-xs font-bold">
            <Heart className="w-4 h-4" />
            312
          </button>
          <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};
