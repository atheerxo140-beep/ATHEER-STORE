import { NextRequest, NextResponse } from 'next/server';
import {
  getAllLocalOrders,
  localOrdersStore,
  isValidStatusTransition,
  OrderStatus,
  PaymentStatus,
} from '@/data/localOrdersStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search')?.toLowerCase().trim();
    const dateFilter = searchParams.get('date'); // 'today', 'week', 'month', 'all'

    let orders = getAllLocalOrders();

    if (status && status !== 'all') {
      orders = orders.filter((o) => o.orderStatus === status);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      orders = orders.filter((o) => o.paymentStatus === paymentStatus);
    }

    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      if (dateFilter === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        orders = orders.filter((o) => new Date(o.createdAt).getTime() >= todayStart);
      } else if (dateFilter === 'week') {
        const weekAgo = now.getTime() - 7 * 24 * 3600 * 1000;
        orders = orders.filter((o) => new Date(o.createdAt).getTime() >= weekAgo);
      } else if (dateFilter === 'month') {
        const monthAgo = now.getTime() - 30 * 24 * 3600 * 1000;
        orders = orders.filter((o) => new Date(o.createdAt).getTime() >= monthAgo);
      }
    }

    if (search) {
      orders = orders.filter(
        (o) =>
          o.orderReference.toLowerCase().includes(search) ||
          o.customerName.toLowerCase().includes(search) ||
          o.customerPhone.includes(search) ||
          o.shippingCity.toLowerCase().includes(search) ||
          (o.governorate && o.governorate.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, orderStatus, paymentStatus, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID or reference is required' }, { status: 400 });
    }

    const order = localOrdersStore.find((o) => o.id === id || o.orderReference === id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (orderStatus) {
      const current = order.orderStatus;
      const target = orderStatus as OrderStatus;

      // Validate transition
      if (!isValidStatusTransition(current, target)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status transition from "${current}" to "${target}". Terminal statuses (delivered, cancelled) cannot be reopened.`,
          },
          { status: 400 }
        );
      }

      order.orderStatus = target;

      // Automatically sync payment if delivered
      if (target === 'delivered' && order.paymentStatus === 'pending_cod') {
        order.paymentStatus = 'paid_on_delivery';
      } else if (target === 'cancelled' && order.paymentStatus === 'pending_cod') {
        order.paymentStatus = 'cancelled';
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus as PaymentStatus;
    }

    if (notes !== undefined) {
      order.notes = notes;
    }

    order.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
