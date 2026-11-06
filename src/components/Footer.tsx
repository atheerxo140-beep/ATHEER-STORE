'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import QRCode from 'qrcode';
import { Flame, ArrowRight, ArrowLeft, Check, MapPin, Phone, QrCode } from 'lucide-react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const { t, language, isRtl } = useLanguage();
  const { settings } = useStoreSettings();
  const { content } = useHomepageContent();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-brand-black text-brand-ivory border-t border-brand-border/60 font-sans">
      {/* Drop Club VIP Signup */}
      <div className="border-b border-brand-border/40 py-16 sm:py-20 bg-brand-charcoal/40">
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
              className="px-6 py-3.5 bg-brand-gold text-brand-black text-xs uppercase tracking-widest font-bold hover:bg-brand-gold-hover transition-colors shadow-gold flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              {subscribed ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{language === 'ar' ? 'تم الانضمام' : 'Subscribed'}</span>
                </>
              ) : (
                <>
                  <span>{t('newsletterBtn')}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Column (Span 2) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="font-sans font-black text-2xl tracking-[0.2em] text-brand-ivory uppercase">
                {t('brandName')}
              </span>
              <span className="text-brand-gold text-xl font-light">/</span>
              <span className="font-arabic font-bold text-2xl text-brand-gold">أثير</span>
            </div>

            <p className="text-xs text-brand-cream/70 font-light leading-relaxed max-w-sm">
              {t('footerDesc')}
            </p>

            <div className="pt-2 text-xs text-brand-gold space-y-1.5 font-mono">
              <p className="flex items-center space-x-2 rtl:space-x-reverse">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'الأتيليه الرقمي (القاهرة، مصر) · مواقع المعارض المؤقتة تُعلن مع كل إصدار موسمي'
                    : 'Digital Flagship Atelier (Cairo, Egypt) · Seasonal Pop-up Locations Announced Per Drop'}
                </span>
              </p>
              <p className="flex items-center space-x-2 rtl:space-x-reverse">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {settings.whatsappNumber && !settings.whatsappNumber.includes('0000')
                    ? `+${settings.whatsappNumber} | ${settings.supportEmail || 'concierge@atheer.store'}`
                    : (settings.supportEmail || 'concierge@atheer.store')}
                </span>
              </p>
            </div>
          </div>

          {/* Links 1: Collections */}
          <div>
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-brand-gold mb-5">
              {t('footerCol1')}
            </h4>
            <ul className="space-y-3 text-xs text-brand-cream/70 font-light">
              <li>
                <a href="/#products" className="hover:text-brand-gold transition-colors font-medium text-brand-ivory">
                  {language === 'ar' ? 'الهوديز الثقيلة 500 GSM (الأساسي)' : 'Core 500 GSM Hoodies'}
                </a>
              </li>
              <li>
                <a href="/#products" className="hover:text-brand-gold transition-colors">
                  {language === 'ar' ? 'سويت شيرتات الكرو نيك' : 'Atelier Crewneck Sweatshirts'}
                </a>
              </li>
              <li>
                <a href="/#products" className="hover:text-brand-gold transition-colors">
                  {language === 'ar' ? 'سويت شيرتات الهاف زيب' : 'Quarter-Zip Pullovers'}
                </a>
              </li>
              <li>
                <a href="/#future-drop" className="hover:text-brand-gold transition-colors text-brand-gold/90 font-mono">
                  {language === 'ar' ? 'تي شيرتات 320 GSM (قريباً)' : '320 GSM Tees (Coming Soon)'}
                </a>
              </li>
            </ul>
          </div>

          {/* Links 2: Customer Support & COD */}
          <div>
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-brand-gold mb-5">
              {t('footerCol2')}
            </h4>
            <ul className="space-y-3 text-xs text-brand-cream/70 font-light">
              <li>
                <a href="/#fabric-fit" className="hover:text-brand-gold transition-colors">
                  {language === 'ar' ? 'دليل مقاسات البوكسي أوفرسايز' : 'Boxy Oversized Size Guide'}
                </a>
              </li>
              <li>
                <span className="text-brand-gold block font-mono">
                  {t('footerCodBadge')}
                </span>
              </li>
              <li>
                <a href="/#fabric-fit" className="hover:text-brand-gold transition-colors">
                  {language === 'ar' ? 'إرشادات غسيل القطن الثقيل' : 'Heavy Cotton Care Guide'}
                </a>
              </li>
              <li>
                <a href="/#products" className="hover:text-brand-gold transition-colors">
                  {language === 'ar' ? 'سياسة الاستبدال والمعاينة' : 'Inspection & Exchange Policy'}
                </a>
              </li>
            </ul>
          </div>

          {/* Links 3: The Brand & Admin */}
          <div>
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-brand-gold mb-5">
              {t('footerCol3')}
            </h4>
            <ul className="space-y-3 text-xs text-brand-cream/70 font-light">
              <li>
                <a href="/#about" className="hover:text-brand-gold transition-colors">
                  {language === 'ar' ? 'فلسفة أثير للستريتوير' : 'The ATHEER Streetwear Story'}
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-brand-gold transition-colors">
                  {language === 'ar' ? 'مواصفات أقمشة 500 GSM' : '500 GSM Fabric Standards'}
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-brand-gold transition-colors">
                  {language === 'ar' ? 'مجتمع شباب أثير في مصر' : 'ATHEER Egypt Youth Club'}
                </a>
              </li>

            </ul>
          </div>
        </div>

        {/* Permanent Store QR Code Showcase in Footer */}
        {content.showQrCode !== false && (
          <div className="mt-12 p-6 sm:p-8 bg-brand-charcoal/50 border border-brand-gold/40 rounded-xs flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 rtl:space-x-reverse text-center sm:text-right rtl:sm:text-right">
              {/* QR Image */}
              <div className="p-2.5 bg-brand-black border border-brand-gold/60 rounded-xs shrink-0 shadow-gold relative">
                {footerQrUrl ? (
                  <div className="relative">
                    <img
                      src={footerQrUrl}
                      alt="ATHEER Permanent Store QR"
                      className="w-28 h-28 object-contain"
                    />
                    <div className="absolute inset-0 m-auto w-7 h-7 rounded-xs bg-brand-black border border-brand-gold text-brand-gold flex items-center justify-center font-bold text-xs shadow-md">
                      أ
                    </div>
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-brand-charcoal animate-pulse flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-brand-gold" />
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start space-x-2 rtl:space-x-reverse">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">
                    {language === 'ar' ? 'رمز المتجر الدائم' : 'Permanent Store QR Code'}
                  </span>
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono px-2 py-0.5 rounded-full">
                    {language === 'ar' ? 'مدى الحياة' : 'Lifetime'}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-brand-ivory font-serif">
                  {language === 'ar'
                    ? 'امسح الرمز بكاميرا هاتفك لزيارة متجر أثير ومشاركة الكتالوج'
                    : 'Scan to Visit & Share ATHEER Streetwear'}
                </h4>
                <p className="text-xs text-brand-cream/70 font-sans max-w-lg leading-relaxed">
                  {language === 'ar'
                    ? 'وجّه كاميرا هاتفك المحمول نحو الرمز لفتح المتجر مباشرة والاطلاع على تشكيلة الهوديز وطلب القطع من الموبايل في أي وقت.'
                    : 'Point your mobile camera to instantly explore our heavyweight hoodie drop and place COD orders directly.'}
                </p>
              </div>
            </div>

            {/* Direct Link Action */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
              <a
                href={targetQr}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-brand-gold text-brand-black text-xs font-mono font-bold uppercase tracking-wider rounded-xs hover:bg-brand-gold-hover transition-colors shadow-gold flex items-center space-x-2 rtl:space-x-reverse"
              >
                <QrCode className="w-4 h-4" />
                <span>{language === 'ar' ? 'فتح الرابط المباشر' : 'Open Direct URL'}</span>
              </a>
            </div>
          </div>
        )}

        {/* Egypt Delivery Coverage Banner */}
        <div className="mt-12 pt-8 border-t border-brand-border/40 text-center font-mono">
          <p className="text-[11px] text-brand-gold/85 uppercase tracking-wider">
            {t('footerEgyptDelivery')}
          </p>
        </div>

        {/* Bottom Credits & Payment Badges */}
        <div className="mt-8 pt-6 border-t border-brand-border/30 flex flex-col sm:flex-row items-center justify-between text-[11px] text-brand-muted space-y-4 sm:space-y-0">
          <div>
            <p>© 2026 ATHEER | أثير. {t('footerRights')}</p>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse text-[10px] tracking-wider uppercase font-mono text-brand-cream/70">
            <span className="px-2.5 py-1 border border-brand-border bg-brand-charcoal text-brand-gold">
              الدفع عند الاستلام (EGP)
            </span>
            <span className="px-2.5 py-1 border border-brand-border bg-brand-charcoal">Cash on Delivery</span>
            <span className="px-2.5 py-1 border border-brand-border bg-brand-charcoal">POS Mobile Card</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
