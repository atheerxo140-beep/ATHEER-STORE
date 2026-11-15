import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getStoreFilePath } from '@/lib/storePath';

export const dynamic = 'force-dynamic';

function getCustomersStorePath(): string {
  try {
    return getStoreFilePath('customers_store.json');
  } catch (e) {
    return path.join(process.cwd(), 'src', 'data', 'customers_store.json');
  }
}

function getCustomers(): any[] {
  try {
    const storePath = getCustomersStorePath();
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading customers store', e);
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let email = (body.email || '').trim().toLowerCase();
    const password = body.password || body.pass || '123456';
    const fullName = (body.fullName || '').trim();
    let phone = (body.phone || '').trim().replace(/[^0-9]/g, '');

    // Allow phone-based registration if email is not provided
    if (!fullName) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال اسمك بالكامل' },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال رقم هاتفك المحمول أو بريدك الإلكتروني' },
        { status: 400 }
      );
    }

    // Auto-generate clean synthetic email if registered via phone
    if (!email && phone) {
      email = `${phone}@customer.atheer.store`;
    }

    const customers = getCustomers();

    // Check if customer exists by email or phone
    let customer = customers.find((c) => {
      if (email && c.email && c.email.toLowerCase() === email) return true;
      if (phone && c.phone && c.phone.replace(/[^0-9]/g, '') === phone) return true;
      return false;
    });

    if (customer) {
      customer.fullName = fullName;
      if (phone) customer.phone = phone;
    } else {
      customer = {
        id: `cust-${Date.now()}`,
        email,
        fullName,
        phone: phone || '',
        preferredLanguage: 'ar',
        tier: 'Bronze',
        addresses: [],
        createdAt: new Date().toISOString(),
      };
      customers.push(customer);
    }

    try {
      fs.writeFileSync(getCustomersStorePath(), JSON.stringify(customers, null, 2), 'utf8');
    } catch (e) {}

    // Initialize loyalty account with welcome perks
    try {
      const { getLoyaltyAccount } = await import('@/lib/loyaltyService');
      getLoyaltyAccount(email, fullName);
    } catch (loyaltyErr) {
      console.warn('Loyalty initialization error:', loyaltyErr);
    }

    return NextResponse.json({
      success: true,
      customer,
      message: 'تم إنشاء الحساب وتفعيل كارت الولاء بنجاح',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
