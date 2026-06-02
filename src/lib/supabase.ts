import { createClient } from '@supabase/supabase-js';
import type { Hook, HookOption, Profile, Comment, UserSettings } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Accept: 'application/json',
    },
  },
});

// ─── AUTH ──────────────────────────────────────────────────────────
export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) throw error;

  if (data.user) {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (fetchError) throw new Error(`Failed to check existing profile: ${fetchError.message}`);

      if (!existingProfile) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          full_name: username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        });
        if (insertError) throw new Error(`Failed to create user profile: ${insertError.message}`);
      }
    } catch (profileError: any) {
      throw new Error(`Signup completed but profile setup failed: ${profileError.message}`);
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── PROFILES ──────────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function ensureProfileExists(userId: string, username?: string): Promise<Profile> {
  const profile = await getProfile(userId);
  if (profile) return profile;

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username: username || `user_${userId.slice(0, 8)}`,
      full_name: username || `user_${userId.slice(0, 8)}`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to ensure profile exists: ${error.message}`);
  return data;
}

// ─── FOLLOWS ───────────────────────────────────────────────────────

/** Follow a user. Returns true if newly followed. */
export async function followUser(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
}

/** Unfollow a user. */
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  if (error) throw error;
}

/** Check if currentUser follows targetUser. */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  return !!data;
}

/** Get all users that userId follows (following list). */
export async function getFollowing(userId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('following:profiles!follows_following_id_fkey(*)')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => row.following);
}

/** Get all followers of userId. */
export async function getFollowers(userId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('follower:profiles!follows_follower_id_fkey(*)')
    .eq('following_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => row.follower);
}

/** Batch-check which profileIds the currentUser follows (for feed cards). */
export async function getFollowingIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);
  return new Set((data ?? []).map((r: any) => r.following_id));
}

// ─── HOOKS ─────────────────────────────────────────────────────────
export async function fetchHooks(category?: string, userId?: string): Promise<Hook[]> {
  let query = supabase
    .from('hooks')
    .select(`*, creator:profiles(*), options:hook_options(*)`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (category && category !== 'For You') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (userId && data) {
    const hookIds = data.map((h: any) => h.id);
    const { data: votes } = await supabase
      .from('votes')
      .select('hook_id, option_id')
      .eq('user_id', userId)
      .in('hook_id', hookIds);

    return data.map((hook: any) => {
      const vote = votes?.find((v: any) => v.hook_id === hook.id);
      return {
        ...hook,
        has_voted: !!vote,
        user_voted_option_id: vote?.option_id ?? null,
      };
    });
  }

  return data ?? [];
}

export async function fetchHookById(hookId: string, userId?: string): Promise<Hook | null> {
  const { data, error } = await supabase
    .from('hooks')
    .select(`*, creator:profiles(*), options:hook_options(*)`)
    .eq('id', hookId)
    .single();
  if (error) return null;

  if (userId) {
    const { data: vote } = await supabase
      .from('votes')
      .select('option_id')
      .eq('user_id', userId)
      .eq('hook_id', hookId)
      .maybeSingle();
    return { ...data, has_voted: !!vote, user_voted_option_id: vote?.option_id ?? null };
  }
  return data;
}

export async function createHook(
  creatorId: string,
  question: string,
  category: string,
  type: 'visual' | 'text',
  expiresInHours: number,
  options: { label: string; image_url?: string }[]
): Promise<Hook> {
  await ensureProfileExists(creatorId);
  const expiresAt = new Date(Date.now() + expiresInHours * 3600000).toISOString();

  const { data: hook, error } = await supabase
    .from('hooks')
    .insert({ creator_id: creatorId, question, category, type, expires_at: expiresAt })
    .select()
    .single();
  if (error) throw error;

  const optionRows = options.map((o) => ({ hook_id: hook.id, label: o.label, image_url: o.image_url }));
  const { error: optErr } = await supabase.from('hook_options').insert(optionRows);
  if (optErr) throw optErr;

  return hook;
}

// ─── VOTING ────────────────────────────────────────────────────────
export async function castVote(userId: string, hookId: string, optionId: string) {
  const { error } = await supabase
    .from('votes')
    .insert({ user_id: userId, hook_id: hookId, option_id: optionId });
  if (error) throw error;
}

// ─── COMMENTS ──────────────────────────────────────────────────────
export async function fetchComments(hookId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:profiles(*)')
    .eq('hook_id', hookId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function postComment(userId: string, hookId: string, content: string): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: userId, hook_id: hookId, content })
    .select('*, user:profiles(*)')
    .single();
  if (error) throw error;
  return data;
}

// ─── USER HOOKS ────────────────────────────────────────────────────
export async function fetchUserHooks(userId: string): Promise<Hook[]> {
  const { data, error } = await supabase
    .from('hooks')
    .select('*, options:hook_options(*)')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── SETTINGS ──────────────────────────────────────────────────────
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const { data } = await supabase
    .from('profiles')
    .select('settings')
    .eq('id', userId)
    .single();
  const defaults: UserSettings = {
    push_notifications: true,
    email_alerts: false,
    show_vote_counts: true,
    private_profile: false,
    theme: 'light',
    language: 'English',
  };
  return { ...defaults, ...(data?.settings ?? {}) };
}

export async function saveUserSettings(userId: string, settings: UserSettings) {
  const { error } = await supabase
    .from('profiles')
    .update({ settings } as any)
    .eq('id', userId);
  if (error) throw error;
}

// ─── IMAGE UPLOAD ──────────────────────────────────────────────────
export async function uploadImage(file: File, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('hook-images')
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('hook-images').getPublicUrl(data.path);
  return urlData.publicUrl;
}
