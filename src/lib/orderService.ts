import { mockProducts } from '@/data/mockProducts';
import { calculateShippingFee, getShippingZoneById } from '@/data/shippingZones';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';
import { localOrdersStore, saveLocalOrder, StoredOrder } from '@/data/localOrdersStore';

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
  shippingCountry: string;
  shippingCity: string;
  shippingAddress: string;
  shippingPostalCode?: string;
  shippingZoneId: string;
  notes?: string;
  items: CreateOrderItemInput[];
}

export interface OrderCreationResult {
  success: boolean;
  order?: StoredOrder;
  error?: string;
  errorAr?: string;
}

export const createOrder = async (input: CreateOrderInput): Promise<OrderCreationResult> => {
  // 1. Basic Customer Information Validation
  if (!input.customerName || input.customerName.trim().length < 3) {
    return {
      success: false,
      error: 'Please provide a valid full name (at least 3 characters).',
      errorAr: 'يرجى إدخال الاسم الكامل بشكل صحيح (٣ أحرف على الأقل).',
    };
  }

  const cleanPhone = input.customerPhone ? input.customerPhone.replace(/[\s\-\(\)]/g, '') : '';
  if (!cleanPhone || cleanPhone.length < 8) {
    return {
      success: false,
      error: 'Please provide a valid mobile phone number for courier delivery.',
      errorAr: 'يرجى إدخال رقم جوال صحيح للتنسيق مع مندوب التوصيل.',
    };
  }

  if (!input.shippingCity || input.shippingCity.trim().length < 2) {
    return {
      success: false,
      error: 'Please provide a valid delivery city.',
      errorAr: 'يرجى إدخال اسم المدينة بشكل صحيح.',
    };
  }

  if (!input.shippingAddress || input.shippingAddress.trim().length < 5) {
    return {
      success: false,
      error: 'Please provide a detailed delivery address (district, street, house/building).',
      errorAr: 'يرجى إدخال تفاصيل العنوان (الحي، الشارع، المبنى) بدقة.',
    };
  }

  // 2. Validate Items Array
  if (!input.items || !Array.isArray(input.items) || input.items.length === 0) {
    return {
      success: false,
      error: 'Your shopping cart is empty.',
      errorAr: 'حقيبة التسوق فارغة.',
    };
  }

  // 3. Validate Each Item Against Official Server Catalog & Prevent Price Tampering
  const validatedItems: StoredOrder['items'] = [];
  let calculatedSubtotal = 0;

  for (const itemInput of input.items) {
    // Check quantity validity
    if (!itemInput.quantity || itemInput.quantity <= 0 || !Number.isInteger(itemInput.quantity)) {
      return {
        success: false,
        error: `Invalid quantity for item ${itemInput.productId}. Quantity must be a positive integer.`,
        errorAr: 'الكمية المحددة غير صحيحة، يجب أن تكون عدداً صحيحاً أكبر من الصفر.',
      };
    }

    // Look up product strictly on server
    const product = mockProducts.find((p) => p.id === itemInput.productId);
    if (!product) {
      return {
        success: false,
        error: `Product ID "${itemInput.productId}" was not found in the catalog.`,
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

    // Validate size
    if (!product.sizes.includes(itemInput.selectedSize)) {
      return {
        success: false,
        error: `Size "${itemInput.selectedSize}" is not available for "${product.nameEn}".`,
        errorAr: `المقاس "${itemInput.selectedSize}" غير متوفر للقطعة "${product.nameAr}".`,
      };
    }

    // Validate color
    const selectedColor = itemInput.selectedColor || product.colors[0] || 'Default';
    if (product.colors.length > 0 && !product.colors.includes(selectedColor)) {
      return {
        success: false,
        error: `Color "${selectedColor}" is not available for "${product.nameEn}".`,
        errorAr: `اللون "${selectedColor}" غير متوفر للقطعة "${product.nameAr}".`,
      };
    }

    // Unit price is strictly taken from server product.price
    const unitPrice = product.price;
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
  }

  // 4. Validate Shipping Zone & Calculate Server Shipping Fee
  const zone = getShippingZoneById(input.shippingZoneId);
  if (!zone) {
    return {
      success: false,
      error: `Invalid shipping zone selected: "${input.shippingZoneId}".`,
      errorAr: 'المنطقة المحددة للشحن غير صحيحة.',
    };
  }

  const { fee: calculatedShippingFee } = calculateShippingFee(zone.id, calculatedSubtotal);
  const totalAmount = calculatedSubtotal + calculatedShippingFee;

  // 5. Generate Unique Order Reference
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderReference = `ATH-2026-${randomSuffix}`;
  const nowIso = new Date().toISOString();
  const orderId = `ord_${Date.now()}_${randomSuffix}`;

  // 6. Build the Final Order Record
  const newOrder: StoredOrder = {
    id: orderId,
    orderReference,
    customerName: input.customerName.trim(),
    customerPhone: cleanPhone,
    customerEmail: input.customerEmail?.trim(),
    shippingCountry: input.shippingCountry,
    shippingCity: input.shippingCity.trim(),
    shippingAddress: input.shippingAddress.trim(),
    shippingPostalCode: input.shippingPostalCode?.trim(),
    shippingZoneId: zone.id,
    shippingZoneNameEn: zone.nameEn,
    shippingZoneNameAr: zone.nameAr,
    subtotal: calculatedSubtotal,
    shippingFee: calculatedShippingFee,
    totalAmount,
    currency: 'SAR',
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_cod',
    orderStatus: 'confirmed',
    notes: input.notes?.trim(),
    items: validatedItems,
    createdAt: nowIso,
    backendStorage: 'local_database',
  };

  // 7. Persist to Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_reference: orderReference,
            customer_name: newOrder.customerName,
            customer_phone: newOrder.customerPhone,
            customer_email: newOrder.customerEmail,
            shipping_country: newOrder.shippingCountry,
            shipping_city: newOrder.shippingCity,
            shipping_address: newOrder.shippingAddress,
            shipping_postal_code: newOrder.shippingPostalCode,
            shipping_zone_id: newOrder.shippingZoneId,
            subtotal: newOrder.subtotal,
            shipping_fee: newOrder.shippingFee,
            total_amount: newOrder.totalAmount,
            currency: newOrder.currency,
            payment_method: newOrder.paymentMethod,
            payment_status: newOrder.paymentStatus,
            order_status: newOrder.orderStatus,
            notes: newOrder.notes,
          })
          .select('id')
          .single();

        if (orderError) {
          console.error('[Supabase Order Insert Error]', orderError);
        } else if (orderData) {
          newOrder.id = orderData.id;
          newOrder.backendStorage = 'supabase';

          // Insert order items
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

          const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
          if (itemsError) {
            console.error('[Supabase Order Items Error]', itemsError);
          }
        }
      } catch (err) {
        console.error('[Supabase Order Exception]', err);
      }
    }
  }

  // Always save to the local memory store as well to support fast retrieval
  saveLocalOrder(newOrder);

  return {
    success: true,
    order: newOrder,
  };
};

export const getOrderByIdOrReference = async (idOrRef: string): Promise<StoredOrder | null> => {
  // Check local store first
  const local = localOrdersStore.find(
    (o) => o.id === idOrRef || o.orderReference.toLowerCase() === idOrRef.toLowerCase()
  );
  if (local) return local;

  // If Supabase is configured, check Supabase
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
            currency: data.currency,
            paymentMethod: data.payment_method,
            paymentStatus: data.payment_status,
            orderStatus: data.order_status,
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
