'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useLanguage } from '@/context/LanguageContext';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { QrCode, X, Copy, Check, Smartphone, Share2, ExternalLink } from 'lucide-react';

export const StorefrontQrModal: React.FC = () => {
  const { language, isRtl } = useLanguage();
  const { content } = useHomepageContent();
  const isAr = language === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // If hidden by admin in homepage content settings, don't render anything
  if (content.showQrCode === false) {
    return null;
  }

  const targetUrl =
    content.qrTargetUrl?.trim() ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://atheer.store');

  useEffect(() => {
    const generate = async () => {
      try {
        const url = await QRCode.toDataURL(targetUrl, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 500,
          color: {
            dark: '#C5A880',
            light: '#0A0A0A',
          },
        });
        setQrDataUrl(url);
      } catch (e) {
        console.error(e);
      }
    };
    generate();
  }, [targetUrl]);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: 'ATHEER | أثير — أزياء الستريتوير الشبابية الفاخرة',
          text: 'تسوق تشكيلة هوديز وسويت شيرتات أثير 500 GSM الفاخرة في مصر:',
          url: targetUrl,
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      {/* Floating QR Quick Launcher Button (Bottom Left on LTR, Bottom Right on RTL opposite to WhatsApp) */}
      <div
        className={`fixed bottom-6 ${
          isRtl ? 'right-6' : 'left-6'
        } z-40 hidden sm:flex items-center`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="w-13 h-13 sm:w-14 sm:h-14 bg-brand-black/90 backdrop-blur-md border-2 border-brand-gold/70 text-brand-gold rounded-full flex items-center justify-center shadow-gold hover:scale-105 active:scale-95 transition-all duration-300 group"
          aria-label={isAr ? 'رمز الـ QR للمتجر' : 'Store QR Code'}
          title={isAr ? 'امسح الرمز لفتح المتجر على الموبايل' : 'Scan to open on mobile'}
        >
          <QrCode className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        </button>
      </div>

      {/* Enlarged QR Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="bg-brand-charcoal border border-brand-gold/60 max-w-sm w-full p-6 sm:p-7 rounded-xs shadow-2xl space-y-5 text-center relative">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 text-brand-cream/60 hover:text-brand-ivory transition-colors bg-brand-black/60 rounded-xs"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-1">
                <span className="font-sans font-black text-xl tracking-[0.2em] text-brand-ivory uppercase">
                  ATHEER
                </span>
                <span className="text-brand-gold text-lg font-light">/</span>
                <span className="font-bold text-xl text-brand-gold">أثير</span>
              </div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-brand-gold">
                {isAr ? 'رمز الاستجابة السريع الدائم' : 'Permanent Mobile Store QR'}
              </p>
            </div>

            {/* QR Image Frame */}
            <div className="p-3 bg-brand-black border border-brand-gold/50 rounded-xs inline-block mx-auto shadow-gold relative">
              {qrDataUrl ? (
                <div className="relative">
                  <img
                    src={qrDataUrl}
                    alt="ATHEER Store QR Code"
                    className="w-56 h-56 object-contain rounded-xs"
                  />
                  <div className="absolute inset-0 m-auto w-10 h-10 rounded-xs bg-brand-black border border-brand-gold text-brand-gold flex items-center justify-center font-bold text-base shadow-xl">
                    أ
                  </div>
                </div>
              ) : (
                <div className="w-56 h-56 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-brand-gold animate-pulse" />
                </div>
              )}
            </div>

            {/* Scanning Guide */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-brand-ivory flex items-center justify-center space-x-1.5 rtl:space-x-reverse">
                <Smartphone className="w-3.5 h-3.5 text-brand-gold" />
                <span>{isAr ? 'افتح كاميرا هاتفك وامسح الرمز' : 'Scan with your mobile camera'}</span>
              </p>
              <p className="text-[11px] text-brand-cream/70 leading-relaxed">
                {isAr
                  ? 'يفتح الكتالوج الكامل والمنتجات مباشرة على هاتفك مع إمكانية مشاركة الرابط مع أصدقائك.'
                  : 'Instantly opens the full collection and streetwear catalog on mobile.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-brand-border/60 flex items-center justify-center gap-2">
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 px-3 bg-brand-gold hover:bg-brand-gold-hover text-brand-black font-bold text-xs uppercase tracking-wider rounded-xs font-mono transition-colors flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'مشاركة' : 'Share'}</span>
              </button>
              <button
                onClick={handleCopy}
                className="py-2.5 px-3 bg-brand-black hover:bg-brand-stone/60 border border-brand-border hover:border-brand-gold text-brand-ivory text-xs font-mono rounded-xs transition-colors flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
                title={isAr ? 'نسخ الرابط' : 'Copy Link'}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرابط' : 'Copy')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
