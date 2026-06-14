import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImagePlus, Loader2, X, ArrowRight, Zap } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { createHook, uploadImage } from '../lib/supabase';
import { Category, cn } from '../types';

interface CreatePageProps {
  session: Session;
  onCreated: () => void;
}

const CATEGORIES: { cat: Category; emoji: string }[] = [
  { cat: 'Style', emoji: '👗' },
  { cat: 'Tech', emoji: '💻' },
  { cat: 'Lifestyle', emoji: '☀️' },
];
const DURATIONS = [{ h: 6, label: '6h' }, { h: 12, label: '12h' }, { h: 24, label: '24h' }, { h: 48, label: '48h' }];

export const CreatePage: React.FC<CreatePageProps> = ({ session, onCreated }) => {
  const [question, setQuestion] = React.useState('');
  const [category, setCategory] = React.useState<Category>('Style');
  const [type, setType] = React.useState<'visual' | 'text'>('visual');
  const [expiresIn, setExpiresIn] = React.useState(24);
  const [optionLabels, setOptionLabels] = React.useState(['', '']);
  const [optionFiles, setOptionFiles] = React.useState<(File | null)[]>([null, null]);
  const [optionPreviews, setOptionPreviews] = React.useState<(string | null)[]>([null, null]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<1 | 2>(1);

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return;
    const u = [...optionFiles]; u[index] = file; setOptionFiles(u);
    const p = [...optionPreviews]; p[index] = URL.createObjectURL(file); setOptionPreviews(p);
  };

  const handleSubmit = async () => {
    if (!question.trim()) { setError('Add a question to get started.'); return; }
    if (type === 'text' && optionLabels.some((l) => !l.trim())) { setError('Fill in both options.'); return; }
    if (type === 'visual' && optionFiles.some((f) => !f)) { setError('Upload both images.'); return; }

    setLoading(true);
    setError(null);
    try {
      const options: { label: string; image_url?: string }[] = [];
      for (let i = 0; i < 2; i++) {
        let image_url: string | undefined;
        if (type === 'visual' && optionFiles[i]) {
          image_url = await uploadImage(optionFiles[i]!, `hooks/${session.user.id}/${Date.now()}-${i}`);
        }
        options.push({ label: optionLabels[i] || `Option ${i === 0 ? 'A' : 'B'}`, image_url });
      }
      await createHook(session.user.id, question.trim(), category, type, expiresIn, options);
      onCreated();
    } catch (err: any) {
      setError(err.message ?? 'Failed to post hook');
    } finally {
      setLoading(false);
    }
  };

  const isStep1Ready = question.trim().length > 0;
  const isReadyToPost = isStep1Ready && (
    type === 'text' ? optionLabels.every(l => l.trim()) : optionFiles.every(f => f !== null)
  );

  return (
    <div className="pt-6 pb-12">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <h1 className="font-display text-xl font-bold text-on-surface">New Hook</h1>
        </div>
        <p className="text-sm text-on-surface-variant">Create a battle. Let the community decide.</p>
      </div>

      <div className="space-y-5">
        {/* Question */}
        <div>
          <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-2">Question</label>
          <textarea
            className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-2xl p-4 font-display text-lg resize-none outline-none focus:border-violet-500 transition-colors placeholder-on-surface-variant/50"
            placeholder="What's the battle?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={200}
            rows={3}
          />
          <div className="flex justify-between mt-1.5 px-1">
            <span className="text-[11px] text-on-surface-variant/60">{question.length}/200</span>
          </div>
        </div>

        {/* Format toggle */}
        <div>
          <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-2">Format</label>
          <div className="flex gap-2">
            {(['visual', 'text'] as const).map((t) => (
              <motion.button
                key={t}
                whileTap={{ scale: 0.96 }}
                onClick={() => setType(t)}
                className={cn(
                  'flex-1 py-3 rounded-xl text-sm font-semibold transition-all border',
                  type === t
                    ? 'text-white border-violet-500/50'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50'
                )}
                style={type === t ? { background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' } : {}}
              >
                {t === 'visual' ? '📸  Visual' : '💬  Text'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-2">Category</label>
          <div className="flex gap-2">
            {CATEGORIES.map(({ cat, emoji }) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(cat)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border',
                  category === cat
                    ? 'text-white border-transparent'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/20'
                )}
                style={category === cat ? { background: 'linear-gradient(135deg, #5b21b6, #7c3aed)' } : {}}
              >
                {emoji} {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-2">Duration</label>
          <div className="flex gap-2">
            {DURATIONS.map(({ h, label }) => (
              <motion.button
                key={h}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExpiresIn(h)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border',
                  expiresIn === h
                    ? 'text-white border-transparent'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/20'
                )}
                style={expiresIn === h ? { background: 'linear-gradient(135deg, #5b21b6, #7c3aed)' } : {}}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-2">Options</label>

          {type === 'visual' ? (
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <label key={i} className="cursor-pointer">
                  <div className={cn(
                    'aspect-[4/5] rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed transition-all',
                    optionPreviews[i]
                      ? 'border-violet-500/40'
                      : 'border-outline-variant/30 hover:border-violet-500/50'
                  )}>
                    {optionPreviews[i] ? (
                      <div className="relative w-full h-full">
                        <img src={optionPreviews[i]!} className="w-full h-full object-cover" alt="" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const u = [...optionFiles]; u[i] = null; setOptionFiles(u);
                            const p = [...optionPreviews]; p[i] = null; setOptionPreviews(p);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/70 backdrop-blur rounded-full flex items-center justify-center"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70">
                          <span className={cn(
                            'text-white font-bold text-xs px-2 py-0.5 rounded-full',
                            i === 0 ? 'bg-violet-600' : 'bg-rose-600'
                          )}>
                            Option {i === 0 ? 'A' : 'B'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          i === 0 ? 'bg-violet-600/20' : 'bg-rose-600/20'
                        )}>
                          <ImagePlus className={cn('w-6 h-6', i === 0 ? 'text-violet-400' : 'text-rose-400')} />
                        </div>
                        <span className="text-xs font-semibold">Option {i === 0 ? 'A' : 'B'}</span>
                        <span className="text-[10px] text-on-surface-variant/60">Tap to upload</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)} />
                </label>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {[0, 1].map((i) => (
                <div key={i} className="relative">
                  <span className={cn(
                    'absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white',
                    i === 0 ? 'bg-violet-600' : 'bg-rose-600'
                  )}>
                    {i === 0 ? 'A' : 'B'}
                  </span>
                  <input
                    type="text"
                    placeholder={`Option ${i === 0 ? 'A' : 'B'}…`}
                    value={optionLabels[i]}
                    onChange={(e) => {
                      const u = [...optionLabels]; u[i] = e.target.value; setOptionLabels(u);
                    }}
                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface pl-14 pr-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder-on-surface-variant/50"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading || !isReadyToPost}
          className="w-full py-4 rounded-2xl text-white font-display font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
            boxShadow: isReadyToPost ? '0 8px 24px rgba(124, 58, 237, 0.4)' : 'none'
          }}
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Posting…</>
            : <><Zap className="w-5 h-5 fill-white" /> Post Hook <ArrowRight className="w-4 h-4 ml-0.5" /></>
          }
        </motion.button>
      </div>
    </div>
  );
};
