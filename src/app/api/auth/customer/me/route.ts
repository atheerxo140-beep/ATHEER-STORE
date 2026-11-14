import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const STORE_PATH = path.join(process.cwd(), 'src', 'data', 'customers_store.json');

function getCustomers(): any[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
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
        fs.writeFileSync(STORE_PATH, JSON.stringify(customers, null, 2), 'utf8');
      } catch (e) {}
    }

    return NextResponse.json({ success: true, customer: customers[idx] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
