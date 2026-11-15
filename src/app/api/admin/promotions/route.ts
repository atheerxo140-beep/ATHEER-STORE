import { NextRequest, NextResponse } from 'next/server';
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '@/lib/promotionService';
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
    const promos = getAllPromotions();
    return NextResponse.json({ success: true, promotions: promos }, { headers: NO_CACHE_HEADERS });
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
    const created = createPromotion(body);
    return NextResponse.json({ success: true, promotion: created }, { headers: NO_CACHE_HEADERS });
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
    const { id, ...updates } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Promotion ID is required' }, { status: 400, headers: NO_CACHE_HEADERS });
    }
    const updated = updatePromotion(id, updates);
    return NextResponse.json({ success: !!updated, promotion: updated }, { headers: NO_CACHE_HEADERS });
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
        id = body?.id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const deleted = deletePromotion(id);
    return NextResponse.json({ success: deleted, id }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
