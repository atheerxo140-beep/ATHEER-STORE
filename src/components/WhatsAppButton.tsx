'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MessageCircle, Sparkles, AlertCircle, X, Mail } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const { language, t, isRtl } = useLanguage();
  const isAr = language === 'ar';
  const [isHovered, setIsHovered] = useState(false);
  const [showConfigAlert, setShowConfigAlert] = useState(false);

  // Read configured WhatsApp from environment variable
  // Format: 201XXXXXXXXX (Egyptian international dialing format)
  // CRITICAL: Do NOT fall back to fake/placeholder '201000000000'
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || '';
  const isConfigured = Boolean(
    rawNumber &&
    rawNumber !== '201000000000' &&
    !rawNumber.includes('00000000') &&
    rawNumber.length >= 10
  );

  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

  const whatsappMessage =
    isAr
      ? 'مرحباً أثير مصر، أود الاستفسار عن مقاسات الهوديز وتفاصيل التوصيل داخل مصر.'
      : 'Greetings ATHEER Egypt, I would like to inquire about hoodie sizing, fits, and delivery.';

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappMessage)}`;

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
              {t('whatsappTitle')}
            </p>
            <p className="text-[10px] text-brand-cream/80 font-sans">
              {isConfigured
                ? t('whatsappText')
                : (isAr ? 'الخدمة قيد الإعداد الرسمي' : 'Awaiting line assignment')}
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

      {/* Clear Not Configured Modal */}
      {showConfigAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
          <div className="bg-brand-charcoal border border-brand-gold/50 max-w-md w-full p-6 rounded-sm shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-amber-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>{isAr ? 'قناة الواتساب قيد التفعيل' : 'WhatsApp Concierge Setup'}</span>
              </div>
              <button onClick={() => setShowConfigAlert(false)} className="text-brand-cream/60 hover:text-brand-ivory">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-brand-cream/80 leading-relaxed text-[11px]">
              {isAr
                ? 'رقم هاتف الواتساب الرسمي لخدمة عملاء أثير في مصر قيد التخصيص والربط النهائي (NEXT_PUBLIC_WHATSAPP_NUMBER). يسعدنا استقبال استفساراتكم حالياً عبر البريد الإلكتروني.'
                : 'The official Egyptian WhatsApp support line is currently awaiting commercial number configuration in environment variables (NEXT_PUBLIC_WHATSAPP_NUMBER). In the meantime, please contact our concierge via email.'}
            </p>

            <div className="p-3 bg-brand-stone/30 border border-brand-border rounded-xs flex items-center space-x-2 rtl:space-x-reverse text-brand-ivory">
              <Mail className="w-4 h-4 text-brand-gold" />
              <span>concierge@atheer.store</span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConfigAlert(false)}
                className="px-4 py-2 bg-brand-gold text-brand-black font-bold uppercase rounded-xs text-[10px]"
              >
                {isAr ? 'حسناً' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
