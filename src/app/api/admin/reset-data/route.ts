import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';
import { clearAllLocalOrders } from '@/data/localOrdersStore';
import { getStoreFilePath } from '@/lib/storePath';
import { logAuditEvent } from '@/lib/auditService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const target = body.target || 'all'; // 'all' | 'orders' | 'customers'

    let ordersCleared = false;
    let customersCleared = false;

    // 1. CLEAR ORDERS & METRICS
    if (target === 'all' || target === 'orders') {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseServer();
        if (supabase) {
          try {
            await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          } catch (dbErr) {
            console.error('[ResetData] Supabase orders clear error:', dbErr);
          }
        }
      }

      clearAllLocalOrders();
      ordersCleared = true;
    }

    // 2. CLEAR TEST CUSTOMERS
    if (target === 'all' || target === 'customers') {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseServer();
        if (supabase) {
          try {
            await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          } catch (dbErr) {
            console.error('[ResetData] Supabase customers clear error:', dbErr);
          }
        }
      }

      try {
        const custFile = getStoreFilePath('customers_store.json');
        if (fs.existsSync(custFile)) {
          fs.writeFileSync(custFile, JSON.stringify([], null, 2), 'utf8');
        }
      } catch (e) {}

      try {
        const subFile = getStoreFilePath('subscribers_store.json');
        if (fs.existsSync(subFile)) {
          fs.writeFileSync(subFile, JSON.stringify([], null, 2), 'utf8');
        }
      } catch (e) {}

      try {
        const invFile = getStoreFilePath('inventory_logs_store.json');
        if (fs.existsSync(invFile)) {
          fs.writeFileSync(invFile, JSON.stringify([], null, 2), 'utf8');
        }
      } catch (e) {}

      customersCleared = true;
    }

    logAuditEvent(
      auth.user?.email || 'admin@atheer.store',
      'RESET_STORE_DATA',
      'Dashboard & Operations',
      `Zeroed out store test metrics and transactions (${target}) for live production launch`
    );

    return NextResponse.json({
      success: true,
      ordersCleared,
      customersCleared,
      message: 'Store test metrics and transactions have been reset to zero.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
