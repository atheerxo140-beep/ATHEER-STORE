'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockProducts';
import { matchesProduct } from '@/lib/searchUtils';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Globe,
  Heart,
  Flame,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
} from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const { language, setLanguage, isRtl, t, formatPrice } = useLanguage();
  const { content } = useHomepageContent();
  const { totalCount, setIsCartOpen } = useCart();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const announcementText = isAr
    ? content.announcementTextAr || t('announcementText')
    : content.announcementTextEn || t('announcementText');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.warn('Header failed to fetch live products:', err));
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  const matchingProducts = searchQuery.trim()
    ? products.filter((p) => matchesProduct(p, searchQuery))
    : [];

  const popularSearches = isAr
    ? ['هوديز 500 GSM', 'سويت شيرت', 'تي شيرت بوكسي', 'أوفرسايز', 'أونيكس أسود']
    : ['500 GSM Hoodies', 'Crewnecks', 'Boxy Tees', 'Oversized', 'Onyx Black'];

  const handleSelectProduct = (id: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    router.push(`/products/${id}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('atheer:search', {
          detail: query,
        })
      );

      const productsEl = document.getElementById('products');
      if (productsEl) {
        productsEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push(`/#products?search=${encodeURIComponent(query)}`);
      }
    }

    setSearchOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('navHoodies'), href: '/#products', highlight: true },
    { label: t('navSweatshirts'), href: '/#products' },
    { label: t('navTeesFuture'), href: '/#future-drop' },
    { label: t('navFitLab'), href: '/#fabric-fit' },
    { label: t('navBrand'), href: '/#about' },
  ];

  return (
    <>
      {/* Top Announcement Bar — Egypt Delivery */}
      {content.showAnnouncement !== false && (
        <div className="bg-brand-black text-brand-gold text-[11px] tracking-widest uppercase border-b border-brand-border/60 py-2.5 px-4 font-sans select-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse text-brand-ivory/80 text-[10px] tracking-widest">
              <span className="inline-flex items-center text-brand-gold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-2 rtl:ml-2 rtl:mr-0 inline-block" />
                {t('brandOrigin')}
              </span>
            </div>

            <div className="mx-auto text-center font-medium tracking-wider text-[11px] text-brand-ivory flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <Flame className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>{announcementText}</span>
            </div>

            {/* Quick Selectors */}
            <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse text-[11px]">
              {/* Currency Indicator (EGP Only) */}
              <span className="font-mono text-brand-gold/90 font-bold px-2 py-0.5 bg-brand-charcoal border border-brand-border text-[10px]">
                EGP | ج.م
              </span>

              <span className="text-brand-border">|</span>

              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="flex items-center space-x-1 rtl:space-x-reverse text-brand-ivory/90 hover:text-brand-gold transition-colors font-sans"
                title={language === 'en' ? 'التحويل للعربية' : 'Switch to English'}
              >
                <Globe className="w-3 h-3 opacity-70" />
                <span className="font-semibold text-xs">{language === 'en' ? 'العربية' : 'EN'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-brand-black/95 backdrop-blur-md border-b border-brand-border/80 shadow-luxury-dark py-3'
            : 'bg-brand-black/90 backdrop-blur-sm border-b border-brand-border/40 py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Mobile menu & Desktop Nav */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-brand-ivory hover:text-brand-gold transition-colors -ml-2 rtl:-mr-2 rtl:ml-0"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 stroke-[1.5]" />
              </button>

              <nav className="hidden lg:flex items-center space-x-7 rtl:space-x-reverse">
                {navLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    className={`text-xs uppercase tracking-widest transition-colors font-medium relative group py-1 ${
                      link.highlight
                        ? 'text-brand-gold font-semibold'
                        : 'text-brand-ivory/80 hover:text-brand-gold'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-0 rtl:left-auto rtl:right-0 h-[1.5px] bg-brand-gold transition-all duration-300 ${
                        link.highlight ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: Brand Identity */}
            <div className="text-center flex-1 lg:flex-none">
              <Link href="/" className="inline-block group">
                <div className="flex items-center justify-center space-x-2.5 rtl:space-x-reverse">
                  <span className="font-sans font-black text-2xl sm:text-3xl tracking-[0.2em] text-brand-ivory uppercase group-hover:text-brand-gold transition-colors">
                    {t('brandName')}
                  </span>
                  <span className="text-brand-gold text-xl sm:text-2xl font-light">/</span>
                  <span className="font-arabic font-bold text-2xl sm:text-3xl text-brand-gold">
                    أثير
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-brand-cream/70 font-sans font-medium mt-0.5">
                  {t('brandTagline')}
                </p>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3 sm:space-x-5 rtl:space-x-reverse">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-brand-ivory/80 hover:text-brand-gold transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Mobile Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="lg:hidden p-1.5 text-xs text-brand-ivory font-medium border border-brand-border/80 px-2 rounded-sm hover:text-brand-gold hover:border-brand-gold"
              >
                {language === 'en' ? 'عربي' : 'EN'}
              </button>

              {/* Wishlist */}
              <Link
                href="/#products"
                className="hidden sm:inline-flex p-2 text-brand-ivory/80 hover:text-brand-gold transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.5]" />
              </Link>

              {/* Shopping Bag Button with Badge */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-brand-ivory hover:text-brand-gold transition-colors relative flex items-center"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto bg-brand-gold text-brand-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-fade-in shadow-gold font-mono">
                    {totalCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Luxury Live Search Drawer */}
        {searchOpen && (
          <div className="border-t border-brand-gold/40 bg-brand-charcoal/98 backdrop-blur-xl px-4 py-5 animate-slide-down shadow-2xl relative z-50">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Search Input Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center bg-brand-black border border-brand-border/80 focus-within:border-brand-gold transition-colors px-4 py-3 rounded-xs shadow-inner"
              >
                <Search className="w-5 h-5 text-brand-gold mr-3 rtl:ml-3 rtl:mr-0 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isAr
                      ? 'ابحث عن هوديز، سويت شيرتات، تي شيرت، 500 GSM، أوفرسايز...'
                      : t('searchPlaceholder')
                  }
                  className="w-full bg-transparent text-brand-ivory placeholder-brand-muted text-sm sm:text-base focus:outline-none font-sans"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-brand-muted hover:text-brand-ivory transition-colors mr-2 rtl:ml-2 rtl:mr-0"
                    title={isAr ? 'مسح البحث' : 'Clear search'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-brand-muted hover:text-brand-gold p-1 transition-colors border-r rtl:border-r-0 rtl:border-l border-brand-border/60 pr-2 rtl:pl-2 rtl:pr-0"
                  title={isAr ? 'إغلاق البحث' : 'Close search'}
                >
                  <span className="text-xs font-mono uppercase tracking-wider">
                    {isAr ? 'إغلاق' : 'ESC'}
                  </span>
                </button>
              </form>

              {/* Suggestions Chips when Query is Empty */}
              {!searchQuery.trim() && (
                <div className="pt-1 pb-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-brand-gold/80 mb-2 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{isAr ? 'عمليات البحث الأكثر شيوعاً:' : 'Popular Searches:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setSearchQuery(term)}
                        className="px-3 py-1 bg-brand-black/70 hover:bg-brand-gold hover:text-brand-black border border-brand-border/70 hover:border-brand-gold text-brand-ivory/80 text-xs font-mono transition-colors rounded-xs"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results Display */}
              {searchQuery.trim() && (
                <div className="space-y-3 animate-fade-in">
                  {/* Results Count Bar */}
                  <div className="flex items-center justify-between text-xs font-mono border-b border-brand-border/40 pb-2">
                    <span className="text-brand-cream/90">
                      {isAr
                        ? `نتائج البحث لـ "${searchQuery}": (${matchingProducts.length} ${
                            matchingProducts.length === 1 ? 'قطعة' : 'قطع'
                          })`
                        : `Results for "${searchQuery}": (${matchingProducts.length} items)`}
                    </span>
                    {matchingProducts.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-brand-gold hover:underline flex items-center space-x-1 rtl:space-x-reverse font-semibold"
                      >
                        <span>{isAr ? 'عرض وتصفية بالمعرض' : 'Filter in store gallery'}</span>
                        <ArrowIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Matching Products Grid */}
                  {matchingProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                      {matchingProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => handleSelectProduct(prod.id)}
                          className="flex items-center space-x-3 rtl:space-x-reverse p-2.5 bg-brand-black/80 hover:bg-brand-black border border-brand-border/60 hover:border-brand-gold/80 transition-all cursor-pointer group rounded-xs"
                        >
                          {/* Image */}
                          <div className="relative w-16 h-20 bg-brand-charcoal shrink-0 overflow-hidden border border-brand-border/40">
                            <div
                              className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                              style={{ backgroundImage: `url('${prod.image}')` }}
                            />
                            <span className="absolute bottom-1 right-1 rtl:left-1 rtl:right-auto bg-brand-black/90 text-brand-gold font-mono text-[8px] px-1 font-bold">
                              {prod.gsm}G
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] uppercase font-mono text-brand-gold block truncate">
                              {isAr ? prod.categoryLabelAr : prod.categoryLabelEn}
                            </span>
                            <h4 className="text-xs font-bold text-brand-ivory group-hover:text-brand-gold transition-colors truncate font-sans">
                              {isAr ? prod.nameAr : prod.nameEn}
                            </h4>
                            <div className="mt-1 flex items-baseline space-x-2 rtl:space-x-reverse font-mono text-xs">
                              <span className="text-brand-gold font-bold">
                                {formatPrice(prod.price)}
                              </span>
                              {prod.isComingSoon && (
                                <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1 py-0.5 border border-amber-400/30">
                                  {isAr ? 'قريباً' : 'Coming Soon'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Arrow indicator */}
                          <ArrowUpRight className="w-4 h-4 text-brand-cream/30 group-hover:text-brand-gold transition-colors shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* No Results Card */
                    <div className="p-8 text-center bg-brand-black/60 border border-brand-border/40 rounded-xs space-y-3">
                      <p className="text-sm text-brand-cream/90 font-sans">
                        {isAr
                          ? `لم نتمكن من العثور على أي قطعة تطابق "${searchQuery}"`
                          : `No pieces found matching "${searchQuery}"`}
                      </p>
                      <p className="text-xs text-brand-muted font-sans">
                        {isAr
                          ? 'جرب البحث بكلمات عامة مثل: هوديز، سويت شيرت، بوكسي، أو 500 GSM'
                          : 'Try searching with generic terms like: hoodies, crewnecks, boxy, or 500 GSM'}
                      </p>
                      <div className="pt-2 flex flex-wrap justify-center gap-2">
                        {popularSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setSearchQuery(term)}
                            className="px-3 py-1 bg-brand-charcoal text-brand-gold border border-brand-gold/40 text-xs font-mono hover:bg-brand-gold hover:text-brand-black transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            className={`fixed inset-y-0 ${
              isRtl ? 'right-0' : 'left-0'
            } max-w-xs w-full bg-brand-black border-r rtl:border-l rtl:border-r-0 border-brand-border shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-fade-in`}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-brand-border">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="font-sans font-black text-xl tracking-wider text-brand-ivory">ATHEER</span>
                  <span className="text-brand-gold">/</span>
                  <span className="font-arabic font-bold text-xl text-brand-gold">أثير</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-brand-ivory/80 hover:text-brand-gold"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-6 space-y-4">
                {navLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-sm uppercase tracking-widest py-2 border-b border-brand-border/30 transition-colors ${
                      link.highlight ? 'text-brand-gold font-bold' : 'text-brand-ivory/90 hover:text-brand-gold'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}


              </div>

              <div className="pt-4 border-t border-brand-border space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-muted uppercase tracking-wider">{t('currencyLabel')}</span>
                  <span className="font-mono text-brand-gold font-bold px-2.5 py-1 bg-brand-charcoal border border-brand-border">
                    EGP | ج.م
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-brand-muted uppercase tracking-wider">Language / اللغة</span>
                  <button
                    onClick={() => {
                      setLanguage(language === 'en' ? 'ar' : 'en');
                    }}
                    className="px-3 py-1 text-xs border border-brand-gold text-brand-gold bg-brand-gold/10 font-medium"
                  >
                    {language === 'en' ? 'العربية' : 'English'}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-brand-border text-xs text-brand-muted space-y-1">
              <p className="text-brand-gold font-mono font-medium">ATHEER YOUTH STREETWEAR</p>
              <p className="text-[11px] text-brand-cream/70">Heavyweight 500 GSM Drops Across Egypt.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
