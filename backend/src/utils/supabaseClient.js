import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
export const supabaseAdmin = createClient(supabaseUrl || 'https://placeholder.supabase.co', process.env.SUPABASE_SERVICE_KEY || 'placeholder');
