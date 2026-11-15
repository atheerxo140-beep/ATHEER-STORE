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
  MapPin,
  Phone,
  Mail,
  QrCode,
  ShieldCheck,
  Truck,
  Sparkles,
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

  const formatPhoneNumber = (num?: string) => {
    if (!num) return '+20 101 599 3802';
    const clean = num.replace(/[^0-9+]/g, '');
    if (clean.startsWith('+20') && clean.length === 13) {
      return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
    }
    if (clean.startsWith('20') && clean.length === 12) {
      return `+20 ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
    }
    return clean.startsWith('+') ? clean : `+${clean}`;
  };

  const primaryPhone = formatPhoneNumber(settings.whatsappNumber || '201015993802');
  const secondaryPhone = formatPhoneNumber(settings.supportPhone || '+201015993802');
  const supportEmail = settings.supportEmail || 'atheerxo140@gmail.com';
  const whatsappRaw = (settings.whatsappNumber || '201015993802').replace(/[^0-9]/g, '');

  return (
    <footer className="bg-brand-black text-brand-ivory border-t border-brand-border/60 font-sans pb-24 sm:pb-8">
      {/* 1. Drop Club VIP Signup */}
      <div className="border-b border-brand-border/40 py-14 sm:py-18 bg-brand-charcoal/40">
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
      <div className="border-b border-brand-border/40 bg-brand-charcoal/70 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-start">
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

      {/* 3. Main Architectural 3-Column Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-10">
        {/* Brand Hallmark Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-8 mb-12">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            {isAr ? (
              <>
                <span className="font-arabic font-bold text-2xl sm:text-3xl text-brand-ivory">أثير</span>
                <span className="text-brand-gold text-xl sm:text-2xl font-light">/</span>
                <span className="font-english font-black text-2xl sm:text-3xl tracking-[0.2em] text-brand-gold uppercase">
                  ATHEER
                </span>
              </>
            ) : (
              <>
                <span className="font-english font-black text-2xl sm:text-3xl tracking-[0.2em] text-brand-ivory uppercase">
                  ATHEER
                </span>
                <span className="text-brand-gold text-xl sm:text-2xl font-light">/</span>
                <span className="font-arabic font-bold text-2xl sm:text-3xl text-brand-gold">أثير</span>
              </>
            )}
          </div>

          <p className="text-xs sm:text-sm text-brand-cream/70 font-light max-w-xl leading-relaxed">
            {isAr
              ? 'دار أزياء الستريتوير المصرية الراقية · نسيج شتوي ثقيل ٥٠٠ جم/م² مصمم بأعلى معايير الإتقان والفخامة'
              : 'Egyptian Luxury Heavyweight Streetwear Atelier · 500 GSM custom milled luxury fleece'}
          </p>
        </div>

        {/* 3 Columns Layout matching reference design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 lg:gap-20">
          {/* Column 1 (Right in RTL, Left in LTR): Contact Us / اتصل بنا */}
          <div className="space-y-4">
            <h4 className="font-sans font-bold text-xs sm:text-sm uppercase tracking-widest text-brand-gold mb-5 pb-1 border-b border-brand-gold/30 inline-block">
              {isAr ? 'اتصل بنا' : 'CONTACT US'}
            </h4>
            <div className="space-y-3.5 text-xs sm:text-sm text-brand-cream/80 font-light">
              <p>
                <a
                  href={`mailto:${supportEmail}`}
                  className="hover:text-brand-gold transition-colors font-mono block text-brand-ivory hover:underline"
                  dir="ltr"
                >
                  {supportEmail}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
                  className="hover:text-brand-gold transition-colors font-mono block text-brand-cream/90"
                  dir="ltr"
                >
                  {primaryPhone}
                </a>
              </p>
              <p>
                <a
                  href={`https://wa.me/${whatsappRaw}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-gold transition-colors font-mono block text-brand-gold hover:underline"
                  dir="ltr"
                >
                  {secondaryPhone}
                </a>
              </p>
              <p className="text-brand-cream/70 leading-relaxed pt-1">
                {isAr
                  ? 'الأتيليه الرقمي، القاهرة، مصر'
                  : 'Digital Atelier, Cairo, Egypt'}
              </p>
              <p className="text-[11px] font-mono text-brand-gold/80 pt-0.5">
                {isAr
                  ? 'خدمة العملاء: يومياً من ١٠ ص حتى ١٠ م'
                  : 'Customer Care: Daily 10 AM – 10 PM'}
              </p>
            </div>
          </div>

          {/* Column 2 (Middle): Capabilities / القدرات */}
          <div className="space-y-4">
            <h4 className="font-sans font-bold text-xs sm:text-sm uppercase tracking-widest text-brand-gold mb-5 pb-1 border-b border-brand-gold/30 inline-block">
              {isAr ? 'القدرات' : 'CAPABILITIES'}
            </h4>
            <ul className="space-y-3.5 text-xs sm:text-sm text-brand-cream/80 font-light">
              <li>
                <Link href="/p/about" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'عملية الإنتاج ومعايير النسيج ٥٠٠ جم/م²' : 'Production Process & 500 GSM Spec'}
                </Link>
              </li>
              <li>
                <Link href="/p/return-policy" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'ضمان الجودة وفحص الشحنة مع المندوب' : 'Quality Guarantee & Open Box Check'}
                </Link>
              </li>
              <li>
                <Link href="/p/shipping-policy" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'التصدير والخدمات اللوجستية والشحن' : 'Nationwide Delivery & Logistics'}
                </Link>
              </li>
              <li>
                <a href="/#fabric-fit" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'الأبعاد القياسية ودليل المقاسات' : 'Standard Dimensions & Size Guide'}
                </a>
              </li>
              <li>
                <Link href="/p/faq" className="hover:text-brand-gold transition-colors block text-brand-cream/60">
                  {isAr ? 'الأسئلة الشائعة وإرشادات العناية بالقطعة' : 'FAQ & Garment Care Instructions'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 (Left in RTL, Right in LTR): Explore / استكشف */}
          <div className="space-y-4">
            <h4 className="font-sans font-bold text-xs sm:text-sm uppercase tracking-widest text-brand-gold mb-5 pb-1 border-b border-brand-gold/30 inline-block">
              {isAr ? 'استكشف' : 'EXPLORE'}
            </h4>
            <ul className="space-y-3.5 text-xs sm:text-sm text-brand-cream/80 font-light">
              <li>
                <a href="/#products" className="hover:text-brand-gold transition-colors block font-medium text-brand-ivory">
                  {isAr ? 'جميع القطع (الإصدار الأساسي)' : 'All Pieces (Core Drop)'}
                </a>
              </li>
              <li>
                <a href="/#products" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'مجموعة الهوديز الثقيلة (٥٠٠ جم/م²)' : 'Heavyweight Hoodies Collection'}
                </a>
              </li>
              <li>
                <a href="/#products" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'مجموعة السويت شيرتات الأوفرسايز' : 'Oversized Sweatshirts Collection'}
                </a>
              </li>
              <li>
                <a href="/#products" className="hover:text-brand-gold transition-colors block">
                  {isAr ? 'تشكيلات الهاف زيب بول أوفر' : 'Quarter-Zip Pullovers Drop'}
                </a>
              </li>
              <li>
                <Link href="/account/loyalty" className="hover:text-brand-gold transition-colors block text-brand-gold font-mono">
                  {isAr ? 'كارت الولاء ومكافآت أثير الرقمي' : 'ATHEER Loyalty Pass & Rewards'}
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-brand-gold transition-colors block text-brand-cream/60">
                  {isAr ? 'تتبع حالة شحنتك المباشر' : 'Live Shipment Tracking'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Permanent Store QR Code Showcase in Footer (Subtle & Elegant) */}
        {content.showQrCode !== false && (
          <div className="mt-14 p-5 sm:p-7 bg-brand-charcoal/50 border border-brand-gold/30 rounded-xs flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 rtl:space-x-reverse text-center sm:text-start rtl:sm:text-start">
              <div className="p-2 bg-brand-black border border-brand-gold/50 rounded-xs shrink-0 shadow-gold relative">
                {footerQrUrl ? (
                  <div className="relative">
                    <img
                      src={footerQrUrl}
                      alt="ATHEER Permanent Store QR"
                      className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                    />
                    <div className="absolute inset-0 m-auto w-6 h-6 rounded-xs bg-brand-black border border-brand-gold text-brand-gold flex items-center justify-center font-bold text-xs shadow-md">
                      أ
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-brand-charcoal animate-pulse flex items-center justify-center">
                    <QrCode className="w-7 h-7 text-brand-gold" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start space-x-2 rtl:space-x-reverse">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">
                    {isAr ? 'رمز المتجر الدائم' : 'Permanent Store QR Code'}
                  </span>
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono px-2 py-0.5 rounded-full">
                    {isAr ? 'مدى الحياة' : 'Lifetime'}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-brand-ivory font-serif">
                  {isAr
                    ? 'امسح الرمز بكاميرا هاتفك لزيارة متجر أثير ومشاركة الكتالوج'
                    : 'Scan to Visit & Share ATHEER Streetwear'}
                </h4>
                <p className="text-xs text-brand-cream/70 font-sans max-w-lg leading-relaxed">
                  {isAr
                    ? 'وجّه كاميرا هاتفك المحمول نحو الرمز لفتح المتجر مباشرة والاطلاع على تشكيلة الهوديز وطلب القطع من الموبايل في أي وقت.'
                    : 'Point your mobile camera to instantly explore our heavyweight hoodie drop and place COD orders directly.'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
              <a
                href={targetQr}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-brand-gold text-brand-black text-xs font-mono font-bold uppercase tracking-wider rounded-xs hover:bg-brand-gold-hover transition-colors shadow-gold flex items-center space-x-2 rtl:space-x-reverse"
              >
                <QrCode className="w-4 h-4" />
                <span>{isAr ? 'فتح الرابط المباشر' : 'Open Direct URL'}</span>
              </a>
            </div>
          </div>
        )}

        {/* 4. Elegant Thin Divider Line & Bottom Bar matching reference design */}
        <div className="border-t border-brand-border/60 mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-brand-cream/70 font-mono gap-4">
          <div className="text-center sm:text-start text-brand-cream/80">
            {isAr ? 'تم التصميم والتطوير بواسطة دار أثير' : 'Designed & Developed by ATHEER Atelier'}
          </div>

          <div className="text-center sm:text-end text-brand-cream/60">
            © 2026 {isAr ? 'دار أثير' : 'ATHEER'} — {isAr ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}
          </div>
        </div>
      </div>
    </footer>
  );
};
