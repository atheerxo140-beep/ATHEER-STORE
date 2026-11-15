import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getAllLocalOrders } from '@/data/localOrdersStore';
import { getAllLoyaltyAccounts } from '@/lib/loyaltyService';
import { getStoreFilePath } from '@/lib/storePath';

export const dynamic = 'force-dynamic';

function getCustomersStorePath(): string {
  try {
    return getStoreFilePath('customers_store.json');
  } catch (e) {
    return path.join(process.cwd(), 'src', 'data', 'customers_store.json');
  }
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    let registeredCustomers: any[] = [];
    const custPath = getCustomersStorePath();
    if (fs.existsSync(custPath)) {
      registeredCustomers = JSON.parse(fs.readFileSync(custPath, 'utf8'));
    }

    const allOrders = getAllLocalOrders();
    const loyaltyAccounts = getAllLoyaltyAccounts();

    // Map registered customers with calculated metrics
    const customerMap = new Map<string, any>();

    for (const cust of registeredCustomers) {
      const email = cust.email.toLowerCase().trim();
      const matchingOrders = allOrders.filter(
        (o) =>
          (o.customerId && o.customerId === cust.id) ||
          (o.customerEmail && o.customerEmail.toLowerCase().trim() === email) ||
          (cust.phone && o.customerPhone && o.customerPhone.replace(/\D/g, '') === cust.phone.replace(/\D/g, ''))
      );

      const totalSpend = matchingOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const loyalty = loyaltyAccounts.find((l) => l.customerEmail.toLowerCase().trim() === email);

      customerMap.set(email, {
        id: cust.id,
        isRegistered: true,
        fullName: cust.fullName,
        email: cust.email,
        phone: cust.phone || '',
        addresses: cust.addresses || [],
        tier: loyalty?.tier || cust.tier || 'Bronze',
        stamps: loyalty?.stampsCount || 0,
        totalOrders: matchingOrders.length,
        totalSpend,
        lastOrderDate: matchingOrders[0]?.createdAt || cust.createdAt,
        createdAt: cust.createdAt,
      });
    }

    // Also include guest checkout clients from orders
    for (const order of allOrders) {
      const email = (order.customerEmail || `${order.customerPhone}@guest.atheer.store`).toLowerCase().trim();
      if (!customerMap.has(email)) {
        const guestOrders = allOrders.filter((o) => o.customerPhone === order.customerPhone);
        const guestSpend = guestOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        customerMap.set(email, {
          id: `guest-${order.customerPhone}`,
          isRegistered: false,
          fullName: order.customerName,
          email: order.customerEmail || '(طلب ضيف برقم الهاتف)',
          phone: order.customerPhone,
          addresses: [
            {
              id: 'guest-addr',
              label: 'عنوان التوصيل',
              governorate: order.governorate || '',
              city: order.shippingCity || '',
              streetAddress: order.shippingAddress || '',
            },
          ],
          tier: 'Guest',
          stamps: 0,
          totalOrders: guestOrders.length,
          totalSpend: guestSpend,
          lastOrderDate: order.createdAt,
          createdAt: order.createdAt,
        });
      }
    }

    const customers = Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.lastOrderDate || 0).getTime() - new Date(a.lastOrderDate || 0).getTime()
    );

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
