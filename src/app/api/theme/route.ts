import { NextResponse } from 'next/server';
import { getThemeConfig } from '@/lib/themeService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const theme = getThemeConfig();
  return NextResponse.json({ success: true, theme });
}
