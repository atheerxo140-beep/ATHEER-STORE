'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { PromoOfferItem } from '@/types';
import { Tag, Sparkles, Copy, Check, ArrowRight, ArrowLeft, Flame, ShieldCheck, Truck } from 'lucide-react';

export const PromoOffersSection: React.FC = () => {
  const { language, isRtl, t } = useLanguage();
  const { content } = useHomepageContent();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // If disabled from Admin CMS
  if (content.showPromoOffers === false) {
    return null;
  }

  const subtitle = isAr
    ? content.promoOffersSubtitleAr || 'عروض أيام أثير الحصرية'
    : content.promoOffersSubtitleEn || 'SEASONAL WINTER OFFERS';

  const title = isAr
    ? content.promoOffersTitleAr || 'اختار عرضك'
    : content.promoOffersTitleEn || 'Choose Your Drop Offer';

  const description = isAr
    ? content.promoOffersDescriptionAr ||
      'عروض وباندلات شتوية حصرية من أثير. انسخ الكوبون بضغطة زر وطبقه فوراً في سلتك مع معاينة كاملة للقطعة قبل الاستلام والدفع.'
    : content.promoOffersDescriptionEn ||
      'Exclusive winter streetwear bundles and vouchers. Direct 1-click coupon application with full order inspection before courier payment.';

  const bannerTag = isAr
    ? content.promoOffersBannerTagAr || 'إصدارات شتاء 27 المحدودة'
    : content.promoOffersBannerTagEn || 'Winter 27 Limited Drops';

  const offers: PromoOfferItem[] =
    content.promoOffers && content.promoOffers.length > 0
      ? content.promoOffers
      : [
          {
            id: 'coupon-10',
            badgeEn: 'INSTANT VOUCHER',
            badgeAr: 'كوبون فوري',
            titleEn: '10% OFF With Voucher',
            titleAr: '10% خصم بالكوبون',
            descriptionEn: 'Valid on your entire streetwear order. Can be combined with free shipping threshold.',
            descriptionAr: 'يطبق على جميع قطع المتجر فوراً. يمكن الجمع مع الشحن المجاني المؤهل.',
            couponCode: 'ATHEER10',
            discountBadgeEn: '10% OFF',
            discountBadgeAr: 'خصم 10%',
            actionTextEn: 'Copy Code',
            actionTextAr: 'نسخ الكود',
            actionType: 'copy',
            isPrimary: true,
          },
          {
            id: 'family-bundle',
            badgeEn: 'HOT BUNDLE',
            badgeAr: 'وفر أكثر',
            titleEn: '15% OFF On 2+ Pieces',
            titleAr: '15% على الباندل أو قطعتين',
            descriptionEn: 'Winter warmth for family and youth. Pick any 2 pieces or full tracksuit set and get 15% discount.',
            descriptionAr: 'دفا العيلة… من أثير. اختار أي قطعتين هودي أو تريننج واحصل على خصم 15% فوري من الإجمالي.',
            couponCode: 'FAMILY15',
            discountBadgeEn: '15% OFF',
            discountBadgeAr: 'خصم 15%',
            actionTextEn: 'Copy Code',
            actionTextAr: 'نسخ الكود',
            actionType: 'copy',
            isPrimary: false,
          },
          {
            id: 'welcome-voucher',
            badgeEn: 'WELCOME GIFT',
            badgeAr: 'هدية ترحيبية',
            titleEn: '100 EGP Instant Cash Off',
            titleAr: 'خصم 100 ج.م كاش ترحيبي',
            descriptionEn: 'Instant 100 EGP discount on your first streetwear drop order above 1000 EGP.',
            descriptionAr: 'خصم فوري 100 جنيه عند طلبك الأول لقطع أثير الفاخرة فوق 1000 ج.م.',
            couponCode: 'WELCOME100',
            discountBadgeEn: '-100 EGP',
            discountBadgeAr: '-100 ج.م',
            actionTextEn: 'Copy Code',
            actionTextAr: 'نسخ الكود',
            actionType: 'copy',
            isPrimary: false,
          },
          {
            id: 'free-shipping-egypt',
            badgeEn: 'EXPRESS PERK',
            badgeAr: 'شحن ومعاينة',
            titleEn: 'Free Egypt Delivery & Open Box',
            titleAr: 'شحن مجاني ومعاينة للباب',
            descriptionEn: 'Free delivery across all Egypt on orders above 1800 EGP. Inspect the fabric with courier before paying.',
            descriptionAr: 'شحن مجاني لكافة المحافظات للطلبات فوق 1800 ج.م مع فتح الشحنة ومعاينة التقفيل مع المندوب.',
            couponCode: 'FREESHIP',
            discountBadgeEn: 'FREE SHIP',
            discountBadgeAr: 'شحن مجاني',
            actionTextEn: 'Shop Now',
            actionTextAr: 'تسوق الآن',
            actionType: 'link',
            actionHref: '#products',
            isPrimary: false,
          },
        ];

  const handleCopyCode = (code: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(code);
      localStorage.setItem('atheer_active_coupon', code);
    }
    setCopiedCode(code);
    setToastMessage(
      isAr
        ? `تم نسخ الكوبون "${code}" بنجاح! سيتم تطبيقه تلقائياً عند الدفع.`
        : `Coupon "${code}" copied! It will be pre-filled at checkout.`
    );
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <section id="offers" className="py-16 sm:py-24 bg-brand-black text-brand-ivory border-b border-brand-border/60 relative overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-xs uppercase tracking-[0.25em] text-brand-gold font-mono font-semibold mb-3 px-3 py-1 bg-brand-charcoal/80 border border-brand-gold/30 rounded-full">
            <Flame className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
            <span>{subtitle}</span>
            <span className="text-brand-cream/40">|</span>
            <span className="text-brand-cream/80 text-[10px]">{bannerTag}</span>
          </div>

          <h2 className="font-sans font-black text-3xl sm:text-5xl text-brand-ivory uppercase tracking-tight">
            {title}
          </h2>

          <div className="w-16 h-[2px] bg-brand-gold mx-auto my-4" />

          <p className="text-xs sm:text-sm text-brand-cream/70 font-sans leading-relaxed">
            {description}
          </p>
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {offers.map((offer) => {
            const badge = isAr ? offer.badgeAr : offer.badgeEn;
            const offerTitle = isAr ? offer.titleAr : offer.titleEn;
            const offerDesc = isAr ? offer.descriptionAr : offer.descriptionEn;
            const discountBadge = isAr ? offer.discountBadgeAr : offer.discountBadgeEn;
            const actionText = isAr ? offer.actionTextAr : offer.actionTextEn;
            const isCopied = copiedCode === offer.couponCode;

            return (
              <div
                key={offer.id}
                className={`relative flex flex-col justify-between p-6 rounded-xs transition-all duration-300 group ${
                  offer.isPrimary
                    ? 'bg-gradient-to-b from-brand-charcoal to-brand-stone/40 border-2 border-brand-gold shadow-gold'
                    : 'bg-brand-charcoal/80 hover:bg-brand-charcoal border border-brand-border/80 hover:border-brand-gold/60 shadow-luxury-dark'
                }`}
              >
                {/* Top Row: Badge & Discount */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold px-2 py-0.5 bg-brand-black/70 border border-brand-gold/30 rounded-xs">
                      {badge}
                    </span>
                    <span className="inline-block text-xs font-mono font-black text-brand-black bg-brand-gold px-2.5 py-0.5 rounded-xs shadow-sm">
                      {discountBadge}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-lg text-brand-ivory mb-2 group-hover:text-brand-gold transition-colors">
                    {offerTitle}
                  </h3>

                  <p className="text-xs text-brand-cream/65 leading-relaxed mb-6">
                    {offerDesc}
                  </p>
                </div>

                {/* Bottom Row: Coupon Code / Action */}
                <div className="pt-4 border-t border-brand-border/40 mt-auto space-y-3">
                  {offer.actionType === 'copy' ? (
                    <div>
                      <div className="flex items-center justify-between bg-brand-black/90 border border-brand-border/80 group-hover:border-brand-gold/50 rounded-xs p-2 transition-colors">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse font-mono text-xs font-bold text-brand-gold tracking-widest">
                          <Tag className="w-3.5 h-3.5 opacity-70" />
                          <span>{offer.couponCode}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(offer.couponCode)}
                          className={`px-3 py-1 text-[11px] font-mono font-bold rounded-xs flex items-center space-x-1 rtl:space-x-reverse transition-all duration-200 ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-brand-gold text-brand-black hover:bg-brand-gold-hover active:scale-95'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>{isAr ? 'تم النسخ' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{actionText}</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-brand-cream/45 text-center mt-1.5 font-mono">
                        {isAr ? 'عرض واحد لكل طلب • يطبق في السلة' : 'One per order • Apply in cart'}
                      </p>
                    </div>
                  ) : (
                    <a
                      href={offer.actionHref || '#products'}
                      className="w-full py-2 px-4 bg-brand-gold text-brand-black hover:bg-brand-gold-hover font-sans text-xs uppercase tracking-wider font-bold rounded-xs flex items-center justify-center space-x-2 rtl:space-x-reverse transition-colors"
                    >
                      <span>{actionText}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-brand-charcoal border-2 border-brand-gold text-brand-ivory text-xs px-4 py-3 rounded-xs shadow-2xl flex items-center space-x-2 rtl:space-x-reverse animate-slide-up">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </section>
  );
};
