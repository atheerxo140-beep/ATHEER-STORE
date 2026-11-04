import { NextRequest, NextResponse } from 'next/server';
import { getActivePaymentMethods } from '@/data/paymentMethodsStore';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const methods = getActivePaymentMethods();
    return NextResponse.json({
      success: true,
      methods,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve active payment methods' },
      { status: 500 }
    );
  }
}
