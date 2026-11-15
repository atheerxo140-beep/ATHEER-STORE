import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getAdminPasswordHash, setAdminCredentials, verifyPassword, hashPassword } from '@/lib/adminCredentials';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { logAuditEvent } from '@/lib/auditService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: 'يجب ألا تقل كلمة المرور الآمنة عن 8 أحرف أو أرقام معقدة.' },
        { status: 400 }
      );
    }

    const currentHash = getAdminPasswordHash();
    const adminEmail = getAdminEmail().toLowerCase().trim();

    // Case 1: First-time setup (no password hash configured yet)
    if (!currentHash) {
      setAdminCredentials(adminEmail, newPassword.trim());
      logAuditEvent(adminEmail, 'PASSWORD_INIT', 'Security', 'Owner configured initial secure administrator password');
      return NextResponse.json({
        success: true,
        message: 'تم تعيين كلمة المرور الآمنة لحساب المالك لأول مرة بنجاح.',
      });
    }

    // Case 2: Existing password exists - require authentication OR current password
    const auth = await verifyAdminRequest(req);
    let isAuthorized = auth.authorized;

    if (!isAuthorized && currentPassword) {
      if (email && email.toLowerCase().trim() === adminEmail) {
        isAuthorized = verifyPassword(currentPassword, currentHash);
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح: كلمة المرور الحالية غير صحيحة أو يلزم تسجيل الدخول.' },
        { status: 401 }
      );
    }

    setAdminCredentials(adminEmail, newPassword.trim());
    logAuditEvent(adminEmail, 'PASSWORD_RESET', 'Security', 'Owner successfully reset administrator password');

    return NextResponse.json({
      success: true,
      message: 'تم تحديث وإعادة تعيين كلمة المرور بنجاح وبسرية تامة.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'حدث خطأ أثناء معالجة كلمة المرور' },
      { status: 500 }
    );
  }
}
