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
  brandBorder: '#282828',
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
  announcementTextAr: 'إصدار الانطلاق: هوديز وسويت شيرتات ثقيلة ٥٠٠ جم/م² | توصيل سريع ودفع عند الاستلام لكافة المحافظات',
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

/**
 * Converts a 3 or 6 digit hex string to comma-separated RGB values: "r, g, b"
 */
export function hexToRgb(hex?: string): string {
  if (!hex) return '197, 168, 128';
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  if (cleaned.length !== 6) return '197, 168, 128';
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '197, 168, 128';
  return `${r}, ${g}, ${b}`;
}

/**
 * Adjusts brightness of a hex color (+- percentage)
 */
export function adjustHexBrightness(hex: string, percent: number): string {
  if (!hex) return hex;
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  if (cleaned.length !== 6) return hex;
  const num = parseInt(cleaned, 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

/**
 * Compiles dynamic CSS variables reflecting the live ThemeConfig
 */
export function generateThemeCss(theme: ThemeConfig): string {
  const gold = theme.brandGold || '#C5A880';
  const goldHover = adjustHexBrightness(gold, -15);
  const goldLight = adjustHexBrightness(gold, 25);
  const goldDark = adjustHexBrightness(gold, -35);

  const black = theme.brandBlack || '#0A0A0A';
  const charcoal = theme.brandCharcoal || adjustHexBrightness(black, 10);
  const dark = adjustHexBrightness(black, 16);
  const stone = theme.brandStone || adjustHexBrightness(black, 22);
  const border = theme.brandBorder || adjustHexBrightness(black, 28);
  const ivory = theme.brandIvory || '#FAF9F6';
  const cream = theme.brandCream || '#F0EAE1';

  const fontAr = theme.fontFamilyAr || 'Cairo';
  const fontEn = theme.fontFamilyEn || 'Cinzel';
  const fontArParam = encodeURIComponent(fontAr).replace(/%20/g, '+');
  const fontEnParam = encodeURIComponent(fontEn).replace(/%20/g, '+');
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontArParam}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=${fontEnParam}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap`;

  return `
    @import url('${googleFontsUrl}');

    :root {
      --font-family-ar: '${fontAr}', 'Cairo', 'Tajawal', system-ui, sans-serif;
      --font-family-en: '${fontEn}', 'Cinzel', 'Inter', system-ui, sans-serif;

      --brand-gold: ${gold};
      --brand-gold-rgb: ${hexToRgb(gold)};
      --brand-gold-hover: ${goldHover};
      --brand-gold-hover-rgb: ${hexToRgb(goldHover)};
      --brand-gold-light: ${goldLight};
      --brand-gold-light-rgb: ${hexToRgb(goldLight)};
      --brand-gold-dark: ${goldDark};
      --brand-gold-dark-rgb: ${hexToRgb(goldDark)};

      --brand-black: ${black};
      --brand-black-rgb: ${hexToRgb(black)};
      --brand-charcoal: ${charcoal};
      --brand-charcoal-rgb: ${hexToRgb(charcoal)};
      --brand-dark: ${dark};
      --brand-dark-rgb: ${hexToRgb(dark)};
      --brand-stone: ${stone};
      --brand-stone-rgb: ${hexToRgb(stone)};
      --brand-border: ${border};
      --brand-border-rgb: ${hexToRgb(border)};

      --brand-ivory: ${ivory};
      --brand-ivory-rgb: ${hexToRgb(ivory)};
      --brand-cream: ${cream};
      --brand-cream-rgb: ${hexToRgb(cream)};
    }

    .font-english {
      font-family: var(--font-family-en) !important;
    }

    .font-arabic {
      font-family: var(--font-family-ar) !important;
    }

    /* Dual Language Harmony — Latin glyphs use English font, Arabic glyphs use Arabic font */
    [dir="rtl"], [dir="rtl"] body {
      font-family: var(--font-family-en), var(--font-family-ar), system-ui, sans-serif !important;
    }

    [dir="rtl"] h1:not(.font-arabic), [dir="rtl"] h2:not(.font-arabic), [dir="rtl"] h3:not(.font-arabic),
    [dir="rtl"] h4:not(.font-arabic), [dir="rtl"] h5:not(.font-arabic), [dir="rtl"] h6:not(.font-arabic),
    [dir="rtl"] .font-serif, [dir="rtl"] .font-sans {
      font-family: var(--font-family-en), var(--font-family-ar), system-ui, sans-serif !important;
    }

    [dir="ltr"], [dir="ltr"] body {
      font-family: var(--font-family-en), var(--font-family-ar), system-ui, sans-serif !important;
    }

    [dir="ltr"] h1:not(.font-arabic), [dir="ltr"] h2:not(.font-arabic), [dir="ltr"] h3:not(.font-arabic),
    [dir="ltr"] h4:not(.font-arabic), [dir="ltr"] h5:not(.font-arabic), [dir="ltr"] h6:not(.font-arabic),
    [dir="ltr"] .font-serif, [dir="ltr"] .font-sans {
      font-family: var(--font-family-en), var(--font-family-ar), system-ui, sans-serif !important;
    }

    html, body {
      background-color: var(--brand-black, #0A0A0A) !important;
      color: var(--brand-ivory, #FAF9F6) !important;
      transition: background-color 0.25s ease, color 0.25s ease;
    }

    ::selection {
      background-color: var(--brand-gold, #C5A880) !important;
      color: var(--brand-black, #0A0A0A) !important;
    }

    /* =========================================================================
       Light Mode Overrides (Luxury Minimalist Sand & Rich Warm Bronze)
       ========================================================================= */
    html.theme-light, [data-theme="light"] {
      --brand-black: #F8F6F0;
      --brand-black-rgb: 248, 246, 240;
      --brand-charcoal: #FFFFFF;
      --brand-charcoal-rgb: 255, 255, 255;
      --brand-dark: #F0EAE1;
      --brand-dark-rgb: 240, 234, 225;
      --brand-stone: #E6DFD3;
      --brand-stone-rgb: 230, 223, 211;
      --brand-border: #DCD3C5;
      --brand-border-rgb: 220, 211, 197;

      --brand-ivory: #111111;
      --brand-ivory-rgb: 17, 17, 17;
      --brand-cream: #2C2C2E;
      --brand-cream-rgb: 44, 44, 46;

      --brand-gold: #9E783E;
      --brand-gold-rgb: 158, 120, 62;
      --brand-gold-hover: #83622E;
      --brand-gold-hover-rgb: 131, 98, 46;
      --brand-gold-light: #5A4016;
      --brand-gold-light-rgb: 90, 64, 22;
      --brand-gold-dark: #C5A880;
      --brand-gold-dark-rgb: 197, 168, 128;
    }

    html.theme-light, html.theme-light body {
      background-color: #F8F6F0 !important;
      color: #111111 !important;
    }

    html.theme-light ::selection {
      background-color: #9E783E !important;
      color: #FFFFFF !important;
    }

    html.theme-light ::-webkit-scrollbar-track {
      background: #F8F6F0;
    }

    html.theme-light ::-webkit-scrollbar-thumb {
      background: #DCD3C5;
    }

    html.theme-light ::-webkit-scrollbar-thumb:hover {
      background: #9E783E;
    }

    html.theme-light .shadow-luxury-dark {
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08) !important;
    }
  `;
}

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

    // If black was changed but charcoal/stone/border were not explicitly passed, auto-harmonize them
    if (updates.brandBlack && !updates.brandCharcoal) {
      updated.brandCharcoal = adjustHexBrightness(updates.brandBlack, 10);
    }
    if (updates.brandBlack && !updates.brandStone) {
      updated.brandStone = adjustHexBrightness(updates.brandBlack, 22);
    }
    if (updates.brandBlack && !updates.brandBorder) {
      updated.brandBorder = adjustHexBrightness(updates.brandBlack, 28);
    }

    fs.writeFileSync(getStorePath(), JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  } catch (e) {
    console.error('[ThemeService] Failed to update theme config', e);
    return defaultThemeConfig;
  }
}
