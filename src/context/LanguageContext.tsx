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
  brandOrigin: { en: 'CAIRO · ALEXANDRIA · LONDON', ar: 'القاهرة · الإسكندرية · لندن' },

  // Announcement
  announcementText: {
    en: 'THE LAUNCH DROP: 500 GSM Heavyweight Hoodies & Sweatshirts | Fast Delivery Across Egypt',
    ar: 'الإصدار الأول: هوديز وسويت شيرتات 500 GSM الفاخرة للشباب | شحن سريع لجميع محافظات مصر',
  },

  // Navigation
  navHoodies: { en: 'Hoodies (Core)', ar: 'الهوديز (الأساسي)' },
  navSweatshirts: { en: 'Sweatshirts', ar: 'سويت شيرت' },
  navTeesFuture: { en: 'Future Drop: Tees', ar: 'الإصدار القادم: التي شيرتات' },
  navFitLab: { en: 'Fabric & Fit', ar: 'القماش والقصّات' },
  navBrand: { en: 'About ATHEER', ar: 'عن أثير' },
  navAdmin: { en: 'Admin Portal', ar: 'لوحة الإدارة' },

  // Actions
  searchPlaceholder: { en: 'Search hoodies, crewnecks, heavyweight fleece...', ar: 'ابحث عن هوديز، سويت شيرتات، قماش ثقيل...' },
  myBag: { en: 'Shopping Bag', ar: 'حقيبة التسوق' },
  wishlist: { en: 'Wishlist', ar: 'المفضلة' },
  currencyLabel: { en: 'Currency: EGP', ar: 'العملة: جنيه مصري' },

  // Hero
  heroBadge: { en: 'THE LAUNCH COLLECTION · 500 GSM HOODIES', ar: 'المجموعة الافتتاحية · هوديز 500 GSM' },
  heroTitle: { en: 'Engineered For The New Youth Standard', ar: 'معيار جديد لأزياء الستريتوير الشبابية' },
  heroSubtitle: {
    en: 'Ultra-dense 500 GSM specification French terry cotton. Sculpted drop-shoulder boxy silhouette. No drawstrings, pure structural volume.',
    ar: 'قطن فرنش تيري كثيف بمواصفات 500 GSM. قصّة بوكسي عريضة وأكتاف ساقطة تمنح قواماً ثابتاً وفخامة مينيمالية خالية من التعقيد.',
  },
  heroCtaPrimary: { en: 'Shop The Hoodies Drop', ar: 'تسوق تشكيلة الهوديز' },
  heroCtaSecondary: { en: 'Explore Sweatshirts', ar: 'استكشف السويت شيرتات' },
  heroStat1Value: { en: '500 GSM', ar: '٥٠٠ GSM' },
  heroStat1Label: { en: 'Heavyweight Spec', ar: 'مواصفات ثقيلة معتمدة' },
  heroStat2Value: { en: 'Boxy Fit', ar: 'قصّة بوكسي' },
  heroStat2Label: { en: 'Engineered Drop-Shoulder', ar: 'أكتاف منسدلة متوازنة' },
  heroStat3Value: { en: 'Pre-Shrunk', ar: 'مقاوم للانكماش' },
  heroStat3Label: { en: 'Garment Dyed & Washed', ar: 'مصبوغ ومغسول بالإنزيم' },

  // Categories / Collections Showcase
  curatedCollections: { en: 'Launch Collection Categories', ar: 'فئات الإطلاق الرسمي' },
  collectionsTitle: { en: 'The Heavyweight Youth Wardrobe', ar: 'خزانة الستريتوير الشبابية الفاخرة' },
  collectionsSubtitle: {
    en: 'Centred around our flagship 500 GSM hoodies and tailored crewnecks, engineered for daily wear and unmatched durability across Egypt.',
    ar: 'محورها الرئيسي الهوديز فائقة الثقل 500 GSM والسويت شيرتات المتقنة، صُممت لتتحمل الارتداء اليومي في شوارع مصر.',
  },
  catHoodiesTitle: { en: 'Heavyweight Boxy Hoodies', ar: 'الهوديز الثقيلة (المنتج الرئيسي)' },
  catHoodiesDesc: { en: 'Our signature 480-500 GSM double-hood silhouettes in Onyx, Bone, and Washed Charcoal.', ar: 'القطعة الأساسية للدار بوزن 480 إلى 500 GSM بغطاء رأس مزدوج بدون حبال.' },
  catSweatshirtsTitle: { en: 'Atelier Crewnecks & Sweatshirts', ar: 'سويت شيرتات الكرو نيك الراقية' },
  catSweatshirtsDesc: { en: 'Minimalist 450 GSM crewneck pullovers and quarter-zip cuts with reinforced cuffs.', ar: 'تصاميم كرو نيك وهاف زيب بمواصفات 450 GSM مع أساور مقواة لا تتمدد.' },
  catFabricLabTitle: { en: 'The Fabric & Fit Architecture', ar: 'هندسة القماش والقصّة' },
  catFabricLabDesc: { en: 'Custom milled loopback cotton blend, zero chemical softening, natural drape.', ar: 'مزيج قطن مريح ومتين، خالٍ من المعالجات الكيميائية الزائدة.' },
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
  currencyEg: { en: 'EGP', ar: 'ج.م' },
  inStock: { en: 'In Stock · Ready to Ship', ar: 'متوفر · جاهز للشحن الفوري' },
  comingSoon: { en: 'Future Drop · Teaser', ar: 'إصدار قادم · قريباً' },

  // Brand Story / Manifesto
  storyBadge: { en: 'THE ATHEER PHILOSOPHY', ar: 'فلسفة أثير' },
  storyTitle: { en: 'Heavyweight Minimalism For Modern Youth', ar: 'المينيمالية الثقيلة لجيل الشباب المعاصر' },
  storyParagraph1: {
    en: 'ATHEER was born from a desire to elevate youth streetwear in Egypt and beyond. We build pieces with true substance: 500 GSM density specifications, an architectural boxy drape, and subtle matte gold accents that speak with quiet confidence.',
    ar: 'انطلقت دار أثير من الرغبة في إرساء معايير جديدة للستريتوير الشبابي في مصر والمنطقة. نبتكر قطعاً ذات وزن حقيقي بمواصفات 500 GSM، وقصّة بوكسي معمارية تمنح هيبة وثقة، مع لمسات ذهبية مطفأة هادئة تعكس فخامة المحتوى.',
  },
  storyParagraph2: {
    en: 'Every piece is engineered to retain its silhouette through relentless everyday wear. Our current focus is perfecting the hoodie and sweatshirt; upcoming drops will introduce our heavy boxy tees.',
    ar: 'صُممت كل قطعة لتحافظ على مقاسها وهيبتها دائماً مع الاستخدام المتكرر. تركيزنا الحالي ينصب على الهودي والسويت شيرت، وستتبعه قريباً تشكيلة التي شيرتات الثقيلة.',
  },

  // Luxury / Streetwear Pillars
  pillar1Title: { en: '500 GSM Heavyweight Spec', ar: 'مواصفات 500 GSM الثقيلة' },
  pillar1Desc: { en: 'Dense French terry cotton blend with unmatched warmth, structure, and zero drooping.', ar: 'نسيج قطن فرنش تيري مخصص فائق الكثافة يمنح قواماً ثابتاً دون أي ترهل.' },
  pillar2Title: { en: 'Engineered Boxy Cut', ar: 'قصّة بوكسي مريحة ومدروسة' },
  pillar2Desc: { en: 'Drop-shoulder proportions that drape cleanly over any body type without bunching.', ar: 'أبعاد أكتاف ساقطة تمنح انسيابية وأناقة عصرية مريحة لكافة الأجسام.' },
  pillar3Title: { en: 'Cash on Delivery (Egypt)', ar: 'الدفع عند الاستلام في مصر' },
  pillar3Desc: { en: 'Courier delivery directly to your door across Cairo, Giza, Alex, and all governorates.', ar: 'توصيل سريع لباب منزلك في القاهرة، الجيزة، الإسكندرية، وجميع المحافظات مع خيار الدفع نقدياً عند الاستلام.' },
  pillar4Title: { en: 'WhatsApp Drop Concierge', ar: 'خدمة العملاء عبر واتساب' },
  pillar4Desc: { en: 'Direct sizing advice, order verification, and tracking assistance via WhatsApp.', ar: 'مساعدة فورية لاختيار المقاس المناسب والاستفسار عن الإصدارات والطلبات.' },

  // Cart Drawer
  cartTitle: { en: 'Your Shopping Bag', ar: 'حقيبة التسوق' },
  cartEmpty: { en: 'Your shopping bag is currently empty.', ar: 'حقيبة التسوق فارغة حالياً.' },
  cartSubtotal: { en: 'Subtotal', ar: 'المجموع الجزئي' },
  cartShippingNotice: { en: 'Shipping fee calculated by governorate at checkout', ar: 'يتم احتساب رسوم الشحن حسب المحافظة في صفحة الدفع' },
  checkoutBtn: { en: 'Proceed to Checkout', ar: 'متابعة الدفع عند الاستلام' },
  continueShopping: { en: 'Explore More Hoodies', ar: 'استكشف المزيد من الهوديز' },

  // Newsletter / Drop Alerts
  newsletterBadge: { en: 'THE ATHEER DROP CLUB', ar: 'نادي إصدارات أثير' },
  newsletterTitle: { en: 'Get Notified Before Drops Sell Out', ar: 'كن أول من يعلم عند إطلاق الإصدارات' },
  newsletterSubtitle: {
    en: 'Exclusive early access to limited hoodie colorways, sweatshirt restocks, and our upcoming Egypt T-Shirt drop.',
    ar: 'أولوية الشراء لإصدارات الهوديز المحدودة، وإشعارات إعادة التوفر، ومعاينة حصرية لتشكيلة التي شيرتات القادمة في مصر.',
  },
  newsletterPlaceholder: { en: 'Enter your email for drop alerts...', ar: 'أدخل بريدك الإلكتروني ليصلك موعد الإصدار...' },
  newsletterBtn: { en: 'Join Drop List', ar: 'انضم لقائمة الإطلاق' },

  // WhatsApp
  whatsappTitle: { en: 'ATHEER Egypt Stylist', ar: 'خدمة عملاء أثير مصر' },
  whatsappText: { en: 'Ask about sizing, fits & delivery', ar: 'استفسر عن المقاسات والتوصيل' },

  // Footer
  footerDesc: {
    en: 'ATHEER is a modern youth streetwear brand founded on heavyweight textiles, minimalist luxury cuts, and sovereign youth aesthetic standards in Egypt.',
    ar: 'أثير هي علامة أزياء ستريتوير شبابية فاخرة في مصر، تأسست على مبدأ الأقمشة فائقة الثقل، والقصّات العصرية المينيمالية، والهوية الشبابية الراقية.',
  },
  footerCol1: { en: 'Collections', ar: 'التشكيلات' },
  footerCol2: { en: 'Customer Support', ar: 'خدمة العملاء' },
  footerCol3: { en: 'The Brand', ar: 'عن العلامة' },
  footerRights: { en: 'All rights reserved. Engineered for the youth.', ar: 'جميع الحقوق محفوظة. صُممت لجيل الشباب الواثق في مصر.' },
  footerCodBadge: { en: 'Cash on Delivery Across Egypt', ar: 'الدفع عند الاستلام متاح لجميع محافظات مصر' },
  footerEgyptDelivery: { en: 'Fast Courier Delivery to all 27 Egyptian Governorates', ar: 'شحن سريع وموثوق لجميع محافظات جمهورية مصر العربية الـ ٢٧' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
  isRtl: boolean;
  formatPrice: (amountInEgp: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const currency: Currency = 'EGP'; // EGP is the default and only checkout currency

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

  // Format strictly in Egyptian Pounds (EGP)
  const formatPrice = (amountInEgp: number): string => {
    const rounded = Math.round(amountInEgp);
    if (language === 'ar') {
      return `${rounded.toLocaleString('ar-EG')} ج.م`;
    }
    return `${rounded.toLocaleString('en-US')} EGP`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        currency,
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
