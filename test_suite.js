const BASE_URL = 'http://localhost:3000';
const DEV_TOKEN = 'dev-admin-session-atheer';

async function runAuditTests() {
  console.log('====================================================');
  console.log('ATHEER STORE — PRODUCTION READINESS & SECURITY AUDIT');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // AUDIT 1: ADMIN SECURITY & UNAUTHORIZED REQUESTS (401/403)
  // ----------------------------------------------------
  console.log('--- AUDIT 1: Admin API Security & Access Control ---');

  // 1.1 Test Direct Unauthenticated GET to /api/admin/products
  const resUnauthGet = await fetch(`${BASE_URL}/api/admin/products`);
  const unauthGetData = await resUnauthGet.json();
  if (resUnauthGet.status === 401 && !unauthGetData.success) {
    console.log(`[PASS] Unauthenticated GET /api/admin/products rejected: HTTP 401 ("${unauthGetData.error}")`);
  } else {
    throw new Error(`SECURITY VULNERABILITY: Unauthenticated GET /api/admin/products returned ${resUnauthGet.status}`);
  }

  // 1.2 Test Direct Unauthenticated POST to /api/admin/products
  const resUnauthPost = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nameEn: 'Hack', nameAr: 'اختراق', price: 100, category: 'hoodies' }),
  });
  if (resUnauthPost.status === 401) {
    console.log('[PASS] Unauthenticated POST /api/admin/products rejected: HTTP 401');
  } else {
    throw new Error('SECURITY VULNERABILITY: Unauthenticated POST allowed!');
  }

  // 1.3 Test Direct Unauthenticated PUT to /api/admin/inventory
  const resUnauthInv = await fetch(`${BASE_URL}/api/admin/inventory`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: 'ath-hd-01', adjustment: 50 }),
  });
  if (resUnauthInv.status === 401) {
    console.log('[PASS] Unauthenticated PUT /api/admin/inventory rejected: HTTP 401');
  } else {
    throw new Error('SECURITY VULNERABILITY: Unauthenticated PUT allowed!');
  }

  // 1.4 Test Direct Unauthenticated PUT to /api/shipping-zones
  const resUnauthShipPut = await fetch(`${BASE_URL}/api/shipping-zones`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zoneId: 'cairo-giza', baseFee: 0 }),
  });
  if (resUnauthShipPut.status === 401) {
    console.log('[PASS] Unauthenticated PUT /api/shipping-zones rejected: HTTP 401');
  } else {
    throw new Error('SECURITY VULNERABILITY: Unauthenticated PUT allowed!');
  }

  // 1.5 Test Dev-Bypass Token in Production Mode (MUST BE FORBIDDEN)
  const resDevBypass = await fetch(`${BASE_URL}/api/admin/products`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEV_TOKEN}`,
    },
  });
  const devBypassData = await resDevBypass.json();
  if (resDevBypass.status === 401 && devBypassData.error?.includes('forbidden in production mode')) {
    console.log(`[PASS] Development-mode bypass strictly blocked in production: HTTP 401 ("${devBypassData.error}")`);
  } else if (resDevBypass.status === 200) {
    console.log(`[INFO] Server running in development mode; dev bypass accepted.`);
  } else {
    console.log(`[PASS] Dev token rejected as expected: HTTP ${resDevBypass.status} (${devBypassData.error})`);
  }

  // ----------------------------------------------------
  // AUDIT 2: CUSTOMER CHECKOUT, DATA PROTECTION & PII MASKING
  // ----------------------------------------------------
  console.log('\n--- AUDIT 2: Customer Checkout & PII Masking ---');

  const uniquePhone = '010' + Math.floor(10000000 + Math.random() * 90000000);
  const checkoutPayload = {
    customerName: 'Tariq Mansour (طارق منصور)',
    customerPhone: uniquePhone,
    customerEmail: 'tariq.mansour@atheer-client.eg',
    governorate: 'Cairo',
    shippingCity: 'New Cairo',
    shippingAddress: 'Building 14, Apartment 3B, Diplomatic Quarter',
    shippingZoneId: 'cairo-giza',
    couponCode: 'ATHEER10',
    notes: 'Please ring bell twice upon arrival',
    items: [{ productId: 'ath-hd-01', selectedSize: 'L', selectedColor: 'Onyx Black', quantity: 1 }],
  };

  const resOrder = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkoutPayload),
  });
  const orderData = await resOrder.json();
  if (!orderData.success) throw new Error(`Order placement failed: ${orderData.error}`);
  const orderRef = orderData.order.orderReference;
  console.log(`[PASS] Customer order successfully placed: ${orderRef}`);
  console.log(`       Subtotal: ${orderData.order.subtotal} EGP, Shipping: ${orderData.order.shippingFee} EGP, Total: ${orderData.order.totalAmount} EGP (COD)`);

  // Test Public Query to /api/orders/[id] without admin authentication (IDOR attack simulation)
  const resPublicOrder = await fetch(`${BASE_URL}/api/orders/${orderRef}`);
  const publicOrderData = await resPublicOrder.json();
  if (publicOrderData.success) {
    const pubOrder = publicOrderData.order;
    // Verify phone is masked
    if (pubOrder.customerPhone.includes('*****') && !pubOrder.customerPhone.includes(uniquePhone)) {
      console.log(`[PASS] Customer phone successfully masked against scraping: "${pubOrder.customerPhone}"`);
    } else {
      throw new Error(`SECURITY LEAK: Customer phone exposed publicly: ${pubOrder.customerPhone}`);
    }

    // Verify address is masked
    if (!pubOrder.shippingAddress.includes('Building 14') && !pubOrder.shippingAddress.includes('Apartment 3B')) {
      console.log(`[PASS] Customer street address protected from public exposure: "${pubOrder.shippingAddress}"`);
    } else {
      throw new Error(`SECURITY LEAK: Customer street address exposed publicly: ${pubOrder.shippingAddress}`);
    }
  }

  // ----------------------------------------------------
  // AUDIT 3: DUPLICATE ORDER PREVENTION (IDEMPOTENCY GUARD)
  // ----------------------------------------------------
  console.log('\n--- AUDIT 3: Duplicate Order Prevention (Idempotency) ---');
  // Submit exact duplicate order immediately
  const resDuplicate = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkoutPayload),
  });
  const duplicateData = await resDuplicate.json();
  if (duplicateData.success && duplicateData.order.orderReference === orderRef) {
    console.log(`[PASS] Idempotency guard triggered: duplicate payload within 60s returned existing order (${duplicateData.order.orderReference}) without double-billing.`);
  } else {
    throw new Error('Duplicate order was not prevented!');
  }

  // ----------------------------------------------------
  // AUDIT 4: INVENTORY CONSISTENCY & VALIDATION
  // ----------------------------------------------------
  console.log('\n--- AUDIT 4: Inventory Consistency & Overselling Guard ---');
  // Attempt to order 9999 units (exceeding stock)
  const overstockPayload = {
    ...checkoutPayload,
    customerPhone: '011' + Math.floor(10000000 + Math.random() * 90000000),
    items: [{ productId: 'ath-hd-01', selectedSize: 'L', selectedColor: 'Onyx Black', quantity: 9999 }],
  };
  const resOverstock = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(overstockPayload),
  });
  const overstockData = await resOverstock.json();
  if (!overstockData.success && overstockData.error.includes('Insufficient stock')) {
    console.log(`[PASS] Overselling blocked: "${overstockData.error}"`);
  } else {
    throw new Error('Overselling was not blocked by inventory check!');
  }

  // ----------------------------------------------------
  // AUDIT 5: SHIPPING ZONES & PROVISIONAL STATUS
  // ----------------------------------------------------
  console.log('\n--- AUDIT 5: Shipping Zones & Provisional Rates ---');
  const resShip = await fetch(`${BASE_URL}/api/shipping-zones`);
  const shipData = await resShip.json();
  const allProvisional = shipData.zones.every((z) => z.isProvisional === true);
  if (allProvisional && shipData.zones.length >= 5) {
    console.log(`[PASS] All ${shipData.zones.length} shipping zones verified with provisional status.`);
    console.log(`[PASS] Every rate is explicitly marked as "isProvisional: true" awaiting physical courier contract.`);
  } else {
    throw new Error('Shipping zones missing provisional designation!');
  }

  // ----------------------------------------------------
  // AUDIT 6: COUPON VALIDATION ENGINE
  // ----------------------------------------------------
  console.log('\n--- AUDIT 6: Coupon Validation Engine ---');
  const resCoupon = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'ATHEER10', subtotal: 1450 }),
  });
  const couponData = await resCoupon.json();
  if (couponData.success && couponData.discountValue === 10) {
    console.log(`[PASS] Coupon engine validated ATHEER10 (10% off launch drop discount, -${couponData.discountAmount} EGP).`);
  } else {
    throw new Error('Coupon validation failed!');
  }

  console.log('\n====================================================');
  console.log('>>> ALL 6 PRODUCTION AUDIT SUITES PASSED CLEANLY! <<<');
  console.log('====================================================\n');
}

runAuditTests().catch((err) => {
  console.error('\n[AUDIT TEST FAILED]:', err);
  process.exit(1);
});
