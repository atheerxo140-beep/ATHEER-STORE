'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockProducts';
import { ProductCard } from '@/components/ProductCard';
import { useLanguage } from '@/context/LanguageContext';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { useCart } from '@/context/CartContext';
import { X, Flame, Check, ShoppingBag, ShieldCheck, Ruler, ArrowRight, ArrowLeft, Clock } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { t, language, formatPrice, isRtl } = useLanguage();
  const { content } = useHomepageContent();
  const { addItem } = useCart();

  if (content.showProducts === false) {
    return null;
  }
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalSize, setModalSize] = useState<string>('');
  const [modalColor, setModalColor] = useState<string>('');
  const [modalAdded, setModalAdded] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.warn('Failed to load live products:', err));
  }, []);

  const categories = [
    { id: 'all', label: t('filterAll') },
    { id: 'hoodies', label: t('filterHoodies'), isMain: true },
    { id: 'sweatshirts', label: t('filterSweatshirts'), isMain: false },
    { id: 'tshirts', label: t('filterTees'), isMain: false },
  ];

  const filteredProducts = products.filter((product) => {
    if (activeCategory === 'all') return true;
    return product.category === activeCategory;
  });

  const handleOpenQuickView = (product: Product) => {
    setSelectedProduct(product);
    setModalSize(product.sizes[0] || 'L');
    setModalColor(product.colors[0] || '');
    setModalAdded(false);
  };

  const handleModalAddToCart = () => {
    if (!selectedProduct) return;
    if (selectedProduct.isComingSoon) {
      alert(
        language === 'ar'
          ? 'تم تسجيل اهتمامك بتشكيلة التي شيرتات القادمة! سنرسل لك إشعاراً فور توفرها.'
          : 'Interest registered! You will receive drop notification as soon as the tees drop.'
      );
      setSelectedProduct(null);
      return;
    }
    addItem(selectedProduct, 1, modalSize, modalColor);
    setModalAdded(true);
    setTimeout(() => {
      setModalAdded(false);
      setSelectedProduct(null);
    }, 1200);
  };

  return (
    <section id="products" className="py-20 sm:py-28 bg-brand-black text-brand-ivory border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-brand-gold text-xs uppercase tracking-[0.25em] font-mono font-semibold mb-3">
            <Flame className="w-3.5 h-3.5" />
            <span>{t('productSectionBadge')}</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-brand-ivory uppercase tracking-tight">
            {t('productSectionTitle')}
          </h2>
          <div className="w-16 h-[2px] bg-brand-gold mx-auto my-6" />
          <p className="text-brand-cream/80 text-sm sm:text-base font-sans font-light leading-relaxed">
            {t('productSectionSubtitle')}
          </p>
        </div>

        {/* Filter Category Tabs (Highlighting Hoodies as core) */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 mb-14 border-b border-brand-border/40 pb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 text-xs uppercase tracking-widest transition-all duration-300 font-semibold font-mono ${
                activeCategory === cat.id
                  ? 'bg-brand-gold text-brand-black shadow-gold'
                  : 'text-brand-ivory/70 hover:text-brand-gold hover:bg-brand-charcoal/60 border border-brand-border/40'
              }`}
            >
              {cat.label}
              {cat.isMain && <span className="ml-1.5 rtl:mr-1.5 rtl:ml-0 text-[10px] opacity-80">★</span>}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={handleOpenQuickView}
            />
          ))}
        </div>
      </div>

      {/* Streetwear Quick Specs Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedProduct(null)}
          />

          <div className="relative w-full max-w-4xl bg-brand-charcoal border border-brand-gold/40 shadow-2xl z-10 overflow-hidden my-8">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 p-2 text-brand-ivory/80 hover:text-brand-gold transition-colors bg-brand-black/70 backdrop-blur-sm"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Gallery in Modal */}
              <div className="relative aspect-[3/4] md:aspect-auto h-72 md:h-full bg-brand-black">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${selectedProduct.image}')` }}
                />
              </div>

              {/* Product Specs */}
              <div className="p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-brand-gold border border-brand-gold/40 px-2 py-0.5 font-mono">
                      {selectedProduct.gsm} GSM
                    </span>
                    <span className="text-xs text-brand-cream/60 uppercase tracking-wider font-mono">
                      {language === 'ar' ? selectedProduct.fitAr : selectedProduct.fitEn}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-2xl sm:text-3xl text-brand-ivory mb-3">
                    {language === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn}
                  </h3>

                  <div className="font-mono text-2xl font-bold text-brand-gold mb-4">
                    {formatPrice(selectedProduct.price)}
                  </div>

                  <p className="text-sm text-brand-cream/85 font-sans leading-relaxed mb-6 font-light">
                    {language === 'ar' ? selectedProduct.descriptionAr : selectedProduct.descriptionEn}
                  </p>

                  {/* Fabric & Architecture Box */}
                  <div className="p-4 bg-brand-black border border-brand-border mb-6 text-xs text-brand-ivory/85 space-y-2">
                    <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                      <span className="text-brand-cream/60">{language === 'ar' ? 'القماش:' : 'Fabrication:'}</span>
                      <span className="text-brand-gold font-medium">
                        {language === 'ar' ? selectedProduct.fabricAr : selectedProduct.fabricEn}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                      <span className="text-brand-cream/60">{language === 'ar' ? 'القصّة:' : 'Silhouette:'}</span>
                      <span className="text-brand-ivory font-medium">
                        {language === 'ar' ? selectedProduct.fitAr : selectedProduct.fitEn}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-cream/60">{language === 'ar' ? 'نصيحة المقاس:' : 'Fit Guide:'}</span>
                      <span className="text-brand-ivory font-light">
                        {language === 'ar' ? 'اختر مقاسك المعتاد للحصول على مظهر بوكسي مثالي' : 'True to size for a boxy oversized drape'}
                      </span>
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs text-brand-ivory/80 uppercase tracking-wider mb-2 font-mono">
                      <span>{language === 'ar' ? 'اختر المقاس' : 'Select Size'}</span>
                      <span className="text-brand-gold text-[11px] flex items-center">
                        <Ruler className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0 inline" />
                        {language === 'ar' ? 'دليل مقاسات الستريتوير' : 'Streetwear Size Chart'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setModalSize(sz)}
                          className={`px-3.5 py-1.5 text-xs font-mono border uppercase tracking-wider transition-colors ${
                            modalSize === sz
                              ? 'border-brand-gold text-brand-gold bg-brand-gold/15 font-bold'
                              : 'border-brand-border text-brand-ivory/70 hover:border-brand-gold/60'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Display */}
                  {selectedProduct.colors.length > 0 && (
                    <div className="mb-6">
                      <div className="text-xs text-brand-ivory/80 uppercase tracking-wider mb-2 font-mono">
                        <span>{language === 'ar' ? 'الألوان' : 'Colorway'}</span>
                      </div>
                      <div className="flex gap-2">
                        {selectedProduct.colors.map((c) => (
                          <button
                            key={c}
                            onClick={() => setModalColor(c)}
                            className={`px-3 py-1 text-xs border font-mono transition-colors ${
                              modalColor === c
                                ? 'border-brand-gold text-brand-gold bg-brand-gold/15 font-semibold'
                                : 'border-brand-border text-brand-ivory/60'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Add to Bag or Drop Alert */}
                <button
                  onClick={handleModalAddToCart}
                  className={`w-full py-4 flex items-center justify-center space-x-2 rtl:space-x-reverse text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 ${
                    selectedProduct.isComingSoon
                      ? 'bg-brand-gold text-brand-black hover:bg-brand-gold-hover shadow-gold'
                      : modalAdded
                      ? 'bg-emerald-800 text-white'
                      : 'bg-brand-gold text-brand-black hover:bg-brand-gold-hover shadow-gold'
                  }`}
                >
                  {selectedProduct.isComingSoon ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تفعيل إشعار الإطلاق' : 'Notify Me on Release'}</span>
                    </>
                  ) : modalAdded ? (
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
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
