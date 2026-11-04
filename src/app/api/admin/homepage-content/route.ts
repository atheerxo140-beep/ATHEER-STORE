import { NextRequest, NextResponse } from 'next/server';
import { getHomepageContent, updateHomepageContent } from '@/data/homepageContentStore';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const content = await getHomepageContent();
    return NextResponse.json({
      success: true,
      content,
    });
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
    const updated = await updateHomepageContent(body);
    return NextResponse.json({
      success: true,
      content: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
