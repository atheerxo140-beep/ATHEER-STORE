import { StoredOrder } from '@/data/localOrdersStore';
import { addAdminNotification } from '@/data/adminNotificationsStore';
import { getStoreSettings } from '@/data/storeSettingsStore';

/**
 * Dispatches automated notifications across all channels when a new customer order is placed.
 */
export async function notifyAdminOfNewOrder(order: StoredOrder): Promise<void> {
  const itemsSummary = order.items
    .map((i) => `${i.quantity}x ${i.productNameAr || i.productNameEn} (${i.selectedSize})`)
    .join('، ');

  // 1. Add to Admin in-app Notification Center
  addAdminNotification({
    type: 'new_order',
    title: `طلب جديد وارد: ${order.orderReference}`,
    message: `العميل: ${order.customerName} (${order.customerPhone}) طلب ${itemsSummary} بقيمة ${order.totalAmount.toLocaleString()} ج.م`,
    orderReference: order.orderReference,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    totalAmount: order.totalAmount,
  });

  // 2. Dispatch to Telegram Bot if configured
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    try {
      const telegramText = `🛍️ *طلب جديد في دار أثير!*
━━━━━━━━━━━━━━━
📦 *رقم الطلب:* \`${order.orderReference}\`
👤 *العميل:* ${order.customerName}
📞 *الهاتف:* \`${order.customerPhone}\`
📍 *العنوان:* ${order.shippingCity} (${order.shippingAddress})
🛒 *القطع:* ${itemsSummary}
💰 *المبلغ المطلوب عند الاستلام:* *${order.totalAmount.toLocaleString()} ج.م*
🚚 *طريقة الدفع:* ${order.paymentMethod === 'cash_on_delivery' ? 'كاش عند الاستلام' : order.paymentMethod}`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramText,
          parse_mode: 'Markdown',
        }),
      }).catch((e) => console.warn('[Telegram Notification Error]', e));
    } catch (e) {
      console.warn('[Telegram Dispatch Exception]', e);
    }
  }

  // 3. Dispatch to Generic Webhook if configured
  const webhookUrl = process.env.ORDER_NOTIFICATION_WEBHOOK;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'order.created',
          order,
          timestamp: new Date().toISOString(),
        }),
      }).catch((e) => console.warn('[Webhook Notification Error]', e));
    } catch (e) {
      console.warn('[Webhook Dispatch Exception]', e);
    }
  }

  // 4. Automated Direct Server-to-WhatsApp Dispatch to Store Owner
  try {
    const { sendAutomatedOrderWhatsApp } = await import('@/lib/serverWhatsAppDispatcher');
    const settings = await getStoreSettings();
    const ownerPhone = settings.whatsappNumber || '201500429943';
    const waResult = await sendAutomatedOrderWhatsApp(order, ownerPhone);
    console.log('[Order Notification WA Result]', waResult);
  } catch (waErr) {
    console.warn('[Automated Server WhatsApp Dispatch Exception]', waErr);
  }
}
