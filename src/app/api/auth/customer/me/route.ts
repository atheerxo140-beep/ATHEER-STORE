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

export async function PUT(req: NextRequest) {
  try {
    const { customerId, updates } = await req.json();

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Customer ID required' }, { status: 400 });
    }

    const customers = getCustomers();
    const idx = customers.findIndex((c) => c.id === customerId);

    if (idx !== -1) {
      customers[idx] = { ...customers[idx], ...updates };
      try {
        fs.writeFileSync(getCustomersStorePath(), JSON.stringify(customers, null, 2), 'utf8');
      } catch (e) {}
    }

    return NextResponse.json({ success: true, customer: customers[idx] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
