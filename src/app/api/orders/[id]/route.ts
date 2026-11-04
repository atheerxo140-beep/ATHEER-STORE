import { NextRequest, NextResponse } from 'next/server';
import { getOrderByIdOrReference } from '@/lib/orderService';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

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

    // Check if requester is an authenticated administrator
    const adminAuth = await verifyAdminRequest(req);
    if (adminAuth.authorized) {
      // Admins receive full unmasked customer and order records
      return NextResponse.json({
        success: true,
        order,
      });
    }

    // For public receipt inquiries (e.g. /order-success?ref=...),
    // protect customer PII against scraping and IDOR attacks by masking sensitive data:
    const maskPhone = (phone: string) => {
      if (phone.length <= 4) return '***';
      return phone.slice(0, 3) + '*****' + phone.slice(-3);
    };

    const maskEmail = (email?: string) => {
      if (!email) return undefined;
      const parts = email.split('@');
      if (parts.length < 2) return '***@***';
      return parts[0].slice(0, 2) + '***@' + parts[1];
    };

    const sanitizedOrder = {
      ...order,
      customerPhone: maskPhone(order.customerPhone),
      customerEmail: maskEmail(order.customerEmail),
      shippingAddress: `[Delivery details verified privately with customer for dispatch]`,
    };

    return NextResponse.json({
      success: true,
      order: sanitizedOrder,
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
