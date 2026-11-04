import { NextRequest, NextResponse } from 'next/server';
import { getShippingZones, updateShippingZone } from '@/data/shippingZones';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const zones = getShippingZones();
  return NextResponse.json({
    success: true,
    zones,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { zoneId, baseFee, freeShippingThreshold, isActive } = body;

    if (!zoneId) {
      return NextResponse.json(
        { success: false, error: 'zoneId is required' },
        { status: 400 }
      );
    }

    const updated = updateShippingZone(zoneId, {
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
