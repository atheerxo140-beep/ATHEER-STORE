import { NextRequest, NextResponse } from 'next/server';
import { getAllCoupons, createCoupon, toggleCouponActive, deleteCoupon } from '@/data/couponsStore';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  const coupons = getAllCoupons();
  return NextResponse.json({
    success: true,
    coupons,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json();
    const { code, discountType, discountValue, minOrderAmount, usageLimit } = body;

    if (!code || !discountType || typeof discountValue !== 'number' || discountValue <= 0) {
      return NextResponse.json(
        { success: false, error: 'Code, valid discountType, and positive discountValue are required.' },
        { status: 400 }
      );
    }

    const created = createCoupon({
      code,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      isActive: true,
    });

    return NextResponse.json({ success: true, coupon: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Coupon ID is required.' }, { status: 400 });
    }

    const toggled = toggleCouponActive(id);
    if (!toggled) {
      return NextResponse.json({ success: false, error: 'Coupon not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon: toggled });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Coupon ID is required.' }, { status: 400 });
    }

    const deleted = deleteCoupon(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Coupon not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
