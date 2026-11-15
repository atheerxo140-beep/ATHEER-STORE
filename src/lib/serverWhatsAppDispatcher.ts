import { StoredOrder } from '@/data/localOrdersStore';
import { normalizeWhatsAppNumber } from '@/lib/whatsappUtils';
import fs from 'fs';
import path from 'path';
import { getStoreFilePath } from '@/lib/storePath';

export interface WhatsAppGatewayConfig {
  provider: 'callmebot' | 'ultramsg' | 'custom_webhook' | 'none';
  targetPhone?: string;
  callmebotApiKey?: string;
  ultramsgInstanceId?: string;
  ultramsgToken?: string;
  customWebhookUrl?: string;
}

function getGatewayConfigPath(): string {
  try {
    return getStoreFilePath('whatsapp_gateway.json');
  } catch (e) {
    return path.join(process.cwd(), 'src', 'data', 'whatsapp_gateway.json');
  }
}

export function getWhatsAppGatewayConfig(): WhatsAppGatewayConfig {
  // Check env vars first
  const callmebotApiKey = process.env.CALLMEBOT_APIKEY || '';
  const ultramsgInstanceId = process.env.ULTRAMSG_INSTANCE_ID || '';
  const ultramsgToken = process.env.ULTRAMSG_TOKEN || '';
  const customWebhookUrl = process.env.WHATSAPP_WEBHOOK_URL || '';

  if (callmebotApiKey) {
    return { provider: 'callmebot', callmebotApiKey };
  }
  if (ultramsgInstanceId && ultramsgToken) {
    return { provider: 'ultramsg', ultramsgInstanceId, ultramsgToken };
  }
  if (customWebhookUrl) {
    return { provider: 'custom_webhook', customWebhookUrl };
  }

  // Check persistent JSON file
  try {
    const configPath = getGatewayConfigPath();
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed) return parsed;
    }
  } catch (e) {
    // Ignore
  }

  return { provider: 'none' };
}

export function saveWhatsAppGatewayConfig(config: WhatsAppGatewayConfig): void {
  try {
    const configPath = getGatewayConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {
    console.warn('[WhatsAppGateway] Notice: read-only filesystem on serverless.');
  }
}

/**
 * Sends an automated server-to-WhatsApp message directly to the store owner's phone
 * without requiring the customer to open or click on WhatsApp.
 */
export async function sendAutomatedOrderWhatsApp(
  order: StoredOrder,
  ownerPhone: string
): Promise<{ success: boolean; provider?: string; error?: string }> {
  const config = getWhatsAppGatewayConfig();
  const cleanPhone = normalizeWhatsAppNumber(config.targetPhone || ownerPhone) || '201021483802';

  const itemsSummary = order.items
    .map((i) => `• ${i.quantity}x ${i.productNameAr || i.productNameEn} (${i.selectedSize} | ${i.selectedColor})`)
    .join('\n');

  const destination = [order.governorate, order.shippingCity, order.shippingAddress].filter(Boolean).join(' - ');

  const messageText = `🛍️ *طلب جديد وارد في دار أثير | ATHEER*
━━━━━━━━━━━━━━━━━━━━━
📦 *رقم الطلب:* ${order.orderReference}
👤 *العميل:* ${order.customerName}
📞 *هاتف العميل:* ${order.customerPhone}
📍 *العنوان:* ${destination}

🛒 *القطع المطلوبة:*
${itemsSummary}

💰 *الإجمالي المطلوب عند الاستلام:* *${order.totalAmount.toLocaleString()} جنيه مصري*
🚚 *طريقة الدفع:* ${order.paymentMethod === 'cash_on_delivery' ? 'كاش عند الاستلام (COD)' : order.paymentMethod}
${order.notes ? `📝 *ملاحظة العميل:* ${order.notes}\n` : ''}━━━━━━━━━━━━━━━━━━━━━
✨ تم تسجيل الطلب بالسيرفر وتجهيزه للشحن.`;

  // 1. CallMeBot Gateway (Free personal WhatsApp notifications API)
  if (config.callmebotApiKey || process.env.CALLMEBOT_APIKEY) {
    const apikey = config.callmebotApiKey || process.env.CALLMEBOT_APIKEY;
    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}&apikey=${apikey}`;
      const res = await fetch(url, { method: 'GET' });
      const text = await res.text();
      const isSuccess = res.ok && !text.toLowerCase().includes('error');
      return { success: isSuccess, provider: 'callmebot', error: isSuccess ? undefined : text };
    } catch (err: any) {
      console.warn('[CallMeBot WhatsApp Dispatch Error]', err);
      return { success: false, provider: 'callmebot', error: err.message };
    }
  }

  // 2. UltraMsg Gateway (Dedicated QR instance)
  if (config.ultramsgInstanceId && config.ultramsgToken) {
    try {
      const url = `https://api.ultramsg.com/${config.ultramsgInstanceId}/messages/chat`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: config.ultramsgToken,
          to: cleanPhone,
          body: messageText,
        }),
      });
      const data = await res.json();
      return { success: Boolean(data.sent), provider: 'ultramsg', error: data.error };
    } catch (err: any) {
      console.warn('[UltraMsg WhatsApp Dispatch Error]', err);
      return { success: false, provider: 'ultramsg', error: err.message };
    }
  }

  // 3. Custom Webhook
  if (config.customWebhookUrl) {
    try {
      const res = await fetch(config.customWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: cleanPhone,
          message: messageText,
          order,
        }),
      });
      return { success: res.ok, provider: 'custom_webhook' };
    } catch (err: any) {
      return { success: false, provider: 'custom_webhook', error: err.message };
    }
  }

  // No server-side gateway configured yet
  return {
    success: false,
    provider: 'none',
    error: 'No automated WhatsApp gateway API key configured. Configure CallMeBot or UltraMsg in Store Settings.',
  };
}
