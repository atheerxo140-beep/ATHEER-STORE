import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';
import { getSupabaseClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '';

  const envAudit = {
    NEXT_PUBLIC_SUPABASE_URL: {
      configured: Boolean(supabaseUrl),
      host: supabaseUrl ? new URL(supabaseUrl).host : null,
    },
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: {
      configured: Boolean(publishableKey),
      length: publishableKey.length,
      prefix: publishableKey ? publishableKey.substring(0, 7) + '...' : null,
    },
    SUPABASE_SECRET_KEY: {
      configured: Boolean(secretKey),
      length: secretKey.length,
      prefix: secretKey ? secretKey.substring(0, 7) + '...' : null,
    },
    ADMIN_EMAIL: {
      configured: Boolean(process.env.ADMIN_EMAIL),
      value: process.env.ADMIN_EMAIL || 'yassinanwar140@gmail.com',
    },
    ADMIN_PASSWORD_HASH: {
      configured: Boolean(adminPasswordHash),
      isSecureHash: adminPasswordHash.startsWith('pbkdf2:'),
    },
  };

  // Connectivity test
  let connectivity = {
    tested: false,
    reachable: false,
    httpStatus: 0,
    latencyMs: 0,
    error: null as string | null,
    tables: {} as Record<string, boolean>,
  };

  if (supabaseUrl && secretKey) {
    connectivity.tested = true;
    const start = Date.now();
    try {
      const serverClient = getSupabaseServer();
      if (!serverClient) {
        connectivity.error = 'Supabase client could not be instantiated';
      } else {
        // Probe database with 3 second timeout
        const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timed out after 3000ms')), 3000)
        );

        const probePromise = serverClient
          .from('products')
          .select('count', { count: 'exact', head: true });

        const result: any = await Promise.race([probePromise, timeoutPromise]);
        connectivity.latencyMs = Date.now() - start;

        if (result.error) {
          connectivity.error = result.error.message;
        } else {
          connectivity.reachable = true;
          connectivity.httpStatus = 200;

          // Check required tables
          const tablesToCheck = [
            'products',
            'orders',
            'order_items',
            'shipping_zones',
            'store_settings',
            'categories',
            'coupons',
            'promotions',
            'loyalty_accounts',
            'staff_members',
            'audit_logs',
          ];

          for (const tbl of tablesToCheck) {
            try {
              const { error: tErr } = await serverClient
                .from(tbl)
                .select('count', { count: 'exact', head: true });
              connectivity.tables[tbl] = !tErr;
            } catch (e) {
              connectivity.tables[tbl] = false;
            }
          }
        }
      }
    } catch (err: any) {
      connectivity.latencyMs = Date.now() - start;
      connectivity.error = err.message || 'Unknown network error';
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel-production' : 'local-development',
    envAudit,
    connectivity,
  });
}
