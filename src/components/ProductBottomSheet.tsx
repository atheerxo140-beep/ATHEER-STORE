'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Check,
  Flame,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface ProductBottomSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductBottomSheet: React.FC<ProductBottomSheetProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { language, formatPrice, isRtl } = useLanguage();
  const { addItem } = useCart();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || 'L');
      setSelectedColor(product.colors[0] || '');
      setQuantity(1);
      setAddedSuccess(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const title = isAr ? product.nameAr : product.nameEn;
  const categoryLabel = isAr ? product.categoryLabelAr : product.categoryLabelEn;
  const totalPrice = product.price * quantity;

  const handleAddToCart = () => {
    if (product.isComingSoon) {
      alert(
        isAr
          ? 'هذه القطعة جزء من إصدار التي شيرتات القادم! يمكنك الانضمام لقائمة الإطلاق بالأسفل.'
          : 'Coming soon in our upcoming drop! Join the Drop List to get notified.'
      );
      onClose();
      return;
    }

    addItem(product, quantity, selectedSize, selectedColor, false);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-fade-in font-sans">
      {/* Backdrop click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Sheet Container: Slide-Up on Mobile / Centered on Desktop */}
      <div className="relative w-full sm:max-w-2xl bg-brand-charcoal border-t-2 sm:border border-brand-gold/60 rounded-t-2xl sm:rounded-xs p-5 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-slide-up-sheet">
        {/* Mobile Swipe / Sheet Indicator */}
        <div className="w-12 h-1 bg-brand-border/80 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 text-brand-cream/60 hover:text-brand-ivory transition-colors bg-brand-black/60 rounded-xs z-20"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Visual & Header Info */}
        <div className="flex flex-col sm:flex-row gap-5 pb-5 border-b border-brand-border/60">
          {/* Thumbnail */}
          <div className="relative w-28 h-36 sm:w-36 sm:h-44 bg-brand-black rounded-xs overflow-hidden shrink-0 border border-brand-border/70 self-center sm:self-start">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: `url('${product.image}')` }}
            />
            <span className="absolute bottom-1 right-1 rtl:left-1 rtl:right-auto bg-brand-black/90 text-brand-gold font-mono text-[9px] px-1.5 py-0.5 font-bold">
              {product.gsm} {isAr ? 'جم/م²' : 'GSM'}
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2 text-right rtl:text-right">
            <div className="flex items-center space-x-2 rtl:space-x-reverse justify-end sm:justify-start">
              <span className="text-[10px] uppercase font-mono text-brand-gold font-semibold tracking-wider">
                {categoryLabel}
              </span>
              <span className="text-emerald-400 text-[10px] font-mono flex items-center space-x-1 rtl:space-x-reverse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>{isAr ? 'متوفر للتسليم' : 'In Stock'}</span>
              </span>
            </div>

            <h3 className="font-bold text-base sm:text-xl text-brand-ivory font-serif leading-snug">
              {title}
            </h3>

            <div className="flex items-baseline space-x-2 rtl:space-x-reverse font-mono">
              <span className="text-lg sm:text-xl font-bold text-brand-gold">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-brand-muted line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-[11px] text-brand-cream/70 font-light leading-relaxed line-clamp-2">
              {isAr ? product.descriptionAr : product.descriptionEn}
            </p>
          </div>
        </div>

        {/* Options Selection Stage */}
        <div className="py-4 space-y-4">
          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="block text-xs font-mono text-brand-cream/80 uppercase tracking-wider mb-2">
                {isAr ? 'اللون المتاح:' : 'Color:'}{' '}
                <strong className="text-brand-gold">{selectedColor}</strong>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-xs border transition-all ${
                      selectedColor === color
                        ? 'border-brand-gold bg-brand-gold/15 text-brand-gold font-bold shadow-sm'
                        : 'border-brand-border/80 text-brand-cream/70 hover:text-brand-ivory hover:border-brand-border'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-brand-cream/80 uppercase tracking-wider">
                  {isAr ? 'المقاس (قصّة بوكسي واسعة):' : 'Size (Oversized Boxy Fit):'}
                </label>
                <Link
                  href="/#fabric-fit"
                  onClick={onClose}
                  className="text-[10px] text-brand-gold hover:underline font-mono"
                >
                  {isAr ? 'جدول المقاسات' : 'Size Guide'}
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`w-11 h-9 flex items-center justify-center text-xs font-mono border rounded-xs transition-all ${
                      selectedSize === sz
                        ? 'border-brand-gold bg-brand-gold text-brand-black font-bold shadow-gold'
                        : 'border-brand-border/80 text-brand-ivory/80 hover:text-brand-ivory hover:border-brand-gold/60'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Counter */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-brand-cream/80 uppercase">
              {isAr ? 'الكمية المطلوبة:' : 'Quantity:'}
            </span>
            <div className="flex items-center space-x-2 rtl:space-x-reverse bg-brand-black border border-brand-border/80 rounded-xs p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center text-brand-cream/70 hover:text-brand-ivory transition-colors hover:bg-brand-charcoal"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-mono font-bold text-sm text-brand-ivory">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center text-brand-cream/70 hover:text-brand-ivory transition-colors hover:bg-brand-charcoal"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer CTAs & Total */}
        <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-brand-cream/60 font-mono block">
              {isAr ? 'الإجمالي للطلب:' : 'Subtotal:'}
            </span>
            <span className="text-lg font-bold text-brand-gold font-mono">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-5 text-xs uppercase tracking-widest font-bold rounded-xs transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse font-mono shadow-gold ${
              addedSuccess
                ? 'bg-emerald-700 text-white'
                : 'bg-brand-gold text-brand-black hover:bg-brand-gold-hover active:scale-98'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isAr ? 'تمت الإضافة بنجاح!' : 'Added Successfully!'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{isAr ? 'إضافة إلى السلة' : 'Add to Bag'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
