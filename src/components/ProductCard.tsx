'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, ShoppingBag, Eye, Check, Flame, Clock, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, index = 0 }) => {
  const router = useRouter();
  const { language, t, formatPrice } = useLanguage();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const isWishlisted = isInWishlist(product.id);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'L');

  const title = language === 'ar' ? product.nameAr : product.nameEn;
  const categoryLabel = language === 'ar' ? product.categoryLabelAr : product.categoryLabelEn;
  const badge = language === 'ar' ? product.badgeAr : product.badgeEn;
  const fit = language === 'ar' ? product.fitAr : product.fitEn;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleDirectBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isComingSoon) {
      handleAddToCart(e);
      return;
    }
    addItem(product, 1, selectedSize, product.colors[0] || '', false);
    router.push('/checkout');
  };

  const handleQuickAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      handleAddToCart(e);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isComingSoon) {
      alert(
        language === 'ar'
          ? 'هذه القطعة جزء من إصدار التي شيرتات القادم! يمكنك الانضمام لقائمة الإطلاق في أسفل الصفحة لتصلك رسالة فور توفرها.'
          : 'This item is part of our upcoming Youth T-Shirt drop! Join the Drop List at the bottom of the page to get notified on release.'
      );
      return;
    }
    addItem(product, 1, selectedSize, product.colors[0] || '', false);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  return (
    <div
      style={{ animationDelay: `${index * 80}ms` }}
      className={`group flex flex-col bg-brand-black border transition-all duration-500 overflow-hidden rounded-xs animate-card-entrance ${
        product.category === 'hoodies'
          ? 'border-brand-border/80 hover:border-brand-gold shadow-luxury-dark hover:shadow-gold hover:-translate-y-1'
          : 'border-brand-border/60 hover:border-brand-gold/70 hover:-translate-y-1'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-charcoal">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          {/* Primary Image */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out ${
              isHovered ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
            }`}
            style={{ backgroundImage: `url('${product.image}')` }}
          />

          {/* Hover Second Angle Image */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out ${
              isHovered ? 'scale-105 opacity-100' : 'scale-100 opacity-0'
            }`}
            style={{ backgroundImage: `url('${product.hoverImage}')` }}
          />
        </Link>

        {/* Streetwear Dark Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/85 via-transparent to-black/30 pointer-events-none" />

        {/* GSM, Fit & Discount Top Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 rtl:left-auto rtl:right-2 sm:rtl:right-3 z-10 flex flex-col space-y-1">
          {discountPercent && (
            <span className="inline-block bg-rose-600/95 text-white border border-rose-500/80 text-[8px] xs:text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs shadow-md">
              {language === 'ar' ? `خصم ${discountPercent}%` : `${discountPercent}% OFF`}
            </span>
          )}
          {badge && (
            <span className="inline-block bg-brand-black/90 backdrop-blur-md text-brand-gold border border-brand-gold/50 text-[8px] xs:text-[9px] uppercase tracking-wider font-mono font-semibold px-1.5 py-0.5">
              {badge}
            </span>
          )}
          <span className="inline-block bg-brand-charcoal/95 backdrop-blur-md text-brand-ivory text-[8px] xs:text-[9px] font-mono tracking-wider px-1.5 py-0.5 border border-brand-border">
            {product.gsm} GSM
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 rtl:right-auto rtl:left-2 sm:rtl:left-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-black/75 backdrop-blur-md border border-brand-border/80 flex items-center justify-center text-brand-ivory hover:text-brand-gold hover:border-brand-gold transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isWishlisted ? 'fill-brand-gold text-brand-gold' : 'text-brand-ivory'
            }`}
          />
        </button>

        {/* Quick View Button (Desktop) */}
        {onQuickView && (
          <button
            type="button"
            onClick={handleQuickAction}
            className={`hidden sm:flex absolute inset-x-8 top-1/2 -translate-y-1/2 items-center justify-center space-x-2 rtl:space-x-reverse bg-brand-black/90 backdrop-blur-md border border-brand-gold text-brand-gold text-xs uppercase tracking-widest py-3 px-4 font-semibold transition-all duration-300 shadow-xl ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('quickView')}</span>
          </button>
        )}

        {/* Mobile Quick Order Floating Button (Direct Bottom Sheet Trigger) */}
        {onQuickView && (
          <button
            type="button"
            onClick={handleQuickAction}
            className="sm:hidden absolute bottom-2 right-2 rtl:right-auto rtl:left-2 z-20 px-2 py-1 xs:px-2.5 xs:py-1.5 rounded-full bg-brand-gold text-brand-black flex items-center space-x-1 rtl:space-x-reverse text-[10px] xs:text-[11px] font-mono font-bold shadow-gold active:scale-90 transition-transform"
            aria-label="Quick order"
          >
            <ShoppingBag className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
            <span>{language === 'ar' ? 'طلب سريع' : 'Quick Order'}</span>
          </button>
        )}

        {/* Desktop Bottom Slide-Up Quick Add / Coming Soon Bar */}
        <div
          className={`hidden sm:block absolute inset-x-0 bottom-0 p-3 bg-brand-black/95 backdrop-blur-md border-t border-brand-border transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          {/* Sizes */}
          {!product.isComingSoon && product.sizes.length > 0 && (
            <div className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse mb-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(s);
                  }}
                  className={`text-[10px] px-2 py-0.5 font-mono border transition-colors ${
                    selectedSize === s
                      ? 'border-brand-gold text-brand-gold bg-brand-gold/15 font-bold'
                      : 'border-brand-border/80 text-brand-ivory/60 hover:text-brand-ivory'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-1.5 w-full">
            <button
              type="button"
              onClick={handleDirectBuy}
              disabled={product.isComingSoon}
              className="flex-1 py-2 px-2 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-[10px] uppercase font-bold tracking-wider rounded-xs transition-colors flex items-center justify-center space-x-1 rtl:space-x-reverse shadow-gold disabled:opacity-40"
              title={language === 'ar' ? 'شراء فوري ومباشر والدفع عند الاستلام' : 'Buy Now directly'}
            >
              <Zap className="w-3 h-3 fill-brand-black text-brand-black" />
              <span>{language === 'ar' ? 'شراء فوري' : 'Buy Now'}</span>
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              className={`py-2 px-2.5 border rounded-xs transition-all flex items-center justify-center ${
                product.isComingSoon
                  ? 'border-brand-border text-brand-gold/60'
                  : addedAnimation
                  ? 'bg-emerald-800 border-emerald-600 text-white'
                  : 'border-brand-border bg-brand-charcoal text-brand-gold hover:border-brand-gold'
              }`}
              title={language === 'ar' ? 'إضافة للحقيبة' : 'Add to Bag'}
            >
              {addedAnimation ? (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-2.5 xs:p-3 sm:p-4 md:p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-[9px] xs:text-[10px] sm:text-[11px] text-brand-gold tracking-wider uppercase mb-1 font-mono">
            <span>{categoryLabel}</span>
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-brand-cream/60">{fit}</span>
          </div>

          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-sans font-bold text-xs xs:text-sm sm:text-base lg:text-lg text-brand-ivory hover:text-brand-gold transition-colors leading-snug line-clamp-1">
              {title}
            </h3>
          </Link>
        </div>

        {/* Pricing and Stock */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-brand-border/40 flex items-center justify-between">
          <div className="flex items-baseline space-x-1.5 xs:space-x-2 rtl:space-x-reverse">
            <span className="font-mono text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-brand-gold">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[9px] xs:text-[10px] sm:text-xs text-brand-muted line-through font-mono">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <Link
            href={`/products/${product.id}`}
            className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-gold hover:underline font-mono hidden xs:inline-block"
          >
            {language === 'ar' ? 'عرض القطعة' : 'View Piece'}
          </Link>
        </div>
      </div>
    </div>
  );
};
