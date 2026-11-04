'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { getShippingZones, calculateShippingFee } from '@/data/shippingZones';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Flame,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalCount } = useCart();
  const { language, t, formatPrice, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const shippingZones = getShippingZones();
  const [selectedZoneId, setSelectedZoneId] = useState(shippingZones[0]?.id || 'cairo-giza');

  const { fee: shippingFee, isFree: isFreeShipping, zone: activeZone } = calculateShippingFee(
    selectedZoneId,
    subtotal
  );

  const freeThreshold = activeZone?.freeShippingThreshold || 1800;
  const remainingForFreeShipping = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const finalTotal = subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        <div className="flex items-center justify-between pb-6 border-b border-brand-border/60 mb-8">
          <div>
            <h1 className="font-sans font-black text-3xl sm:text-4xl uppercase tracking-tight">
              {language === 'ar' ? 'حقيبة التسوق' : 'Shopping Bag'}
            </h1>
            <p className="text-xs text-brand-cream/70 font-mono mt-1">
              {language === 'ar'
                ? `لديك ${totalCount} قطع في حقيبتك (بالجنيه المصري EGP)`
                : `${totalCount} streetwear pieces in your bag (EGP)`}
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-brand-muted hover:text-rose-400 font-mono transition-colors"
            >
              {language === 'ar' ? 'تفريغ الحقيبة' : 'Clear All'}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <ShoppingBag className="w-16 h-16 text-brand-muted/30 mx-auto stroke-[1] mb-6" />
            <h2 className="font-sans font-bold text-2xl uppercase mb-3">
              {language === 'ar' ? 'حقيبتك فارغة حالياً' : 'Your bag is empty'}
            </h2>
            <p className="text-xs sm:text-sm text-brand-cream/70 font-light leading-relaxed mb-8">
              {language === 'ar'
                ? 'استكشف تشكيلة الهوديز الثقيلة بوزن 500 GSM والسويت شيرتات المصممة للشباب في مصر.'
                : 'Explore our launch collection of 500 GSM heavyweight hoodies and stylish sweatshirts.'}
            </p>
            <Link
              href="/#products"
              className="inline-flex items-center space-x-2 rtl:space-x-reverse px-8 py-4 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-widest hover:bg-brand-gold-hover transition-colors font-mono shadow-gold"
            >
              <span>{language === 'ar' ? 'تسوق تشكيلة الهوديز' : 'Shop The Hoodies Drop'}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Items Column (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Progress Indicator */}
              <div className="p-4 bg-brand-charcoal border border-brand-border/60">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="flex items-center text-brand-gold font-bold">
                    <Flame className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0 inline text-brand-gold" />
                    {isFreeShipping ? (
                      language === 'ar' ? 'مؤهل للتوصيل المجاني داخل مصر!' : 'Unlocked Free Express Delivery in Egypt!'
                    ) : (
                      language === 'ar'
                        ? `أضف بقيمة ${formatPrice(remainingForFreeShipping)} للحصول على شحن مجاني!`
                        : `Add ${formatPrice(remainingForFreeShipping)} more for FREE Delivery!`
                    )}
                  </span>
                  <span className="text-brand-cream/70">{progressPercent}%</span>
                </div>
                <div className="w-full bg-brand-black h-2 overflow-hidden border border-brand-border/50">
                  <div
                    className="bg-brand-gold h-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-brand-border/40 border-y border-brand-border/60">
                {items.map((item) => {
                  const title = language === 'ar' ? item.product.nameAr : item.product.nameEn;
                  return (
                    <div
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="w-20 h-24 bg-brand-charcoal border border-brand-border/70 overflow-hidden flex-shrink-0"
                        >
                          <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url('${item.product.image}')` }}
                          />
                        </Link>

                        <div>
                          <Link
                            href={`/products/${item.product.id}`}
                            className="font-sans font-bold text-base text-brand-ivory hover:text-brand-gold transition-colors block"
                          >
                            {title}
                          </Link>
                          <div className="text-xs text-brand-cream/70 font-mono mt-1 space-x-2 rtl:space-x-reverse">
                            <span className="text-brand-gold font-bold">{item.selectedSize}</span>
                            {item.selectedColor && (
                              <>
                                <span>•</span>
                                <span>{item.selectedColor}</span>
                              </>
                            )}
                            <span>•</span>
                            <span className="text-brand-muted">{item.product.gsm} GSM</span>
                          </div>
                          <div className="font-mono text-sm font-bold text-brand-gold mt-2 sm:hidden">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                        </div>
                      </div>

                      {/* Controls and Price */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 rtl:space-x-reverse">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-brand-border bg-brand-charcoal">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)
                            }
                            className="px-3 py-1.5 text-brand-ivory/70 hover:text-brand-gold font-mono"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 font-mono font-bold text-xs text-brand-ivory">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)
                            }
                            className="px-3 py-1.5 text-brand-ivory/70 hover:text-brand-gold font-mono"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="hidden sm:block text-right rtl:text-left min-w-[100px]">
                          <span className="font-mono text-base font-bold text-brand-gold">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeItem(item.product.id, item.selectedSize)}
                          className="text-brand-muted hover:text-rose-400 p-2 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between items-center text-xs font-mono">
                <Link
                  href="/#products"
                  className="text-brand-gold hover:underline flex items-center"
                >
                  <ArrowIcon className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 inline rotate-180" />
                  <span>{language === 'ar' ? 'مواصلة تصفح الهوديز' : 'Continue Shopping'}</span>
                </Link>
              </div>
            </div>

            {/* Summary Column (4 cols) */}
            <div className="lg:col-span-4">
              <div className="p-6 bg-brand-charcoal border border-brand-border sticky top-28 space-y-6">
                <h3 className="font-sans font-bold text-base uppercase tracking-wider border-b border-brand-border pb-3">
                  {language === 'ar' ? 'ملخص الفاتورة (EGP)' : 'Order Summary (EGP)'}
                </h3>

                {/* Egyptian Shipping Zone Selector */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                    {language === 'ar' ? 'منطقة الشحن داخل مصر:' : 'Select Egypt Delivery Region:'}
                  </label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full bg-brand-black border border-brand-border px-3 py-2.5 text-xs text-brand-ivory focus:outline-none focus:border-brand-gold font-sans"
                  >
                    {shippingZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {language === 'ar' ? z.nameAr : z.nameEn} ({z.baseFee} ج.م)
                      </option>
                    ))}
                  </select>
                  {activeZone && (
                    <p className="text-[11px] text-brand-gold font-mono mt-1.5">
                      {language === 'ar' ? activeZone.estimatedDaysAr : activeZone.estimatedDaysEn}
                    </p>
                  )}
                </div>

                {/* Subtotal, Shipping, Total */}
                <div className="space-y-3 pt-3 border-t border-brand-border/60 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-brand-cream/70">{t('cartSubtotal')}</span>
                    <span className="text-brand-ivory font-bold">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-brand-cream/70">
                      {language === 'ar' ? 'رسوم الشحن:' : 'Courier Shipping:'}
                    </span>
                    <span className="font-bold">
                      {isFreeShipping ? (
                        <span className="text-emerald-400 uppercase">
                          {language === 'ar' ? 'مجاني' : 'FREE'}
                        </span>
                      ) : (
                        <span className="text-brand-ivory">{formatPrice(shippingFee)}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-brand-border text-sm font-bold">
                    <span className="text-brand-gold uppercase">
                      {language === 'ar' ? 'الإجمالي الكلي:' : 'Total Amount:'}
                    </span>
                    <span className="font-mono text-xl text-brand-gold">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Payment notice */}
                <div className="p-3 bg-brand-black border border-brand-border/80 text-[11px] text-brand-cream/80 space-y-1 font-sans">
                  <p className="text-brand-gold font-bold flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0 inline" />
                    {language === 'ar' ? 'الدفع نقدياً عند الاستلام (COD)' : 'Cash on Delivery (COD)'}
                  </p>
                  <p className="text-[10px] text-brand-cream/70 leading-relaxed">
                    {language === 'ar'
                      ? 'ادفع نقداً لمندوب شركة الشحن عند استلام وفحص طلبيتك في منزلك.'
                      : 'Pay upon delivery via cash or card directly to the courier.'}
                  </p>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-4 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-brand-gold-hover transition-colors shadow-gold flex items-center justify-center space-x-2 rtl:space-x-reverse font-mono"
                >
                  <span>{t('checkoutBtn')}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
