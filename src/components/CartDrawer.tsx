'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, Plus, Minus, Trash2, ShoppingBag, Flame, ArrowRight, ArrowLeft } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const { items, removeItem, updateQuantity, isCartOpen, setIsCartOpen, subtotal, totalCount } = useCart();
  const { t, language, formatPrice, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className={`fixed inset-y-0 ${isRtl ? 'left-0' : 'right-0'} max-w-md w-full flex`}>
        <div className="w-full bg-brand-charcoal border-l rtl:border-r rtl:border-l-0 border-brand-border/80 shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-down">
          {/* Header */}
          <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-black/70">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <ShoppingBag className="w-5 h-5 text-brand-gold" />
              <h2 className="font-sans font-bold text-lg text-brand-ivory uppercase tracking-wider">
                {t('cartTitle')}
              </h2>
              <span className="text-xs text-brand-gold font-mono font-bold">({totalCount})</span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-brand-ivory/70 hover:text-brand-gold transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Notice Banner for Egypt */}
          <div className="bg-brand-black px-6 py-2.5 border-b border-brand-border/40 text-[11px] text-brand-gold flex items-center justify-center space-x-1.5 rtl:space-x-reverse font-mono">
            <Flame className="w-3.5 h-3.5 flex-shrink-0 text-brand-gold" />
            <span>
              {language === 'ar'
                ? 'شحن سريع لجميع محافظات مصر | الدفع عند الاستلام متاح'
                : 'Fast Delivery Across Egypt | Cash on Delivery Available'}
            </span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {items.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <ShoppingBag className="w-12 h-12 text-brand-muted/40 stroke-[1] mb-4" />
                <p className="text-brand-cream/80 text-sm font-light mb-6 font-sans">
                  {t('cartEmpty')}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-3 border border-brand-gold text-brand-gold text-xs uppercase tracking-widest hover:bg-brand-gold hover:text-brand-black transition-colors font-mono font-bold"
                >
                  {t('continueShopping')}
                </button>
              </div>
            ) : (
              items.map((item) => {
                const title = language === 'ar' ? item.product.nameAr : item.product.nameEn;
                return (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor || 'default'}`}
                    className="flex space-x-4 rtl:space-x-reverse pb-5 border-b border-brand-border/40"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/products/${item.product.id}`}
                      onClick={() => setIsCartOpen(false)}
                      className="w-20 h-24 bg-brand-black border border-brand-border/60 overflow-hidden flex-shrink-0"
                    >
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${item.product.image}')` }}
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <Link
                            href={`/products/${item.product.id}`}
                            onClick={() => setIsCartOpen(false)}
                            className="font-sans font-bold text-sm text-brand-ivory hover:text-brand-gold leading-snug line-clamp-1"
                          >
                            {title}
                          </Link>
                          <button
                            onClick={() => removeItem(item.product.id, item.selectedSize)}
                            className="text-brand-muted hover:text-rose-400 p-1 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-brand-cream/70 mt-1 font-mono space-x-2 rtl:space-x-reverse">
                          <span className="text-brand-gold font-semibold">{item.selectedSize}</span>
                          {item.selectedColor && (
                            <>
                              <span>•</span>
                              <span>{item.selectedColor}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-brand-muted">{item.product.gsm} GSM</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-brand-border bg-brand-black">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)
                            }
                            className="p-1 px-2 text-brand-ivory/70 hover:text-brand-gold transition-colors font-mono"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs text-brand-ivory font-mono font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)
                            }
                            className="p-1 px-2 text-brand-ivory/70 hover:text-brand-gold transition-colors font-mono"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Line Total in EGP */}
                        <span className="font-mono text-sm text-brand-gold font-bold">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Area with Subtotal & Direct Checkout Link */}
          {items.length > 0 && (
            <div className="p-6 border-t border-brand-border bg-brand-black/90 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-cream/80 uppercase tracking-widest text-xs font-mono">
                  {t('cartSubtotal')}
                </span>
                <span className="font-mono text-xl text-brand-gold font-bold">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="text-[11px] text-brand-cream/60 leading-relaxed font-sans">
                {language === 'ar'
                  ? 'يتم احتساب رسوم التوصيل وفق محافظتك في مصر وتأكيد الدفع عند الاستلام.'
                  : 'Courier shipping fees calculated by Egyptian governorate at checkout.'}
              </p>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-4 bg-brand-gold text-brand-black text-xs uppercase tracking-[0.2em] font-bold hover:bg-brand-gold-hover transition-colors shadow-gold flex items-center justify-center space-x-2 rtl:space-x-reverse font-mono"
              >
                <span>{t('checkoutBtn')}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="block text-center text-xs text-brand-cream/70 hover:text-brand-gold underline font-mono"
              >
                {language === 'ar' ? 'عرض حقيبة التسوق الكاملة' : 'View Full Shopping Bag'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
