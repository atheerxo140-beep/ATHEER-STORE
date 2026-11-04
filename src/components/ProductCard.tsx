'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingBag, Eye, Check, Flame, Clock } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { language, t, formatPrice } = useLanguage();
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'L');

  const title = language === 'ar' ? product.nameAr : product.nameEn;
  const categoryLabel = language === 'ar' ? product.categoryLabelAr : product.categoryLabelEn;
  const badge = language === 'ar' ? product.badgeAr : product.badgeEn;
  const fit = language === 'ar' ? product.fitAr : product.fitEn;

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
    addItem(product, 1, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  return (
    <div
      className={`group flex flex-col bg-brand-black border transition-all duration-500 overflow-hidden ${
        product.category === 'hoodies'
          ? 'border-brand-border/80 hover:border-brand-gold shadow-luxury-dark'
          : 'border-brand-border/60 hover:border-brand-gold/70'
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

        {/* GSM & Fit Top Badges */}
        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10 flex flex-col space-y-1">
          {badge && (
            <span className="inline-block bg-brand-black/90 backdrop-blur-md text-brand-gold border border-brand-gold/50 text-[9px] uppercase tracking-wider font-mono font-semibold px-2 py-0.5">
              {badge}
            </span>
          )}
          <span className="inline-block bg-brand-charcoal/95 backdrop-blur-md text-brand-ivory text-[9px] font-mono tracking-wider px-2 py-0.5 border border-brand-border">
            {product.gsm} GSM
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 w-8 h-8 rounded-full bg-brand-black/75 backdrop-blur-md border border-brand-border/80 flex items-center justify-center text-brand-ivory hover:text-brand-gold hover:border-brand-gold transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-brand-gold text-brand-gold' : 'text-brand-ivory'
            }`}
          />
        </button>

        {/* Quick View Button */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className={`hidden sm:flex absolute inset-x-8 top-1/2 -translate-y-1/2 items-center justify-center space-x-2 rtl:space-x-reverse bg-brand-black/90 backdrop-blur-md border border-brand-gold text-brand-gold text-xs uppercase tracking-widest py-3 px-4 font-semibold transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('quickView')}</span>
          </button>
        )}

        {/* Bottom Slide-Up Quick Add / Coming Soon Bar */}
        <div
          className={`absolute inset-x-0 bottom-0 p-3 bg-brand-black/95 backdrop-blur-md border-t border-brand-border transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'sm:translate-y-full sm:opacity-0 opacity-100'
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

          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-3 flex items-center justify-center space-x-2 rtl:space-x-reverse text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
              product.isComingSoon
                ? 'bg-brand-charcoal text-brand-gold border border-brand-gold/40 hover:bg-brand-gold hover:text-brand-black'
                : addedAnimation
                ? 'bg-emerald-800 text-white'
                : 'bg-brand-gold text-brand-black hover:bg-brand-gold-hover'
            }`}
          >
            {product.isComingSoon ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إشعار عند الإطلاق' : 'Get Drop Alert'}</span>
              </>
            ) : addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{language === 'ar' ? 'تمت الإضافة للحقيبة' : 'Added to Bag'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('addToBag')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-brand-gold tracking-wider uppercase mb-1 font-mono">
            <span>{categoryLabel}</span>
            <span className="text-[10px] text-brand-cream/60">{fit}</span>
          </div>

          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-sans font-bold text-base sm:text-lg text-brand-ivory hover:text-brand-gold transition-colors leading-snug line-clamp-1">
              {title}
            </h3>
          </Link>
        </div>

        {/* Pricing and Stock */}
        <div className="mt-4 pt-3 border-t border-brand-border/40 flex items-center justify-between">
          <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
            <span className="font-mono text-lg sm:text-xl font-bold text-brand-gold">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-brand-muted line-through font-mono">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <Link
            href={`/products/${product.id}`}
            className="text-[10px] uppercase tracking-wider text-brand-gold hover:underline font-mono"
          >
            {language === 'ar' ? 'عرض التفاصيل' : 'View Piece'}
          </Link>
        </div>
      </div>
    </div>
  );
};
