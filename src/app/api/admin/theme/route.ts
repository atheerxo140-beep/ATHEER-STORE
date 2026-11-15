import { NextRequest, NextResponse } from 'next/server';
import { getThemeConfig, updateThemeConfig } from '@/lib/themeService';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { logAuditEvent } from '@/lib/auditService';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  const theme = getThemeConfig();
  return NextResponse.json({ success: true, theme });
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json();
    const updated = updateThemeConfig(body);
    try {
      revalidatePath('/', 'layout');
    } catch (e) {}
    logAuditEvent(auth.user?.email || 'admin@atheer.store', 'UPDATE_THEME', 'Theme & Design', 'Updated brand colors, typography, or styling');
    return NextResponse.json({ success: true, theme: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
