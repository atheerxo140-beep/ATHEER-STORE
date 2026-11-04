'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Currency } from '@/types';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  // Brand
  brandName: { en: 'ATHEER', ar: 'أثير' },
  brandTagline: { en: 'PREMIUM YOUTH STREETWEAR', ar: 'أزياء الشارع الراقية للشباب' },
  brandOrigin: { en: 'RIYADH · DUBAI · LONDON', ar: 'الرياض · دبي · لندن' },

  // Announcement
  announcementText: {
    en: 'THE LAUNCH DROP: 500 GSM Heavyweight Hoodies & Sweatshirts | Complimentary GCC Delivery',
    ar: 'الإصدار الأول: هوديز وسويت شيرتات 500 GSM الثقيلة للشباب | توصيل مجاني لكافة دول الخليج',
  },

  // Navigation
  navHoodies: { en: 'Hoodies (Core)', ar: 'الهوديز (الأساسي)' },
  navSweatshirts: { en: 'Sweatshirts', ar: 'سويت شيرت' },
  navTeesFuture: { en: 'Future Drop: Tees', ar: 'الإصدار القادم: التي شيرتات' },
  navFitLab: { en: 'Fabric & Fit', ar: 'القماش والقصّات' },
  navBrand: { en: 'About ATHEER', ar: 'عن أثير' },
  navContact: { en: 'Concierge', ar: 'خدمة العملاء' },

  // Actions
  searchPlaceholder: { en: 'Search hoodies, crewnecks, heavyweight fleece...', ar: 'ابحث عن هوديز، سويت شيرتات، قماش ثقيل...' },
  myBag: { en: 'Shopping Bag', ar: 'حقيبة التسوق' },
  wishlist: { en: 'Wishlist', ar: 'المفضلة' },
  currencyLabel: { en: 'Currency', ar: 'العملة' },

  // Hero (Hoodies as Main Focus)
  heroBadge: { en: 'THE LAUNCH COLLECTION · 500 GSM HOODIES', ar: 'المجموعة الافتتاحية · هوديز 500 GSM' },
  heroTitle: { en: 'Engineered For The New Youth Standard', ar: 'معيار جديد لأزياء الستريتوير الشبابية' },
  heroSubtitle: {
    en: 'Ultra-dense 500 GSM organic French terry cotton. Sculpted drop-shoulder boxy silhouette. No drawstrings, pure structural volume.',
    ar: 'قطن فرنش تيري عضوي فائق الكثافة بوزن 500 GSM. قصّة بوكسي عريضة وأكتاف ساقطة تمنح قواماً ثابتاً وفخامة مينيمالية خالية من التعقيد.',
  },
  heroCtaPrimary: { en: 'Shop The Hoodies Drop', ar: 'تسوق تشكيلة الهوديز' },
  heroCtaSecondary: { en: 'Explore Sweatshirts', ar: 'استكشف السويت شيرتات' },
  heroStat1Value: { en: '500 GSM', ar: '٥٠٠ GSM' },
  heroStat1Label: { en: 'Heavyweight French Terry', ar: 'قطن فرنش تيري فائق الثقل' },
  heroStat2Value: { en: 'Boxy Fit', ar: 'قصّة بوكسي' },
  heroStat2Label: { en: 'Engineered Drop-Shoulder', ar: 'أكتاف منسدلة متوازنة' },
  heroStat3Value: { en: 'Pre-Shrunk', ar: 'مقاوم للانكماش' },
  heroStat3Label: { en: 'Garment Dyed & Washed', ar: 'مصبوغ ومغسول بالإنزيم' },

  // Categories / Collections Showcase
  curatedCollections: { en: 'Launch Collection Categories', ar: 'فئات الإطلاق الرسمي' },
  collectionsTitle: { en: 'The Heavyweight Youth Wardrobe', ar: 'خزانة الستريتوير الشبابية الفاخرة' },
  collectionsSubtitle: {
    en: 'Centred around our flagship 500 GSM hoodies and tailored crewnecks, engineered for daily wear and unmatched durability.',
    ar: 'محورها الرئيسي الهوديز فائقة الثقل 500 GSM والسويت شيرتات المتقنة، صُممت لتتحمل الارتداء اليومي وتمنح حضوراً لافتاً.',
  },
  catHoodiesTitle: { en: 'Heavyweight Boxy Hoodies', ar: 'الهوديز الثقيلة (المنتج الرئيسي)' },
  catHoodiesDesc: { en: 'Our signature 480-500 GSM double-hood silhouettes in Onyx, Bone, and Washed Charcoal.', ar: 'القطعة الأساسية للدار بوزن 480 إلى 500 GSM بغطاء رأس مزدوج بدون حبال.' },
  catSweatshirtsTitle: { en: 'Atelier Crewnecks & Sweatshirts', ar: 'سويت شيرتات الكرو نيك الراقية' },
  catSweatshirtsDesc: { en: 'Minimalist 450 GSM crewneck pullovers and quarter-zip cuts with reinforced cuffs.', ar: 'تصاميم كرو نيك وهاف زيب بوزن 450 GSM مع أساور مقواة لا تتمدد.' },
  catFabricLabTitle: { en: 'The Fabric & Fit Architecture', ar: 'هندسة القماش والقصّة' },
  catFabricLabDesc: { en: 'Custom milled organic loopback cotton, zero chemical softening, natural drape.', ar: 'أنوال نسيج مخصصة من القطن العضوي المتين، خالية من المعالجات الكيميائية.' },
  catTeesTeaserTitle: { en: 'Future Drop: 320 GSM Tees', ar: 'الإصدار القادم: تي شيرتات 320 GSM' },
  catTeesTeaserDesc: { en: 'Upcoming oversized youth tees currently in sampling. Launching in the next drop.', ar: 'تي شيرتات شبابية أوفرسايز فائقة الكثافة. يجري تجهيزها للإطلاق القادم.' },
  exploreCategory: { en: 'Explore', ar: 'استكشف' },

  // Products Section
  productSectionBadge: { en: 'CURRENT LAUNCH DROP', ar: 'قطع الإطلاق الحالي' },
  productSectionTitle: { en: 'The Heavyweight Lineup', ar: 'تشكيلة الهوديز والسويت شيرتات' },
  productSectionSubtitle: {
    en: 'Crafted with obsessive attention to fabric weight, collar structure, and relaxed streetwear fit.',
    ar: 'صُنعت بعناية فائقة لوزن القماش، وثبات الياقة، والتوازن المثالي للقصّة الشبابية الواسعة.',
  },
  filterAll: { en: 'All Drops', ar: 'جميع القطع' },
  filterHoodies: { en: 'Hoodies (Core)', ar: 'الهوديز (الأساسي)' },
  filterSweatshirts: { en: 'Sweatshirts', ar: 'السويت شيرت' },
  filterTees: { en: 'Upcoming: Tees', ar: 'قريباً: تي شيرتات' },

  // Product Card Details
  addToBag: { en: 'Add to Bag', ar: 'أضف للحقيبة' },
  quickView: { en: 'Quick Specs', ar: 'تفاصيل القطعة' },
  currencySar: { en: 'SAR', ar: 'ر.س' },
  inStock: { en: 'In Stock · Ready to Ship', ar: 'متوفر · جاهز للشحن الفوري' },
  comingSoon: { en: 'Future Drop · Teaser', ar: 'إصدار قادم · قريباً' },

  // Brand Story / Manifesto
  storyBadge: { en: 'THE ATHEER PHILOSOPHY', ar: 'فلسفة أثير' },
  storyTitle: { en: 'Heavyweight Minimalism For Modern Youth', ar: 'المينيمالية الثقيلة لجيل الشباب المعاصر' },
  storyParagraph1: {
    en: 'ATHEER was born from a frustration with flimsy fast-fashion streetwear. We set out to build the ultimate hoodie: substantial 500 GSM weight, an architectural boxy drape, and subtle matte gold accents that whisper luxury rather than shouting logos.',
    ar: 'انطلقت دار أثير من الرغبة في إنهاء زمن الستريتوير الخفيف والرخيص. هدفنا ابتكار الهودي المثالي: وزن حقيقي يبلغ 500 GSM، وقصّة بوكسي معمارية تمنح هيبة وثقة، مع لمسات ذهبية مطفأة هادئة تعكس فخامة المحتوى دون صخب الشعارات.',
  },
  storyParagraph2: {
    en: 'Every piece is knitted from combed organic long-staple cotton, pre-shrunk to retain its silhouette through relentless wear. Our current focus is perfecting the hoodie and sweatshirt; upcoming drops will introduce our heavy boxy tees.',
    ar: 'تُحاك كل قطعة من أجود خيوط القطن العضوي طويل التيلة، وتُعالج ضد الانكماش لتحافظ على مقاسها وهيبتها دائماً. تركيزنا الحالي ينصب على الهودي والسويت شيرت، وستتبعه قريباً تشكيلة التي شيرتات الثقيلة.',
  },

  // Luxury / Streetwear Pillars
  pillar1Title: { en: '500 GSM Heavyweight Fabric', ar: 'أقمشة ثقيلة 500 GSM' },
  pillar1Desc: { en: 'Custom dense French terry cotton with unmatched warmth, structure, and zero drooping.', ar: 'قطن فرنش تيري مخصص فائق الكثافة يمنح قواماً ثابتاً ودفئاً مثالياً دون أي ترهل.' },
  pillar2Title: { en: 'Engineered Boxy Cut', ar: 'قصّة بوكسي مريحة ومدروسة' },
  pillar2Desc: { en: 'Drop-shoulder proportions that drape cleanly over any body type without bunching.', ar: 'أبعاد أكتاف ساقطة تمنح انسيابية وأناقة عصرية مريحة لكافة الأجسام.' },
  pillar3Title: { en: 'Cash on Delivery (COD)', ar: 'الدفع عند الاستلام' },
  pillar3Desc: { en: 'Fast express courier across Riyadh, Jeddah, Dubai, and all GCC cities with COD options.', ar: 'شحن سريع وموثوق لكافة مدن المملكة ودول الخليج مع خيار الدفع عند الاستلام.' },
  pillar4Title: { en: 'WhatsApp Drop Concierge', ar: 'خدمة كبار العملاء عبر واتساب' },
  pillar4Desc: { en: 'Direct styling advice, sizing verification, and order assistance via WhatsApp.', ar: 'مساعدة فورية لاختيار المقاس المناسب والاستفسار عن الإصدارات والطلبات.' },

  // Cart Drawer
  cartTitle: { en: 'Your Shopping Bag', ar: 'حقيبة التسوق' },
  cartEmpty: { en: 'Your shopping bag is currently empty.', ar: 'حقيبة التسوق فارغة حالياً.' },
  cartSubtotal: { en: 'Subtotal', ar: 'المجموع الجزئي' },
  cartShippingNotice: { en: 'Free GCC express delivery applied at checkout', ar: 'توصيل سريع مجاني لكافة دول الخليج عند إتمام الطلب' },
  checkoutBtn: { en: 'Proceed to Checkout', ar: 'متابعة الدفع الآمن' },
  checkoutNote: {
    en: 'Real checkout & Cash on Delivery order processing will be activated in the next development milestone.',
    ar: 'سيتم تفعيل الدفع الحقيقي وإتمام الطلبات بالدفع عند الاستلام في المرحلة القادمة.',
  },
  continueShopping: { en: 'Explore More Hoodies', ar: 'استكشف المزيد من الهوديز' },

  // Newsletter / Drop Alerts
  newsletterBadge: { en: 'THE ATHEER DROP CLUB', ar: 'نادي إصدارات أثير' },
  newsletterTitle: { en: 'Get Notified Before Drops Sell Out', ar: 'كن أول من يعلم عند إطلاق الإصدارات' },
  newsletterSubtitle: {
    en: 'Exclusive access to limited hoodie colorways, sweatshirt restocks, and first access to our upcoming Youth T-Shirts drop.',
    ar: 'أولوية الشراء لإصدارات الهوديز المحدودة، وإشعارات إعادة التوفر، ومعاينة حصرية لتشكيلة التي شيرتات القادمة.',
  },
  newsletterPlaceholder: { en: 'Enter your email for drop alerts...', ar: 'أدخل بريدك الإلكتروني ليصلك موعد الإصدار...' },
  newsletterBtn: { en: 'Join Drop List', ar: 'انضم لقائمة الإطلاق' },

  // WhatsApp
  whatsappTitle: { en: 'ATHEER Sizing & Drops', ar: 'مستشار مقاسات أثير' },
  whatsappText: { en: 'Ask about sizing, fits & drops', ar: 'استفسر عن المقاسات والإصدارات' },

  // Footer
  footerDesc: {
    en: 'ATHEER is a modern youth streetwear brand founded on heavyweight textiles, minimalist luxury cuts, and sovereign aesthetic standards.',
    ar: 'أثير هي علامة أزياء ستريتوير شبابية فاخرة، تأسست على مبدأ الأقمشة فائقة الثقل، والقصّات العصرية المينيمالية، والهوية الخليجية الراقية.',
  },
  footerCol1: { en: 'Collections', ar: 'التشكيلات' },
  footerCol2: { en: 'Customer Support', ar: 'خدمة العملاء' },
  footerCol3: { en: 'The Brand', ar: 'عن العلامة' },
  footerRights: { en: 'All rights reserved. Engineered for the youth.', ar: 'جميع الحقوق محفوظة. صُممت لجيل الشباب الواثق.' },
  footerCodBadge: { en: 'Cash on Delivery Available in KSA & UAE', ar: 'الدفع عند الاستلام متاح في السعودية والإمارات' },
  footerGCCDelivery: { en: 'Complimentary Delivery: KSA, UAE, Qatar, Kuwait, Bahrain, Oman', ar: 'توصيل مجاني: السعودية، الإمارات، قطر، الكويت، البحرين، عُمان' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
  isRtl: boolean;
  formatPrice: (amountInSar: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('SAR');

  useEffect(() => {
    const saved = localStorage.getItem('atheer_language') as Language;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('atheer_language', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: string): string => {
    const item = translations[key];
    if (!item) return key;
    return item[language] || item.en || key;
  };

  const isRtl = language === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  const formatPrice = (amountInSar: number): string => {
    let rate = 1;
    let symbol = language === 'ar' ? 'ر.س' : 'SAR';

    if (currency === 'AED') {
      rate = 0.98;
      symbol = language === 'ar' ? 'د.إ' : 'AED';
    } else if (currency === 'USD') {
      rate = 0.266;
      symbol = '$';
    }

    const converted = Math.round(amountInSar * rate);
    const formatted = converted.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');

    if (currency === 'USD') {
      return `$${formatted}`;
    }
    return language === 'ar' ? `${formatted} ${symbol}` : `${symbol} ${formatted}`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        currency,
        setCurrency,
        dir,
        t,
        isRtl,
        formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
