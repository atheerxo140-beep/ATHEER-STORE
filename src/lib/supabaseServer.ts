import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client
// CRITICAL SECURITY: Uses Modern Secret Key (SUPABASE_SECRET_KEY) or legacy Service Role Key (SUPABASE_SERVICE_ROLE_KEY).
// NEVER import this file into client-side components!

let supabaseServerInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
    key &&
    !url.includes('your-project-id') &&
    !url.includes('<') &&
    !key.includes('...') &&
    !key.includes('<')
  );
};

export const getSupabaseServer = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseServerInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    // Priority: 1) Modern Secret Key, 2) Service Role Key, 3) Publishable/Anon Key (fallback)
    const supabaseKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    supabaseServerInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            cache: 'no-store',
          });
        },
      },
    });
  }

  return supabaseServerInstance;
};
