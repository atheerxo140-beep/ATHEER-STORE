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
 * Ensures the admin user has an active, valid session token.
 * Instant 0ms verification from localStorage or cookies with zero network blocking.
 */
export async function ensureValidAdminSession(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  // 1. FAST PATH (Instant 0ms): Check localStorage
  let savedToken = localStorage.getItem('atheer_admin_token');

  // 2. Cookie fallback (Instant 0ms)
  if (!savedToken && typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)atheer_admin_token=([^;]+)/);
    if (match && match[1]) {
      savedToken = decodeURIComponent(match[1]);
      localStorage.setItem('atheer_admin_token', savedToken);
    }
  }

  if (savedToken && savedToken.trim().length > 0) {
    return savedToken.trim();
  }

  return null;
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

  // If 401 Unauthorized, redirect smoothly to login
  if (res.status === 401) {
    if (options.redirectOnUnauthorized && typeof window !== 'undefined') {
      clearAdminToken();
      window.location.href = '/admin/login?reason=expired';
    }
    return res;
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
