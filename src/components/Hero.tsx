'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { ArrowRight, ArrowLeft, Flame, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  const { t, isRtl, language } = useLanguage();
  const { content } = useHomepageContent();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const bgImage = content.heroBgImage || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2200&auto=format&fit=crop';
  const badge = isAr ? content.heroBadgeAr || t('heroBadge') : content.heroBadgeEn || t('heroBadge');
  const title = isAr ? content.heroTitleAr || t('heroTitle') : content.heroTitleEn || t('heroTitle');
  const subtitle = isAr ? content.heroSubtitleAr || t('heroSubtitle') : content.heroSubtitleEn || t('heroSubtitle');
  const ctaPrimary = isAr ? content.heroCtaPrimaryAr || t('heroCtaPrimary') : content.heroCtaPrimaryEn || t('heroCtaPrimary');
  const ctaSecondary = isAr ? content.heroCtaSecondaryAr || t('heroCtaSecondary') : content.heroCtaSecondaryEn || t('heroCtaSecondary');

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-brand-black text-brand-ivory border-b border-brand-border/60">
      {/* High-Resolution Editorial Streetwear Hoodie Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-[center_top_15%] sm:bg-center scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('${bgImage}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-brand-black/65" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-brand-black/50 to-brand-black/90" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center flex flex-col items-center">
        {/* Streetwear Drop Badge */}
        <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-1.5 rounded-full border border-brand-gold/50 bg-brand-black/80 backdrop-blur-md mb-6 shadow-gold animate-fade-in">
          <Flame className="w-3.5 h-3.5 text-brand-gold" />
          <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-brand-gold font-semibold">
            {badge}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="font-sans font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] text-brand-ivory uppercase max-w-5xl whitespace-pre-line">
          {title}
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 sm:mt-8 max-w-2xl text-sm sm:text-base md:text-lg text-brand-cream/90 font-sans leading-relaxed tracking-wide font-light whitespace-pre-line">
          {subtitle}
        </p>

        {/* Flagship Hoodie Specification Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] font-mono text-brand-gold uppercase tracking-wider">
          <span className="px-3 py-1 bg-brand-charcoal/90 border border-brand-gold/40">
            {language === 'ar' ? 'مواصفات النسيج: 500 GSM' : 'Fabric: 500 GSM Spec Fleece'}
          </span>
          <span className="px-3 py-1 bg-brand-charcoal/90 border border-brand-border">
            {language === 'ar' ? 'قصّة: بوكسي أكتاف ساقطة' : 'Fit: Drop-Shoulder Boxy'}
          </span>
          <span className="px-3 py-1 bg-brand-charcoal/90 border border-brand-border">
            {language === 'ar' ? 'توصيل ودفع عند الاستلام في مصر' : 'COD Delivery Across Egypt'}
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-md sm:max-w-none">
          <a
            href="#products"
            className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-4 bg-brand-gold text-brand-black text-xs uppercase tracking-[0.2em] font-bold hover:bg-brand-gold-hover transition-all duration-300 shadow-gold group font-mono"
          >
            <span>{ctaPrimary}</span>
            <ArrowIcon className="w-4 h-4 ml-2.5 rtl:mr-2.5 rtl:ml-0 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </a>

          <a
            href="#collections"
            className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-4 border border-brand-ivory/40 text-brand-ivory hover:border-brand-gold hover:text-brand-gold bg-brand-black/60 backdrop-blur-sm text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 font-mono"
          >
            <span>{ctaSecondary}</span>
          </a>
        </div>

        {/* 3 Pillars of ATHEER Heavyweight Streetwear in Egypt */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-brand-border/40 grid grid-cols-3 gap-6 sm:gap-12 w-full max-w-3xl">
          <div className="flex flex-col items-center text-center">
            <span className="font-sans font-black text-xl sm:text-3xl text-brand-gold tracking-tight">
              {t('heroStat1Value')}
            </span>
            <span className="mt-1 text-[10px] sm:text-xs text-brand-cream/80 tracking-wider uppercase font-sans">
              {t('heroStat1Label')}
            </span>
          </div>

          <div className="flex flex-col items-center text-center border-x border-brand-border/40 px-2 sm:px-4">
            <span className="font-sans font-black text-xl sm:text-3xl text-brand-ivory tracking-tight">
              {t('heroStat2Value')}
            </span>
            <span className="mt-1 text-[10px] sm:text-xs text-brand-cream/80 tracking-wider uppercase font-sans">
              {t('heroStat2Label')}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="font-sans font-black text-xl sm:text-3xl text-brand-gold tracking-tight">
              {t('heroStat3Value')}
            </span>
            <span className="mt-1 text-[10px] sm:text-xs text-brand-cream/80 tracking-wider uppercase font-sans">
              {t('heroStat3Label')}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
    </section>
  );
};
