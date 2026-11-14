import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/subscriberService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, locale } = await req.json();
    const result = addSubscriber(email, locale || 'ar');
    return NextResponse.json({
      success: true,
      isNew: result.isNew,
      message: 'شكراً لانضمامك إلى قائمة إصدارات أثير الحصرية',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
