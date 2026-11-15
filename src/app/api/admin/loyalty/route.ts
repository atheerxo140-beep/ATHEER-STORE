import { NextRequest, NextResponse } from 'next/server';
import {
  getLoyaltyConfig,
  updateLoyaltyConfig,
  getAllLoyaltyAccounts,
  adjustCustomerStamps,
  grantCustomerVoucher,
  updateCustomerTier,
  createManualLoyaltyAccount,
  deleteLoyaltyAccount,
  resetCustomerStamps,
} from '@/lib/loyaltyService';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode, headers: NO_CACHE_HEADERS });
  }

  try {
    const config = getLoyaltyConfig();
    const accounts = getAllLoyaltyAccounts();
    return NextResponse.json({ success: true, config, accounts }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode, headers: NO_CACHE_HEADERS });
  }

  try {
    const body = await req.json();
    const updated = updateLoyaltyConfig(body);
    return NextResponse.json({ success: true, config: updated }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode, headers: NO_CACHE_HEADERS });
  }

  try {
    const body = await req.json();
    const action = body.action;

    switch (action) {
      case 'adjust_stamps': {
        const { accountId, adjustment, notes } = body;
        if (!accountId || adjustment === undefined) {
          return NextResponse.json({ success: false, error: 'accountId and adjustment are required' }, { status: 400 });
        }
        const res = adjustCustomerStamps(accountId, Number(adjustment), notes);
        return NextResponse.json(res, { headers: NO_CACHE_HEADERS });
      }

      case 'grant_voucher': {
        const { accountId, discountAmount, customCode, expiryDays, notes } = body;
        if (!accountId || !discountAmount) {
          return NextResponse.json({ success: false, error: 'accountId and discountAmount are required' }, { status: 400 });
        }
        const res = grantCustomerVoucher(accountId, Number(discountAmount), customCode, expiryDays ? Number(expiryDays) : 90, notes);
        return NextResponse.json(res, { headers: NO_CACHE_HEADERS });
      }

      case 'update_tier': {
        const { accountId, tier, notes } = body;
        if (!accountId || !tier) {
          return NextResponse.json({ success: false, error: 'accountId and tier are required' }, { status: 400 });
        }
        const res = updateCustomerTier(accountId, tier, notes);
        return NextResponse.json(res, { headers: NO_CACHE_HEADERS });
      }

      case 'create_account': {
        const { customerEmail, customerName, customerPhone, initialStamps, tier, welcomeVoucherAmount } = body;
        if (!customerEmail) {
          return NextResponse.json({ success: false, error: 'customerEmail is required' }, { status: 400 });
        }
        const res = createManualLoyaltyAccount({
          customerEmail,
          customerName,
          customerPhone,
          initialStamps: initialStamps ? Number(initialStamps) : 1,
          tier,
          welcomeVoucherAmount: welcomeVoucherAmount ? Number(welcomeVoucherAmount) : 100,
        });
        return NextResponse.json(res, { headers: NO_CACHE_HEADERS });
      }

      case 'reset_stamps': {
        const { accountId, notes } = body;
        if (!accountId) {
          return NextResponse.json({ success: false, error: 'accountId is required' }, { status: 400 });
        }
        const res = resetCustomerStamps(accountId, notes);
        return NextResponse.json(res, { headers: NO_CACHE_HEADERS });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: "${action}"` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode, headers: NO_CACHE_HEADERS });
  }

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id || body?.accountId;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter is required' }, { status: 400 });
    }

    const deleted = deleteLoyaltyAccount(id);
    return NextResponse.json({ success: deleted, id }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
