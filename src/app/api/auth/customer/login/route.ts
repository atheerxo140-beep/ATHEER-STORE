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
    const rawInput = (body.email || body.phone || body.identifier || '').trim();

    if (!rawInput) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني' },
        { status: 400 }
      );
    }

    const cleanDigits = rawInput.replace(/[^0-9]/g, '');
    const isPhoneNumber = cleanDigits.length >= 8 && /^(\+?20|0)?1[0125]/.test(rawInput);
    const normalizedPhone = isPhoneNumber ? normalizeEgyptianPhone(rawInput) : '';
    const cleanEmail = rawInput.toLowerCase();

    const customers = getCustomers();

    // Find the customer deterministically
    const customer = customers.find((c) => {
      // 1. Phone matching
      if (normalizedPhone && c.phone && arePhonesEqual(c.phone, normalizedPhone)) {
        return true;
      }
      // 2. Phone prefix match in synthetic email (e.g. 01015993802@customer.atheer.store)
      if (normalizedPhone && c.email && c.email.includes(normalizedPhone.slice(-10))) {
        return true;
      }
      // 3. Email matching
      if (c.email && c.email.toLowerCase() === cleanEmail) {
        return true;
      }
      return false;
    });

    if (!customer) {
      // Strict preservation: Do not auto-register ghost accounts!
      return NextResponse.json(
        {
          success: false,
          error: 'لم نتمكن من العثور على حساب مسجل برقم الهاتف أو البريد المدخل. يرجى التأكد من الرقم أو إنشاء حساب جديد للحصول على كارت الولاء VIP.',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Retrieve active loyalty card and rewards
    let loyaltyAccount = null;
    try {
      const { getLoyaltyAccount } = await import('@/lib/loyaltyService');
      loyaltyAccount = getLoyaltyAccount(customer.email, customer.fullName);
    } catch (loyaltyErr) {
      console.warn('Loyalty retrieval warning on login:', loyaltyErr);
    }

    return NextResponse.json({
      success: true,
      customer,
      loyaltyAccount,
      message: 'تم تسجيل الدخول وتفعيل كارت الولاء بنجاح',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'حدث خطأ في تسجيل الدخول' },
      { status: 500 }
    );
  }
}
