'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MessageCircle, Sparkles } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const { language, t, isRtl } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  // Read configured WhatsApp from environment variable or default Egyptian support line
  // Format: 201XXXXXXXXX (Egyptian international dialing format)
  const configuredNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201000000000';
  const cleanNumber = configuredNumber.replace(/[^0-9]/g, '');

  const whatsappMessage =
    language === 'ar'
      ? 'مرحباً أثير مصر، أود الاستفسار عن مقاسات الهوديز وتفاصيل التوصيل داخل مصر.'
      : 'Greetings ATHEER Egypt, I would like to inquire about hoodie sizing, fits, and delivery.';

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
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
            {t('whatsappText')}
          </p>
        </div>
      </div>

      {/* Main Circular Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-13 h-13 sm:w-14 sm:h-14 bg-brand-black border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black transition-all duration-300 rounded-full flex items-center justify-center shadow-gold hover:scale-105 active:scale-95"
        aria-label="Contact ATHEER Egypt on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 stroke-[1.8]" />
      </a>
    </div>
  );
};
