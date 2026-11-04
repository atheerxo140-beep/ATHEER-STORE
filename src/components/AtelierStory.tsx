'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Flame, Layers, ShieldCheck, Sparkles } from 'lucide-react';

export const AtelierStory: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section id="about" className="py-24 sm:py-32 bg-brand-charcoal text-brand-ivory relative overflow-hidden border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Streetwear Editorial Hoodie Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-brand-border/80 shadow-2xl">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent" />
            </div>

            {/* Overlapping Floating Streetwear Spec Card */}
            <div className="absolute -bottom-8 -right-4 sm:-right-8 rtl:-left-4 sm:rtl:-left-8 rtl:right-auto bg-brand-black/95 backdrop-blur-md border border-brand-gold/60 p-6 max-w-xs shadow-gold hidden sm:block">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-gold mb-2 font-mono">
                <Flame className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  {language === 'ar' ? 'معايير الثقل الحقيقي' : 'The Heavyweight Standard'}
                </span>
              </div>
              <p className="text-xs text-brand-cream/85 font-sans leading-relaxed">
                {language === 'ar'
                  ? '"الستريتوير ليس مجرد شعار، بل ثقل القماش، وثبات الياقة، وتوازن القصّة."'
                  : '"Real streetwear is not about loud logos; it is defined by fabric weight, structural hood, and boxy proportions."'}
              </p>
              <span className="block mt-3 text-[10px] text-brand-gold uppercase tracking-widest font-mono">
                — ATHEER Brand Manifesto
              </span>
            </div>
          </div>

          {/* Right: The Streetwear Manifesto */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-brand-gold text-xs uppercase tracking-[0.25em] font-mono font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('storyBadge')}</span>
            </div>

            <h2 className="font-sans font-black text-3xl sm:text-5xl text-brand-ivory uppercase tracking-tight leading-[1.15] mb-8">
              {t('storyTitle')}
            </h2>

            <div className="space-y-6 text-sm sm:text-base text-brand-cream/85 font-sans font-light leading-relaxed">
              <p>{t('storyParagraph1')}</p>
              <p>{t('storyParagraph2')}</p>
            </div>

            {/* Technical Streetwear Metrics */}
            <div id="fabric-fit" className="mt-10 pt-8 border-t border-brand-border/60 grid grid-cols-3 gap-4">
              <div className="border-l-2 rtl:border-l-0 rtl:border-r-2 border-brand-gold pl-3 rtl:pl-0 rtl:pr-3">
                <span className="font-mono text-2xl sm:text-3xl text-brand-gold font-bold">500</span>
                <span className="text-xs text-brand-gold font-mono ml-1">GSM</span>
                <p className="text-[11px] text-brand-cream/70 uppercase tracking-wider mt-1 font-sans">
                  {language === 'ar' ? 'قطن فرنش تيري ثقيل' : 'Heavy French Terry'}
                </p>
              </div>

              <div className="border-l-2 rtl:border-l-0 rtl:border-r-2 border-brand-gold pl-3 rtl:pl-0 rtl:pr-3">
                <span className="font-mono text-2xl sm:text-3xl text-brand-ivory font-bold">0%</span>
                <p className="text-[11px] text-brand-cream/70 uppercase tracking-wider mt-1 font-sans">
                  {language === 'ar' ? 'بوليستر أو حشو رخيص' : 'Zero Synthetic Fillers'}
                </p>
              </div>

              <div className="border-l-2 rtl:border-l-0 rtl:border-r-2 border-brand-gold pl-3 rtl:pl-0 rtl:pr-3">
                <span className="font-mono text-2xl sm:text-3xl text-brand-gold font-bold">100%</span>
                <p className="text-[11px] text-brand-cream/70 uppercase tracking-wider mt-1 font-sans">
                  {language === 'ar' ? 'معالج ضد الانكماش' : 'Pre-Shrunk Cotton'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
