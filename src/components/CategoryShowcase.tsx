'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { ArrowRight, ArrowLeft, Flame, Sparkles } from 'lucide-react';

export const CategoryShowcase: React.FC = () => {
  const { t, isRtl, language } = useLanguage();
  const { content } = useHomepageContent();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const sectionSubtitle = isAr
    ? content.categoriesSubtitleAr || t('curatedCollections')
    : content.categoriesSubtitleEn || t('curatedCollections');
  const sectionTitle = isAr
    ? content.categoriesTitleAr || t('collectionsTitle')
    : content.categoriesTitleEn || t('collectionsTitle');
  const sectionDesc = isAr
    ? content.categoriesDescriptionAr || t('collectionsSubtitle')
    : content.categoriesDescriptionEn || t('collectionsSubtitle');

  const categories =
    content.categories && content.categories.length > 0
      ? content.categories.map((cat) => ({
          id: cat.id,
          title: isAr ? cat.titleAr : cat.titleEn,
          desc: isAr ? cat.descAr : cat.descEn,
          image: cat.image,
          tag: isAr ? cat.tagAr : cat.tagEn,
          href: cat.href,
          isPrimary: cat.isPrimary,
        }))
      : [
          {
            id: 'hoodies',
            title: t('catHoodiesTitle'),
            desc: t('catHoodiesDesc'),
            image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
            tag: '01 / MAIN DROP · 500 GSM',
            href: '#products',
            isPrimary: true,
          },
          {
            id: 'sweatshirts',
            title: t('catSweatshirtsTitle'),
            desc: t('catSweatshirtsDesc'),
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
            tag: '02 / CREWNECKS · 450 GSM',
            href: '#products',
            isPrimary: false,
          },
          {
            id: 'fabric-fit',
            title: t('catFabricLabTitle'),
            desc: t('catFabricLabDesc'),
            image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop',
            tag: '03 / FABRIC LAB',
            href: '#fabric-fit',
            isPrimary: false,
          },
          {
            id: 'tshirts',
            title: t('catTeesTeaserTitle'),
            desc: t('catTeesTeaserDesc'),
            image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
            tag: '04 / FUTURE DROP',
            href: '#future-drop',
            isPrimary: false,
          },
        ];

  return (
    <section id="collections" className="py-20 sm:py-28 bg-brand-charcoal text-brand-ivory border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-xs uppercase tracking-[0.25em] text-brand-gold font-mono font-medium mb-3">
            <Flame className="w-3.5 h-3.5" />
            <span>{sectionSubtitle}</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-brand-ivory uppercase tracking-tight">
            {sectionTitle}
          </h2>
          <div className="w-16 h-[2px] bg-brand-gold mx-auto my-6" />
          <p className="text-brand-cream/80 text-sm sm:text-base font-sans font-light leading-relaxed">
            {sectionDesc}
          </p>
        </div>

        {/* 4-Item Streetwear Grid (Hoodies emphasized as primary) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={cat.href}
              className={`group relative block overflow-hidden bg-brand-black border transition-all duration-500 ${
                cat.isPrimary
                  ? 'border-brand-gold shadow-gold ring-1 ring-brand-gold/30'
                  : 'border-brand-border/60 hover:border-brand-gold/70'
              }`}
            >
              {/* Product Category Imagery */}
              <div className="aspect-[3/4] w-full overflow-hidden relative">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-108"
                  style={{ backgroundImage: `url('${cat.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/45 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                {/* Badge Tag */}
                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 text-[10px] uppercase tracking-wider text-brand-gold font-mono bg-brand-black/85 px-2.5 py-1 backdrop-blur-sm border border-brand-gold/40">
                  {cat.tag}
                </div>

                {/* Bottom Card Copy */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                  <h3 className="font-sans font-bold text-xl sm:text-2xl text-brand-ivory group-hover:text-brand-gold transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-brand-cream/75 mt-2 line-clamp-2 font-light leading-relaxed">
                    {cat.desc}
                  </p>

                  <div className="mt-4 pt-4 border-t border-brand-border/40 flex items-center justify-between text-xs text-brand-gold font-semibold uppercase tracking-wider">
                    <span>{t('exploreCategory')}</span>
                    <ArrowIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
