'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, ShoppingBag, X, ArrowLeft, ArrowRight } from 'lucide-react';

export const FloatingCartToast: React.FC = () => {
  const { toast, dismissToast, setIsCartOpen, totalCount } = useCart();
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  if (!toast) return null;

  const productName = isAr ? toast.product.nameAr : toast.product.nameEn;

  const handleOpenCart = () => {
    dismissToast();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed top-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 max-w-lg w-auto min-w-0 sm:min-w-[320px] bg-emerald-950/95 border border-emerald-500/70 shadow-2xl backdrop-blur-md rounded-xs p-3 text-white flex items-center justify-between gap-3 animate-slide-down font-sans select-none">
      {/* Icon & Message */}
      <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-emerald-300 leading-tight">
            {isAr ? 'تمت الإضافة إلى السلة بنجاح' : 'Added to bag successfully!'}
          </p>
          <p className="text-[11px] text-white/90 truncate max-w-[200px] sm:max-w-xs mt-0.5 font-medium">
            {productName}
          </p>
        </div>
      </div>

      {/* Action Button & Close */}
      <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
        <button
          onClick={handleOpenCart}
          className="px-3 py-1.5 bg-brand-gold text-brand-black text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs hover:bg-brand-gold-hover transition-colors shadow-sm flex items-center space-x-1 rtl:space-x-reverse"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isAr ? `عرض السلة (${totalCount})` : `View Bag (${totalCount})`}</span>
        </button>

        <button
          onClick={dismissToast}
          className="p-1 text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
