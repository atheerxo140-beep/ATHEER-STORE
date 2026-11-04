import { NextRequest, NextResponse } from 'next/server';
import { getShippingZones, updateShippingZone, fetchShippingZonesFromDb } from '@/data/shippingZones';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(_req: NextRequest) {
  await fetchShippingZonesFromDb();
  const zones = getShippingZones();
  return NextResponse.json(
    { success: true, zones },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json();
    const { zoneId, baseFee, freeShippingThreshold, isActive } = body;

    if (!zoneId) {
      return NextResponse.json(
        { success: false, error: 'zoneId is required' },
        { status: 400 }
      );
    }

    const updated = await updateShippingZone(zoneId, {
      ...(typeof baseFee === 'number' && { baseFee }),
      ...(typeof freeShippingThreshold === 'number' && { freeShippingThreshold }),
      ...(typeof isActive === 'boolean' && { isActive }),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Shipping zone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      zone: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update shipping zone' },
      { status: 500 }
    );
  }
}
