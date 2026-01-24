import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Create a dummy client or real client based on credentials
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage,
    },
  });
} else {
  console.warn('Supabase credentials not configured. Using placeholder client.');
  // Create with placeholder values - will fail on actual requests but won't crash on import
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage,
    },
  });
}

export { supabase };
