import { NextRequest, NextResponse } from 'next/server';
import { createOrder, CreateOrderInput } from '@/lib/orderService';
import { getAllLocalOrders, StoredOrder } from '@/data/localOrdersStore';
import { isSupabaseConfigured, getSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSearch = searchParams.get('search') || searchParams.get('q') || searchParams.get('query') || '';
    const search = rawSearch.trim();

    const localOrders = getAllLocalOrders();

    if (!search) {
      return NextResponse.json({
        success: true,
        count: localOrders.length,
        orders: localOrders,
      });
    }

    const searchLower = search.toLowerCase();
    const digitsOnly = search.replace(/[^0-9]/g, '');

    // Extract core phone digits for Egyptian mobile numbers (without +20 or leading 0)
    let corePhoneDigits = digitsOnly;
    if (corePhoneDigits.startsWith('20') && corePhoneDigits.length >= 11) {
      corePhoneDigits = corePhoneDigits.slice(2);
    }
    if (corePhoneDigits.startsWith('0') && corePhoneDigits.length >= 10) {
      corePhoneDigits = corePhoneDigits.slice(1);
    }

    // 1. Filter local orders
    const matchedLocal = localOrders.filter((o) => {
      // A. Match order reference (e.g. ATH-001092 or 001092)
      if (o.orderReference && o.orderReference.toLowerCase().includes(searchLower)) {
        return true;
      }
      if (o.id && o.id.toLowerCase() === searchLower) {
        return true;
      }

      // B. Match email
      if (o.customerEmail && o.customerEmail.toLowerCase().includes(searchLower)) {
        return true;
      }

      // C. Match phone
      if (digitsOnly.length >= 6) {
        const orderDigits = (o.customerPhone || '').replace(/[^0-9]/g, '');
        let orderCore = orderDigits;
        if (orderCore.startsWith('20') && orderCore.length >= 11) {
          orderCore = orderCore.slice(2);
        }
        if (orderCore.startsWith('0') && orderCore.length >= 10) {
          orderCore = orderCore.slice(1);
        }

        if (orderDigits.includes(digitsOnly) || digitsOnly.includes(orderDigits)) {
          return true;
        }
        if (corePhoneDigits.length >= 6 && orderCore.includes(corePhoneDigits)) {
          return true;
        }
      }

      return false;
    });

    // 2. Query Supabase if configured and merge
    const matchedSupabase: StoredOrder[] = [];
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        try {
          let sbQuery = supabase.from('orders').select('*, order_items(*)');

          if (search.includes('@')) {
            sbQuery = sbQuery.ilike('customer_email', `%${search}%`);
          } else if (digitsOnly.length >= 6) {
            sbQuery = sbQuery.or(
              `customer_phone.ilike.%${digitsOnly}%,customer_phone.ilike.%${corePhoneDigits}%,order_reference.ilike.%${search}%`
            );
          } else {
            sbQuery = sbQuery.ilike('order_reference', `%${search}%`);
          }

          const { data, error } = await sbQuery.order('created_at', { ascending: false }).limit(20);

          if (!error && Array.isArray(data)) {
            data.forEach((row: any) => {
              matchedSupabase.push({
                id: row.id,
                orderReference: row.order_reference,
                customerName: row.customer_name,
                customerPhone: row.customer_phone,
                customerEmail: row.customer_email,
                shippingCountry: row.shipping_country || 'مصر',
                shippingCity: row.shipping_city,
                shippingAddress: row.shipping_address,
                shippingPostalCode: row.shipping_postal_code,
                shippingZoneId: row.shipping_zone_id,
                shippingZoneNameEn: row.shipping_zone_id,
                shippingZoneNameAr: row.shipping_zone_id,
                subtotal: Number(row.subtotal || 0),
                shippingFee: Number(row.shipping_fee || 0),
                totalAmount: Number(row.total_amount || 0),
                currency: 'EGP',
                paymentMethod: 'cash_on_delivery',
                paymentStatus: row.payment_status || 'pending_cod',
                orderStatus: row.order_status || 'confirmed',
                notes: row.notes,
                createdAt: row.created_at,
                backendStorage: 'supabase',
                items: (row.order_items || []).map((item: any) => ({
                  productId: item.product_id,
                  productNameEn: item.product_name_en,
                  productNameAr: item.product_name_ar,
                  selectedSize: item.selected_size,
                  selectedColor: item.selected_color,
                  unitPrice: Number(item.unit_price || 0),
                  quantity: item.quantity || 1,
                  totalPrice: Number(item.total_price || 0),
                  image: '',
                  gsm: 500,
                })),
              });
            });
          }
        } catch (e) {
          console.warn('[Orders Search Supabase error]', e);
        }
      }
    }

    // Merge and deduplicate by id or orderReference
    const allMatches: StoredOrder[] = [...matchedLocal];
    for (const sbOrder of matchedSupabase) {
      const exists = allMatches.some(
        (o) => o.id === sbOrder.id || o.orderReference.toLowerCase() === sbOrder.orderReference.toLowerCase()
      );
      if (!exists) {
        allMatches.push(sbOrder);
      }
    }

    // Sort by createdAt descending (most recent first)
    allMatches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      count: allMatches.length,
      orders: allMatches,
    });
  } catch (error: any) {
    console.error('[API Orders GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
