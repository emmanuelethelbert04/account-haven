import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Prefer values injected via vite.config.ts (works reliably in this environment),
// with a fallback to Vite env vars.
const supabaseUrl = (
  (typeof __SUPABASE_URL__ !== 'undefined' ? __SUPABASE_URL__ : '') ||
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  // In case this project uses non-VITE secrets and `envPrefix` is enabled later.
  ((import.meta.env as any).SUPABASE_URL as string | undefined) ||
  ''
).trim();

const supabaseAnonKey = (
  (typeof __SUPABASE_ANON_KEY__ !== 'undefined' ? __SUPABASE_ANON_KEY__ : '') ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  ((import.meta.env as any).SUPABASE_ANON_KEY as string | undefined) ||
  ''
).trim();

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder-key';

// Create a dummy client or real client based on credentials
let supabase: SupabaseClient;

if (isSupabaseConfigured) {
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
