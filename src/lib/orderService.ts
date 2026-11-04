import { mockProducts, currentProducts } from '@/data/mockProducts';
import { calculateShippingFee, getShippingZoneById, getZoneByGovernorate } from '@/data/shippingZones';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';
import { localOrdersStore, saveLocalOrder, StoredOrder } from '@/data/localOrdersStore';
import { getCouponByCode } from '@/data/couponsStore';
import { addInventoryLog } from '@/data/inventoryLogsStore';

export interface CreateOrderItemInput {
  productId: string;
  selectedSize: string;
  selectedColor?: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingCountry?: string; // defaults to 'Egypt'
  governorate: string; // e.g. 'Cairo', 'Giza', 'Alexandria'
  shippingCity: string;
  shippingDistrict?: string;
  shippingAddress: string; // Street name, building number, apartment
  shippingPostalCode?: string;
  shippingZoneId?: string;
  couponCode?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  items: CreateOrderItemInput[];
}

export interface OrderCreationResult {
  success: boolean;
  order?: StoredOrder;
  error?: string;
  errorAr?: string;
}

// Egyptian Mobile Number Validator: Accepts 010..., 011..., 012..., 015... (11 digits) or +2010... (12-13 digits)
export const validateEgyptianPhone = (phone: string): { isValid: boolean; normalized: string } => {
  const digitsOnly = phone.replace(/[\s\-\(\)\+]/g, '');

  // Case 1: Standard local 11-digit mobile: 01012345678, 011..., 012..., 015...
  if (/^01[0125][0-9]{8}$/.test(digitsOnly)) {
    return { isValid: true, normalized: digitsOnly };
  }

  // Case 2: International format: 2010..., 2011..., 2012..., 2015...
  if (/^201[0125][0-9]{8}$/.test(digitsOnly)) {
    const localFormat = '0' + digitsOnly.slice(2);
    return { isValid: true, normalized: localFormat };
  }

  return { isValid: false, normalized: phone };
};

