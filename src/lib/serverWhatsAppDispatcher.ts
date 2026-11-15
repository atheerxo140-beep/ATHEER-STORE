import { StoredOrder } from '@/data/localOrdersStore';
import { normalizeWhatsAppNumber } from '@/lib/whatsappUtils';
import fs from 'fs';
import path from 'path';
import { getStoreFilePath } from '@/lib/storePath';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';

export interface WhatsAppGatewayConfig {
  provider: 'callmebot' | 'ultramsg' | 'custom_webhook' | 'none';
  targetPhone?: string;
  callmebotApiKey?: string;
  ultramsgInstanceId?: string;
  ultramsgToken?: string;
  customWebhookUrl?: string;
}

// In-memory runtime cache for serverless execution
let cachedGatewayConfig: WhatsAppGatewayConfig | null = null;

function getGatewayConfigPath(): string {
  try {
    return getStoreFilePath('whatsapp_gateway.json');
  } catch (e) {
    return path.join(process.cwd(), 'src', 'data', 'whatsapp_gateway.json');
  }
}

export async function getWhatsAppGatewayConfig(): Promise<WhatsAppGatewayConfig> {
  // Check memory cache first
  if (cachedGatewayConfig && (cachedGatewayConfig.callmebotApiKey || cachedGatewayConfig.ultramsgToken)) {
    return cachedGatewayConfig;
  }

  // Check env vars first
  const callmebotApiKey = process.env.CALLMEBOT_APIKEY || '';
  const ultramsgInstanceId = process.env.ULTRAMSG_INSTANCE_ID || '';
  const ultramsgToken = process.env.ULTRAMSG_TOKEN || '';
  const customWebhookUrl = process.env.WHATSAPP_WEBHOOK_URL || '';

  if (callmebotApiKey) {
    cachedGatewayConfig = { provider: 'callmebot', callmebotApiKey };
    return cachedGatewayConfig;
  }
  if (ultramsgInstanceId && ultramsgToken) {
    cachedGatewayConfig = { provider: 'ultramsg', ultramsgInstanceId, ultramsgToken };
    return cachedGatewayConfig;
  }
  if (customWebhookUrl) {
    cachedGatewayConfig = { provider: 'custom_webhook', customWebhookUrl };
    return cachedGatewayConfig;
  }

  // Check Supabase store_settings row id: 'whatsapp_gateway'
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('cairo_showrooms_ar')
          .eq('id', 'whatsapp_gateway')
          .maybeSingle();

        if (!error && data?.cairo_showrooms_ar) {
          try {
            const parsed = JSON.parse(data.cairo_showrooms_ar);
            if (parsed && (parsed.callmebotApiKey || parsed.ultramsgToken || parsed.provider !== 'none')) {
              cachedGatewayConfig = parsed;
              return parsed;
            }
          } catch (e) {}
        }
      } catch (err) {
        console.warn('[WhatsAppGateway] Supabase load error', err);
      }
    }
  }

  // Check persistent JSON file
  try {
    const configPath = getGatewayConfigPath();
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed) {
        cachedGatewayConfig = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // Ignore
  }

  return { provider: 'none' };
}

export async function saveWhatsAppGatewayConfig(config: WhatsAppGatewayConfig): Promise<void> {
  cachedGatewayConfig = config;

  // Persist locally
  try {
    const configPath = getGatewayConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {
    console.warn('[WhatsAppGateway] Notice: read-only filesystem on serverless.');
  }

  // Persist permanently in Supabase PostgreSQL
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        await supabase
          .from('store_settings')
          .upsert({
            id: 'whatsapp_gateway',
            store_name_en: 'WHATSAPP_GATEWAY',
            store_name_ar: 'إعدادات بوابة الواتساب التلقائية',
            cairo_showrooms_ar: JSON.stringify(config),
            whatsapp_number: config.targetPhone || '',
            default_currency: 'EGP',
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn('[WhatsAppGateway] Failed to save gateway config to Supabase', err);
      }
    }
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
  const config = await getWhatsAppGatewayConfig();
  const cleanPhone = normalizeWhatsAppNumber(config.targetPhone || ownerPhone) || '201500429943';

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
