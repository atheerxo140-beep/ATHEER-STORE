import { NextRequest } from 'next/server';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';

export interface AdminAuthResult {
  authorized: boolean;
  statusCode: number;
  error?: string;
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'super_admin';
  };
}

export const DEV_ADMIN_TOKEN = 'dev-admin-session-atheer';

/**
 * Server-Side Admin Authentication and Role Verification Guard.
 * Inspects Bearer Authorization header or atheer_admin_token cookie.
 * In production:
 *   - Strictly forbids development bypass.
 *   - Verifies JWT with Supabase Auth.
 *   - Verifies 'admin' or 'super_admin' role in public.profiles.
 * In development:
 *   - If Supabase is not configured, requires explicit dev-admin session token.
 *   - Rejects unauthenticated direct API requests (401).
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Extract Token from Authorization header or cookie
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    const cookieToken = req.cookies.get('atheer_admin_token')?.value;
    if (cookieToken) {
      token = cookieToken.trim();
    }
  }

  // 2. Production Security Enforcement
  if (isProd) {
    if (!token) {
      return {
        authorized: false,
        statusCode: 401,
        error: 'Unauthorized: Admin authentication token is required.',
      };
    }

    // Forbid any development bypass tokens in production
    if (token === DEV_ADMIN_TOKEN) {
      return {
        authorized: false,
        statusCode: 401,
        error: 'Unauthorized: Development bypass tokens are strictly forbidden in production mode.',
      };
    }

    if (!isSupabaseConfigured()) {
      return {
        authorized: false,
        statusCode: 503,
        error: 'CRITICAL SECURITY: Production store cannot run without configured Supabase authentication and database.',
      };
    }

    // Verify token with Supabase Auth
    const supabase = getSupabaseServer();
    if (!supabase) {
      return {
        authorized: false,
        statusCode: 500,
        error: 'Internal authentication service failure.',
      };
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) {
        return {
          authorized: false,
          statusCode: 401,
          error: 'Unauthorized: Invalid or expired admin session token.',
        };
      }

      // Verify Role in profiles table or user metadata
      let role = user.user_metadata?.role || (user.app_metadata as any)?.role;

      if (!role) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role) {
          role = profile.role;
        }
      }

      if (role !== 'admin' && role !== 'super_admin') {
        return {
          authorized: false,
          statusCode: 403,
          error: 'Forbidden: Insufficient privileges. Admin role is required to access this resource.',
        };
      }

      return {
        authorized: true,
        statusCode: 200,
        user: {
          id: user.id,
          email: user.email || '',
          role,
        },
      };
    } catch (err: any) {
      return {
        authorized: false,
        statusCode: 500,
        error: `Authentication verification error: ${err.message}`,
      };
    }
  }

  // 3. Development Mode Security (NODE_ENV !== 'production')
  if (!token) {
    return {
      authorized: false,
      statusCode: 401,
      error: 'Unauthorized: Authentication required. Please log in via /admin/login.',
    };
  }

  // If Supabase keys exist in dev, try verifying with Supabase
  if (isSupabaseConfigured() && token !== DEV_ADMIN_TOKEN) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          const role = user.user_metadata?.role || 'admin';
          if (role === 'admin' || role === 'super_admin') {
            return {
              authorized: true,
              statusCode: 200,
              user: { id: user.id, email: user.email || '', role },
            };
          }
        }
      } catch (e) {
        // Fall through to dev check
      }
    }
  }

  // Controlled Development Session Token (allowed strictly in non-production)
  if (token === DEV_ADMIN_TOKEN) {
    return {
      authorized: true,
      statusCode: 200,
      user: {
        id: 'dev-admin-local',
        email: 'admin@atheer.store',
        role: 'admin',
      },
    };
  }

  return {
    authorized: false,
    statusCode: 401,
    error: 'Unauthorized: Invalid admin credentials.',
  };
}
