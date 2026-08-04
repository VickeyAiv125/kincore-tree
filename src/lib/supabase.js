import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL
  || import.meta.env.SUPABASE_URL
  || '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY
  || import.meta.env.SUPABASE_ANON_KEY
  || '';

if (!supabaseUrl) {
  console.error('[Kincore] SUPABASE_URL / VITE_SUPABASE_URL is missing from the build env.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
