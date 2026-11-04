import { NextRequest, NextResponse } from 'next/server';
import {
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethodActive,
} from '@/data/paymentMethodsStore';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  const methods = getPaymentMethods();
  return NextResponse.json({
    success: true,
    methods,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json();
    const { nameEn, nameAr, type, descriptionEn, descriptionAr, accountDetails, instructionsEn, instructionsAr } = body;

    if (!nameEn || !nameAr) {
      return NextResponse.json(
        { success: false, error: 'Name in English and Arabic are required.' },
        { status: 400 }
      );
    }

    const created = addPaymentMethod({
      nameEn,
      nameAr,
      type: type || 'custom',
      descriptionEn: descriptionEn || '',
      descriptionAr: descriptionAr || '',
      accountDetails: accountDetails || '',
      instructionsEn: instructionsEn || '',
      instructionsAr: instructionsAr || '',
      isActive: true,
      isDefault: false,
    });

    return NextResponse.json({
      success: true,
      method: created,
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
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Payment method ID is required.' }, { status: 400 });
    }

    if (action === 'toggle') {
      const toggled = togglePaymentMethodActive(id);
      if (!toggled) {
        return NextResponse.json({ success: false, error: 'Payment method not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, method: toggled });
    }

    const updated = updatePaymentMethod(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Payment method not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      method: updated,
    });
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
      return NextResponse.json({ success: false, error: 'Payment method ID is required.' }, { status: 400 });
    }

    if (id === 'cod') {
      return NextResponse.json(
        { success: false, error: 'Cash on Delivery is the baseline method and cannot be deleted.' },
        { status: 400 }
      );
    }

    const deleted = deletePaymentMethod(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Payment method not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
