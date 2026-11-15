import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getAdminPasswordHash, verifyPassword, signAdminToken } from '@/lib/adminCredentials';

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
    const currentAdminEmail = getAdminEmail().trim().toLowerCase();
    const storedPasswordHash = getAdminPasswordHash();

    // Check custom credentials
    if (storedPasswordHash) {
      const isEmailMatch = cleanInputEmail === currentAdminEmail;
      const isPassMatch = verifyPassword(password, storedPasswordHash);

      if (!isEmailMatch || !isPassMatch) {
        return NextResponse.json(
          {
            success: false,
            error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          },
          { status: 401 }
        );
      }

      // Valid verified credentials!
      const sessionToken = signAdminToken(currentAdminEmail);
      const res = NextResponse.json({
        success: true,
        token: sessionToken,
        email: currentAdminEmail,
        message: 'تم تسجيل الدخول بنجاح',
      });
      res.cookies.set('atheer_admin_token', sessionToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
      return res;
    }

    // STRICT SECURITY: Forbid any insecure default credentials
    return NextResponse.json(
      {
        success: false,
        error: 'لم يتم تعيين كلمة مرور المسؤول بعد. يرجى إعداد كلمة مرور آمنة لحساب المالك (Owner) عبر متغيرات البيئة أو واجهة الإعداد.',
        requiresSetup: true,
      },
      { status: 401 }
    );

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
