import { NextRequest, NextResponse } from 'next/server';
import { createOrder, CreateOrderInput } from '@/lib/orderService';
import { getAllLocalOrders } from '@/data/localOrdersStore';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateOrderInput;
    const result = await createOrder(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          errorAr: result.errorAr,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: result.order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API Order Creation Exception]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal server error occurred while processing your order.',
        errorAr: 'حدث خطأ داخلي في الخادم أثناء معالجة الطلب.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const orders = getAllLocalOrders();
  return NextResponse.json({
    success: true,
    count: orders.length,
    orders,
  });
}
