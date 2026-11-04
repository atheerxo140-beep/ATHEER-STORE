import { NextRequest, NextResponse } from 'next/server';
import { getOrderByIdOrReference } from '@/lib/orderService';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const order = await getOrderByIdOrReference(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: `Order with reference "${orderId}" not found.`,
          errorAr: `الطلب برقم "${orderId}" غير موجود.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve order details.',
      },
      { status: 500 }
    );
  }
}
