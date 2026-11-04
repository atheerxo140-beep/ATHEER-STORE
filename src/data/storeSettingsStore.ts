import { StoreSettings } from '@/types';

export const defaultStoreSettings: StoreSettings = {
  storeNameEn: 'ATHEER',
  storeNameAr: 'أثير',
  taglineEn: 'PREMIUM YOUTH STREETWEAR',
  taglineAr: 'أزياء الشارع الراقية للشباب',
  whatsappNumber: '201000000000',
  supportEmail: 'concierge@atheer.store',
  supportPhone: '+20 10 0000 0000',
  defaultCurrency: 'EGP',
  cairoShowroomsEn: 'New Cairo (Fifth Settlement) · Sheikh Zayed',
  cairoShowroomsAr: 'القاهرة الجديدة (التجمع الخامس) · الشيخ زايد',
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
