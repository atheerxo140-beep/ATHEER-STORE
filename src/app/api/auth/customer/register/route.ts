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
    const fullName = body.fullName;
    const phone = body.phone;

    if (!email || !fullName) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال الاسم والبريد الإلكتروني' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const customers = getCustomers();

    let customer = customers.find((c) => c.email.toLowerCase() === cleanEmail);

    if (customer) {
      customer.fullName = fullName.trim();
      if (phone) customer.phone = phone.trim();
    } else {
      customer = {
        id: `cust-${Date.now()}`,
        email: cleanEmail,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : '',
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

    return NextResponse.json({
      success: true,
      customer,
      message: 'تم إنشاء الحساب بنجاح',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
