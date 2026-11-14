'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockProducts';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft, Package, Sparkles } from 'lucide-react';

export default function CustomerWishlistPage() {
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const { language, isRtl, formatPrice } = useLanguage();
  const { addItem } = useCart();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.products)) {
          setProducts(d.products);
        } else {
          setProducts(mockProducts);
        }
      })
      .catch(() => setProducts(mockProducts))
      .finally(() => setLoading(false));
  }, []);

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-gold selection:text-brand-black">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-cream/60">
          <Link href="/account" className="hover:text-brand-gold transition-colors">
            {isAr ? 'حسابي' : 'My Account'}
          </Link>
          <span>/</span>
          <span className="text-brand-gold font-bold">{isAr ? 'قائمة المفضلة' : 'Wishlist'}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
          <div>
            <h1 className="text-2xl font-sans font-black text-brand-ivory">
              {isAr ? 'قطع أثير المحفوظة في مفضلتك' : 'Your Saved Streetwear Drops'}
            </h1>
            <p className="text-xs text-brand-cream/60 font-mono mt-1">
              {isAr ? 'احفظ قطعك المفضلة لتصلك إشعارات توفر المقاسات والشراء السريع' : 'Saved for quick checkout & sizing'}
            </p>
          </div>

          <span className="text-xs font-mono text-brand-gold font-bold">
            {wishlistedProducts.length} {isAr ? 'قطعة محفوظة' : 'Saved Items'}
          </span>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12 font-mono text-xs text-brand-gold">
            {isAr ? 'جاري فتح المفضلة...' : 'Loading wishlist...'}
          </div>
        ) : wishlistedProducts.length === 0 ? (
          <div className="bg-brand-charcoal border border-brand-border/80 rounded-xs p-12 text-center space-y-4">
            <Heart className="w-12 h-12 text-brand-gold/40 mx-auto" />
            <h3 className="text-base font-bold text-brand-ivory">
              {isAr ? 'قائمة المفضلة فارغة حالياً' : 'Your wishlist is empty'}
            </h3>
            <p className="text-xs text-brand-cream/60 max-w-sm mx-auto">
              {isAr
                ? 'استكشف تشكيلة الهوديز والسويت شيرتات الشتوية الثقيلة واضغط على القلب لحفظ أي قطعة.'
                : 'Browse our heavyweight collection and tap the heart icon to save pieces.'}
            </p>
            <Link
              href="/#products"
              className="inline-block px-6 py-2.5 bg-brand-gold text-brand-black text-xs font-bold uppercase rounded-xs tracking-wider shadow-gold"
            >
              {isAr ? 'استكشف كولكشن الشتاء' : 'Explore Winter Drops'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistedProducts.map((product) => {
              const name = isAr ? product.nameAr : product.nameEn;

              return (
                <div
                  key={product.id}
                  className="bg-brand-charcoal border border-brand-border/80 rounded-xs overflow-hidden flex flex-col justify-between group hover:border-brand-gold transition-colors"
                >
                  <div className="relative aspect-[3/4] bg-brand-stone/40 overflow-hidden">
                    <Link href={`/products/${product.id}`} className="block w-full h-full">
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url('${product.image}')` }}
                      />
                    </Link>

                    {/* Remove Wishlist Button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-8 h-8 rounded-full bg-brand-black/80 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors flex items-center justify-center border border-brand-border"
                      title={isAr ? 'إزالة من المفضلة' : 'Remove from wishlist'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex flex-col space-y-1">
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-brand-black/90 text-brand-gold border border-brand-gold/40 rounded-xs">
                        {product.gsm} GSM
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-sm text-brand-ivory group-hover:text-brand-gold transition-colors">
                        {name}
                      </h3>
                      <p className="font-mono text-sm font-bold text-brand-gold mt-1">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        addItem(product, 1, product.sizes[0] || 'L', product.colors[0] || '', true);
                      }}
                      className="w-full py-2 px-3 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase rounded-xs transition-colors flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isAr ? 'أضف للسلة الآن' : 'Add To Bag'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
