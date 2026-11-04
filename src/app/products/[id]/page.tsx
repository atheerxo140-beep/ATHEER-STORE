'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockProducts, currentProducts } from '@/data/mockProducts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const product =
    currentProducts.find((p) => p.id === productId) ||
    mockProducts.find((p) => p.id === productId);

  const { language, t, formatPrice, isRtl } = useLanguage();
  const { addItem } = useCart();
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

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
  const galleryImages = [product.image, product.hoverImage];
  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Onyx');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'L');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const title = language === 'ar' ? product.nameAr : product.nameEn;
  const categoryLabel = language === 'ar' ? product.categoryLabelAr : product.categoryLabelEn;
  const description = language === 'ar' ? product.descriptionAr : product.descriptionEn;
  const fabric = language === 'ar' ? product.fabricAr : product.fabricEn;
  const fit = language === 'ar' ? product.fitAr : product.fitEn;

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

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-brand-cream/60 mb-8 font-mono">
          <Link href="/" className="hover:text-brand-gold transition-colors">
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ArrowIcon className="w-3.5 h-3.5 opacity-40" />
          <Link href="/#products" className="hover:text-brand-gold transition-colors">
            {categoryLabel}
          </Link>
          <ArrowIcon className="w-3.5 h-3.5 opacity-40" />
          <span className="text-brand-gold font-medium truncate max-w-xs">{title}</span>
        </nav>

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
                    {product.colors.map((c) => (
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

                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`py-3 text-xs font-mono font-bold border uppercase transition-all ${
                        selectedSize === s
                          ? 'border-brand-gold text-brand-gold bg-brand-gold/20 shadow-gold'
                          : 'border-brand-border text-brand-ivory/70 hover:border-brand-gold/60'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {showSizeGuide && (
                  <div className="mt-3 p-4 bg-brand-charcoal border border-brand-border text-xs font-mono text-brand-cream/80 animate-slide-down space-y-2">
                    <p className="font-bold text-brand-gold uppercase">
                      {language === 'ar' ? 'دليل القياسات البوكسي (سم)' : 'Boxy Silhouette Specs (CM)'}
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-[11px] pt-1">
                      <div><span className="text-brand-muted">Size:</span> S (Chest 118, L 68)</div>
                      <div><span className="text-brand-muted">Size:</span> M (Chest 124, L 70)</div>
                      <div><span className="text-brand-muted">Size:</span> L (Chest 130, L 72)</div>
                      <div><span className="text-brand-muted">Size:</span> XL (Chest 136, L 74)</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity & Add to Bag */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border border-brand-border bg-brand-charcoal h-14 px-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-brand-ivory/70 hover:text-brand-gold px-2 font-mono text-lg"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 font-mono font-bold text-sm text-brand-ivory">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-brand-ivory/70 hover:text-brand-gold px-2 font-mono text-lg"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 h-14 flex items-center justify-center space-x-2 rtl:space-x-reverse text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 shadow-gold ${
                    product.isComingSoon
                      ? 'bg-brand-charcoal text-brand-gold border border-brand-gold'
                      : addedSuccess
                      ? 'bg-emerald-800 text-white'
                      : 'bg-brand-gold text-brand-black hover:bg-brand-gold-hover'
                  }`}
                >
                  {product.isComingSoon ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>{language === 'ar' ? 'إشعار عند الإطلاق' : 'Get Drop Notification'}</span>
                    </>
                  ) : addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{language === 'ar' ? 'تمت الإضافة للحقيبة بنجاح' : 'Added to Bag'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('addToBag')}</span>
                    </>
                  )}
                </button>
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
      </main>

      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
