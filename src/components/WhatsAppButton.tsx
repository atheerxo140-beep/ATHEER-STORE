'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { MessageCircle, Sparkles, AlertCircle, X, Mail, Send } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const { language, t, isRtl } = useLanguage();
  const isAr = language === 'ar';
  const [isHovered, setIsHovered] = useState(false);
  const [showConfigAlert, setShowConfigAlert] = useState(false);

  const { settings } = useStoreSettings();

  // Normalize phone number (handling Egyptian formats: 010..., 201..., +201..., 00201...)
  const rawNumber = settings.whatsappNumber?.trim() || '';
  let digits = rawNumber.replace(/[^0-9]/g, '');

  let cleanNumber = digits;
  if (digits.startsWith('00201') && digits.length === 14) {
    cleanNumber = digits.substring(2);
  } else if (digits.startsWith('01') && digits.length === 11) {
    cleanNumber = '20' + digits.substring(1);
  } else if (digits.startsWith('201') && (digits.length === 12 || digits.length === 13)) {
    cleanNumber = digits;
  }

  const isConfigured = Boolean(
    cleanNumber &&
    cleanNumber !== '201000000000' &&
    !cleanNumber.includes('00000000') &&
    cleanNumber.length >= 10
  );

  const whatsappMessage =
    isAr
      ? 'مرحباً أثير، أود الاستفسار عن تفاصيل ومقاسات تشكيلة الهوديز والتوصيل.'
      : 'Greetings ATHEER, I would like to inquire about hoodie sizing, fits, and delivery.';

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const supportEmail = settings.supportEmail || 'concierge@atheer.store';

  const handleClick = (e: React.MouseEvent) => {
    if (!isConfigured) {
      e.preventDefault();
      setShowConfigAlert(true);
    }
  };

  return (
    <>
      <div
        className={`fixed bottom-6 ${
          isRtl ? 'left-6' : 'right-6'
        } z-40 flex items-center group`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Expanding Label on Hover */}
        <div
          className={`hidden sm:flex items-center space-x-2 rtl:space-x-reverse bg-brand-black/95 backdrop-blur-md border border-brand-gold/60 py-2.5 px-4 shadow-luxury-dark ${
            isRtl ? 'ml-3' : 'mr-3'
          } transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
          <div className="text-left rtl:text-right">
            <p className="text-[11px] uppercase tracking-wider text-brand-gold font-semibold font-sans">
              {isAr ? 'خدمة العملاء والكونسيرج' : t('whatsappTitle')}
            </p>
            <p className="text-[10px] text-brand-cream/80 font-sans">
              {isConfigured
                ? (isAr ? 'تحدث مباشرة معنا عبر الواتساب' : t('whatsappText'))
                : (isAr ? 'تواصل عبر البريد الإلكتروني' : 'Contact via email')}
            </p>
          </div>
        </div>

        {/* Main Circular Action Button */}
        <a
          href={isConfigured ? whatsappUrl : '#'}
          onClick={handleClick}
          target={isConfigured ? '_blank' : undefined}
          rel={isConfigured ? 'noopener noreferrer' : undefined}
          className={`w-13 h-13 sm:w-14 sm:h-14 bg-brand-black border-2 transition-all duration-300 rounded-full flex items-center justify-center shadow-gold hover:scale-105 active:scale-95 ${
            isConfigured
              ? 'border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black'
              : 'border-brand-border text-brand-cream/60 hover:border-amber-400 hover:text-amber-400'
          }`}
          aria-label="Contact ATHEER Egypt on WhatsApp"
        >
          <MessageCircle className="w-6 h-6 stroke-[1.8]" />
        </a>
      </div>

      {/* Fallback Contact Modal */}
      {showConfigAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
          <div className="bg-brand-charcoal border border-brand-gold/50 max-w-md w-full p-6 rounded-sm shadow-2xl space-y-4 text-xs animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-gold font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>{isAr ? 'خدمة عملاء أثير' : 'ATHEER Concierge Support'}</span>
              </div>
              <button
                onClick={() => setShowConfigAlert(false)}
                className="text-brand-cream/60 hover:text-brand-ivory transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-brand-cream/80 leading-relaxed text-[11px] font-sans">
              {isAr
                ? 'مرحباً بك! يسعدنا الرد على جميع استفساراتك حول المقاسات والشحن عبر البريد الإلكتروني الرسمي لخدمة العملاء مباشرة:'
                : 'Welcome! We are pleased to assist you with sizing and order inquiries via our official concierge email:'}
            </p>

            <a
              href={`mailto:${supportEmail}`}
              className="p-3 bg-brand-black border border-brand-border hover:border-brand-gold rounded-sm flex items-center justify-between text-brand-ivory hover:text-brand-gold transition-colors group"
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Mail className="w-4 h-4 text-brand-gold" />
                <span className="font-mono text-xs">{supportEmail}</span>
              </div>
              <Send className="w-3.5 h-3.5 text-brand-cream/40 group-hover:text-brand-gold transition-colors" />
            </a>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConfigAlert(false)}
                className="px-5 py-2 bg-brand-gold text-brand-black font-bold uppercase rounded-xs text-[10px] tracking-wider hover:bg-brand-gold-hover transition-colors font-mono"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
