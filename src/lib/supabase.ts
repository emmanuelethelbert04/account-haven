import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Prefer values injected via vite.config.ts (works reliably in this environment),
// with a fallback to Vite env vars.
const envSupabaseUrl = (
  (typeof __SUPABASE_URL__ !== 'undefined' ? __SUPABASE_URL__ : '') ||
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  // In case this project uses non-VITE secrets and `envPrefix` is enabled later.
  ((import.meta.env as any).SUPABASE_URL as string | undefined) ||
  ''
).trim();

const envSupabaseAnonKey = (
  (typeof __SUPABASE_ANON_KEY__ !== 'undefined' ? __SUPABASE_ANON_KEY__ : '') ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  ((import.meta.env as any).SUPABASE_ANON_KEY as string | undefined) ||
  ''
).trim();

const STORAGE_URL_KEY = 'socialmarket_backend_url';
const STORAGE_ANON_KEY = 'socialmarket_backend_anon_key';

const readStorage = (key: string) => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return '';
    return (localStorage.getItem(key) || '').trim();
  } catch {
    return '';
  }
};

const isPlaceholder = (value: string) =>
  !value || value === 'https://placeholder.supabase.co' || value === 'placeholder-key';

const storedSupabaseUrl = readStorage(STORAGE_URL_KEY);
const storedSupabaseAnonKey = readStorage(STORAGE_ANON_KEY);

// Prefer env values only if they look valid; otherwise fall back to the stored config.
const supabaseUrl = (!isPlaceholder(envSupabaseUrl) ? envSupabaseUrl : storedSupabaseUrl).trim();
const supabaseAnonKey = (!isPlaceholder(envSupabaseAnonKey) ? envSupabaseAnonKey : storedSupabaseAnonKey).trim();

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);

export const getBackendConfigSummary = () => {
  const source = !isPlaceholder(envSupabaseUrl) || !isPlaceholder(envSupabaseAnonKey)
    ? 'env'
    : !isPlaceholder(storedSupabaseUrl) || !isPlaceholder(storedSupabaseAnonKey)
      ? 'localStorage'
      : 'missing';

  let host = '';
  try {
    host = supabaseUrl ? new URL(supabaseUrl).host : '';
  } catch {
    host = '';
  }

  return {
    configured: isSupabaseConfigured,
    source,
    urlHost: host,
    hasAnonKey: Boolean(supabaseAnonKey),
  } as const;
};

export const setBackendConfig = (url: string, anonKey: string) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
};

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
