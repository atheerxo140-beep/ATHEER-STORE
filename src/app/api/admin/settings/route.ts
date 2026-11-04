import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings, updateStoreSettings } from '@/data/storeSettingsStore';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const settings = getStoreSettings();
  return NextResponse.json({
    success: true,
    settings,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateStoreSettings(body);
    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
