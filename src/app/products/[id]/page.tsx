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
  const galleryImages = [product.image, product.hoverImage];
  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Onyx');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'L');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [userWeightKg, setUserWeightKg] = useState<string>('');

  const title = language === 'ar' ? product.nameAr : product.nameEn;
  const categoryLabel = language === 'ar' ? product.categoryLabelAr : product.categoryLabelEn;
  const description = language === 'ar' ? product.descriptionAr : product.descriptionEn;
  const fabric = language === 'ar' ? product.fabricAr : product.fabricEn;
  const fit = language === 'ar' ? product.fitAr : product.fitEn;

  const selectedSpec = SIZE_WEIGHT_SPECS[selectedSize.toUpperCase()];

  const handleWeightChange = (val: string) => {
    setUserWeightKg(val);
    const kg = parseFloat(val);
    if (!isNaN(kg)) {
      if (kg < 65) setSelectedSize('S');
      else if (kg < 78) setSelectedSize('M');
      else if (kg < 92) setSelectedSize('L');
      else if (kg < 105) setSelectedSize('XL');
      else setSelectedSize(product.sizes.includes('2XL') ? '2XL' : 'XL');
    }
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
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-24 sm:w-24 sm:h-32 border overflow-hidden flex-shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-brand-gold ring-1 ring-brand-gold shadow-gold'
                      : 'border-brand-border/60 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`View angle ${idx + 1}`}
                >
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${img}')` }}
                  />
                </button>
              ))}
            </div>

            {/* Main Stage View */}
            <div className="flex-1 relative aspect-[3/4] bg-brand-charcoal border border-brand-border/70 overflow-hidden shadow-2xl">
              <div
                className="w-full h-full bg-cover bg-center transition-all duration-500 ease-out"
                style={{ backgroundImage: `url('${selectedImage}')` }}
              />

              {/* GSM Badge */}
              <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 flex flex-col space-y-1.5 font-mono">
                <span className="bg-brand-black/90 backdrop-blur-md text-brand-gold border border-brand-gold/60 text-xs font-bold px-3 py-1">
                  {product.gsm} GSM
                </span>
                <span className="bg-brand-charcoal/95 backdrop-blur-md text-brand-ivory text-[10px] px-2.5 py-0.5 border border-brand-border">
                  {fit}
                </span>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 w-10 h-10 rounded-full bg-brand-black/80 backdrop-blur-md border border-brand-border flex items-center justify-center text-brand-ivory hover:text-brand-gold transition-colors"
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

                {/* Weight-to-Size Calculator */}
                <div className="mt-3 p-3 bg-brand-stone/30 border border-brand-border/80 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-cream/80 font-mono">
                    <Scale className="w-4 h-4 text-brand-gold flex-shrink-0" />
                    <span>{isAr ? 'محتار في المقاس؟ اكتب وزنك بالكيلو:' : 'Unsure? Type your weight (KG):'}</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input
                      type="number"
                      min="40"
                      max="150"
                      value={userWeightKg}
                      onChange={(e) => handleWeightChange(e.target.value)}
                      placeholder={isAr ? 'مثال: 80 كجم' : 'e.g. 80 KG'}
                      className="w-28 bg-brand-charcoal border border-brand-border px-3 py-1.5 text-brand-gold font-mono font-bold text-xs rounded-xs focus:border-brand-gold focus:outline-none"
                    />
                    {userWeightKg && (
                      <span className="text-[11px] font-mono text-emerald-400 font-bold whitespace-nowrap">
                        ← {isAr ? `مقاسك: ${selectedSize}` : `Your size: ${selectedSize}`}
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

              {/* Action Buttons: 1-Click Fast Buy Now + Add to Bag */}
              <div className="space-y-3 mb-8">
                {/* Primary Hero CTA: Express Direct Checkout */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.isComingSoon}
                  className="w-full h-14 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs sm:text-sm font-sans font-black uppercase tracking-[0.16em] rounded-xs shadow-gold transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 fill-brand-black text-brand-black" />
                  <span>
                    {language === 'ar'
                      ? 'شراء فوري الآن (الدفع عند الاستلام)'
                      : 'Buy Now — Express Checkout (COD)'}
                  </span>
                </button>

                {/* Secondary Row: Quantity + Add to Bag for multiple purchases */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-brand-border bg-brand-charcoal h-12 px-3 rounded-xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-brand-ivory/70 hover:text-brand-gold px-2 font-mono text-base"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 font-mono font-bold text-sm text-brand-ivory">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-brand-ivory/70 hover:text-brand-gold px-2 font-mono text-base"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`flex-1 h-12 border border-brand-gold/70 hover:border-brand-gold bg-brand-charcoal hover:bg-brand-stone/40 text-brand-gold text-xs uppercase tracking-wider font-mono font-bold transition-all rounded-xs flex items-center justify-center space-x-2 rtl:space-x-reverse ${
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
