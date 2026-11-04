import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/data/storeSettingsStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({
      success: true,
      settings: {
        storeNameEn: settings.storeNameEn,
        storeNameAr: settings.storeNameAr,
        whatsappNumber: settings.whatsappNumber,
        supportEmail: settings.supportEmail,
        defaultCurrency: settings.defaultCurrency,
        cairoShowroomsEn: settings.cairoShowroomsEn,
        cairoShowroomsAr: settings.cairoShowroomsAr,
        socialInstagram: settings.socialInstagram,
        socialTiktok: settings.socialTiktok,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
