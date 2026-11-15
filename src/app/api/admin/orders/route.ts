import { NextRequest, NextResponse } from 'next/server';
import {
  getAllLocalOrders,
  saveLocalOrder,
  localOrdersStore,
  isValidStatusTransition,
  OrderStatus,
  PaymentStatus,
  StoredOrder,
  clearAllLocalOrders,
  deleteLocalOrder,
} from '@/data/localOrdersStore';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search')?.toLowerCase().trim();
    const dateFilter = searchParams.get('date');

    // Query Supabase directly if configured
    let orders: StoredOrder[] = [];
    let isFromSupabase = false;
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            isFromSupabase = true;
            orders = data.map((o: any) => ({
              id: o.id,
              orderReference: o.order_reference,
              customerId: o.customer_id,
              customerName: o.customer_name,
              customerPhone: o.customer_phone,
              customerEmail: o.customer_email,
              shippingCountry: o.shipping_country || 'Egypt',
              governorate: o.governorate,
              shippingCity: o.shipping_city,
              shippingAddress: o.shipping_address,
              shippingPostalCode: o.shipping_postal_code,
              shippingZoneId: o.shipping_zone_id,
              shippingZoneNameEn: o.shipping_zone_id,
              shippingZoneNameAr: o.shipping_zone_id,
              subtotal: Number(o.subtotal),
              shippingFee: Number(o.shipping_fee),
              totalAmount: Number(o.total_amount),
              currency: o.currency || 'EGP',
              paymentMethod: o.payment_method,
              paymentStatus: o.payment_status,
              orderStatus: o.order_status,
              notes: o.notes,
              createdAt: o.created_at,
              backendStorage: 'supabase',
              items: (o.order_items || []).map((item: any) => ({
                productId: item.product_id,
                productNameEn: item.product_name_en,
                productNameAr: item.product_name_ar,
                selectedSize: item.selected_size,
                selectedColor: item.selected_color,
                unitPrice: Number(item.unit_price),
                quantity: item.quantity,
                totalPrice: Number(item.total_price),
                image: '',
                gsm: 500,
              })),
            }));
          }
        } catch (dbErr) {
          console.warn('[AdminOrders] Supabase fetch fallback to local:', dbErr);
        }
      }
    }

    // Only if Supabase was NOT configured or failed, use local orders
    if (!isFromSupabase) {
      orders = getAllLocalOrders();
    }

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
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

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

      // Automatically sync payment and loyalty if delivered
      if (target === 'delivered') {
        if (order.paymentStatus === 'pending_cod') {
          order.paymentStatus = 'paid_on_delivery';
        }
        try {
          const { awardStampsForOrder } = await import('@/lib/loyaltyService');
          awardStampsForOrder(
            order.customerEmail || `${order.customerPhone}@customer.atheer.store`,
            order.customerName,
            order.orderReference,
            order.totalAmount
          );
        } catch (loyaltyErr) {
          console.warn('[AdminOrders] Loyalty stamp award notice on delivery:', loyaltyErr);
        }
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
    saveLocalOrder(order);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        try {
          const dbPaymentStatus = ['pending_cod', 'paid_on_delivery', 'cancelled'].includes(order.paymentStatus)
            ? order.paymentStatus
            : 'pending_cod';

          await supabase
            .from('orders')
            .update({
              order_status: order.orderStatus,
              payment_status: dbPaymentStatus,
              notes: order.notes,
              updated_at: order.updatedAt,
            })
            .or(`id.eq.${order.id},order_reference.eq.${order.orderReference}`);
        } catch (dbErr) {
          console.warn('[AdminOrders] Supabase update warning:', dbErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('all') === 'true';

    if (clearAll) {
      // 1. Delete all order items & orders in Supabase
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseServer();
        if (supabase) {
          try {
            await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          } catch (dbErr) {
            console.error('[AdminOrders] Error clearing Supabase orders:', dbErr);
          }
        }
      }

      // 2. Clear local orders in memory and disk
      clearAllLocalOrders();

      return NextResponse.json({
        success: true,
        message: 'All test orders and sales metrics have been completely reset to zero.',
      });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID or all=true is required.' }, { status: 400 });
    }

    // Single order deletion
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        try {
          await supabase.from('order_items').delete().eq('order_id', id);
          await supabase.from('orders').delete().or(`id.eq.${id},order_reference.eq.${id}`);
        } catch (dbErr) {
          console.error('[AdminOrders] Error deleting order from Supabase:', dbErr);
        }
      }
    }

    deleteLocalOrder(id);

    return NextResponse.json({
      success: true,
      message: `Order ${id} deleted successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
