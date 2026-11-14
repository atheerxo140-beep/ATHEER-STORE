import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getAdminPasswordHash, verifyPassword } from '@/lib/adminCredentials';
import { DEV_ADMIN_TOKEN } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' },
        { status: 400 }
      );
    }

    const cleanInputEmail = email.trim().toLowerCase();
    const currentAdminEmail = getAdminEmail().toLowerCase();
    const storedPasswordHash = getAdminPasswordHash();

    // Check custom credentials
    if (storedPasswordHash) {
      const isEmailMatch = cleanInputEmail === currentAdminEmail;
      const isPassMatch = verifyPassword(password, storedPasswordHash);

      if (!isEmailMatch || !isPassMatch) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
          { status: 401 }
        );
      }

      // Valid custom credentials!
      return NextResponse.json({
        success: true,
        token: DEV_ADMIN_TOKEN,
        email: currentAdminEmail,
        message: 'تم تسجيل الدخول بنجاح',
      });
    }

    // Default development fallback if no custom password set yet
    if (cleanInputEmail === currentAdminEmail || cleanInputEmail === 'admin@atheer.store') {
      return NextResponse.json({
        success: true,
        token: DEV_ADMIN_TOKEN,
        email: currentAdminEmail,
        message: 'تم تسجيل الدخول بنجاح',
      });
    }

    return NextResponse.json(
      { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
