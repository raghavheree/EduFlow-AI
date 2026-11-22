import { createClient } from '@supabase/supabase-js';

// Environment variable retrieval
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if valid credentials are provided
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id')
  );
};

// Fallback dummy URL and Key to prevent runtime initialization crash when credentials are unset
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'placeholder-anon-key-eduflow-preview';

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured() ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export interface SupabaseHealthStatus {
  isConfigured: boolean;
  isConnected: boolean;
  error?: string;
  url?: string;
}

export async function checkSupabaseConnection(): Promise<SupabaseHealthStatus> {
  if (!isSupabaseConfigured()) {
    return {
      isConfigured: false,
      isConnected: false,
      error: 'Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured.',
    };
  }

  try {
    const { error } = await supabase.from('departments').select('count', { count: 'exact', head: true });
    if (error) {
      return {
        isConfigured: true,
        isConnected: false,
        error: error.message,
        url: supabaseUrl,
      };
    }
    return {
      isConfigured: true,
      isConnected: true,
      url: supabaseUrl,
    };
  } catch (err) {
    return {
      isConfigured: true,
      isConnected: false,
      error: err instanceof Error ? err.message : 'Unknown connection error',
      url: supabaseUrl,
    };
  }
}
