import { NextRequest, NextResponse } from 'next/server';
import { getAllPages, savePage, deletePage } from '@/lib/pageService';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { logAuditEvent } from '@/lib/auditService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  const pages = getAllPages();
  return NextResponse.json({ success: true, count: pages.length, pages });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json();
    if (!body.titleEn || !body.titleAr || !body.slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    const saved = savePage(body);
    logAuditEvent(auth.user?.email || 'admin@atheer.store', 'SAVE_PAGE', 'Content Pages', `Saved page: ${saved.titleEn} (${saved.slug})`);
    return NextResponse.json({ success: true, page: saved });
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
      return NextResponse.json({ success: false, error: 'Page ID required' }, { status: 400 });
    }

    const ok = deletePage(id);
    logAuditEvent(auth.user?.email || 'admin@atheer.store', 'DELETE_PAGE', 'Content Pages', `Deleted page ID: ${id}`);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
