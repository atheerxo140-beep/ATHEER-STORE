import { StoreSettings } from '@/types';
import fs from 'fs';
import path from 'path';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';
import { defaultStoreSettings } from './defaultStoreSettings';
import { cleanMojibake } from '@/lib/encodingUtils';
import { getStoreFilePath } from '@/lib/storePath';

export { defaultStoreSettings };

function getSettingsJsonPath(): string {
  try {
    return getStoreFilePath('store_settings.json');
  } catch (e) {
    return path.join(process.cwd(), 'src', 'data', 'store_settings.json');
  }
}

function loadLocalSettings(): StoreSettings {
  try {
    const filePath = getSettingsJsonPath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
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
    const filePath = getSettingsJsonPath();
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.warn('[StoreSettingsStore] Notice: read-only filesystem on serverless runtime.');
  }
}

// Global runtime instance
const globalForSettings = global as unknown as { currentStoreSettings?: StoreSettings };
export const currentStoreSettings: StoreSettings =
  globalForSettings.currentStoreSettings || loadLocalSettings();
globalForSettings.currentStoreSettings = currentStoreSettings;

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

// Cache tracking for cloud sync to prevent 7-20 second network blocking on each request
let lastSettingsSyncTime = 0;
const SETTINGS_CACHE_TTL_MS = 60 * 1000; // 60 seconds memory cache

export const getStoreSettings = async (): Promise<StoreSettings> => {
  // If memory cache is fresh, return immediately in 0ms
  const now = Date.now();
  if (now - lastSettingsSyncTime < SETTINGS_CACHE_TTL_MS && currentStoreSettings.storeNameEn) {
    return currentStoreSettings;
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error('Settings fetch timeout') }), 1200)
        );

        const fetchPromise = supabase
          .from('store_settings')
          .select('*')
          .eq('id', 'main_settings')
          .single();

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

        lastSettingsSyncTime = Date.now();

        if (!error && data) {
          const cloudSettings: StoreSettings = {
            storeNameEn: data.store_name_en || currentStoreSettings.storeNameEn,
            storeNameAr: cleanMojibake(data.store_name_ar) || currentStoreSettings.storeNameAr,
            taglineEn: data.tagline_en || currentStoreSettings.taglineEn,
            taglineAr: cleanMojibake(data.tagline_ar) || currentStoreSettings.taglineAr,
            whatsappNumber: data.whatsapp_number || currentStoreSettings.whatsappNumber,
            supportEmail: data.support_email || currentStoreSettings.supportEmail,
            supportPhone: data.whatsapp_number ? `+${data.whatsapp_number}` : currentStoreSettings.supportPhone,
            defaultCurrency: (data.default_currency as any) || currentStoreSettings.defaultCurrency,
            cairoShowroomsEn: data.cairo_showrooms_en || currentStoreSettings.cairoShowroomsEn,
            cairoShowroomsAr: cleanMojibake(data.cairo_showrooms_ar) || currentStoreSettings.cairoShowroomsAr,
            socialInstagram: currentStoreSettings.socialInstagram,
            socialTiktok: currentStoreSettings.socialTiktok,
            showQrCode: currentStoreSettings.showQrCode ?? true,
            qrTargetUrl: currentStoreSettings.qrTargetUrl || 'https://atheer.store',
          };

          Object.assign(currentStoreSettings, cloudSettings);
          return cloudSettings;
        }
      } catch (err) {
        console.warn('[StoreSettingsStore] Cloud load error:', err);
      }
    }
  }

  lastSettingsSyncTime = Date.now();
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
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          id: 'main_settings',
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
        });

      if (error) {
        throw new Error(`Failed to update store settings in Supabase: ${error.message}`);
      }
    }
  }

  return updated;
};
