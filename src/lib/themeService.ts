import fs from 'fs';
import path from 'path';
import { ThemeConfig } from '@/types';
import { getStoreFilePath } from '@/lib/storePath';

const getStorePath = () => getStoreFilePath('theme_store.json');

export const defaultThemeConfig: ThemeConfig = {
  brandGold: '#C5A880',
  brandBlack: '#0A0A0A',
  brandCharcoal: '#141414',
  brandStone: '#1F1F1F',
  brandIvory: '#FAF9F6',
  brandCream: '#F0EAE1',
  fontFamilyAr: 'Cairo',
  fontFamilyEn: 'Cinzel',
  borderRadius: 'subtle',
  buttonStyle: 'solid-gold',
  cardStyle: 'bordered',
  headerSticky: true,
  headerShowSearch: true,
  headerShowWishlist: true,
  headerShowAccount: true,
  headerShowCart: true,
  announcementEnabled: true,
  announcementTextEn: 'THE LAUNCH DROP: 500 GSM Heavyweight Hoodies & Sweatshirts | Fast Delivery Across Egypt',
  announcementTextAr: 'إصدار الانطلاق: هوديز وسويت شيرتات ثقيلة 500 GSM | توصيل سريع ودفع عند الاستلام لكافة المحافظات',
  announcementBg: '#C5A880',
  announcementColor: '#0A0A0A',
  announcementLink: '/#offers',
  footerShowroomEn: 'Digital Flagship Atelier (Cairo, Egypt) · Seasonal Pop-up Locations Announced Per Drop',
  footerShowroomAr: 'الأتيليه الرقمي (القاهرة، مصر) · مواقع المعارض المؤقتة تُعلن مع كل إصدار موسمي',
  footerCopyrightEn: '© 2026 ATHEER. All rights reserved. Heavyweight streetwear crafted for Egypt.',
  footerCopyrightAr: '© 2026 أثير (ATHEER). جميع الحقوق محفوظة. ستريتوير ثقيل فائق الفخامة لمصر.',
  maintenanceMode: false,
  maintenanceMessageAr: 'جاري تجهيز الإصدار الشتوي القادم في الأتيليه... سنعود للعمل قريباً جداً!',
  maintenanceMessageEn: 'Our digital atelier is preparing the next heavyweight drop... We will be back shortly!'
};

export function getThemeConfig(): ThemeConfig {
  try {
    const filePath = getStorePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return { ...defaultThemeConfig, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('[ThemeService] Failed to read theme config', e);
  }
  return defaultThemeConfig;
}

export function updateThemeConfig(updates: Partial<ThemeConfig>): ThemeConfig {
  try {
    const current = getThemeConfig();
    const updated = { ...current, ...updates };
    fs.writeFileSync(getStorePath(), JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  } catch (e) {
    console.error('[ThemeService] Failed to update theme config', e);
    return defaultThemeConfig;
  }
}
