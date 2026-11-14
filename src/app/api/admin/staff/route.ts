import { NextRequest, NextResponse } from 'next/server';
import {
  getAllStaff,
  addStaffMember,
  updateStaffMember,
  deleteStaffMember,
  isOwner,
} from '@/lib/staffService';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const staff = getAllStaff();
    return NextResponse.json({ success: true, staff });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  // Only Owner can add new staff
  if (!isOwner(auth.user?.email || '')) {
    return NextResponse.json(
      { success: false, error: 'Only the Brand Owner can invite or create staff members' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const created = addStaffMember(body);
    return NextResponse.json({ success: true, staff: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  if (!isOwner(auth.user?.email || '')) {
    return NextResponse.json(
      { success: false, error: 'Only the Brand Owner can modify staff permissions or roles' },
      { status: 403 }
    );
  }

  try {
    const { id, ...updates } = await req.json();
    const updated = updateStaffMember(id, updates);
    return NextResponse.json({ success: !!updated, staff: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  if (!isOwner(auth.user?.email || '')) {
    return NextResponse.json(
      { success: false, error: 'Only the Brand Owner can remove staff members' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    const deleted = deleteStaffMember(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
