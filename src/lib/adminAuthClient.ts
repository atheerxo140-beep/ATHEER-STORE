import { getSupabaseClient } from '@/lib/supabaseClient';

export function syncAdminToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('atheer_admin_token', token);
  }
  if (typeof document !== 'undefined') {
    // 24 hours max-age for cookie persistence; auto-refreshed JWT inside
    document.cookie = `atheer_admin_token=${token}; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function clearAdminToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('atheer_admin_token');
  }
  if (typeof document !== 'undefined') {
    document.cookie = 'atheer_admin_token=; path=/; max-age=0; SameSite=Lax';
  }
}

/**
 * Ensures the admin user has an active, valid JWT token.
 * If expired or expiring within 2 minutes, automatically refreshes with Supabase Auth.
 */
export async function ensureValidAdminSession(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  // 1. FAST PATH (Instant 0ms): Check for cryptographic HMAC admin session token
  const savedToken = localStorage.getItem('atheer_admin_token');
  if (savedToken && (savedToken.startsWith('ath_') || savedToken.startsWith('dev-admin-'))) {
    return savedToken;
  }

  // 2. Fallback: Supabase Auth Session (only if no HMAC token exists)
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.auth.getSession();
      let session = data?.session;

      if (session) {
        const expiresAt = session.expires_at || 0;
        const nowInSeconds = Math.floor(Date.now() / 1000);

        // If token expires in less than 2 minutes, proactively refresh it
        if (expiresAt - nowInSeconds < 120) {
          const { data: refreshed, error: refreshErr } = await client.auth.refreshSession();
          if (!refreshErr && refreshed?.session) {
            session = refreshed.session;
          }
        }

        if (session?.access_token) {
          syncAdminToken(session.access_token);
          return session.access_token;
        }
      }
    } catch (e) {
      console.warn('[AdminAuthClient] Error checking session:', e);
    }
  }

  return savedToken;
}

/**
 * Robust fetch wrapper that guarantees a valid Bearer token,
 * automatically retries on 401 with refreshed token, and smoothly
 * redirects to login if the session cannot be restored.
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: { redirectOnUnauthorized?: boolean } = { redirectOnUnauthorized: true }
): Promise<Response> {
  let token = await ensureValidAdminSession();

  const headers = new Headers(init?.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(input, {
    ...init,
    headers,
  });

  // If 401 Unauthorized, token might have just expired: attempt one immediate refresh and retry
  if (res.status === 401) {
    if (token && (token.startsWith('ath_') || token.startsWith('dev-admin-'))) {
      if (options.redirectOnUnauthorized && typeof window !== 'undefined') {
        clearAdminToken();
        window.location.href = '/admin/login?reason=expired';
      }
      return res;
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: refreshed, error: refreshErr } = await client.auth.refreshSession();
        if (!refreshErr && refreshed?.session?.access_token) {
          token = refreshed.session.access_token;
          syncAdminToken(token);
          headers.set('Authorization', `Bearer ${token}`);
          // Retry the request with the refreshed token
          res = await fetch(input, {
            ...init,
            headers,
          });
        }
      } catch (e) {
        // Refresh failed
      }
    }

    // If still 401 after refresh attempt, the session is dead
    if (res.status === 401 && options.redirectOnUnauthorized && typeof window !== 'undefined') {
      clearAdminToken();
      // Redirect to login with expired notice
      window.location.href = '/admin/login?reason=expired';
    }
  }

  return res;
}

/**
 * Initializes continuous background auth synchronization.
 */
export function initAdminAuthSync(onSessionInvalid?: () => void) {
  if (typeof window === 'undefined') return () => {};

  const client = getSupabaseClient();
  if (!client) return () => {};

  const { data: listener } = client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session?.access_token) {
        syncAdminToken(session.access_token);
      }
    } else if (event === 'SIGNED_OUT') {
      clearAdminToken();
      if (onSessionInvalid) onSessionInvalid();
    }
  });

  return () => {
    listener?.subscription?.unsubscribe();
  };
}
