import React from 'react';
import { motion } from 'motion/react';
import { Plus, ImagePlus, Loader2, X } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { createHook, uploadImage } from '../lib/supabase';
import { Category, cn } from '../types';

interface CreatePageProps {
  session: Session;
  onCreated: () => void;
}

const CATEGORIES: Category[] = ['Style', 'Tech', 'Lifestyle'];
const DURATIONS = [6, 12, 24, 48];

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

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return;
    const updated = [...optionFiles];
    updated[index] = file;
    setOptionFiles(updated);
    const previews = [...optionPreviews];
    previews[index] = URL.createObjectURL(file);
    setOptionPreviews(previews);
  };

  const handleSubmit = async () => {
    if (!question.trim()) { setError('Please enter a question.'); return; }
    if (optionLabels.some((l) => !l.trim()) && type === 'text') { setError('Please fill in both option labels.'); return; }
    if (type === 'visual' && optionFiles.some((f) => !f)) { setError('Please upload both option images.'); return; }

    setLoading(true);
    setError(null);
    try {
      const options: { label: string; image_url?: string }[] = [];
      for (let i = 0; i < 2; i++) {
        let image_url: string | undefined;
        if (type === 'visual' && optionFiles[i]) {
          const path = `hooks/${session.user.id}/${Date.now()}-${i}`;
          image_url = await uploadImage(optionFiles[i]!, path);
        }
        options.push({ label: optionLabels[i] || `Option ${i === 0 ? 'A' : 'B'}`, image_url });
      }
      await createHook(session.user.id, question.trim(), category, type, expiresIn, options);
      onCreated();
    } catch (err: any) {
      setError(err.message ?? 'Failed to create hook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Question */}
      <div className="space-y-2">
        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Question</span>
        <textarea
          className="w-full bg-surface-container-lowest border-none rounded-xl p-5 font-display text-xl text-on-surface focus:ring-2 focus:ring-primary shadow-sm min-h-[120px] resize-none outline-none"
          placeholder="What's the battle? Ask your Hook..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={200}
        />
        <p className="text-right text-[10px] text-on-surface-variant">{question.length}/200</p>
      </div>

      {/* Type toggle */}
      <div className="space-y-2">
        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Format</span>
        <div className="flex rounded-xl overflow-hidden border border-outline-variant/30">
          {(['visual', 'text'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-all',
                type === t ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
              )}
            >
              {t === 'visual' ? '📸 Visual' : '💬 Text'}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Category</span>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all',
                category === cat ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expiry */}
      <div className="space-y-2">
        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Expires In</span>
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setExpiresIn(d)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-bold transition-all',
                expiresIn === d ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
              )}
            >
              {d}h
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      {type === 'visual' ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <label key={i} className="cursor-pointer">
              <div className="aspect-[4/5] bg-surface-container-high rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-outline-variant hover:border-primary group relative transition-all">
                {optionPreviews[i] ? (
                  <>
                    <img src={optionPreviews[i]!} className="w-full h-full object-cover" alt="" />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const u = [...optionFiles]; u[i] = null; setOptionFiles(u);
                        const p = [...optionPreviews]; p[i] = null; setOptionPreviews(p);
                      }}
                      className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-on-surface-variant group-hover:text-primary mb-2" />
                    <span className="text-xs font-bold text-on-surface-variant group-hover:text-primary">
                      Option {i === 0 ? 'A' : 'B'}
                    </span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
              />
            </label>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <input
              key={i}
              type="text"
              placeholder={`Option ${i === 0 ? 'A' : 'B'}`}
              value={optionLabels[i]}
              onChange={(e) => {
                const u = [...optionLabels]; u[i] = e.target.value; setOptionLabels(u);
              }}
              className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-semibold border-none focus:ring-2 focus:ring-primary outline-none"
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-error font-semibold bg-error-container rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-5 bg-primary text-on-primary font-display text-xl rounded-full shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><span>Post Hook</span><Plus className="w-6 h-6" /></>}
      </button>
    </div>
  );
};
