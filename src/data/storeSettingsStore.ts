import { StoreSettings } from '@/types';

export const defaultStoreSettings: StoreSettings = {
  storeNameEn: 'ATHEER',
  storeNameAr: 'أثير',
  taglineEn: 'PREMIUM YOUTH STREETWEAR',
  taglineAr: 'أزياء الشارع الراقية للشباب',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  supportEmail: 'concierge@atheer.store',
  supportPhone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    ? `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`
    : 'Pending Official Assignment',
  defaultCurrency: 'EGP',
  cairoShowroomsEn: 'Digital Flagship Atelier (Cairo, Egypt) · Seasonal Pop-ups Announced Per Drop',
  cairoShowroomsAr: 'الأتيليه الرقمي (القاهرة، مصر) · مواقع المعارض المؤقتة تُعلن مع كل إصدار',
  socialInstagram: 'https://instagram.com/atheer.store',
  socialTiktok: 'https://tiktok.com/@atheer.store',
};

const globalForSettings = global as unknown as { currentStoreSettings?: StoreSettings };
export const currentStoreSettings: StoreSettings =
  globalForSettings.currentStoreSettings || { ...defaultStoreSettings };

if (process.env.NODE_ENV !== 'production') {
  globalForSettings.currentStoreSettings = currentStoreSettings;
}

export const getStoreSettings = (): StoreSettings => {
  return currentStoreSettings;
};

export const updateStoreSettings = (updates: Partial<StoreSettings>): StoreSettings => {
  Object.assign(currentStoreSettings, updates);
  return currentStoreSettings;
};
