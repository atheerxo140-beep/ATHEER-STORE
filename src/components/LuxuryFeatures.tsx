'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { Layers, Scissors, Banknote, MessageCircle, Flame } from 'lucide-react';

export const LuxuryFeatures: React.FC = () => {
  const { t, language } = useLanguage();
  const { content } = useHomepageContent();
  const isAr = language === 'ar';

  if (content.showFeatures === false) {
    return null;
  }

  const features = [
    {
      icon: Layers,
      title: isAr ? content.feature1TitleAr || t('pillar1Title') : content.feature1TitleEn || t('pillar1Title'),
      desc: isAr ? content.feature1DescAr || t('pillar1Desc') : content.feature1DescEn || t('pillar1Desc'),
    },
    {
      icon: Scissors,
      title: isAr ? content.feature2TitleAr || t('pillar2Title') : content.feature2TitleEn || t('pillar2Title'),
      desc: isAr ? content.feature2DescAr || t('pillar2Desc') : content.feature2DescEn || t('pillar2Desc'),
    },
    {
      icon: Banknote,
      title: isAr ? content.feature3TitleAr || t('pillar3Title') : content.feature3TitleEn || t('pillar3Title'),
      desc: isAr ? content.feature3DescAr || t('pillar3Desc') : content.feature3DescEn || t('pillar3Desc'),
    },
    {
      icon: MessageCircle,
      title: isAr ? content.feature4TitleAr || t('pillar4Title') : content.feature4TitleEn || t('pillar4Title'),
      desc: isAr ? content.feature4DescAr || t('pillar4Desc') : content.feature4DescEn || t('pillar4Desc'),
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-brand-black text-brand-ivory border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-6 bg-brand-charcoal/50 border border-brand-border/50 hover:border-brand-gold/60 transition-colors duration-300 group"
              >
                <div className="w-12 h-12 rounded-full border border-brand-gold/40 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-black transition-all duration-300 mb-5">
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>
                <h3 className="font-sans font-bold text-base sm:text-lg text-brand-ivory mb-2 group-hover:text-brand-gold transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-brand-cream/70 font-sans font-light leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
