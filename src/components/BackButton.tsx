'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  fallbackUrl?: string;
  className?: string;
  variant?: 'button' | 'minimal' | 'floating';
}

export const BackButton: React.FC<BackButtonProps> = ({
  label,
  fallbackUrl = '/',
  className = '',
  variant = 'button',
}) => {
  const router = useRouter();
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  // In RTL, "back" points to the right (→); in LTR, it points to the left (←)
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const defaultLabel = isAr ? 'رجوع للخطوة السابقة' : 'Back to previous';
  const displayLabel = label || defaultLabel;

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={handleBack}
        className={`inline-flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-cream/80 hover:text-brand-gold transition-colors group cursor-pointer active:scale-95 ${className}`}
        aria-label={displayLabel}
      >
        <BackArrow className="w-4 h-4 text-brand-gold transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 shrink-0" />
        <span className="font-medium underline-offset-4 group-hover:underline">{displayLabel}</span>
      </button>
    );
  }

  if (variant === 'floating') {
    return (
      <button
        type="button"
        onClick={handleBack}
        className={`fixed top-20 left-4 rtl:left-auto rtl:right-4 z-40 p-2.5 sm:px-4 sm:py-2 bg-brand-charcoal/90 hover:bg-brand-stone backdrop-blur-md border border-brand-gold/40 text-brand-gold hover:text-brand-ivory text-xs font-mono font-bold rounded-full sm:rounded-xs shadow-gold transition-all flex items-center space-x-2 rtl:space-x-reverse group cursor-pointer active:scale-95 ${className}`}
        aria-label={displayLabel}
      >
        <BackArrow className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 shrink-0" />
        <span className="hidden sm:inline">{displayLabel}</span>
      </button>
    );
  }

  // Default 'button' variant: Sleek luxury badge
  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-3.5 py-2 bg-brand-charcoal/90 hover:bg-brand-stone border border-brand-border/90 hover:border-brand-gold/70 text-xs font-mono text-brand-cream/90 hover:text-brand-gold rounded-xs transition-all shadow-sm group cursor-pointer active:scale-95 ${className}`}
      aria-label={displayLabel}
    >
      <BackArrow className="w-4 h-4 text-brand-gold transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 shrink-0" />
      <span className="font-bold">{displayLabel}</span>
    </button>
  );
};
