import { NextRequest, NextResponse } from 'next/server';
import {
  currentEgyptianShippingZones,
  getShippingZones,
  updateShippingZone,
  EGYPTIAN_GOVERNORATES,
} from '@/data/shippingZones';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  return NextResponse.json({
    success: true,
    zones: currentEgyptianShippingZones,
    governorates: EGYPTIAN_GOVERNORATES,
  });
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json();
    const { zoneId, baseFee, freeShippingThreshold, estimatedDaysEn, estimatedDaysAr, isActive } = body;

    if (!zoneId) {
      return NextResponse.json({ success: false, error: 'zoneId is required' }, { status: 400 });
    }

    const updated = updateShippingZone(zoneId, {
      ...(typeof baseFee === 'number' && { baseFee }),
      ...(typeof freeShippingThreshold === 'number' && { freeShippingThreshold }),
      ...(typeof estimatedDaysEn === 'string' && { estimatedDaysEn }),
      ...(typeof estimatedDaysAr === 'string' && { estimatedDaysAr }),
      ...(typeof isActive === 'boolean' && { isActive }),
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Shipping zone not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      zone: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
