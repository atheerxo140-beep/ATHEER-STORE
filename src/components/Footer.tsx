'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import QRCode from 'qrcode';
import {
  Flame,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  QrCode,
  Instagram,
  Facebook,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Send,
} from 'lucide-react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const { t, language, isRtl } = useLanguage();
  const { settings } = useStoreSettings();
  const { content } = useHomepageContent();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const isAr = language === 'ar';

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [footerQrUrl, setFooterQrUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  const targetQr =
    content.qrTargetUrl?.trim() ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://atheer.store');

  useEffect(() => {
    if (content.showQrCode !== false) {
      QRCode.toDataURL(targetQr, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: { dark: '#C5A880', light: '#0A0A0A' },
      })
        .then(setFooterQrUrl)
        .catch(console.error);
    }
  }, [targetQr, content.showQrCode]);

  const [subscribing, setSubscribing] = useState(false);
  const [subMsg, setSubMsg] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || subscribing) return;
    setSubscribing(true);
    setSubMsg(null);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribed(true);
        setSubMsg(isAr ? 'تم اشتراكك بنجاح في نادي النخبة!' : 'Welcome to the ATHEER Drop Club!');
        setTimeout(() => {
          setEmail('');
          setSubscribed(false);
          setSubMsg(null);
        }, 5000);
      } else {
        setSubMsg(data.error || (isAr ? 'حدث خطأ، حاول ثانية' : 'Error subscribing'));
      }
    } catch {
      setSubMsg(isAr ? 'تعذر الاتصال بالخادم' : 'Connection failed');
    } finally {
      setSubscribing(false);
    }
  };

  // Format local Egyptian phone number like the reference image (e.g. 01015993802)
  const formatLocalEgyptianPhone = (num?: string) => {
    if (!num) return '01015993802';
    const clean = num.replace(/[^0-9]/g, '');
    if (clean.startsWith('20') && clean.length === 12) {
      return `0${clean.slice(2)}`;
    }
    if (clean.startsWith('0') && clean.length === 11) {
      return clean;
    }
    return clean || '01015993802';
  };

  const displayPhone = formatLocalEgyptianPhone(settings.whatsappNumber || settings.supportPhone || '01015993802');
  const rawWhatsApp = (settings.whatsappNumber || '201015993802').replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${rawWhatsApp}?text=${encodeURIComponent(
    isAr ? 'مرحباً دار أثير، أرغب بالاستفسار عن القطع المتاحة وطلب أوردر' : 'Hello ATHEER, I would like to inquire about available drops'
  )}`;

  return (
    <footer className="bg-brand-black text-brand-ivory border-t border-brand-border/60 font-sans pb-24 sm:pb-8 relative overflow-hidden">
      {/* 1. Drop Club VIP Signup */}
      <div className="border-b border-brand-border/40 py-12 sm:py-16 bg-brand-charcoal/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-brand-gold text-[10px] sm:text-xs uppercase tracking-[0.25em] font-mono font-bold mb-3">
            <Flame className="w-3.5 h-3.5" />
            <span>{t('newsletterBadge')}</span>
          </div>

          <h3 className="font-sans font-black text-2xl sm:text-4xl text-brand-ivory uppercase tracking-tight mb-4">
            {t('newsletterTitle')}
          </h3>

          <p className="text-xs sm:text-sm text-brand-cream/80 max-w-xl mx-auto font-light leading-relaxed mb-8">
            {t('newsletterSubtitle')}
          </p>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletterPlaceholder')}
                required
                className="w-full bg-brand-black border border-brand-border px-4 py-3.5 text-xs text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-brand-gold text-brand-black text-xs uppercase tracking-widest font-bold hover:bg-brand-gold-hover transition-colors shadow-gold flex items-center justify-center space-x-2 rtl:space-x-reverse shrink-0"
            >
              {subscribed ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{isAr ? 'تم الانضمام' : 'Subscribed'}</span>
                </>
              ) : (
                <>
                  <span>{t('newsletterBtn')}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {subMsg && (
            <p className="mt-3 text-xs font-mono text-brand-gold animate-fade-in">{subMsg}</p>
          )}
        </div>
      </div>

      {/* 2. Caesar Trust & Guarantee Strip */}
      <div className="border-b border-brand-border/40 bg-brand-charcoal/70 py-6 sm:py-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-start">
            <div className="flex items-center space-x-3.5 rtl:space-x-reverse justify-center sm:justify-start">
              <ShieldCheck className="w-6 h-6 text-brand-gold flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-brand-ivory block text-sm">
                  {isAr ? 'معاينة قبل الاستلام والدفع' : 'Open Box Inspection'}
                </span>
                <span className="text-[11px] text-brand-cream/60">
                  {isAr ? 'افتح الأوردر مع المندوب وتأكد من الخامة' : 'Check fabric & finishing with courier'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 rtl:space-x-reverse justify-center sm:justify-start">
              <Truck className="w-6 h-6 text-brand-gold flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-brand-ivory block text-sm">
                  {isAr ? 'شحن سريع لجميع محافظات مصر' : 'Fast Delivery Across Egypt'}
                </span>
                <span className="text-[11px] text-brand-cream/60">
                  {isAr ? 'توصيل لباب بيتك خلال 48 إلى 72 ساعة' : 'To your doorstep in 48-72 hours'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 rtl:space-x-reverse justify-center sm:justify-start">
              <Sparkles className="w-6 h-6 text-brand-gold flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-brand-ivory block text-sm">
                  {isAr ? 'استبدال واسترجاع سهل 14 يوم' : '14-Day Free Exchange'}
                </span>
                <span className="text-[11px] text-brand-cream/60">
                  {isAr ? 'تغيير المقاس متاح مجاناً وبكل سلاسة' : 'Hassle-free size swaps anytime'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Footer Directory Merging Image 1 (Marotech Stone) & Image 2 (Double Business) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-10 relative">
        {/* Subtle Ambient Curved Golden Arc in Top-Right Corner (matching reference image) */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full border border-brand-gold/15 pointer-events-none -mr-20 -mt-20 hidden md:block" />
        <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full border border-brand-gold/10 pointer-events-none -mr-32 -mt-32 hidden md:block" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Brand Column (Right side in RTL, Span 4) */}
          <div className="lg:col-span-4 space-y-4 text-start">
            {/* Logo Emblem Matching Reference Layout */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {/* Luxury Monogram Badge */}
              <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-brand-gold/25 to-brand-gold/10 border-2 border-brand-gold flex items-center justify-center shrink-0 shadow-gold">
                <span className="font-serif font-black text-xl text-brand-gold">أ</span>
              </div>

              <div className="flex flex-col">
                <span className="font-arabic font-black text-2xl sm:text-3xl text-brand-gold tracking-wide leading-none">
                  أثير
                </span>
                <span className="font-english font-black text-xs sm:text-sm tracking-[0.28em] text-brand-ivory uppercase leading-relaxed">
                  ATHEER ATELIER
                </span>
              </div>
            </div>

            {/* Concise Mission / Slogan (matching screenshot sentence structure) */}
            <p className="text-xs sm:text-sm text-brand-cream/75 font-light leading-relaxed max-w-sm pt-1">
              {isAr
                ? 'شريكك في التميز يجمع جودة النسيج الثقيل والتصميم العصري حول هدف واحد: أناقتك وثقتك.'
                : 'Strategic fashion atelier uniting 500 GSM heavy craftsmanship and bespoke streetwear around one goal: your distinct presence.'}
            </p>

            {/* Permanent Store QR Discreet Trigger */}
            {content.showQrCode !== false && footerQrUrl && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 bg-brand-charcoal/80 border border-brand-gold/30 hover:border-brand-gold text-brand-gold text-xs font-mono rounded-xs transition-colors group cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-brand-gold group-hover:scale-110 transition-transform" />
                  <span>{isAr ? 'رمز المتجر الدائم QR' : 'Permanent Store QR'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Column 1: روابط سريعة (Span 2) */}
          <div className="lg:col-span-2 space-y-3.5 text-start">
            <h4 className="font-bold text-sm sm:text-base text-brand-ivory font-sans tracking-wide">
              {isAr ? 'روابط سريعة' : 'QUICK LINKS'}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-brand-cream/80 font-light">
              <li>
                <Link href="/" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'الرئيسية' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href="/p/about" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'عن دار أثير' : 'About ATHEER'}
                </Link>
              </li>
              <li>
                <a href="/#products" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'تشكيلات المتجر' : 'Collections'}
                </a>
              </li>
              <li>
                <Link href="/account/loyalty" className="hover:text-brand-gold transition-colors block text-brand-gold font-medium">
                  {isAr ? 'كارت الولاء ومكافآت أثير' : 'Loyalty Pass'}
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'تتبع حالة الطلب' : 'Track Order'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: استكشف والقدرات (Span 3 - Merging Image 1 & Image 2) */}
          <div className="lg:col-span-3 space-y-3.5 text-start">
            <h4 className="font-bold text-sm sm:text-base text-brand-ivory font-sans tracking-wide">
              {isAr ? 'استكشف والقدرات' : 'EXPLORE & QUALITY'}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-brand-cream/80 font-light">
              <li>
                <a href="/#products" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'هوديز وسويت شيرتات ٥٠٠ جم/م²' : '500 GSM Heavyweight Drops'}
                </a>
              </li>
              <li>
                <Link href="/p/return-policy" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'معاينة الشحنة قبل الاستلام والدفع' : 'Open Box Inspection Guarantee'}
                </Link>
              </li>
              <li>
                <Link href="/p/shipping-policy" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'شحن سريع لكافة محافظات مصر' : 'Fast Delivery Across Egypt'}
                </Link>
              </li>
              <li>
                <Link href="/p/return-policy" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'استبدال واسترجاع سهل مجاناً' : '14-Day Free Exchange'}
                </Link>
              </li>
              <li>
                <a href="/#fabric-fit" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'دليل المقاسات والأوفرسايز' : 'Oversized Sizing Guide'}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: تواصل معنا / اتصل بنا (Span 3 - Merging Phone, Email, Address, Quick Action, Social Icons) */}
          <div className="lg:col-span-3 space-y-3.5 text-start">
            <h4 className="font-bold text-sm sm:text-base text-brand-ivory font-sans tracking-wide">
              {isAr ? 'تواصل معنا' : 'CONTACT US'}
            </h4>

            {/* Large Bold Phone Number (matching screenshot style) */}
            <div className="pt-0.5">
              <a
                href={`tel:${displayPhone}`}
                className="text-xl sm:text-2xl font-bold font-mono text-brand-ivory hover:text-brand-gold transition-colors tracking-wider block"
                dir="ltr"
              >
                {displayPhone}
              </a>
            </div>

            {/* Quick Action Link / Button (matching "طلب استشارة سريعة" in screenshot) */}
            <div>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-medium text-brand-cream hover:text-brand-gold transition-colors inline-block pb-0.5 border-b border-brand-cream/30 hover:border-brand-gold"
              >
                {isAr ? 'طلب استفسار أو طلب سريع' : 'Quick Inquiry & Fast Order'}
              </a>
            </div>

            {/* Contact Details from Image 1: Email and Address */}
            <div className="space-y-1.5 pt-1 text-xs text-brand-cream/70 font-mono">
              <a
                href={`mailto:${settings.supportEmail || 'atheerxo140@gmail.com'}`}
                className="flex items-center space-x-2 rtl:space-x-reverse hover:text-brand-gold transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span dir="ltr">{settings.supportEmail || 'atheerxo140@gmail.com'}</span>
              </a>
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-cream/60">
                <MapPin className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span>
                  {settings.storeAddress ||
                    (isAr ? (settings.cairoShowroomsAr || 'القاهرة، جمهورية مصر العربية') : (settings.cairoShowroomsEn || 'Cairo, Egypt'))}
                </span>
              </div>
            </div>

            {/* Circular Social Icons - Luminous Gold Luxury Style */}
            <div className="pt-2 flex items-center space-x-2.5 rtl:space-x-reverse">
              {/* WhatsApp */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-charcoal/90 border-2 border-brand-gold/60 hover:border-brand-gold text-brand-gold hover:text-brand-black hover:bg-brand-gold transition-all duration-300 flex items-center justify-center shadow-gold group"
                title="واتساب"
              >
                <MessageCircle className="w-4 h-4 stroke-[2.2] group-hover:scale-110 transition-transform" />
              </a>

              {/* Instagram */}
              <a
                href={settings.socialInstagram || 'https://instagram.com/atheer.store'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-charcoal/90 border-2 border-brand-gold/60 hover:border-brand-gold text-brand-gold hover:text-brand-black hover:bg-brand-gold transition-all duration-300 flex items-center justify-center shadow-gold group"
                title="إنستغرام"
              >
                <Instagram className="w-4 h-4 stroke-[2.2] group-hover:scale-110 transition-transform" />
              </a>

              {/* TikTok */}
              <a
                href={settings.socialTiktok || 'https://tiktok.com/@atheer.store'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-charcoal/90 border-2 border-brand-gold/60 hover:border-brand-gold text-brand-gold hover:text-brand-black hover:bg-brand-gold transition-all duration-300 flex items-center justify-center shadow-gold group"
                title="تيك توك"
              >
                <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.32V8.92a8.28 8.28 0 0 0 4.91 1.6V7.07a4.8 4.8 0 0 1-1-.38z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href={settings.socialFacebook || 'https://facebook.com/atheer.store'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-charcoal/90 border-2 border-brand-gold/60 hover:border-brand-gold text-brand-gold hover:text-brand-black hover:bg-brand-gold transition-all duration-300 flex items-center justify-center shadow-gold group"
                title="فيسبوك"
              >
                <Facebook className="w-4 h-4 stroke-[2.2] group-hover:scale-110 transition-transform" />
              </a>

              {/* Mail */}
              <a
                href={`mailto:${settings.supportEmail || 'atheerxo140@gmail.com'}`}
                aria-label="Email"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-charcoal/90 border-2 border-brand-gold/60 hover:border-brand-gold text-brand-gold hover:text-brand-black hover:bg-brand-gold transition-all duration-300 flex items-center justify-center shadow-gold group"
                title="البريد الإلكتروني"
              >
                <Mail className="w-4 h-4 stroke-[2.2] group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* 4. Elegant Bottom Bar (Matching Reference Images with Clean Line Separator) */}
        <div className="border-t border-brand-border/60 mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-brand-cream/70 font-mono gap-4">
          <div className="text-center sm:text-start text-brand-cream/80">
            {isAr ? 'تم التصميم والتطوير بواسطة دار أثير' : 'Designed & Developed by ATHEER Atelier'}
          </div>

          <div className="text-center sm:text-end text-brand-cream/60">
            © 2026 {isAr ? 'دار أثير' : 'ATHEER'} — {isAr ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}
          </div>
        </div>
      </div>

      {/* Sleek Permanent Store QR Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-brand-charcoal border-2 border-brand-gold rounded-xs p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 text-brand-cream/50 hover:text-brand-ivory text-base p-1"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-brand-gold text-xs font-mono font-bold uppercase tracking-wider">
              <QrCode className="w-4 h-4" />
              <span>{isAr ? 'رمز متجر أثير الدائم' : 'Permanent Store QR'}</span>
            </div>
            <div className="p-3 bg-brand-black border border-brand-gold/60 inline-block rounded-xs shadow-gold">
              <img src={footerQrUrl} alt="Store QR" className="w-48 h-48 object-contain" />
            </div>
            <p className="text-xs text-brand-cream/70 font-sans leading-relaxed">
              {isAr
                ? 'امسح الرمز بكاميرا هاتفك لزيارة متجر أثير والاطلاع على تشكيلة الهوديز وطلب القطع في أي وقت.'
                : 'Point your camera to instantly explore our heavyweight collection and order.'}
            </p>
            <a
              href={targetQr}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2.5 bg-brand-gold text-brand-black font-mono text-xs font-bold uppercase rounded-xs hover:bg-brand-gold-hover transition-colors"
            >
              {isAr ? 'فتح الرابط المباشر' : 'Open Direct URL'}
            </a>
          </div>
        </div>
      )}
    </footer>
  );
};
