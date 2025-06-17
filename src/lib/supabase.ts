import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  question_id: number;
  completed: boolean;
  completed_at?: string;
  time_spent: number;
  created_at: string;
}

export interface QuestionReflection {
  id: string;
  user_id: string;
  question_id: number;
  learning?: string;
  discoveries?: string;
  created_at: string;
}

export interface DailyStreak {
  id: string;
  user_id: string;
  date: string;
  questions_completed: number;
  streak_count: number;
  created_at: string;
}

export interface UserJourney {
  id: string;
  user_id: string;
  journey_start_date: string;
  current_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}