export const createOrder = async (input: CreateOrderInput): Promise<OrderCreationResult> => {
  // 1. Validate Customer Name
  if (!input.customerName || input.customerName.trim().length < 3) {
    return {
      success: false,
      error: 'Please enter a valid full name (at least 3 characters).',
      errorAr: 'يرجى إدخال الاسم بالكامل بشكل صحيح (٣ أحرف على الأقل).',
    };
  }

  // 2. Validate Egyptian Mobile Phone Number
  const phoneCheck = validateEgyptianPhone(input.customerPhone || '');
  if (!phoneCheck.isValid) {
    return {
      success: false,
      error: 'Please provide a valid Egyptian mobile number (e.g. 010xxxxxxxx, 011xxxxxxxx, 012xxxxxxxx, or 015xxxxxxxx).',
      errorAr: 'يرجى إدخال رقم هاتف محمول مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015 ومكون من ١١ رقماً.',
    };
  }

  // 3. Validate Egyptian Governorate
  if (!input.governorate || input.governorate.trim().length < 2) {
    return {
      success: false,
      error: 'Please select an Egyptian governorate for delivery.',
      errorAr: 'يرجى اختيار المحافظة لتحديد مسار التوصيل.',
    };
  }

  // 4. Validate City & Address
  if (!input.shippingCity || input.shippingCity.trim().length < 2) {
    return {
      success: false,
      error: 'Please enter your city / area.',
      errorAr: 'يرجى إدخال المدينة أو المنطقة.',
    };
  }

  if (!input.shippingAddress || input.shippingAddress.trim().length < 5) {
    return {
      success: false,
      error: 'Please provide a detailed street address, building number, and apartment details.',
      errorAr: 'يرجى إدخال تفاصيل العنوان (الشارع، رقم العمارة، رقم الشقة) لضمان دقة التوصيل.',
    };
  }

  // 5. Validate Items
  if (!input.items || !Array.isArray(input.items) || input.items.length === 0) {
    return {
      success: false,
      error: 'Your shopping cart is empty.',
      errorAr: 'حقيبة التسوق فارغة.',
    };
  }

  // 5.1. Duplicate Order Prevention (Idempotency Guard within 60 seconds)
  const nowMs = Date.now();
  const existingDuplicate = localOrdersStore.find((o) => {
    if (o.customerPhone !== phoneCheck.normalized) return false;
    const orderAgeMs = nowMs - new Date(o.createdAt).getTime();
    if (orderAgeMs > 60000) return false; // More than 60s ago
    if (o.items.length !== input.items.length) return false;
    return o.items.every(
      (it, idx) =>
        it.productId === input.items[idx]?.productId &&
        it.selectedSize === input.items[idx]?.selectedSize
    );
  });

  if (existingDuplicate) {
    return {
      success: true,
      order: existingDuplicate,
    };
  }

  // 6. Validate Catalog Items & Compute Pricing Strictly on Server
  const validatedItems: StoredOrder['items'] = [];
  const matchedProducts: { product: any; quantity: number }[] = [];
  let calculatedSubtotal = 0;

  for (const itemInput of input.items) {
    if (!itemInput.quantity || itemInput.quantity <= 0 || !Number.isInteger(itemInput.quantity)) {
      return {
        success: false,
        error: `Invalid quantity for item ${itemInput.productId}. Must be a positive integer.`,
        errorAr: 'الكمية المحددة غير صحيحة.',
      };
    }

    const product = currentProducts.find((p) => p.id === itemInput.productId) ||
      mockProducts.find((p) => p.id === itemInput.productId);

    if (!product) {
      return {
        success: false,
        error: `Product "${itemInput.productId}" not found.`,
        errorAr: `المنتج برمز "${itemInput.productId}" غير موجود.`,
      };
    }

    if (product.isComingSoon) {
      return {
        success: false,
        error: `"${product.nameEn}" is part of an upcoming drop and is not yet available for order.`,
        errorAr: `القطعة "${product.nameAr}" ضمن الإصدار القادم وليست متاحة للطلب بعد.`,
      };
    }

    // Check Inventory Availability
    const currentStock = product.inventory ?? 0;
    if (currentStock < itemInput.quantity) {
      return {
        success: false,
        error: `Insufficient stock for "${product.nameEn}". Requested: ${itemInput.quantity}, Available: ${currentStock}.`,
        errorAr: `المخزون المتوفر من "${product.nameAr}" غير كافٍ. الكمية المتاحة: ${currentStock}.`,
      };
    }

    if (!product.sizes.includes(itemInput.selectedSize)) {
      return {
        success: false,
        error: `Size "${itemInput.selectedSize}" is not available for "${product.nameEn}".`,
        errorAr: `المقاس "${itemInput.selectedSize}" غير متوفر للقطعة "${product.nameAr}".`,
      };
    }

    const selectedColor = itemInput.selectedColor || product.colors[0] || 'Default';
    const unitPrice = product.price; // Taken strictly from server product model
    const totalPrice = unitPrice * itemInput.quantity;
    calculatedSubtotal += totalPrice;

    validatedItems.push({
      productId: product.id,
      productNameEn: product.nameEn,
      productNameAr: product.nameAr,
      selectedSize: itemInput.selectedSize,
      selectedColor,
      unitPrice,
      quantity: itemInput.quantity,
      totalPrice,
      image: product.image,
      gsm: product.gsm,
    });

    matchedProducts.push({ product, quantity: itemInput.quantity });
  }

  // 7. Calculate Shipping Fee Strictly on Server from Egyptian Zones
  const zone = input.shippingZoneId
    ? getShippingZoneById(input.shippingZoneId) || getZoneByGovernorate(input.governorate)
    : getZoneByGovernorate(input.governorate);

  const { fee: calculatedShippingFee } = calculateShippingFee(zone.id, calculatedSubtotal);

  // 8. Server-Side Coupon Discount Calculation
  let discountAmount = 0;
  let validatedCouponCode: string | undefined = undefined;

  if (input.couponCode && input.couponCode.trim()) {
    const coupon = getCouponByCode(input.couponCode.trim());
    if (coupon) {
      if (!coupon.minOrderAmount || calculatedSubtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          discountAmount = Math.min(coupon.discountValue, calculatedSubtotal);
        }
        validatedCouponCode = coupon.code;
        coupon.timesUsed += 1;
      }
    }
  }

  const totalAmount = Math.max(0, calculatedSubtotal + calculatedShippingFee - discountAmount);

  // 9. Generate Unique Order Reference
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderReference = `ATH-EG-${randomSuffix}`;
  const nowIso = new Date().toISOString();
  const orderId = `ord_eg_${Date.now()}_${randomSuffix}`;

  const newOrder: StoredOrder = {
    id: orderId,
    orderReference,
    customerName: input.customerName.trim(),
    customerPhone: phoneCheck.normalized,
    customerEmail: input.customerEmail?.trim(),
    shippingCountry: 'Egypt',
    governorate: input.governorate,
    shippingCity: input.shippingCity.trim(),
    shippingAddress: input.shippingAddress.trim(),
    shippingPostalCode: input.shippingPostalCode?.trim(),
    shippingZoneId: zone.id,
    shippingZoneNameEn: zone.nameEn,
    shippingZoneNameAr: zone.nameAr,
    subtotal: calculatedSubtotal,
    shippingFee: calculatedShippingFee,
    discountAmount: discountAmount > 0 ? discountAmount : undefined,
    couponCode: validatedCouponCode,
    totalAmount,
    currency: 'EGP',
    paymentMethod: input.paymentMethod || 'cash_on_delivery',
    paymentReference: input.paymentReference?.trim(),
    paymentStatus:
      input.paymentMethod && input.paymentMethod !== 'cash_on_delivery'
        ? 'pending_verification'
        : 'pending_cod',
    orderStatus: 'confirmed',
    notes: input.notes?.trim(),
    items: validatedItems,
    createdAt: nowIso,
    backendStorage: 'local_database',
  };

  // 9. Persist to Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        let { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_reference: orderReference,
            customer_name: newOrder.customerName,
            customer_phone: newOrder.customerPhone,
            customer_email: newOrder.customerEmail,
            shipping_country: 'Egypt',
            shipping_city: newOrder.shippingCity,
            shipping_address: newOrder.shippingAddress,
            shipping_postal_code: newOrder.shippingPostalCode,
            shipping_zone_id: newOrder.shippingZoneId,
            subtotal: newOrder.subtotal,
            shipping_fee: newOrder.shippingFee,
            total_amount: newOrder.totalAmount,
            currency: 'EGP',
            payment_method: newOrder.paymentMethod,
            payment_status: newOrder.paymentStatus,
            order_status: 'confirmed',
            notes: newOrder.paymentReference
              ? `${newOrder.notes ? newOrder.notes + ' · ' : ''}Ref: ${newOrder.paymentReference}`
              : newOrder.notes,
          })
          .select('id')
          .single();

        // Fallback for older database check constraints on payment_status
        if (orderError && (orderError.code === '23514' || orderError.message?.includes('payment_status'))) {
          console.warn('[Supabase Order] Check constraint fallback applied:', orderError.message);
          const fallbackRes = await supabase
            .from('orders')
            .insert({
              order_reference: orderReference,
              customer_name: newOrder.customerName,
              customer_phone: newOrder.customerPhone,
              customer_email: newOrder.customerEmail,
              shipping_country: 'Egypt',
              shipping_city: newOrder.shippingCity,
              shipping_address: newOrder.shippingAddress,
              shipping_postal_code: newOrder.shippingPostalCode,
              shipping_zone_id: newOrder.shippingZoneId,
              subtotal: newOrder.subtotal,
              shipping_fee: newOrder.shippingFee,
              total_amount: newOrder.totalAmount,
              currency: 'EGP',
              payment_method: newOrder.paymentMethod,
              payment_status: 'pending_cod',
              order_status: 'confirmed',
              notes: newOrder.paymentReference
                ? `${newOrder.notes ? newOrder.notes + ' · ' : ''}Ref: ${newOrder.paymentReference} [Method: ${newOrder.paymentMethod}]`
                : newOrder.notes,
            })
            .select('id')
            .single();

          orderData = fallbackRes.data;
          orderError = fallbackRes.error;
        }

        if (!orderError && orderData) {
          newOrder.id = orderData.id;
          newOrder.backendStorage = 'supabase';

          const orderItemsToInsert = validatedItems.map((item) => ({
            order_id: orderData.id,
            product_id: item.productId,
            product_name_en: item.productNameEn,
            product_name_ar: item.productNameAr,
            selected_size: item.selectedSize,
            selected_color: item.selectedColor,
            unit_price: item.unitPrice,
            quantity: item.quantity,
            total_price: item.totalPrice,
          }));

          await supabase.from('order_items').insert(orderItemsToInsert);
        }
      } catch (err) {
        console.error('[Supabase Order Exception]', err);
      }
    }
  }

  // Always save in-memory / local runtime store
  saveLocalOrder(newOrder);

  // Deduct Inventory Consistently and record movement logs
  for (const item of matchedProducts) {
    item.product.inventory = Math.max(0, (item.product.inventory ?? 0) - item.quantity);
    addInventoryLog({
      id: `inv_sale_${Date.now()}_${item.product.id}`,
      productId: item.product.id,
      productName: item.product.nameEn,
      adjustment: -item.quantity,
      newTotal: item.product.inventory,
      reason: 'sale',
      notes: `Order confirmed (${orderReference})`,
      timestamp: nowIso,
    });
  }

  // Production Persistence Alert
  if (!isSupabaseConfigured() && process.env.NODE_ENV === 'production') {
    console.error(
      `[SECURITY/PERSISTENCE WARNING]: Order ${orderReference} saved only to temporary process memory. Real Supabase cloud database is required for production persistence!`
    );
  }

  return {
    success: true,
    order: newOrder,
  };
};

