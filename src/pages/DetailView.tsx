import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Share2, Send, Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { Hook, Comment, cn } from '../types';
import { fetchComments, postComment, castVote } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface DetailViewProps {
  hook: Hook;
  onBack: () => void;
  session: Session;
}

export const DetailView: React.FC<DetailViewProps> = ({ hook, onBack, session }) => {
  const [votedOptionId, setVotedOptionId] = React.useState<string | null>(
    hook.user_voted_option_id ?? null
  );
  const [totalVotes, setTotalVotes] = React.useState(hook.total_votes);
  const [optionVotes, setOptionVotes] = React.useState<Record<string, number>>(
    Object.fromEntries((hook.options ?? []).map((o) => [o.id, o.vote_count]))
  );
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [commentText, setCommentText] = React.useState('');
  const [loadingComments, setLoadingComments] = React.useState(true);
  const [postingComment, setPostingComment] = React.useState(false);
  const [votingId, setVotingId] = React.useState<string | null>(null);

  // Countdown
  const msLeft = new Date(hook.expires_at).getTime() - Date.now();
  const hLeft = Math.max(0, Math.floor(msLeft / 3600000));
  const mLeft = Math.max(0, Math.floor((msLeft % 3600000) / 60000));
  const sLeft = Math.max(0, Math.floor((msLeft % 60000) / 1000));
  const pctElapsed = Math.min(100, ((Date.now() - new Date(hook.created_at).getTime()) /
    (new Date(hook.expires_at).getTime() - new Date(hook.created_at).getTime())) * 100);

  React.useEffect(() => {
    fetchComments(hook.id)
      .then(setComments)
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
      // revert
      setVotedOptionId(null);
      setTotalVotes((v) => v - 1);
      setOptionVotes((prev) => ({ ...prev, [optionId]: Math.max(0, (prev[optionId] ?? 1) - 1) }));
    } finally {
      setVotingId(null);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || postingComment) return;
    setPostingComment(true);
    try {
      const c = await postComment(session.user.id, hook.id, commentText.trim());
      setComments((prev) => [c, ...prev]);
      setCommentText('');
    } catch {
      // ignore
    } finally {
      setPostingComment(false);
    }
  };

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

      {/* Countdown */}
      <div className="pt-4 text-center space-y-4">
        <div className="inline-flex flex-col items-center">
          <span className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-1">
            {msLeft > 0 ? 'Voting Ends In' : 'Voting Ended'}
          </span>
          <div className="font-display text-4xl text-primary font-black">
            {String(hLeft).padStart(2, '0')}:{String(mLeft).padStart(2, '0')}:{String(sLeft).padStart(2, '0')}
          </div>
          <div className="w-32 h-1 bg-surface-container rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${100 - pctElapsed}%` }} />
          </div>
        </div>
        <h2 className="font-display text-2xl text-on-surface font-black px-4 leading-tight">{hook.question}</h2>
        <p className="text-xs text-on-surface-variant font-semibold">{totalVotes.toLocaleString()} votes</p>
      </div>

      {/* Options */}
      <div className="space-y-4 px-2">
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
                'relative group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md border',
                hasVoted && !isVoted ? 'opacity-70' : '',
                isVoted ? 'border-primary shadow-primary/20 shadow-lg' : 'border-surface-container'
              )}
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
                    'inline-block px-3 py-1 rounded-full text-[10px] font-black mb-2',
                    index === 0 ? 'bg-primary text-white' : 'bg-secondary text-white'
                  )}>
                    CONCEPT {index === 0 ? 'A' : 'B'}
                  </span>
                  <h3 className="font-display text-white text-xl font-bold">{option.label}</h3>
                </div>
              </div>
              <div className="p-4 bg-white">
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
                  <p className="text-sm font-medium text-on-surface-variant flex-1">{option.label}</p>
                  <div className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center ml-4 transition-all',
                    isVoted
                      ? (index === 0 ? 'bg-primary border-none' : 'bg-secondary border-none')
                      : 'border-outline-variant'
                  )}>
                    {votingId === option.id
                      ? <Loader2 className="w-4 h-4 animate-spin text-white" />
                      : <CheckCircle2 className={cn('w-5 h-5', isVoted ? 'text-white fill-current' : 'text-outline-variant')} />
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
                isVoted ? 'bg-primary-container border-primary' : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container-high'
              )}
            >
              <div className="flex justify-between items-center mb-2">
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

      {/* Comments */}
      <section className="space-y-4 px-2">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-on-surface font-bold">Feedback</h3>
          <span className="text-xs font-bold text-primary bg-primary-container px-3 py-1 rounded-full">
            {comments.length} Comments
          </span>
        </div>

        {loadingComments ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : comments.length === 0 ? (
          <p className="text-center text-on-surface-variant text-sm py-4">No comments yet. Start the conversation!</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="bg-surface-container-low p-4 rounded-xl border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={c.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user?.username}`}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-bold text-on-surface">@{c.user?.username}</span>
                  <span className="text-[10px] text-outline ml-auto">
                    {formatDistanceToNow(new Date(c.created_at))} ago
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant font-medium">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Comment input */}
        <div className="sticky bottom-4 z-40 bg-white/80 backdrop-blur-md rounded-full shadow-xl border border-surface-container p-1 flex items-center gap-2">
          <input
            type="text"
            placeholder="Add your take..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
            className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm font-medium outline-none"
          />
          <button
            onClick={handlePostComment}
            disabled={postingComment || !commentText.trim()}
            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 active:scale-90 transition-transform disabled:opacity-50"
          >
            {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </section>
    </div>
  );
};
