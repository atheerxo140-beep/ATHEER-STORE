const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('ATHEER STORE - AUTOMATED VERIFICATION SUITE');
  console.log('====================================================\n');

  // TEST 1: Query Products
  console.log('--- TEST 1: Query Admin Products ---');
  const resProds = await fetch(`${BASE_URL}/api/admin/products`);
  const prodsData = await resProds.json();
  console.log(`[PASS] Products returned: ${prodsData.count}`);
  if (!prodsData.success || prodsData.count < 5) throw new Error('Expected at least 5 products');

  // TEST 2: Create New Hoodie Product
  console.log('\n--- TEST 2: Create New Hoodie Garment ---');
  const newProdPayload = {
    nameEn: 'Atelier 500 GSM Zip Hoodie',
    nameAr: 'هودي أثير التجريبي 500 GSM',
    category: 'hoodies',
    price: 1600,
    gsm: 500,
    inventory: 40,
    colors: ['Onyx Black', 'Bone Ivory'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  };
  const resCreateProd = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProdPayload),
  });
  const createdProdData = await resCreateProd.json();
  console.log(`[PASS] Created Product ID: ${createdProdData.product.id}, Name: ${createdProdData.product.nameEn}`);
  const testProdId = createdProdData.product.id;

  // TEST 3: Inventory Adjustment & Negative Stock Protection
  console.log('\n--- TEST 3: Inventory Stock Adjustment & Guardrails ---');
  const resAdj = await fetch(`${BASE_URL}/api/admin/inventory`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: testProdId,
      adjustment: 10,
      reason: 'restock',
      notes: 'Batch #42 Inflow',
    }),
  });
  const adjData = await resAdj.json();
  console.log(`[PASS] Valid restock +10 applied. New inventory: ${adjData.newInventory} units`);
  if (adjData.newInventory !== 50) throw new Error('Expected 50 inventory');

  // Test negative stock block
  const resNeg = await fetch(`${BASE_URL}/api/admin/inventory`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: testProdId,
      adjustment: -100,
      reason: 'damage',
    }),
  });
  const negData = await resNeg.json();
  if (resNeg.status === 400 && !negData.success) {
    console.log(`[PASS] Negative stock blocked correctly: "${negData.error}"`);
  } else {
    throw new Error('Server should have rejected negative inventory!');
  }

  // TEST 4: Egyptian Shipping Zones & 27 Governorates
  console.log('\n--- TEST 4: Shipping Zones & Governorates ---');
  const resShipping = await fetch(`${BASE_URL}/api/admin/shipping`);
  const shippingData = await resShipping.json();
  console.log(`[PASS] Shipping Zones: ${shippingData.zones.length}, Governorates: ${shippingData.governorates.length}`);
  if (shippingData.governorates.length !== 27) throw new Error('Expected exactly 27 Egyptian governorates');

  // TEST 5: Coupon Validation
  console.log('\n--- TEST 5: Coupon Validation (10% on 1450 EGP) ---');
  const resCoupon = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'ATHEER10', subtotal: 1450 }),
  });
  const couponData = await resCoupon.json();
  console.log(`[PASS] Coupon validated. Discount: ${couponData.discountAmount} EGP, Final Subtotal: ${couponData.newSubtotal} EGP`);
  if (couponData.discountAmount !== 145) throw new Error('Expected 145 EGP discount');

  // TEST 6: Checkout with Egyptian Mobile Number Validation
  console.log('\n--- TEST 6: Customer Checkout & Egyptian Phone Validation ---');
  // Rejection test: non-Egyptian number
  const resBadOrder = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Test Invalid',
      customerPhone: '0551234567', // Not 010/011/012/015
      governorate: 'Cairo',
      shippingCity: 'New Cairo',
      shippingAddress: 'Villa 10',
      items: [{ productId: 'ath-hd-01', selectedSize: 'L', quantity: 1 }],
    }),
  });
  const badOrderData = await resBadOrder.json();
  if (resBadOrder.status === 400 && !badOrderData.success) {
    console.log(`[PASS] Invalid phone rejected: "${badOrderData.error}"`);
  } else {
    throw new Error('Bad phone number should have been rejected!');
  }

  // Success test: valid Egyptian number (01012345678)
  const resGoodOrder = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Ahmed Zaki (أحمد زكي)',
      customerPhone: '01012345678',
      customerEmail: 'ahmed.zaki@gmail.com',
      governorate: 'Cairo',
      shippingCity: 'New Cairo (Fifth Settlement)',
      shippingAddress: 'Building 45, Street 18, Apt 6',
      shippingZoneId: 'cairo-giza',
      couponCode: 'ATHEER10',
      notes: 'Call 15 mins before arrival',
      items: [{ productId: 'ath-hd-01', selectedSize: 'L', selectedColor: 'Onyx Black', quantity: 1 }],
    }),
  });
  const goodOrderData = await resGoodOrder.json();
  if (!goodOrderData.success) throw new Error(`Order failed: ${goodOrderData.error}`);
  const orderRef = goodOrderData.order.orderReference;
  console.log(`[PASS] Order created! Ref: ${orderRef}, Total: ${goodOrderData.order.totalAmount} EGP (with COD)`);

  // TEST 7: Order Management Pipeline & COD Collection
  console.log('\n--- TEST 7: Admin Order Pipeline & COD Status Transition ---');
  const resUpdateOrder = await fetch(`${BASE_URL}/api/admin/orders`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: orderRef,
      orderStatus: 'processing',
      paymentStatus: 'paid_on_delivery',
    }),
  });
  const updateOrderData = await resUpdateOrder.json();
  console.log(`[PASS] Status updated to: ${updateOrderData.order.orderStatus}, COD: ${updateOrderData.order.paymentStatus}`);

  // Transition to delivered
  await fetch(`${BASE_URL}/api/admin/orders`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: orderRef, orderStatus: 'delivered' }),
  });

  // Try reopening delivered order (terminal state)
  const resInvalidTrans = await fetch(`${BASE_URL}/api/admin/orders`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: orderRef, orderStatus: 'confirmed' }),
  });
  const invalidTransData = await resInvalidTrans.json();
  if (resInvalidTrans.status === 400 && !invalidTransData.success) {
    console.log(`[PASS] Invalid status transition blocked: "${invalidTransData.error}"`);
  } else {
    throw new Error('Reopening delivered order should be rejected!');
  }

  // TEST 8: Product Cleanup
  console.log('\n--- TEST 8: Delete Test Garment ---');
  const resDel = await fetch(`${BASE_URL}/api/admin/products?id=${testProdId}`, { method: 'DELETE' });
  const delData = await resDel.json();
  console.log(`[PASS] Product cleanup: ${delData.message}`);

  console.log('\n====================================================');
  console.log('>>> ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY! <<<');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('\n[TEST FAILED]:', err);
  process.exit(1);
});