export const getOrderByIdOrReference = async (idOrRef: string): Promise<StoredOrder | null> => {
  const local = localOrdersStore.find(
    (o) => o.id === idOrRef || o.orderReference.toLowerCase() === idOrRef.toLowerCase()
  );
  if (local) return local;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const isUuid = idOrRef.includes('-') && idOrRef.length === 36;
        const query = supabase.from('orders').select('*, order_items(*)');
        const { data, error } = isUuid
          ? await query.eq('id', idOrRef).single()
          : await query.eq('order_reference', idOrRef).single();

        if (!error && data) {
          return {
            id: data.id,
            orderReference: data.order_reference,
            customerName: data.customer_name,
            customerPhone: data.customer_phone,
            customerEmail: data.customer_email,
            shippingCountry: data.shipping_country,
            shippingCity: data.shipping_city,
            shippingAddress: data.shipping_address,
            shippingPostalCode: data.shipping_postal_code,
            shippingZoneId: data.shipping_zone_id,
            shippingZoneNameEn: data.shipping_zone_id,
            shippingZoneNameAr: data.shipping_zone_id,
            subtotal: Number(data.subtotal),
            shippingFee: Number(data.shipping_fee),
            totalAmount: Number(data.total_amount),
            currency: 'EGP',
            paymentMethod: 'cash_on_delivery',
            paymentStatus: data.payment_status || 'pending_cod',
            orderStatus: data.order_status || 'confirmed',
            notes: data.notes,
            createdAt: data.created_at,
            backendStorage: 'supabase',
            items: (data.order_items || []).map((item: any) => ({
              productId: item.product_id,
              productNameEn: item.product_name_en,
              productNameAr: item.product_name_ar,
              selectedSize: item.selected_size,
              selectedColor: item.selected_color,
              unitPrice: Number(item.unit_price),
              quantity: item.quantity,
              totalPrice: Number(item.total_price),
              image: '',
              gsm: 500,
            })),
          };
        }
      } catch (e) {
        console.error('[Supabase getOrder error]', e);
      }
    }
  }

  return null;
};
