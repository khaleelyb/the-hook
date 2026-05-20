import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Category = 'For You' | 'Trending' | 'Style' | 'Tech' | 'Lifestyle';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
}

export interface HookOption {
  id: string;
  hook_id: string;
  label: string;
  image_url?: string;
  vote_count: number;
}

export interface Hook {
  id: string;
  creator_id: string;
  question: string;
  category: Category;
  created_at: string;
  expires_at: string;
  type: 'visual' | 'text';
  total_votes: number;
  creator?: Profile;
  options?: HookOption[];
  has_voted?: boolean;
  user_voted_option_id?: string;
}

export interface Comment {
  id: string;
  hook_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  user?: Profile;
}
