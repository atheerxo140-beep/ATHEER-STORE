import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, saveCategory, deleteCategory } from '@/lib/categoryService';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { logAuditEvent } from '@/lib/auditService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  const categories = getAllCategories();
  return NextResponse.json({ success: true, count: categories.length, categories });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json();
    if (!body.nameEn || !body.nameAr || !body.slug) {
      return NextResponse.json({ success: false, error: 'Name and slug required' }, { status: 400 });
    }

    const saved = saveCategory(body);
    logAuditEvent(auth.user?.email || 'admin@atheer.store', 'SAVE_CATEGORY', 'Categories', `Saved category: ${saved.nameEn} (${saved.slug})`);
    return NextResponse.json({ success: true, category: saved });
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
      return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 });
    }

    const ok = deleteCategory(id);
    logAuditEvent(auth.user?.email || 'admin@atheer.store', 'DELETE_CATEGORY', 'Categories', `Deleted category ID: ${id}`);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
