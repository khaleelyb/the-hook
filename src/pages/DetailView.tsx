import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, CheckCircle2, Share2, Send, Loader2, MessageCircle,
  Heart, CornerDownRight, ChevronDown, ChevronUp, X
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { Hook, Comment, cn } from '../types';
import { fetchComments, postComment, castVote } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface DetailViewProps {
  hook: Hook;
  onBack: () => void;
  session: Session;
}

type Side = 'A' | 'B' | null;

interface ParsedComment extends Comment {
  side: Side;
  bodyText: string;
  replies?: ParsedComment[];
  liked?: boolean;
  likeCount?: number;
}

// ── helpers ────────────────────────────────────────────────────────
function parseComment(c: Comment): ParsedComment {
  const match = c.content.match(/^\[([AB])\] ([\s\S]*)/);
  if (match) {
    return { ...c, side: match[1] as Side, bodyText: match[2], liked: false, likeCount: c.likes_count ?? 0 };
  }
  return { ...c, side: null, bodyText: c.content, liked: false, likeCount: c.likes_count ?? 0 };
}

function buildThreads(flat: ParsedComment[]): ParsedComment[] {
  // For now, all comments are top-level (no parent_id in schema).
  // Group by side for visual threading.
  return flat;
}

// ── Reply Composer ─────────────────────────────────────────────────
interface ComposerProps {
  optionA: string;
  optionB: string;
  onSubmit: (side: Side, text: string) => Promise<void>;
  replyingTo?: ParsedComment | null;
  onCancelReply?: () => void;
  autoFocus?: boolean;
}

