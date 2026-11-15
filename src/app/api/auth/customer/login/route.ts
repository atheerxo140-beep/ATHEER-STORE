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
    const rawInput = (body.email || body.phone || body.identifier || '').trim();
    const password = body.password || body.pass;

    if (!rawInput) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني' },
        { status: 400 }
      );
    }

    const cleanDigits = rawInput.replace(/[^0-9]/g, '');
    const isPhoneNumber = cleanDigits.length >= 8 && /^(\+?20|0)?1[0125]/.test(rawInput);
    const cleanEmail = rawInput.toLowerCase();

    const customers = getCustomers();
    let customer = customers.find((c) => {
      if (isPhoneNumber && c.phone && c.phone.replace(/[^0-9]/g, '').endsWith(cleanDigits.slice(-10))) {
        return true;
      }
      if (c.email && c.email.toLowerCase() === cleanEmail) {
        return true;
      }
      return false;
    });

    if (!customer) {
      // Auto-register customer on first phone or email login
      const generatedEmail = isPhoneNumber
        ? `${cleanDigits}@customer.atheer.store`
        : cleanEmail;

      customer = {
        id: `cust-${Date.now()}`,
        email: generatedEmail,
        fullName: isPhoneNumber ? `عميل أثير (${cleanDigits.slice(-4)})` : cleanEmail.split('@')[0],
        phone: isPhoneNumber ? cleanDigits : '',
        preferredLanguage: 'ar',
        tier: 'Bronze',
        addresses: [],
        createdAt: new Date().toISOString(),
      };
      customers.push(customer);
      try {
        fs.writeFileSync(getCustomersStorePath(), JSON.stringify(customers, null, 2), 'utf8');
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      customer,
      message: 'تم تسجيل الدخول وتفعيل كارت الولاء بنجاح',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'حدث خطأ في تسجيل الدخول' },
      { status: 500 }
    );
  }
}
