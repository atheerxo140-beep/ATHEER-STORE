import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getAdminEmail, setAdminCredentials, getAdminPasswordHash, verifyPassword } from '@/lib/adminCredentials';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  return NextResponse.json({
    success: true,
    email: getAdminEmail(),
  });
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json();
    const { email, newPassword, currentPassword } = body;

    // Validate email format
    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'برجاء إدخال بريد إلكتروني صحيح' },
        { status: 400 }
      );
    }

    // If changing password, verify minimum length
    if (newPassword && newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'يجب ألا تقل كلمة المرور عن 6 أحرف أو أرقام' },
        { status: 400 }
      );
    }

    // If existing password exists, verify current password before updating
    const existingHash = getAdminPasswordHash();
    if (existingHash && currentPassword) {
      const isCurrentValid = verifyPassword(currentPassword, existingHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, error: 'كلمة المرور الحالية غير صحيحة' },
          { status: 400 }
        );
      }
    }

    setAdminCredentials(email, newPassword);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث البريد الإلكتروني وكلمة المرور بنجاح وبسرية تامة.',
      email: getAdminEmail(),
    });
  } catch (error: any) {
    console.error('Error updating admin credentials:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في تحديث بيانات الدخول' },
      { status: 500 }
    );
  }
}