const ReplyComposer: React.FC<ComposerProps> = ({
  optionA, optionB, onSubmit, replyingTo, onCancelReply, autoFocus
}) => {
  const [side, setSide] = React.useState<Side>(replyingTo?.side ?? null);
  const [text, setText] = React.useState('');
  const [posting, setPosting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Sync side to reply target's side when replying
  React.useEffect(() => {
    if (replyingTo?.side) setSide(replyingTo.side);
  }, [replyingTo?.side]);

  const handlePost = async () => {
    if (!side || posting) return;
    setPosting(true);
    try {
      await onSubmit(side, text.trim());
      setText('');
      setSide(null);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
      {/* Replying-to banner */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-between px-4 py-2 bg-surface-container border-b border-outline-variant/10"
          >
            <div className="flex items-center gap-2 text-xs text-on-surface-variant min-w-0">
              <CornerDownRight className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
              <span className="font-semibold truncate">
                Replying to <span className="font-black text-on-surface">@{replyingTo.user?.username}</span>
              </span>
              {replyingTo.side && (
                <span className={cn(
                  'flex-shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider',
                  replyingTo.side === 'A' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                )}>
                  Team {replyingTo.side === 'A' ? optionA.slice(0, 10) : optionB.slice(0, 10)}
                </span>
              )}
            </div>
            <button onClick={onCancelReply} className="p-1 flex-shrink-0 text-on-surface-variant hover:text-on-surface">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 space-y-3">
        {/* Side picker — only show if not locked by reply target */}
        {!replyingTo?.side && (
          <div>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">
              Pick your side
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['A', 'B'] as const).map((s) => {
                const label = s === 'A' ? optionA : optionB;
                const active = side === s;
                return (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSide(active ? null : s)}
                    className={cn(
                      'flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-black text-xs uppercase tracking-wide transition-all',
                      active && s === 'A' ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' :
                      active && s === 'B' ? 'bg-secondary border-secondary text-white shadow-md shadow-secondary/20' :
                      'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:border-primary/40'
                    )}
                  >
                    {active && <CheckCircle2 className="w-3.5 h-3.5 fill-current flex-shrink-0" />}
                    <span className="truncate">
                      {label.length > 12 ? label.slice(0, 12) + '…' : label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked side pill when replying */}
        {replyingTo?.side && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Your side:</span>
            <span className={cn(
              'text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider',
              side === 'A' ? 'bg-primary text-white' : 'bg-secondary text-white'
            )}>
              {side === 'A' ? optionA.slice(0, 14) : optionB.slice(0, 14)}
            </span>
          </div>
        )}

        {/* Text input + send */}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePost()}
            placeholder={side ? 'Add your take…' : 'Pick a side first…'}
            disabled={!side}
            maxLength={280}
            className={cn(
              'flex-1 bg-surface-container rounded-xl px-4 py-2.5 text-sm font-medium border-none focus:ring-2 focus:ring-primary outline-none transition-opacity',
              !side && 'opacity-50 cursor-not-allowed'
            )}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePost}
            disabled={!side || posting}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40',
              side === 'A' ? 'bg-primary text-white shadow-md shadow-primary/25' :
              side === 'B' ? 'bg-secondary text-white shadow-md shadow-secondary/25' :
              'bg-surface-container text-on-surface-variant'
            )}
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ── Single Comment Row ─────────────────────────────────────────────
interface CommentRowProps {
  comment: ParsedComment;
  optionA: string;
  optionB: string;
  onReply: (c: ParsedComment) => void;
  onLike: (id: string) => void;
  depth?: number;
  isLast?: boolean;
}

const CommentRow: React.FC<CommentRowProps> = ({
  comment, optionA, optionB, onReply, onLike, depth = 0, isLast
}) => {
  const isA = comment.side === 'A';
  const isB = comment.side === 'B';
  const sideLabel = isA ? optionA : isB ? optionB : null;
  const accentColor = isA ? 'bg-primary' : isB ? 'bg-secondary' : 'bg-outline-variant';
  const textColor = isA ? 'text-primary' : isB ? 'text-secondary' : 'text-on-surface-variant';
  const pillBg = isA ? 'bg-primary/10 text-primary' : isB ? 'bg-secondary/10 text-secondary' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={cn('flex gap-3', depth > 0 && 'ml-10 pl-3 border-l-2 border-outline-variant/20')}
    >
      {/* Side stripe + avatar col */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className={cn('w-1.5 rounded-full mt-1', accentColor)} style={{ minHeight: '28px' }} />
        {!isLast && <div className="w-px flex-1 bg-outline-variant/20 min-h-[12px]" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4">
        {/* Header row */}
        <div className="flex items-start gap-2 mb-1.5">
          <img
            src={comment.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.username}`}
            alt=""
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-surface"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-on-surface leading-none">
                @{comment.user?.username ?? 'unknown'}
              </span>
              {sideLabel && (
                <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider', pillBg)}>
                  {sideLabel.length > 14 ? sideLabel.slice(0, 14) + '…' : sideLabel}
                </span>
              )}
              <span className="text-[10px] text-outline ml-auto flex-shrink-0">
                {formatDistanceToNow(new Date(comment.created_at))}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        {comment.bodyText && (
          <p className="text-sm text-on-surface leading-relaxed ml-10 mb-2">{comment.bodyText}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 ml-10">
          <button
            onClick={() => onLike(comment.id)}
            className={cn(
              'flex items-center gap-1.5 text-xs font-bold transition-colors',
              comment.liked ? 'text-error' : 'text-on-surface-variant hover:text-error'
            )}
          >
            <Heart className={cn('w-3.5 h-3.5', comment.liked && 'fill-current')} />
            {(comment.likeCount ?? 0) > 0 && <span>{comment.likeCount}</span>}
          </button>

          <button
            onClick={() => onReply(comment)}
            className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            Reply
          </button>
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-0">
            {comment.replies.map((reply, i) => (
              <CommentRow
                key={reply.id}
                comment={reply}
                optionA={optionA}
                optionB={optionB}
                onReply={onReply}
                onLike={onLike}
                depth={depth + 1}
                isLast={i === (comment.replies?.length ?? 0) - 1}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Main DetailView ────────────────────────────────────────────────
export const DetailView: React.FC<DetailViewProps> = ({ hook, onBack, session }) => {
  const [votedOptionId, setVotedOptionId] = React.useState<string | null>(
    hook.user_voted_option_id ?? null
  );
  const [totalVotes, setTotalVotes] = React.useState(hook.total_votes);
  const [optionVotes, setOptionVotes] = React.useState<Record<string, number>>(
    Object.fromEntries((hook.options ?? []).map((o) => [o.id, o.vote_count]))
  );
  const [comments, setComments] = React.useState<ParsedComment[]>([]);
  const [loadingComments, setLoadingComments] = React.useState(true);
  const [votingId, setVotingId] = React.useState<string | null>(null);
  const [replyingTo, setReplyingTo] = React.useState<ParsedComment | null>(null);
  const [filterSide, setFilterSide] = React.useState<Side | 'all'>('all');
  const [showComposer, setShowComposer] = React.useState(false);
  const composerRef = React.useRef<HTMLDivElement>(null);

  const optionA = hook.options?.[0];
  const optionB = hook.options?.[1];
  const labelA = optionA?.label ?? 'Option A';
  const labelB = optionB?.label ?? 'Option B';

  const msLeft = new Date(hook.expires_at).getTime() - Date.now();
  const hLeft = Math.max(0, Math.floor(msLeft / 3600000));
  const mLeft = Math.max(0, Math.floor((msLeft % 3600000) / 60000));
  const sLeft = Math.max(0, Math.floor((msLeft % 60000) / 1000));
  const pctRemaining = Math.max(0, Math.min(100,
    (msLeft / (new Date(hook.expires_at).getTime() - new Date(hook.created_at).getTime())) * 100
  ));

  React.useEffect(() => {
    fetchComments(hook.id)
      .then((data) => setComments(data.map(parseComment)))
      .finally(() => setLoadingComments(false));
  }, [hook.id]);

  const handleVote = async (optionId: string) => {
    if (votedOptionId || votingId) return;
    setVotingId(optionId);
    setVotedOptionId(optionId);
    setTotalVotes((v) => v + 1);
    setOptionVotes((prev) => ({ ...prev, [optionId]: (prev[optionId] ?? 0) + 1 }));
    try {
      await castVote(session.user.id, hook.id, optionId);
    } catch {
      setVotedOptionId(null);
      setTotalVotes((v) => v - 1);
      setOptionVotes((prev) => ({ ...prev, [optionId]: Math.max(0, (prev[optionId] ?? 1) - 1) }));
    } finally {
      setVotingId(null);
    }
  };

  const handleSubmitComment = async (side: Side, text: string) => {
    if (!side) return;
    const prefix = `[${side}] `;
    const replyPrefix = replyingTo
      ? `@${replyingTo.user?.username ?? 'user'} `
      : '';
    const content = prefix + replyPrefix + (text || `Voted ${side === 'A' ? labelA : labelB}`);

    const optimistic: ParsedComment = {
      id: `temp-${Date.now()}`,
      hook_id: hook.id,
      user_id: session.user.id,
      content,
      likes_count: 0,
      created_at: new Date().toISOString(),
      user: {
        id: session.user.id,
        username: session.user.user_metadata?.username ?? session.user.email?.split('@')[0] ?? 'you',
        full_name: session.user.user_metadata?.full_name ?? '',
        avatar_url: session.user.user_metadata?.avatar_url ?? '',
        followers_count: 0,
        following_count: 0,
        is_verified: false,
      },
      side,
      bodyText: replyPrefix + (text || `Voted ${side === 'A' ? labelA : labelB}`),
      liked: false,
      likeCount: 0,
    };

    setComments((prev) => [optimistic, ...prev]);
    setReplyingTo(null);
    setShowComposer(false);

    try {
      const saved = await postComment(session.user.id, hook.id, content);
      setComments((prev) =>
        prev.map((c) => c.id === optimistic.id ? parseComment(saved) : c)
      );
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
    }
  };

  const handleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, liked: !c.liked, likeCount: (c.likeCount ?? 0) + (c.liked ? -1 : 1) }
          : c
      )
    );
  };

  const handleReply = (comment: ParsedComment) => {
    setReplyingTo(comment);
    setShowComposer(true);
    setTimeout(() => composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  // Tally
  const sideACnt = comments.filter((c) => c.side === 'A').length;
  const sideBCnt = comments.filter((c) => c.side === 'B').length;
  const totalSided = sideACnt + sideBCnt;
  const pctA = totalSided > 0 ? Math.round((sideACnt / totalSided) * 100) : 50;
  const pctB = 100 - pctA;

  const visibleComments = filterSide === 'all'
    ? comments
    : comments.filter((c) => c.side === filterSide);

  return (
    <div className="space-y-0 pb-32">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-surface shadow-sm">
        <button onClick={onBack} className="p-2 text-primary hover:opacity-80 active:scale-90 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-[10px] font-black text-primary uppercase tracking-widest">The Hook</span>
        <button className="p-2 text-on-surface-variant">
          <Share2 className="w-6 h-6" />
        </button>
      </header>

      {/* Question + timer */}
      <div className="pt-4 text-center space-y-3 px-2">
        <div className="inline-flex flex-col items-center">
          <span className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-1">
            {msLeft > 0 ? 'Voting ends in' : 'Voting ended'}
          </span>
          <div className="font-display text-4xl text-primary font-black">
            {String(hLeft).padStart(2, '0')}:{String(mLeft).padStart(2, '0')}:{String(sLeft).padStart(2, '0')}
          </div>
          <div className="w-32 h-1 bg-surface-container rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${pctRemaining}%` }} />
          </div>
        </div>
        <h2 className="font-display text-2xl text-on-surface font-black px-2 leading-tight">{hook.question}</h2>
        <p className="text-xs text-on-surface-variant font-semibold">{totalVotes.toLocaleString()} votes</p>
      </div>

      {/* Vote options */}
      <div className="space-y-3 px-2 pt-4">
        {hook.options?.map((option, index) => {
          const votes = optionVotes[option.id] ?? option.vote_count;
          const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isVoted = votedOptionId === option.id;
          const hasVoted = !!votedOptionId;

          return hook.type === 'visual' ? (
            <motion.div
              key={option.id}
              whileTap={!hasVoted ? { scale: 0.98 } : {}}
              onClick={() => handleVote(option.id)}
              className={cn(
                'relative cursor-pointer overflow-hidden rounded-2xl border shadow-sm transition-all',
                isVoted ? 'border-primary shadow-primary/20' :
                hasVoted ? 'opacity-70 border-surface-container' : 'border-surface-container hover:border-primary/40'
              )}
            >
              <div className="h-56 relative">
                <img
                  src={option.image_url || `https://picsum.photos/seed/${option.id}/800/600`}
                  className="w-full h-full object-cover"
                  alt={option.label}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className={cn(
                    'inline-block px-3 py-1 rounded-full text-[10px] font-black mb-1.5',
                    index === 0 ? 'bg-primary text-white' : 'bg-secondary text-white'
                  )}>
                    {index === 0 ? 'A' : 'B'}
                  </span>
                  <h3 className="font-display text-white text-xl font-bold">{option.label}</h3>
                </div>
              </div>
              <div className="p-3 bg-surface-container-lowest">
                {hasVoted && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className={isVoted ? 'text-primary' : 'text-on-surface-variant'}>{pct}%</span>
                      <span className="text-on-surface-variant">{votes} votes</span>
                    </div>
                    <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', index === 0 ? 'bg-primary' : 'bg-secondary')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-surface-variant">{option.label}</span>
                  <div className={cn(
                    'w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all',
                    isVoted ? (index === 0 ? 'bg-primary border-none' : 'bg-secondary border-none') : 'border-outline-variant'
                  )}>
                    {votingId === option.id
                      ? <Loader2 className="w-4 h-4 animate-spin text-white" />
                      : <CheckCircle2 className={cn('w-4 h-4', isVoted ? 'text-white fill-current' : 'text-outline-variant')} />
                    }
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key={option.id}
              whileTap={!hasVoted ? { scale: 0.98 } : {}}
              onClick={() => handleVote(option.id)}
              className={cn(
                'w-full p-4 rounded-xl border transition-all text-left',
                isVoted ? 'bg-primary-container border-primary' :
                'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container-high'
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold">{option.label}</span>
                {hasVoted && <span className="font-black text-sm">{pct}%</span>}
              </div>
              {hasVoted && (
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Comments section ──────────────────────────── */}
      <div className="mt-6 px-2 space-y-4">

        {/* Section header + tally */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg text-on-surface font-bold">Replies</h3>
              <span className="text-xs font-black text-primary bg-primary-container px-2.5 py-0.5 rounded-full">
                {comments.length}
              </span>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setReplyingTo(null); setShowComposer((v) => !v); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest shadow-md shadow-primary/20"
            >
              {showComposer ? <ChevronUp className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
              {showComposer ? 'Close' : 'Reply'}
            </motion.button>
          </div>

          {/* Battle tally bar */}
          {totalSided > 0 && (
            <div className="bg-surface-container-low rounded-2xl p-3.5 space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-primary">{labelA.slice(0, 14)} · {pctA}%</span>
                <span className="text-secondary">{labelB.slice(0, 14)} · {pctB}%</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden flex">
                <motion.div
                  className="h-full bg-primary rounded-l-full"
                  initial={{ width: '50%' }}
                  animate={{ width: `${pctA}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
                <motion.div
                  className="h-full bg-secondary rounded-r-full"
                  initial={{ width: '50%' }}
                  animate={{ width: `${pctB}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant text-center font-semibold">
                {sideACnt} vs {sideBCnt} opinions
              </p>
            </div>
          )}

          {/* Filter tabs */}
          {comments.length > 0 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {(['all', 'A', 'B'] as const).map((f) => {
                const label = f === 'all' ? 'All' : f === 'A' ? `Team ${labelA.slice(0, 8)}` : `Team ${labelB.slice(0, 8)}`;
                const count = f === 'all' ? comments.length : comments.filter((c) => c.side === f).length;
                return (
                  <button
                    key={f}
                    onClick={() => setFilterSide(f)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0',
                      filterSide === f
                        ? f === 'A' ? 'bg-primary text-white' : f === 'B' ? 'bg-secondary text-white' : 'bg-on-surface text-surface'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    )}
                  >
                    {label}
                    <span className={cn(
                      'text-[10px] font-black px-1.5 py-0.5 rounded-full',
                      filterSide === f ? 'bg-white/20' : 'bg-surface-container-high'
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Composer */}
        <AnimatePresence>
          {showComposer && (
            <motion.div
              ref={composerRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ReplyComposer
                optionA={labelA}
                optionB={labelB}
                onSubmit={handleSubmitComment}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                autoFocus={showComposer}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment list */}
        {loadingComments ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : visibleComments.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <MessageCircle className="w-10 h-10 text-outline-variant mx-auto" />
            <p className="text-sm font-semibold text-on-surface-variant">
              {filterSide !== 'all'
                ? `No ${filterSide === 'A' ? 'Team ' + labelA.slice(0, 10) : 'Team ' + labelB.slice(0, 10)} replies yet.`
                : 'No replies yet. Pick a side and start the debate!'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {visibleComments.map((c, i) => (
                <CommentRow
                  key={c.id}
                  comment={c}
                  optionA={labelA}
                  optionB={labelB}
                  onReply={handleReply}
                  onLike={handleLike}
                  isLast={i === visibleComments.length - 1}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
