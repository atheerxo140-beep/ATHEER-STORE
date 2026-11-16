import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getLoyaltyAccount, getLoyaltyConfig, validateLoyaltyVoucher } from '@/lib/loyaltyService';
import { getStoreFilePath } from '@/lib/storePath';
import { normalizeEgyptianPhone, arePhonesEqual } from '@/lib/phoneUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let email = searchParams.get('email') || req.headers.get('x-customer-email');
    const phoneParam = searchParams.get('phone');
    const customerId = req.headers.get('x-customer-id');

    if (!email && (phoneParam || customerId)) {
      try {
        const storePath = getStoreFilePath('customers_store.json');
        if (fs.existsSync(storePath)) {
          const list = JSON.parse(fs.readFileSync(storePath, 'utf8'));
          const normalizedPhone = phoneParam ? normalizeEgyptianPhone(phoneParam) : '';
          const found = list.find((c: any) => {
            if (customerId && c.id === customerId) return true;
            if (normalizedPhone && c.phone && arePhonesEqual(c.phone, normalizedPhone)) return true;
            return false;
          });
          if (found && found.email) email = found.email;
        }
      } catch (e) {
        console.error('Error resolving customer for loyalty:', e);
      }
    }

    if (!email && phoneParam) {
      email = `${normalizeEgyptianPhone(phoneParam)}@customer.atheer.store`;
    }

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email, phone, or customer ID required' }, { status: 400 });
    }

    const config = getLoyaltyConfig();
    const account = getLoyaltyAccount(email, undefined, phoneParam || undefined);

    return NextResponse.json({
      success: true,
      config,
      account,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { voucherCode } = await req.json();
    const result = validateLoyaltyVoucher(voucherCode);
    return NextResponse.json({ success: result.valid, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
