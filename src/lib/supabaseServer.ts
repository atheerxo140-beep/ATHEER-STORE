import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client
// CRITICAL SECURITY: Uses Modern Secret Key (SUPABASE_SECRET_KEY) or legacy Service Role Key (SUPABASE_SERVICE_ROLE_KEY).
// NEVER import this file into client-side components!

let supabaseServerInstance: SupabaseClient | null = null;
let isSupabaseHealthy = true;
let lastSupabaseFailureTime = 0;
const BREAKER_COOLDOWN_MS = 60 * 1000; // 60 seconds circuit-breaker cooldown

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    !key ||
    url.includes('your-project-id') ||
    url.includes('<') ||
    key.includes('...') ||
    key.includes('<') ||
    url.includes('zdkpxfxvazwwzemimykc')
  ) {
    return false;
  }

  // Circuit breaker: If Supabase failed recently (e.g. host unreachable / DNS failure / timeout),
  // trip the breaker so every server request doesn't hang for 10-20 seconds.
  if (!isSupabaseHealthy) {
    if (Date.now() - lastSupabaseFailureTime < BREAKER_COOLDOWN_MS) {
      return false;
    }
    // Cooldown passed, allow probe
    isSupabaseHealthy = true;
  }

  return true;
};

export const getSupabaseServer = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseServerInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
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
        fetch: async (url, options = {}) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1200);

          try {
            const res = await fetch(url, {
              ...options,
              signal: controller.signal,
              cache: 'no-store',
            });
            clearTimeout(timeoutId);
            isSupabaseHealthy = true;
            return res;
          } catch (err: any) {
            clearTimeout(timeoutId);
            isSupabaseHealthy = false;
            lastSupabaseFailureTime = Date.now();
            console.warn('[Supabase Circuit-Breaker Tripped] Remote host unreachable. Fast local fallback active.');
            throw err;
          }
        },
      },
    });
  }

  return supabaseServerInstance;
};
