import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import {
  getWhatsAppGatewayConfig,
  saveWhatsAppGatewayConfig,
  sendAutomatedOrderWhatsApp,
  WhatsAppGatewayConfig,
} from '@/lib/serverWhatsAppDispatcher';
import { normalizeWhatsAppNumber } from '@/lib/whatsappUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  const config = getWhatsAppGatewayConfig();
  return NextResponse.json({
    success: true,
    config,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json();
    const { config, testPhone } = body;

    if (config) {
      saveWhatsAppGatewayConfig(config as WhatsAppGatewayConfig);
    }

    // Optional test message
    let testResult = null;
    if (testPhone) {
      const cleanPhone = normalizeWhatsAppNumber(testPhone) || '201021483802';
      const fakeOrder: any = {
        id: 'test-order',
        orderReference: 'ATH-TEST-001',
        customerName: 'عميل تجريبي',
        customerPhone: '01015993802',
        shippingCity: 'القاهرة',
        shippingAddress: 'شارع التسعين',
        totalAmount: 1850,
        paymentMethod: 'cash_on_delivery',
        createdAt: new Date().toISOString(),
        items: [
          {
            productNameAr: 'هودي أثير بوكسي الثقيل 500 GSM',
            productNameEn: 'ATHEER Heavy Boxy Hoodie',
            selectedSize: 'L',
            selectedColor: 'Onyx Black',
            quantity: 1,
            unitPrice: 1850,
            totalPrice: 1850,
          },
        ],
      };

      testResult = await sendAutomatedOrderWhatsApp(fakeOrder, cleanPhone);
    }

    return NextResponse.json({
      success: true,
      config: getWhatsAppGatewayConfig(),
      testResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update WhatsApp gateway' },
      { status: 500 }
    );
  }
}
