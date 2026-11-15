'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockProducts';
import { ProductCard } from '@/components/ProductCard';
import { ProductBottomSheet } from '@/components/ProductBottomSheet';
import { useLanguage } from '@/context/LanguageContext';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { useCart } from '@/context/CartContext';
import { matchesProduct } from '@/lib/searchUtils';
import {
  X,
  Flame,
  Check,
  ShoppingBag,
  ShieldCheck,
  Ruler,
  ArrowRight,
  ArrowLeft,
  Clock,
  Search,
  RotateCcw,
} from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { t, language, formatPrice, isRtl } = useLanguage();
  const { content } = useHomepageContent();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalSize, setModalSize] = useState<string>('');
  const [modalColor, setModalColor] = useState<string>('');
  const [modalAdded, setModalAdded] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.warn('Failed to load live products:', err));

    const handleSearchEvent = (e: any) => {
      if (e && typeof e.detail === 'string') {
        setSearchQuery(e.detail);
        setActiveCategory('all');
      }
    };
    window.addEventListener('atheer:search', handleSearchEvent);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get('search');
      if (searchParam) {
        setSearchQuery(searchParam);
        setActiveCategory('all');
      }
    }

    return () => window.removeEventListener('atheer:search', handleSearchEvent);
  }, []);

  const categories = [
    { id: 'all', label: t('filterAll') },
    { id: 'hoodies', label: t('filterHoodies'), isMain: true },
    { id: 'sweatshirts', label: t('filterSweatshirts'), isMain: false },
    { id: 'tshirts', label: t('filterTees'), isMain: false },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCat = activeCategory === 'all' || product.category === activeCategory;
    const matchesQ = matchesProduct(product, searchQuery);
    return matchesCat && matchesQ;
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

  if (content.showProducts === false) {
    return null;
  }

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

        {/* Filter Category Tabs & Quick Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border-b border-brand-border/40 pb-6">
          {/* Category Tabs */}
          <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-2 sm:px-5 sm:py-2.5 text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest transition-all duration-300 font-semibold font-mono rounded-xs ${
                  activeCategory === cat.id
                    ? 'bg-brand-gold text-brand-black shadow-gold'
                    : 'text-brand-ivory/70 hover:text-brand-gold hover:bg-brand-charcoal/60 border border-brand-border/40'
                }`}
              >
                {cat.label}
                {cat.isMain && (
                  <span className="ml-1 rtl:mr-1 rtl:ml-0 text-[10px] opacity-80">★</span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-brand-gold absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 opacity-75" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'بحث سريع بالاسم، الخامة، GSM...'
                  : 'Quick search pieces, GSM...'
              }
              className="w-full bg-brand-charcoal/90 border border-brand-border/70 focus:border-brand-gold text-brand-ivory text-xs py-2.5 pl-9 pr-8 rtl:pl-8 rtl:pr-9 rounded-xs placeholder-brand-muted focus:outline-none transition-colors font-sans shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-ivory p-0.5"
                title={language === 'ar' ? 'إلغاء البحث' : 'Clear search'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Search Filter Pill */}
        {searchQuery && (
          <div className="mb-8 flex items-center justify-between bg-brand-charcoal/60 border border-brand-gold/40 px-4 py-2.5 rounded-xs animate-fade-in font-mono text-xs">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-gold">
              <Search className="w-3.5 h-3.5" />
              <span>
                {language === 'ar'
                  ? `نتائج البحث عن: "${searchQuery}" (${filteredProducts.length} قطعة)`
                  : `Filtering by: "${searchQuery}" (${filteredProducts.length} items)`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="text-brand-ivory/70 hover:text-brand-gold flex items-center space-x-1 rtl:space-x-reverse text-[11px] hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'ar' ? 'إعادة تعيين وعرض الكل' : 'Reset & show all'}</span>
            </button>
          </div>
        )}

        {/* Products Grid or Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 animate-fade-in">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={handleOpenQuickView}
                index={idx}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-brand-charcoal/40 border border-brand-border/60 rounded-xs space-y-4 max-w-lg mx-auto p-6">
            <Search className="w-8 h-8 text-brand-gold/60 mx-auto" />
            <h3 className="text-base font-bold text-brand-ivory font-sans">
              {language === 'ar'
                ? `لم يتم العثور على قطع تطابق "${searchQuery}"`
                : `No pieces found matching "${searchQuery}"`}
            </h3>
            <p className="text-xs text-brand-cream/70 font-sans max-w-sm mx-auto">
              {language === 'ar'
                ? 'جرّب البحث بكلمات أخرى مثل "هودي" أو "سويت شيرت" أو تصفح كافة الفئات بدون تحديد.'
                : 'Try searching with other keywords like "hoodie" or "sweatshirt", or reset filters to browse all.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-5 py-2.5 bg-brand-gold text-brand-black font-bold uppercase text-xs tracking-wider hover:bg-brand-gold-hover transition-colors font-mono rounded-xs inline-flex items-center space-x-2 rtl:space-x-reverse"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'عرض كافة القطع' : 'Show All Pieces'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Streetwear Quick Order Bottom Sheet & Specs Modal (Video Replica) */}
      <ProductBottomSheet
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
};
