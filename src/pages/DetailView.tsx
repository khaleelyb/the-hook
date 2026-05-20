import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, CheckCircle2, MessageCircle, Heart, Share2, Send } from 'lucide-react';
import { Hook, cn } from '../types';

interface DetailViewProps {
  hook: Hook;
  onBack: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ hook, onBack }) => {
  const [votedOptionId, setVotedOptionId] = React.useState<string | null>(null);

  return (
    <div className="space-y-6 pb-24">
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-surface shadow-sm">
        <button onClick={onBack} className="p-2 text-primary hover:opacity-80 active:scale-90 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Voting Detail</span>
        <button className="p-2 text-on-surface-variant">
          <Share2 className="w-6 h-6" />
        </button>
      </header>

      <div className="pt-4 text-center space-y-4">
        <div className="inline-flex flex-col items-center">
            <span className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-1">Voting Ends In</span>
            <div className="font-display text-4xl text-primary font-black">14:22:05</div>
            <div className="w-32 h-1 bg-surface-container rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary w-3/4 animate-pulse" />
            </div>
        </div>

        <h2 className="font-display text-2xl text-on-surface font-black px-4 leading-tight">
            {hook.question}
        </h2>
      </div>

      <div className="space-y-4 px-2">
        {hook.options?.map((option, index) => (
            <motion.div 
                key={option.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setVotedOptionId(option.id)}
                className="relative group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md border border-surface-container"
            >
                <div className="h-64 relative">
                    <img 
                        src={option.image_url || `https://picsum.photos/seed/${option.id}/800/600`} 
                        className="w-full h-full object-cover" 
                        alt={option.label}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                        <span className={cn(
                            "inline-block px-3 py-1 rounded-full text-[10px] font-black mb-2",
                            index === 0 ? "bg-primary text-white" : "bg-secondary text-white"
                        )}>
                            CONCEPT {index === 0 ? 'A' : 'B'}
                        </span>
                        <h3 className="font-display text-white text-xl font-bold">{option.label}</h3>
                    </div>
                </div>
                <div className="p-4 flex justify-between items-center bg-white">
                    <p className="text-sm font-medium text-on-surface-variant flex-1">
                        Maximized efficiency through integrated smart-glass and modular living units.
                    </p>
                    <div className={cn(
                        "w-12 h-12 rounded-full border-2 flex items-center justify-center ml-4 transition-all duration-300",
                        votedOptionId === option.id 
                            ? (index === 0 ? "bg-primary border-none shadow-lg shadow-primary/30" : "bg-secondary border-none shadow-lg shadow-secondary/30") 
                            : "border-outline-variant"
                    )}>
                        <CheckCircle2 className={cn("w-6 h-6", votedOptionId === option.id ? "text-white fill-current" : "text-outline-variant")} />
                    </div>
                </div>
            </motion.div>
        ))}
      </div>

      <section className="space-y-4 px-2">
        <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-on-surface font-bold">Feedback</h3>
            <span className="text-xs font-bold text-primary bg-primary-container px-3 py-1 rounded-full">24 Comments</span>
        </div>

        <div className="space-y-4">
            <div className="bg-surface-container-low p-4 rounded-xl border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-black text-on-primary-container">JD</div>
                    <span className="text-xs font-bold text-on-surface">Jordan Design</span>
                    <span className="text-[10px] text-outline ml-auto">2h ago</span>
                </div>
                <p className="text-sm text-on-surface-variant font-medium">Concept B feels more human-centric. We need more greenery in dense cities.</p>
            </div>
        </div>

        <div className="sticky bottom-4 z-40 bg-white/80 backdrop-blur-md rounded-full shadow-xl border border-surface-container p-1 flex items-center gap-2">
            <input 
                type="text" 
                placeholder="Add your constructive take..." 
                className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm font-medium"
            />
            <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 active:scale-90 transition-transform">
                <Send className="w-5 h-5" />
            </button>
        </div>
      </section>
    </div>
  );
};
