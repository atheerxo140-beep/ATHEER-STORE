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
    const email = body.email;
    const password = body.password || body.pass;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const customers = getCustomers();
    let customer = customers.find((c) => c.email.toLowerCase() === cleanEmail);

    if (!customer) {
      // Auto-register or guest-to-customer conversion on first login
      customer = {
        id: `cust-${Date.now()}`,
        email: cleanEmail,
        fullName: cleanEmail.split('@')[0],
        phone: '',
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
      message: 'تم تسجيل الدخول بنجاح',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'حدث خطأ في تسجيل الدخول' },
      { status: 500 }
    );
  }
}
