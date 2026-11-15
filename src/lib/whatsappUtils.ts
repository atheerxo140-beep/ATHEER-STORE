import type { StoredOrder } from '@/data/localOrdersStore';

export const DEFAULT_STORE_WHATSAPP = '201015993802';

/**
 * Normalizes Egyptian WhatsApp numbers (local 010..., 011..., 012..., 015... or 201...)
 */
export function normalizeWhatsAppNumber(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.startsWith('00201') && digits.length === 14) {
    return digits.substring(2);
  }
  if (digits.startsWith('01') && digits.length === 11) {
    return '20' + digits.substring(1);
  }
  if (digits.startsWith('201') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }
  return digits;
}

/**
 * Clean and normalize phone numbers for WhatsApp wa.me links
 * Handles Egyptian mobile numbers (010, 011, 012, 015) by prefixing 20.
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');

  // Local Egyptian mobile (01xxxxxxxxx) -> prefix 20
  if (digits.startsWith('01') && digits.length === 11) {
    return `20${digits.substring(1)}`;
  }
  // International with 0020
  if (digits.startsWith('0020')) {
    return digits.substring(2);
  }
  // International format 201xxxxxxxxx
  if (digits.startsWith('201') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }
  return digits;
}

/**
 * Builds a beautifully formatted, comprehensive WhatsApp order receipt
 */
export function formatOrderWhatsAppMessage(order: StoredOrder, language: 'ar' | 'en' = 'ar'): string {
  const isAr = language === 'ar';

  const itemsList = order.items
    .map((item, idx) => {
      const name = isAr ? item.productNameAr : item.productNameEn;
      const sizeColor = `${isAr ? 'المقاس' : 'Size'}: ${item.selectedSize} | ${isAr ? 'اللون' : 'Color'}: ${item.selectedColor}${item.gsm ? ` | ${item.gsm} ${isAr ? 'جم/م²' : 'GSM'}` : ''}`;
      const qtyPrice = `${isAr ? 'الكمية' : 'Qty'}: ${item.quantity} × ${item.unitPrice.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`;
      return `▪️ *${idx + 1}. ${name}*\n   ▫️ ${sizeColor}\n   ▫️ ${qtyPrice} (الإجمالي: ${item.totalPrice.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'})`;
    })
    .join('\n\n');

  const destination = [
    order.governorate ? (isAr ? `محافظة ${order.governorate}` : `${order.governorate} Gov`) : '',
    order.shippingCity,
    order.shippingAddress,
    order.shippingDistrict ? `(${order.shippingDistrict})` : '',
  ]
    .filter(Boolean)
    .join(' - ');

  if (isAr) {
    return `🛍️ *فاتورة تأكيد طلب جديد — دار أثير | ATHEER*
━━━━━━━━━━━━━━━━━━━━━
📦 *رقم تتبع الطلب:* \`${order.orderReference}\`
📅 *التاريخ:* ${new Date(order.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}

👤 *بيانات العميل:*
• *الاسم:* ${order.customerName}
• *رقم الهاتف:* ${order.customerPhone}
${order.customerEmail ? `• *البريد:* ${order.customerEmail}\n` : ''}📍 *عنوان التوصيل (مصر):*
${destination}

🛒 *القطع المطلوبة (${order.items.reduce((acc, i) => acc + i.quantity, 0)} قطع):*
${itemsList}

💵 *ملخص الحساب والرسوم:*
• المجموع الفرعي: ${order.subtotal.toLocaleString()} ج.م
• الشحن والتوصيل: ${order.shippingFee === 0 ? 'شحن مجاني' : `${order.shippingFee.toLocaleString()} ج.م`} (${order.shippingZoneNameAr || 'مصر'})
${order.discountAmount ? `• كود الخصم (${order.couponCode || ''}): -${order.discountAmount.toLocaleString()} ج.م\n` : ''}💰 *المبلغ المطلوب عند الاستلام (COD):*
👉 *${order.totalAmount.toLocaleString()} جنيه مصري*

🚚 *طريقة الدفع:* الدفع عند الاستلام (نقداً أو بالبطاقة)
${order.notes ? `\n📝 *ملاحظات التوصيل:* ${order.notes}` : ''}
━━━━━━━━━━━━━━━━━━━━━
✨ برجاء تأكيد استلام الطلب وتحديد موعد الاستلام المناسب.
🖤 دار أثير للأزياء الراقية | ATHEER STREETWEAR`;
  }

  // English fallback
  return `🛍️ *ORDER CONFIRMATION RECEIPT — ATHEER*
━━━━━━━━━━━━━━━━━━━━━
📦 *Order Reference:* \`${order.orderReference}\`
📅 *Date:* ${new Date(order.createdAt).toLocaleDateString('en-GB')}

👤 *Customer Info:*
• *Name:* ${order.customerName}
• *Phone:* ${order.customerPhone}
${order.customerEmail ? `• *Email:* ${order.customerEmail}\n` : ''}📍 *Delivery Destination:*
${destination}

🛒 *Ordered Items:*
${itemsList}

💵 *Financial Breakdown:*
• Subtotal: ${order.subtotal.toLocaleString()} EGP
• Shipping: ${order.shippingFee === 0 ? 'FREE' : `${order.shippingFee.toLocaleString()} EGP`}
${order.discountAmount ? `• Discount (${order.couponCode || ''}): -${order.discountAmount.toLocaleString()} EGP\n` : ''}💰 *Total Payable on Delivery (COD):*
👉 *${order.totalAmount.toLocaleString()} EGP*

🚚 *Payment Method:* Cash on Delivery (COD)
${order.notes ? `\n📝 *Notes:* ${order.notes}` : ''}
━━━━━━━━━━━━━━━━━━━━━
✨ Thank you for choosing ATHEER.`;
}

