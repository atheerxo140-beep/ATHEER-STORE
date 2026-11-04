import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Client-Side Supabase Client
 * Uses the Modern Publishable Key (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
 * or the legacy anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY).
 * Safe for client browser bundles.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    !publishableKey ||
    url.includes('your-project-id') ||
    url.includes('<') ||
    publishableKey.includes('...') ||
    publishableKey.includes('<')
  ) {
    return null;
  }

  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseClientInstance;
};
