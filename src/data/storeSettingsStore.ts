import { StoreSettings } from '@/types';
import fs from 'fs';
import path from 'path';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';
import { defaultStoreSettings } from './defaultStoreSettings';

export { defaultStoreSettings };

const JSON_PATH = path.join(process.cwd(), 'src', 'data', 'store_settings.json');

function loadLocalSettings(): StoreSettings {
  try {
    if (fs.existsSync(JSON_PATH)) {
      const data = fs.readFileSync(JSON_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && (parsed.storeNameEn || parsed.whatsappNumber)) {
        return { ...defaultStoreSettings, ...parsed };
      }
    }
  } catch (err) {
    console.error('[StoreSettingsStore] Error reading local settings json:', err);
  }
  return { ...defaultStoreSettings };
}

function persistLocalSettings(settings: StoreSettings) {
  try {
    fs.writeFileSync(JSON_PATH, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.warn('[StoreSettingsStore] Notice: read-only filesystem on serverless runtime.');
  }
}

// Global runtime instance
const globalForSettings = global as unknown as { currentStoreSettings?: StoreSettings };
export const currentStoreSettings: StoreSettings =
  globalForSettings.currentStoreSettings || loadLocalSettings();

if (process.env.NODE_ENV !== 'production') {
  globalForSettings.currentStoreSettings = currentStoreSettings;
}

// Helper to normalize Egyptian WhatsApp numbers
export function normalizeWhatsAppNumber(raw: string): string {
  if (!raw) return '';
  let digits = raw.replace(/[^0-9]/g, '');
  // If user entered with international prefix 0020...
  if (digits.startsWith('00201') && digits.length === 14) {
    return digits.substring(2);
  }
  // If local Egyptian number e.g. 010..., 011..., 012..., 015...
  if (digits.startsWith('01') && digits.length === 11) {
    return '20' + digits.substring(1);
  }
  // If international format without + e.g. 201...
  if (digits.startsWith('201') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }
  // Otherwise return cleaned digits
  return digits;
}

export const getStoreSettings = async (): Promise<StoreSettings> => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('id', 'main_settings')
          .single();

        if (!error && data) {
          const cloudSettings: StoreSettings = {
            storeNameEn: data.store_name_en || currentStoreSettings.storeNameEn,
            storeNameAr: data.store_name_ar || currentStoreSettings.storeNameAr,
            taglineEn: data.tagline_en || currentStoreSettings.taglineEn,
            taglineAr: data.tagline_ar || currentStoreSettings.taglineAr,
            whatsappNumber: data.whatsapp_number || currentStoreSettings.whatsappNumber,
            supportEmail: data.support_email || currentStoreSettings.supportEmail,
            supportPhone: data.whatsapp_number ? `+${data.whatsapp_number}` : currentStoreSettings.supportPhone,
            defaultCurrency: (data.default_currency as any) || currentStoreSettings.defaultCurrency,
            cairoShowroomsEn: data.cairo_showrooms_en || currentStoreSettings.cairoShowroomsEn,
            cairoShowroomsAr: data.cairo_showrooms_ar || currentStoreSettings.cairoShowroomsAr,
            socialInstagram: currentStoreSettings.socialInstagram,
            socialTiktok: currentStoreSettings.socialTiktok,
          };

          Object.assign(currentStoreSettings, cloudSettings);
          return cloudSettings;
        }
      } catch (err) {
        console.warn('[StoreSettingsStore] Cloud load error:', err);
      }
    }
  }

  return currentStoreSettings;
};

export const updateStoreSettings = async (
  updates: Partial<StoreSettings>
): Promise<StoreSettings> => {
  if (updates.whatsappNumber) {
    updates.whatsappNumber = normalizeWhatsAppNumber(updates.whatsappNumber);
  }

  const updated: StoreSettings = {
    ...currentStoreSettings,
    ...updates,
  };

  Object.assign(currentStoreSettings, updated);
  persistLocalSettings(updated);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        await supabase
          .from('store_settings')
          .update({
            store_name_en: updated.storeNameEn,
            store_name_ar: updated.storeNameAr,
            tagline_en: updated.taglineEn,
            tagline_ar: updated.taglineAr,
            whatsapp_number: updated.whatsappNumber,
            support_email: updated.supportEmail,
            default_currency: updated.defaultCurrency,
            cairo_showrooms_en: updated.cairoShowroomsEn,
            cairo_showrooms_ar: updated.cairoShowroomsAr,
            updated_at: new Date().toISOString(),
          })
          .eq('id', 'main_settings');
      } catch (err) {
        console.warn('[StoreSettingsStore] Cloud update fallback:', err);
      }
    }
  }

  return updated;
};
