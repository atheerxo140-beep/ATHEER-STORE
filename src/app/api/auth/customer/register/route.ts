import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getStoreFilePath } from '@/lib/storePath';
import { normalizeEgyptianPhone, arePhonesEqual } from '@/lib/phoneUtils';

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
    const fullName = (body.fullName || '').trim();
    const rawPhone = (body.phone || '').trim();
    const normalizedPhone = normalizeEgyptianPhone(rawPhone);

    if (!fullName) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال اسمك بالكامل' },
        { status: 400 }
      );
    }

    if (!email && !normalizedPhone) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال رقم هاتفك المحمول أو بريدك الإلكتروني' },
        { status: 400 }
      );
    }

    // Auto-generate clean synthetic email if registered via phone only
    const isSyntheticEmail = !email && Boolean(normalizedPhone);
    if (isSyntheticEmail) {
      email = `${normalizedPhone}@customer.atheer.store`;
    }

    const customers = getCustomers();

    // 1. Check if phone is already registered with any customer
    if (normalizedPhone) {
      const existingByPhone = customers.find(
        (c) => c.phone && arePhonesEqual(c.phone, normalizedPhone)
      );
      if (existingByPhone) {
        return NextResponse.json(
          {
            success: false,
            error: 'رقم الهاتف هذا مسجل بالفعل لدينا. يرجى تسجيل الدخول بحسابك مباشرة للمحافظة على كارت الولاء والمكافآت الخاصة بك.',
            code: 'PHONE_EXISTS',
            existingPhone: normalizedPhone,
          },
          { status: 409 }
        );
      }
    }

    // 2. Check if real email is already registered
    if (!isSyntheticEmail && email) {
      const existingByEmail = customers.find(
        (c) => c.email && c.email.toLowerCase() === email
      );
      if (existingByEmail) {
        return NextResponse.json(
          {
            success: false,
            error: 'هذا البريد الإلكتروني مسجل بالفعل لدينا. يرجى تسجيل الدخول بحسابك مباشرة للمحافظة على كارت الولاء والمكافآت الخاصة بك.',
            code: 'EMAIL_EXISTS',
            existingEmail: email,
          },
          { status: 409 }
        );
      }
    }

    // 3. Create fresh new customer
    const newCustomer = {
      id: `cust-${Date.now()}`,
      email,
      fullName,
      phone: normalizedPhone,
      preferredLanguage: 'ar',
      tier: 'Bronze',
      addresses: [],
      createdAt: new Date().toISOString(),
    };

    customers.push(newCustomer);

    try {
      fs.writeFileSync(getCustomersStorePath(), JSON.stringify(customers, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing to customers store', e);
    }

    // 4. Initialize loyalty account with welcome perks and 1 stamp
    try {
      const { getLoyaltyAccount } = await import('@/lib/loyaltyService');
      getLoyaltyAccount(email, fullName);
    } catch (loyaltyErr) {
      console.warn('Loyalty initialization error:', loyaltyErr);
    }

    return NextResponse.json({
      success: true,
      customer: newCustomer,
      message: 'تم إنشاء الحساب وتفعيل كارت الولاء بنجاح',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
