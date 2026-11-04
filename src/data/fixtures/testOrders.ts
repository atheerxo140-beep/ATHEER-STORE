import { StoredOrder } from '@/data/localOrdersStore';

// SEPARATED TEST FIXTURES: For testing and local evaluation ONLY.
// CRITICAL: NEVER automatically populate these fake customer orders into production databases or runtime!
export const testFixtureOrders: StoredOrder[] = [
  {
    id: 'test-ord-001',
    orderReference: 'ATH-TEST-001',
    customerName: 'Test Customer 1 (عميل تجريبي)',
    customerPhone: '01011111111',
    customerEmail: 'test1@atheer.internal',
    shippingCountry: 'Egypt',
    governorate: 'Cairo',
    shippingCity: 'New Cairo (Fifth Settlement)',
    shippingDistrict: 'Test Zone',
    shippingAddress: 'Test Address 1',
    shippingZoneId: 'cairo-giza',
    shippingZoneNameEn: 'Greater Cairo & Giza',
    shippingZoneNameAr: 'القاهرة الكبرى والجيزة',
    subtotal: 1450,
    shippingFee: 60,
    totalAmount: 1510,
    currency: 'EGP',
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_cod',
    orderStatus: 'confirmed',
    notes: 'Automated test fixture order',
    items: [
      {
        productId: 'ath-hd-01',
        productNameEn: 'The Heavyweight 500 GSM Boxy Hoodie',
        productNameAr: 'هودي أثير بوكسي الثقيل 500 GSM',
        selectedSize: 'L',
        selectedColor: 'Onyx Black',
        unitPrice: 1450,
        quantity: 1,
        totalPrice: 1450,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
        gsm: 500,
      },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    backendStorage: 'local_database',
  },
];
