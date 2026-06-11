import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      saves: {
        Row: {
          id: string;
          user_id: string;
          slot: number;
          player_data: Record<string, unknown>;
          chapter: number;
          playtime: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slot: number;
          player_data: Record<string, unknown>;
          chapter: number;
          playtime: number;
        };
        Update: {
          player_data?: Record<string, unknown>;
          chapter?: number;
          playtime?: number;
          updated_at?: string;
        };
      };
      rankings: {
        Row: {
          id: string;
          user_id: string;
          player_name: string;
          level: number;
          banchou_rank: string;
          max_combo: number;
          playtime: number;
          chapter: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          player_name: string;
          level: number;
          banchou_rank: string;
          max_combo: number;
          playtime: number;
          chapter: number;
        };
        Update: never;
      };
    };
  };
};
