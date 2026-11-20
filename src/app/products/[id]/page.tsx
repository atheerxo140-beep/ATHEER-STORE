'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import { mockProducts, currentProducts } from '@/data/mockProducts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Heart,
  Flame,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Ruler,
  ChevronRight,
  ChevronLeft,
  Clock,
  Zap,
  Scale,
  Maximize2,
  ZoomIn,
  X,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface SizeWeightSpec {
  size: string;
  weightRangeAr: string;
  weightRangeEn: string;
  heightRange: string;
  chestCm: number;
  lengthCm: number;
  fitDescAr: string;
  fitDescEn: string;
  minKg: number;
  maxKg: number;
}

const SIZE_WEIGHT_SPECS: Record<string, SizeWeightSpec> = {
  S: {
    size: 'S',
    weightRangeAr: '50 - 65 كجم',
    weightRangeEn: '50 - 65 KG',
    heightRange: '160 - 170 سم',
    chestCm: 118,
    lengthCm: 68,
    fitDescAr: 'مناسب لوزن 50 إلى 65 كجم (قصة بوكسي أوفر سايز راقية)',
    fitDescEn: 'Recommended for 50-65 KG (signature relaxed boxy fit)',
    minKg: 50,
    maxKg: 65,
  },
  M: {
    size: 'M',
    weightRangeAr: '65 - 78 كجم',
    weightRangeEn: '65 - 78 KG',
    heightRange: '168 - 178 سم',
    chestCm: 124,
    lengthCm: 70,
    fitDescAr: 'مناسب لوزن 65 إلى 78 كجم (قصة متوازنة واسعة وأكتاف ساقطة)',
    fitDescEn: 'Recommended for 65-78 KG (balanced drop-shoulder boxy fit)',
    minKg: 65,
    maxKg: 78,
  },
  L: {
    size: 'L',
    weightRangeAr: '78 - 92 كجم',
    weightRangeEn: '78 - 92 KG',
    heightRange: '174 - 185 سم',
    chestCm: 130,
    lengthCm: 72,
    fitDescAr: 'مناسب لوزن 78 إلى 92 كجم (المقاس الأكثر طلباً — راحة وفخامة)',
    fitDescEn: 'Recommended for 78-92 KG (most popular fit — relaxed luxury)',
    minKg: 78,
    maxKg: 92,
  },
  XL: {
    size: 'XL',
    weightRangeAr: '92 - 105 كجم',
    weightRangeEn: '92 - 105 KG',
    heightRange: '178 - 192 سم',
    chestCm: 136,
    lengthCm: 74,
    fitDescAr: 'مناسب لوزن 92 إلى 105 كجم (قصة واسعة مريحة بدون تضييق)',
    fitDescEn: 'Recommended for 92-105 KG (roomy comfort silhouette)',
    minKg: 92,
    maxKg: 105,
  },
  '2XL': {
    size: '2XL',
    weightRangeAr: '105 - 125 كجم',
    weightRangeEn: '105 - 125 KG',
    heightRange: '180+ سم',
    chestCm: 142,
    lengthCm: 76,
    fitDescAr: 'مناسب لوزن 105 إلى 125 كجم (أقصى اتساع بوكسي ثقيل)',
    fitDescEn: 'Recommended for 105-125 KG (maximum heavyweight room)',
    minKg: 105,
    maxKg: 125,
  },
  XXL: {
    size: 'XXL',
    weightRangeAr: '105 - 125 كجم',
    weightRangeEn: '105 - 125 KG',
    heightRange: '180+ سم',
    chestCm: 142,
    lengthCm: 76,
    fitDescAr: 'مناسب لوزن 105 إلى 125 كجم (أقصى اتساع بوكسي ثقيل)',
    fitDescEn: 'Recommended for 105-125 KG (maximum heavyweight room)',
    minKg: 105,
    maxKg: 125,
  },
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [product, setProduct] = useState<Product | null>(() => {
    return (
      currentProducts.find((p) => p.id === productId) ||
      mockProducts.find((p) => p.id === productId) ||
      null
    );
  });
  const [loading, setLoading] = useState(!product);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          const found = data.products.find((p: any) => p.id === productId);
          if (found) {
            setProduct(found);
          }
        }
      })
      .catch((err) => console.warn('Failed to load product detail:', err))
      .finally(() => setLoading(false));
  }, [productId]);

  const { language, t, formatPrice, isRtl } = useLanguage();
  const isAr = language === 'ar';
  const { addItem } = useCart();
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black text-brand-ivory flex flex-col justify-between">
        <Header />
        <div className="max-w-2xl mx-auto text-center py-32 px-4">
          <Flame className="w-12 h-12 text-brand-gold mx-auto mb-4 animate-pulse" />
          <p className="text-xs font-mono text-brand-cream/60">
            {language === 'ar' ? 'جاري تحميل تفاصيل القطعة...' : 'Loading piece details...'}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-black text-brand-ivory flex flex-col justify-between">
        <Header />
        <div className="max-w-2xl mx-auto text-center py-32 px-4">
          <Flame className="w-12 h-12 text-brand-gold mx-auto mb-4" />
          <h1 className="font-sans font-black text-3xl uppercase mb-3">
            {language === 'ar' ? 'القطعة غير متوفرة' : 'Piece Not Found'}
          </h1>
          <p className="text-sm text-brand-cream/70 mb-8 font-light">
            {language === 'ar'
              ? 'القطعة المطلوبة غير موجودة في كتالوج أثير الحالي أو تم نقلها.'
              : 'The requested piece was not found in the current ATHEER launch catalog.'}
          </p>
          <Link
            href="/"
            className="px-8 py-3.5 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-widest hover:bg-brand-gold-hover transition-colors font-mono"
          >
            {language === 'ar' ? 'العودة للمتجر' : 'Return to Storefront'}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Gallery & Variant State
  const router = useRouter();
  const rawGallery = [
    product.image,
    product.hoverImage,
    ...(product.gallery || []),
  ].filter(Boolean);
  // Ensure unique list
  const galleryImages = Array.from(new Set(rawGallery));
  const [selectedImage, setSelectedImage] = useState(galleryImages[0] || product.image);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Onyx');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'L');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Multi-Factor Size Recommendation (Weight, Height, Fit Preference)
  const [userWeightKg, setUserWeightKg] = useState<string>('');
  const [userHeightCm, setUserHeightCm] = useState<string>('');
  const [fitPreference, setFitPreference] = useState<'regular' | 'oversized' | 'ultra_boxy'>('oversized');

  const title = language === 'ar' ? product.nameAr : product.nameEn;
  const categoryLabel = language === 'ar' ? product.categoryLabelAr : product.categoryLabelEn;
  const description = language === 'ar' ? product.descriptionAr : product.descriptionEn;
  const fabric = language === 'ar' ? product.fabricAr : product.fabricEn;
  const fit = language === 'ar' ? product.fitAr : product.fitEn;

  const selectedSpec = SIZE_WEIGHT_SPECS[selectedSize.toUpperCase()];
  const availableStock = product.inventory ?? 50;
  const isOutOfStock = availableStock <= 0 && !product.isComingSoon;

  const handleComputeRecommendation = (weightVal: string, heightVal: string, fitPref: 'regular' | 'oversized' | 'ultra_boxy') => {
    const kg = parseFloat(weightVal);
    if (isNaN(kg) || kg <= 0) return;

    let baseIdx = 0; // S
    if (kg < 65) baseIdx = 0;
    else if (kg < 78) baseIdx = 1;
    else if (kg < 92) baseIdx = 2;
    else if (kg < 105) baseIdx = 3;
    else baseIdx = 4; // 2XL / XXL

    const cm = parseFloat(heightVal);
    if (!isNaN(cm) && cm > 0) {
      if (cm >= 186 && baseIdx < 4) baseIdx += 1;
      else if (cm <= 165 && baseIdx > 0) baseIdx -= 1;
    }

    if (fitPref === 'regular' && baseIdx > 0) {
      baseIdx -= 1;
    } else if (fitPref === 'ultra_boxy' && baseIdx < 4) {
      baseIdx += 1;
    }

    const standardSizes = ['S', 'M', 'L', 'XL', '2XL'];
    const targetSize = standardSizes[Math.min(baseIdx, standardSizes.length - 1)];

    if (product.sizes.includes(targetSize)) {
      setSelectedSize(targetSize);
    } else if (targetSize === '2XL' && product.sizes.includes('XXL')) {
      setSelectedSize('XXL');
    } else if (product.sizes.length > 0) {
      // Find closest
      const match = product.sizes.find((s) => s.toUpperCase() === targetSize);
      if (match) setSelectedSize(match);
      else setSelectedSize(product.sizes[0]);
    }
  };

  const handleWeightChange = (val: string) => {
    setUserWeightKg(val);
    handleComputeRecommendation(val, userHeightCm, fitPreference);
  };

  const handleHeightChange = (val: string) => {
    setUserHeightCm(val);
    handleComputeRecommendation(userWeightKg, val, fitPreference);
  };

  const handleFitPrefChange = (pref: 'regular' | 'oversized' | 'ultra_boxy') => {
    setFitPreference(pref);
    handleComputeRecommendation(userWeightKg, userHeightCm, pref);
  };

  const handleAddToCart = () => {
    if (product.isComingSoon) {
      alert(
        language === 'ar'
          ? 'هذه القطعة ضمن الإصدار القادم في مصر. انضم لقائمة الإطلاق لتصلك دعوة الشراء فور طرحها!'
          : 'This item is part of our upcoming drop. Join the Drop List to get notified on release!'
      );
      return;
    }
    if (isOutOfStock) {
      alert(
        language === 'ar'
          ? 'عذراً، هذا المقاس غير متوفر حالياً بالمخزن.'
          : 'Sorry, this size is currently out of stock.'
      );
      return;
    }
    addItem(product, quantity, selectedSize, selectedColor);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.isComingSoon) {
      alert(
        language === 'ar'
          ? 'هذه القطعة ضمن الإصدار القادم في مصر. انضم لقائمة الإطلاق لتصلك دعوة الشراء فور طرحها!'
          : 'This item is part of our upcoming drop. Join the Drop List to get notified on release!'
      );
      return;
    }
    if (isOutOfStock) {
      alert(
        language === 'ar'
          ? 'عذراً، هذا المقاس غير متوفر حالياً بالمخزن.'
          : 'Sorry, this size is currently out of stock.'
      );
      return;
    }
    addItem(product, quantity, selectedSize, selectedColor);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full pb-28 sm:pb-14">
        {/* Top Navigation Bar with Prominent Back Button & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-brand-border/60">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <BackButton
              label={language === 'ar' ? 'رجوع للخطوة السابقة' : 'Back to previous'}
              fallbackUrl="/#products"
            />
          </div>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-brand-cream/60 font-mono overflow-x-auto py-1">
            <Link href="/" className="hover:text-brand-gold transition-colors shrink-0">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <ArrowIcon className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <Link href="/#products" className="hover:text-brand-gold transition-colors shrink-0">
              {categoryLabel}
            </Link>
            <ArrowIcon className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <span className="text-brand-gold font-bold truncate max-w-xs">{title}</span>
          </nav>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left: Gallery Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail Strip */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(img);
                    setImageLoading(true);
                  }}
                  className={`relative w-20 h-24 sm:w-24 sm:h-32 border overflow-hidden flex-shrink-0 transition-all rounded-xs ${
                    selectedImage === img
                      ? 'border-brand-gold ring-2 ring-brand-gold/80 shadow-gold'
                      : 'border-brand-border/60 opacity-60 hover:opacity-100 hover:border-brand-gold/50'
                  }`}
                  aria-label={`View angle ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`${title} - angle ${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute bottom-1 right-1 rtl:right-auto rtl:left-1 bg-brand-black/80 text-[9px] font-mono text-brand-gold px-1 rounded-xs">
                    {idx === 0 ? (isAr ? 'أمامي' : 'Front') : idx === 1 ? (isAr ? 'خلفي' : 'Back') : (isAr ? 'تفاصيل' : 'Detail')}
                  </span>
                </button>
              ))}
            </div>

            {/* Main Stage View with Click-to-Zoom */}
            <div
              onClick={() => setZoomModalOpen(true)}
              className="flex-1 relative aspect-[3/4] bg-brand-charcoal border border-brand-border/70 overflow-hidden shadow-2xl rounded-xs group cursor-zoom-in"
              title={isAr ? 'اضغط لتكبير وفحص الخامة والتفاصيل' : 'Click to inspect fabric & high-res details'}
            >
              {/* Image Loading Skeleton */}
              {imageLoading && (
                <div className="absolute inset-0 bg-brand-stone/40 animate-pulse flex items-center justify-center z-0">
                  <Flame className="w-8 h-8 text-brand-gold/40 animate-bounce" />
                </div>
              )}

              <img
                src={selectedImage}
                alt={title}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
                className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              />

              {/* GSM Badge */}
              <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 flex flex-col space-y-1.5 font-mono pointer-events-none">
                <span className="bg-brand-black/90 backdrop-blur-md text-brand-gold border border-brand-gold/60 text-xs font-bold px-3 py-1 shadow">
                  {product.gsm} GSM
                </span>
                <span className="bg-brand-charcoal/95 backdrop-blur-md text-brand-ivory text-[10px] px-2.5 py-0.5 border border-brand-border shadow">
                  {fit}
                </span>
              </div>

              {/* Zoom Indicator Button */}
              <div className="absolute bottom-4 right-4 rtl:right-auto rtl:left-4 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 bg-brand-black/85 backdrop-blur-md border border-brand-gold/60 text-brand-gold text-xs font-mono rounded-xs shadow-gold">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isAr ? 'فحص التفاصيل والأنسجة' : 'Zoom Fabric'}</span>
                </span>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
                className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 w-10 h-10 rounded-full bg-brand-black/80 backdrop-blur-md border border-brand-border flex items-center justify-center text-brand-ivory hover:text-brand-gold transition-colors shadow"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? 'fill-brand-gold text-brand-gold' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Right: Technical Specs & Action Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Category & Badge */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs uppercase tracking-widest text-brand-gold mb-2 font-mono">
                <span>{categoryLabel}</span>
                {product.badgeEn && (
                  <>
                    <span>•</span>
                    <span className="text-brand-ivory/80">
                      {language === 'ar' ? product.badgeAr : product.badgeEn}
                    </span>
                  </>
                )}
              </div>

              {/* Product Title */}
              <h1 className="font-sans font-black text-3xl sm:text-4xl text-brand-ivory uppercase tracking-tight leading-tight mb-4">
                {title}
              </h1>

              {/* Price & Stock */}
              <div className="flex items-baseline space-x-3 rtl:space-x-reverse mb-6">
                <span className="font-mono text-3xl font-bold text-brand-gold">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-brand-muted line-through font-mono">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-mono font-medium ml-2 rtl:mr-2 rtl:ml-0">
                  {product.isComingSoon
                    ? language === 'ar' ? 'إصدار قادم' : 'Upcoming Drop'
                    : language === 'ar' ? 'متوفر للشحن في مصر' : 'In Stock (Egypt)'}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-brand-cream/85 font-sans leading-relaxed mb-6 font-light">
                {description}
              </p>

              {/* Technical Streetwear Matrix */}
              <div className="p-4 bg-brand-charcoal/80 border border-brand-border mb-6 text-xs text-brand-ivory/90 space-y-2.5 font-sans">
                <div className="flex justify-between border-b border-brand-border/40 pb-2">
                  <span className="text-brand-cream/60">{language === 'ar' ? 'مواصفات الوزن والكثافة:' : 'Density & Weight Spec:'}</span>
                  <span className="text-brand-gold font-mono font-bold">
                    {product.gsm} GSM {language === 'ar' ? '(مواصفة مستهدفة)' : '(Target Spec)'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 pb-2">
                  <span className="text-brand-cream/60">{language === 'ar' ? 'تركيبة النسيج:' : 'Composition:'}</span>
                  <span className="text-brand-ivory font-medium">{fabric}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-cream/60">{language === 'ar' ? 'هندسة القصّة:' : 'Silhouette Architecture:'}</span>
                  <span className="text-brand-ivory font-medium">{fit}</span>
                </div>
              </div>

              {/* Colorway Selection */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-brand-cream/80 uppercase tracking-wider font-mono mb-2.5">
                    <span>{language === 'ar' ? 'اللون المحدد' : 'Colorway'}</span>
                    <span className="text-brand-gold font-semibold">{selectedColor}</span>
                  </div>
                  <div className="flex gap-2">
                    {product.colors.map((c: string) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-4 py-2 text-xs font-mono border transition-all ${
                          selectedColor === c
                            ? 'border-brand-gold text-brand-gold bg-brand-gold/15 font-bold'
                            : 'border-brand-border text-brand-ivory/70 hover:border-brand-gold/60'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs text-brand-cream/80 uppercase tracking-wider font-mono mb-2.5">
                  <span>{language === 'ar' ? 'اختر المقاس' : 'Select Size'}</span>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-brand-gold flex items-center hover:underline"
                  >
                    <Ruler className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 inline" />
                    {language === 'ar' ? 'جدول المقاسات البوكسي' : 'Size & Fit Chart'}
                  </button>
                </div>

                {/* Weight-Based Sizing Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {product.sizes.map((s: string) => {
                    const spec = SIZE_WEIGHT_SPECS[s.toUpperCase()] || {
                      weightRangeAr: 'وزن قياسي',
                      weightRangeEn: 'Standard',
                      fitDescAr: 'قصة بوكسي مريحة',
                      fitDescEn: 'Boxy comfortable fit',
                    };
                    const isSelected = selectedSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`p-2.5 sm:p-3 text-center border rounded-xs transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-brand-gold bg-brand-gold/15 text-brand-gold shadow-gold ring-1 ring-brand-gold'
                            : 'border-brand-border bg-brand-charcoal/60 text-brand-ivory/80 hover:border-brand-gold/60'
                        }`}
                      >
                        <span className="font-mono text-base sm:text-lg font-black tracking-wider block">
                          {s}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-mono font-bold mt-1 text-brand-cream/80 block">
                          {isAr ? spec.weightRangeAr : spec.weightRangeEn}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Size Fit Description */}
                {selectedSpec && (
                  <div className="mt-3 p-3 bg-brand-charcoal border border-brand-gold/50 rounded-xs flex items-center justify-between text-xs font-mono animate-fade-in">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Scale className="w-4 h-4 text-brand-gold flex-shrink-0" />
                      <div>
                        <span className="font-bold text-brand-ivory ml-1 rtl:mr-1">
                          {isAr ? `المقاس المختار (${selectedSize}):` : `Selected Size (${selectedSize}):`}
                        </span>
                        <span className="text-brand-cream/90 font-sans">
                          {isAr ? selectedSpec.fitDescAr : selectedSpec.fitDescEn}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multi-Factor Size Recommendation Engine (Weight, Height & Fit Preference) */}
                <div className="mt-3 p-3.5 bg-brand-stone/30 border border-brand-border/80 rounded-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-cream/90 font-mono font-bold">
                      <Scale className="w-4 h-4 text-brand-gold flex-shrink-0" />
                      <span>{isAr ? 'مستشار المقاس والقصّة الذكي:' : 'Smart Fit & Size Advisor:'}</span>
                    </div>
                    <span className="text-[10px] text-brand-gold/80 font-mono">
                      {isAr ? 'حساب مبني على الأبعاد والتفضيل' : 'Multi-factor Fit Algorithm'}
                    </span>
                  </div>

                  {/* Inputs: Weight & Height */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-brand-cream/60 font-mono mb-1">
                        {isAr ? 'الوزن (كجم):' : 'Weight (KG):'}
                      </label>
                      <input
                        type="number"
                        min="40"
                        max="150"
                        value={userWeightKg}
                        onChange={(e) => handleWeightChange(e.target.value)}
                        placeholder={isAr ? 'مثال: 80 كجم' : 'e.g. 80 KG'}
                        className="w-full bg-brand-charcoal border border-brand-border px-3 py-1.5 text-brand-gold font-mono font-bold text-xs rounded-xs focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-brand-cream/60 font-mono mb-1">
                        {isAr ? 'الطول (سم):' : 'Height (CM):'}
                      </label>
                      <input
                        type="number"
                        min="140"
                        max="220"
                        value={userHeightCm}
                        onChange={(e) => handleHeightChange(e.target.value)}
                        placeholder={isAr ? 'مثال: 178 سم' : 'e.g. 178 CM'}
                        className="w-full bg-brand-charcoal border border-brand-border px-3 py-1.5 text-brand-gold font-mono font-bold text-xs rounded-xs focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fit Preference Buttons */}
                  <div>
                    <label className="block text-[10px] text-brand-cream/60 font-mono mb-1.5">
                      {isAr ? 'ستايل القصّة المفضل لديك:' : 'Preferred Fit Style:'}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleFitPrefChange('regular')}
                        className={`py-1.5 px-2 rounded-xs border transition-colors ${
                          fitPreference === 'regular'
                            ? 'bg-brand-gold/20 border-brand-gold text-brand-gold font-bold'
                            : 'bg-brand-charcoal/80 border-brand-border/60 text-brand-cream/70 hover:border-brand-gold/40'
                        }`}
                      >
                        {isAr ? 'مضبوط / كلاسيك' : 'Regular Fitted'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFitPrefChange('oversized')}
                        className={`py-1.5 px-2 rounded-xs border transition-colors ${
                          fitPreference === 'oversized'
                            ? 'bg-brand-gold/20 border-brand-gold text-brand-gold font-bold'
                            : 'bg-brand-charcoal/80 border-brand-border/60 text-brand-cream/70 hover:border-brand-gold/40'
                        }`}
                      >
                        {isAr ? 'بوكسي معتمد' : 'Boxy Oversized'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFitPrefChange('ultra_boxy')}
                        className={`py-1.5 px-2 rounded-xs border transition-colors ${
                          fitPreference === 'ultra_boxy'
                            ? 'bg-brand-gold/20 border-brand-gold text-brand-gold font-bold'
                            : 'bg-brand-charcoal/80 border-brand-border/60 text-brand-cream/70 hover:border-brand-gold/40'
                        }`}
                      >
                        {isAr ? 'واسع جداً ستريت' : 'Ultra Baggy'}
                      </button>
                    </div>
                  </div>

                  {/* Explanation & Result */}
                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-brand-border/40 text-[11px]">
                    <p className="text-brand-cream/60 leading-relaxed font-sans">
                      {isAr
                        ? 'تعتمد التوصية على قياسات الصدر والأكتاف وطريقة ارتدائك للقطعة، وليس الوزن المجرد فقط.'
                        : 'Fit is calibrated by shoulder drape, chest width, and your preferred silhouette, not solely body weight.'}
                    </p>
                    {userWeightKg && (
                      <span className="text-emerald-400 font-mono font-bold whitespace-nowrap shrink-0">
                        ✓ {isAr ? `المقاس المقترح: ${selectedSize}` : `Recommended: ${selectedSize}`}
                      </span>
                    )}
                  </div>
                </div>

                {showSizeGuide && (
                  <div className="mt-4 p-4 bg-brand-charcoal border border-brand-gold/60 text-xs font-mono text-brand-cream/80 animate-slide-down space-y-3 rounded-xs shadow-luxury-dark">
                    <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                      <p className="font-bold text-brand-gold uppercase flex items-center space-x-2 rtl:space-x-reverse">
                        <Ruler className="w-4 h-4" />
                        <span>{isAr ? 'جدول القياسات بالأوزان الحقيقية' : 'Real Weight-Based Size Chart'}</span>
                      </p>
                      <span className="text-[10px] text-brand-cream/60">
                        {isAr ? 'قصة بوكسي أوفر سايز' : 'Boxy Silhouette'}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-[11px]">
                        <thead>
                          <tr className="text-brand-gold border-b border-brand-border/40 font-bold">
                            <th className="py-1.5 px-2">{isAr ? 'المقاس' : 'Size'}</th>
                            <th className="py-1.5 px-2">{isAr ? 'الوزن الموصى به' : 'Weight Range'}</th>
                            <th className="py-1.5 px-2">{isAr ? 'الطول التقريبي' : 'Height'}</th>
                            <th className="py-1.5 px-2">{isAr ? 'الصدر (سم)' : 'Chest (CM)'}</th>
                            <th className="py-1.5 px-2">{isAr ? 'الطول (سم)' : 'Length (CM)'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/30">
                          {Object.values(SIZE_WEIGHT_SPECS).map((spec) => (
                            <tr
                              key={spec.size}
                              className={`hover:bg-brand-stone/40 ${selectedSize === spec.size ? 'bg-brand-gold/15 text-brand-gold font-bold' : ''}`}
                            >
                              <td className="py-2 px-2 font-mono font-bold text-brand-ivory">{spec.size}</td>
                              <td className="py-2 px-2">{isAr ? spec.weightRangeAr : spec.weightRangeEn}</td>
                              <td className="py-2 px-2 text-brand-cream/70">{spec.heightRange}</td>
                              <td className="py-2 px-2 font-mono">{spec.chestCm} سم</td>
                              <td className="py-2 px-2 font-mono">{spec.lengthCm} سم</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Inventory Stock Status & Warning */}
              {isOutOfStock ? (
                <div className="p-4 bg-red-950/40 border border-red-500/60 rounded-xs mb-6 flex items-center space-x-3 rtl:space-x-reverse text-red-200 text-xs font-mono">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <span className="font-bold block">
                      {isAr ? 'نفد المخزون مؤقتاً لهذا المقاس' : 'Temporarily Out of Stock'}
                    </span>
                    <span className="text-[11px] text-red-300/80 font-sans">
                      {isAr ? 'جاري تجهيز دفعة جديدة في مصانعنا بالقاهرة. يمكنك اختيار مقاس آخر أو التواصل مع الكونسيرج.' : 'Restocking soon. Select another size or contact our WhatsApp concierge.'}
                    </span>
                  </div>
                </div>
              ) : availableStock <= 10 && !product.isComingSoon ? (
                <div className="mb-4 inline-flex items-center space-x-2 rtl:space-x-reverse px-2.5 py-1 bg-amber-950/40 border border-amber-500/50 rounded-xs text-[11px] font-mono text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>
                    {isAr ? `متبقي بالمخزن ${availableStock} قطع فقط — سارع بالطلب` : `Only ${availableStock} pieces remaining in stock`}
                  </span>
                </div>
              ) : null}

              {/* Action Buttons: 1-Click Fast Buy Now + Add to Bag */}
              <div className="space-y-3 mb-8">
                {/* Primary Hero CTA: Express Direct Checkout */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.isComingSoon || isOutOfStock}
                  className="w-full h-14 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs sm:text-sm font-sans font-black uppercase tracking-[0.16em] rounded-xs shadow-gold transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 fill-brand-black text-brand-black" />
                  <span>
                    {isOutOfStock
                      ? (isAr ? 'غير متوفر حالياً' : 'Out of Stock')
                      : language === 'ar'
                      ? 'شراء فوري الآن (الدفع عند الاستلام)'
                      : 'Buy Now — Express Checkout (COD)'}
                  </span>
                </button>

                {/* Secondary Row: Quantity + Add to Bag for multiple purchases */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-brand-border bg-brand-charcoal h-12 px-3 rounded-xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock}
                      className="text-brand-ivory/70 hover:text-brand-gold px-2 font-mono text-base disabled:opacity-30"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 font-mono font-bold text-sm text-brand-ivory">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(availableStock || 1, quantity + 1))}
                      disabled={isOutOfStock || quantity >= availableStock}
                      className="text-brand-ivory/70 hover:text-brand-gold px-2 font-mono text-base disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.isComingSoon || isOutOfStock}
                    className={`flex-1 h-12 border border-brand-gold/70 hover:border-brand-gold bg-brand-charcoal hover:bg-brand-stone/40 text-brand-gold text-xs uppercase tracking-wider font-mono font-bold transition-all rounded-xs flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-40 ${
                      addedSuccess ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' : ''
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>{language === 'ar' ? 'تمت الإضافة للحقيبة ✓' : 'Added to Bag ✓'}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{language === 'ar' ? 'أضف للسلة (لشراء أكثر من قطعة)' : 'Add to Bag (Shop More)'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Trust & Guarantee Badges for Egypt */}
              <div className="pt-6 border-t border-brand-border/40 grid grid-cols-2 gap-4 text-xs text-brand-cream/70 font-sans">
                <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                  <Truck className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span>
                    {language === 'ar' ? 'توصيل سريع ودفع عند الاستلام في مصر' : 'Fast Delivery & Cash on Delivery'}
                  </span>
                </div>
                <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                  <RotateCcw className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span>
                    {language === 'ar' ? 'معاينة واستبدال المقاس عند الاستلام' : 'Inspection & 7-Day Size Exchange'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Quick Buy Bar (One-Hand Ergonomic Checkout on All Mobile Phones) */}
        <div
          className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-brand-black/95 backdrop-blur-xl border-t border-brand-gold/40 px-3 py-2.5 shadow-2xl flex items-center justify-between gap-2.5 select-none animate-slide-up-sheet"
          style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0.6rem))' }}
        >
          <div className="flex flex-col min-w-0">
            <div className="text-[10px] text-brand-cream/70 font-mono flex items-center space-x-1 rtl:space-x-reverse truncate">
              <span className="font-bold text-brand-gold bg-brand-gold/15 px-1.5 py-0.5 rounded-xs border border-brand-gold/40">{selectedSize}</span>
              <span className="truncate">{isAr ? (SIZE_WEIGHT_SPECS[selectedSize.toUpperCase()]?.weightRangeAr || '') : (SIZE_WEIGHT_SPECS[selectedSize.toUpperCase()]?.weightRangeEn || '')}</span>
            </div>
            <div className="font-mono text-base font-black text-brand-gold mt-0.5">
              {formatPrice(product.price)}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`p-2.5 rounded-xs border transition-all flex items-center justify-center active:scale-95 ${
                addedSuccess
                  ? 'bg-emerald-900 border-emerald-500 text-white'
                  : 'bg-brand-charcoal border-brand-border text-brand-gold hover:border-brand-gold'
              }`}
              aria-label="Add to bag"
              title={isAr ? 'أضف للسلة' : 'Add to bag'}
            >
              {addedSuccess ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={product.isComingSoon}
              className="py-2.5 px-3.5 bg-brand-gold active:bg-brand-gold-hover text-brand-black text-xs font-bold uppercase tracking-wider rounded-xs shadow-gold flex items-center justify-center space-x-1 rtl:space-x-reverse font-sans active:scale-95 transition-transform disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-brand-black text-brand-black" />
              <span className="whitespace-nowrap">{isAr ? 'شراء فوري ⚡' : 'Buy Now ⚡'}</span>
            </button>
          </div>
        </div>
        {/* High-Resolution Zoom Lightbox Modal */}
        {zoomModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fade-in"
            onClick={() => setZoomModalOpen(false)}
          >
            {/* Top Bar: Title & Close */}
            <div
              className="w-full max-w-5xl flex items-center justify-between text-brand-ivory pb-4 border-b border-brand-border/40"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse font-mono text-xs">
                <span className="text-brand-gold font-bold">{title}</span>
                <span className="text-brand-cream/40">•</span>
                <span className="text-brand-cream/70">
                  {isAr ? 'معاينة النسيج والتطريز بدقة فائقة' : 'High-Res Fabric & Stitching Inspection'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setZoomModalOpen(false)}
                className="w-10 h-10 rounded-full bg-brand-charcoal border border-brand-gold/60 text-brand-gold hover:text-brand-ivory hover:bg-brand-gold/20 flex items-center justify-center transition-colors"
                aria-label="Close Zoom"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage: Big Image with Carousel Navigation */}
            <div
              className="relative flex-1 w-full max-w-4xl flex items-center justify-center my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt={`${title} zoomed view`}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xs shadow-2xl transition-all"
              />

              {/* Prev / Next buttons if multiple images */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const curIdx = galleryImages.indexOf(selectedImage);
                      const prevIdx = (curIdx - 1 + galleryImages.length) % galleryImages.length;
                      setSelectedImage(galleryImages[prevIdx]);
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 border border-brand-gold/60 text-brand-gold hover:bg-brand-gold hover:text-black flex items-center justify-center transition-all shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const curIdx = galleryImages.indexOf(selectedImage);
                      const nextIdx = (curIdx + 1) % galleryImages.length;
                      setSelectedImage(galleryImages[nextIdx]);
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 border border-brand-gold/60 text-brand-gold hover:bg-brand-gold hover:text-black flex items-center justify-center transition-all shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnail Selector in Modal */}
            <div
              className="w-full max-w-md flex items-center justify-center gap-3 py-2"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-14 h-16 rounded-xs overflow-hidden border transition-all ${
                    selectedImage === img
                      ? 'border-brand-gold ring-2 ring-brand-gold shadow-gold'
                      : 'border-brand-border/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
      <WhatsAppButton />

      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: language === 'ar' ? product.nameAr : product.nameEn,
              description: language === 'ar' ? product.descriptionAr : product.descriptionEn,
              image: [product.image, product.hoverImage].filter(Boolean),
              sku: product.sku || product.id,
              brand: {
                '@type': 'Brand',
                name: 'ATHEER | أثير',
              },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'EGP',
                price: product.price,
                availability: 'https://schema.org/InStock',
                itemCondition: 'https://schema.org/NewCondition',
              },
            }),
          }}
        />
      )}
    </div>
  );
}
