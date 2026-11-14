import { NextResponse } from 'next/server';
import { getAllPromotions } from '@/lib/promotionService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const active = getAllPromotions().filter((p) => p.isActive);
    return NextResponse.json({ success: true, promotions: active });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