/**
 * Builds the wa.me link for an order.
 * - `store`: Sends the full order receipt to the store's official WhatsApp number (so store owner receives it immediately).
 * - `customer`: Sends the full order receipt to the customer's personal mobile number (so customer has the receipt on their WhatsApp).
 */
export function getWhatsAppOrderUrl(
  order: StoredOrder,
  target: 'store' | 'customer',
  storeWhatsAppNumber?: string,
  language: 'ar' | 'en' = 'ar'
): string {
  const message = formatOrderWhatsAppMessage(order, language);
  const encodedMsg = encodeURIComponent(message);

  if (target === 'store') {
    const rawNum = storeWhatsAppNumber || DEFAULT_STORE_WHATSAPP;
    const cleanNum = normalizeWhatsAppNumber(rawNum) || DEFAULT_STORE_WHATSAPP;
    return `https://wa.me/${cleanNum}?text=${encodedMsg}`;
  }

  // Target: customer
  const cleanCustomerPhone = formatPhoneForWhatsApp(order.customerPhone);
  return `https://wa.me/${cleanCustomerPhone}?text=${encodedMsg}`;
}

/**
 * Generates a tailored administrative customer notification message
 * used by the store admin in /admin/orders to message the customer with 1 click.
 */
export function getAdminToCustomerWhatsAppUrl(order: StoredOrder, language: 'ar' | 'en' = 'ar'): string {
  const isAr = language === 'ar';
  const cleanCustomerPhone = formatPhoneForWhatsApp(order.customerPhone);

  const destination = [
    order.governorate ? (isAr ? `محافظة ${order.governorate}` : `${order.governorate} Gov`) : '',
    order.shippingCity,
    order.shippingAddress,
  ]
    .filter(Boolean)
    .join(' - ');

  const textAr = `أهلاً بك أستاذ ${order.customerName} 👋
معاك خدمة عملاء *دار أثير | ATHEER* 🖤

بخصوص طلبك رقم: \`${order.orderReference}\`
• عدد القطع: ${order.items.reduce((acc, i) => acc + i.quantity, 0)} قطعة
• إجمالي الفاتورة عند الاستلام: *${order.totalAmount.toLocaleString()} جنيه مصري*
• عنوان الشحن: ${destination}

يسعدنا إبلاغك أن طلبك مسجل لدينا وحالته حالياً: *${
  order.orderStatus === 'shipped'
    ? 'تم الشحن ومع مندوب التوصيل'
    : order.orderStatus === 'delivered'
    ? 'تم التسليم بنجاح (وصل للعميل)'
    : order.orderStatus === 'confirmed'
    ? 'تم التأكيد'
    : 'قيد التجهيز'
}*.
${order.orderStatus === 'shipped' ? 'سيتواصل معك مندوب شركة الشحن قريباً جداً لتسليم الطرد والدفع عند الاستلام مع حق المعاينة وفتح الشحنة.' : order.orderStatus === 'delivered' ? 'سعدنا جداً بخدمتك ونتمنى أن تنال القطعة إعجابك وفخرك! تمت إضافة ختم رقمي إلى كارت الولاء الخاص بك.' : 'سيتواصل معك مندوب شركة الشحن قريباً للتسليم والدفع عند الاستلام.'}

إذا كان لديك أي استفسار أو رغبة في تعديل الموعد نحن في خدمتك دائماً! 🤍`;

  const textEn = `Hello ${order.customerName} 👋
This is ATHEER Concierge regarding your order: \`${order.orderReference}\`.
• Total Payable: ${order.totalAmount.toLocaleString()} EGP
• Delivery Address: ${destination}
• Current Status: ${order.orderStatus}

Our courier will be in touch with you shortly. Thank you for choosing ATHEER!`;

  const message = isAr ? textAr : textEn;
  return `https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(message)}`;
}
