import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getAllLocalOrders } from '@/data/localOrdersStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'all'; // 'today' | '7days' | '30days' | 'all'

    let orders = getAllLocalOrders();
    const now = new Date();

    if (range === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      orders = orders.filter((o) => new Date(o.createdAt).getTime() >= startOfDay);
    } else if (range === '7days') {
      const past7 = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      orders = orders.filter((o) => new Date(o.createdAt).getTime() >= past7);
    } else if (range === '30days') {
      const past30 = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      orders = orders.filter((o) => new Date(o.createdAt).getTime() >= past30);
    }

    const totalOrders = orders.length;
    const grossRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const nonCancelled = orders.filter((o) => o.orderStatus !== 'cancelled');
    const netRevenue = nonCancelled.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const deliveredRevenue = orders
      .filter((o) => o.orderStatus === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0;

    // Status breakdown
    const statusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const o of orders) {
      const s = o.orderStatus || 'pending';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    }

    // Governorate breakdown
    const governoratesMap: Record<string, { count: number; revenue: number }> = {};
    for (const o of orders) {
      const gov = o.governorate || 'القاهرة (Cairo)';
      if (!governoratesMap[gov]) {
        governoratesMap[gov] = { count: 0, revenue: 0 };
      }
      governoratesMap[gov].count += 1;
      governoratesMap[gov].revenue += o.totalAmount || 0;
    }
    const governoratesBreakdown = Object.entries(governoratesMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Product & Category breakdown
    const productSalesMap: Record<string, { nameEn: string; nameAr: string; quantity: number; revenue: number }> = {};
    for (const o of orders) {
      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          const key = item.productId || item.productNameEn;
          if (!productSalesMap[key]) {
            productSalesMap[key] = {
              nameEn: item.productNameEn,
              nameAr: item.productNameAr,
              quantity: 0,
              revenue: 0,
            };
          }
          productSalesMap[key].quantity += item.quantity || 1;
          productSalesMap[key].revenue += item.totalPrice || item.unitPrice * (item.quantity || 1);
        }
      }
    }
    const topProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      success: true,
      range,
      metrics: {
        totalOrders,
        grossRevenue,
        netRevenue,
        deliveredRevenue,
        averageOrderValue,
      },
      statusCounts,
      governoratesBreakdown,
      topProducts,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
