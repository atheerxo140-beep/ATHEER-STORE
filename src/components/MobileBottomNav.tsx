'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import {
  Home,
  Flame,
  ShoppingBag,
  Award,
  User,
  X,
  Phone,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { language, isRtl } = useLanguage();
  const { totalCount, setIsCartOpen } = useCart();
  const { content } = useHomepageContent();
  const { customer } = useCustomerAuth();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [orderLookupPhone, setOrderLookupPhone] = useState('');
  const [orderLookupResult, setOrderLookupResult] = useState<any>(null);
  const [orderSearching, setOrderSearching] = useState(false);

  // Hide on admin routes, checkout, or if explicitly disabled by owner
  if (content.enableMobileBottomNav === false) {
    return null;
  }
  if (pathname?.startsWith('/admin') || pathname === '/checkout' || pathname?.startsWith('/products/')) {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isLoyaltyActive = pathname?.startsWith('/account/loyalty');
  const isAccountActive = pathname?.startsWith('/account') && !isLoyaltyActive;

  const handleHomeClick = () => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  const handleDropsClick = () => {
    if (pathname === '/') {
      const el = document.getElementById('products') || document.getElementById('categories');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push('/#products');
    }
  };

  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderLookupPhone.trim()) return;

    setOrderSearching(true);
    try {
      const cleanPhone = orderLookupPhone.replace(/[^0-9]/g, '');
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(cleanPhone)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && data.orders && data.orders.length > 0) {
        setOrderLookupResult(data.orders);
      } else {
        setOrderLookupResult([]);
      }
    } catch (err) {
      console.error(err);
      setOrderLookupResult([]);
    } finally {
      setOrderSearching(false);
    }
  };

  return (
    <>
      {/* Fixed Mobile Bottom Bar (iOS / Android Native App Experience) */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-brand-black/95 backdrop-blur-xl border-t border-brand-border/80 px-2 pt-1.5 shadow-2xl select-none transition-transform duration-300"
        style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0.6rem))' }}
      >
        <div className="grid grid-cols-5 items-center justify-around text-center">
          {/* 1. Home */}
          <button
            type="button"
            onClick={handleHomeClick}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isHomeActive ? 'text-brand-gold' : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5 stroke-[1.8]" />
            <span className="text-[10px] font-sans font-medium">
              {isAr ? 'الرئيسية' : 'Home'}
            </span>
          </button>

          {/* 2. Drops / Heavyweight Catalog */}
          <button
            type="button"
            onClick={handleDropsClick}
            className="flex flex-col items-center justify-center py-1 transition-all active:scale-95 text-brand-cream/60 hover:text-brand-cream"
          >
            <Flame className="w-5 h-5 mb-0.5 stroke-[1.8]" />
            <span className="text-[10px] font-sans font-medium">
              {isAr ? 'الهوديز' : 'Drops'}
            </span>
          </button>

          {/* 3. Cart with Badge */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex flex-col items-center justify-center py-1 transition-all active:scale-95 text-brand-cream/60 hover:text-brand-cream"
            aria-label="Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 mb-0.5 stroke-[1.8]" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-2 rtl:-left-2 rtl:right-auto bg-brand-gold text-brand-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-gold font-mono animate-bounce">
                  {totalCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-sans font-medium">
              {isAr ? 'السلة' : 'Bag'}
            </span>
          </button>

          {/* 4. VIP Loyalty Pass */}
          <Link
            href="/account/loyalty"
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isLoyaltyActive ? 'text-brand-gold' : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            <div className="relative">
              <Award className="w-5 h-5 mb-0.5 stroke-[1.8]" />
              <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            </div>
            <span className="text-[10px] font-sans font-bold text-brand-gold">
              {isAr ? 'كارت VIP' : 'VIP Pass'}
            </span>
          </Link>

          {/* 5. Account / Track */}
          <button
            type="button"
            onClick={() => setShowOrdersModal(true)}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isAccountActive ? 'text-brand-gold' : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            <User className="w-5 h-5 mb-0.5 stroke-[1.8]" />
            <span className="text-[10px] font-sans font-medium">
              {customer ? (isAr ? 'حسابي' : 'Account') : (isAr ? 'تتبع / حسابي' : 'Track')}
            </span>
          </button>
        </div>
      </nav>

      {/* Orders Tracking & Account Slide-Up Bottom Sheet Modal */}
      {showOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-fade-in font-sans">
          <div
            className="fixed inset-0"
            onClick={() => {
              setShowOrdersModal(false);
              setOrderLookupResult(null);
            }}
          />

          <div
            className="relative w-full sm:max-w-md bg-brand-charcoal border-t-2 sm:border border-brand-gold/60 rounded-t-2xl sm:rounded-xs p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto animate-slide-up-sheet"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-brand-border/80 rounded-full mx-auto mb-3 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-gold font-bold text-sm">
                <Truck className="w-4 h-4" />
                <span>{isAr ? 'متابعة الطلبات والحساب' : 'Orders & Account'}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowOrdersModal(false);
                  setOrderLookupResult(null);
                }}
                className="p-1 text-brand-cream/60 hover:text-brand-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Quick Card */}
            <div className="mt-4 p-3 bg-brand-stone/40 border border-brand-border/80 rounded-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-brand-ivory">
                  {customer ? customer.fullName : (isAr ? 'ضيف أثير المميز' : 'ATHEER Guest')}
                </p>
                <p className="text-[11px] text-brand-gold font-mono mt-0.5">
                  {customer ? (customer.phone || customer.email) : (isAr ? 'سجل برقمك لكارت الولاء VIP' : 'Sign in with phone for VIP pass')}
                </p>
              </div>
              <Link
                href={customer ? '/account' : '/account/login'}
                onClick={() => setShowOrdersModal(false)}
                className="px-3 py-1.5 bg-brand-gold text-brand-black text-[11px] font-bold font-mono uppercase tracking-wider rounded-xs hover:bg-brand-gold-hover transition-colors flex items-center space-x-1 rtl:space-x-reverse"
              >
                <span>{customer ? (isAr ? 'ملفي' : 'Profile') : (isAr ? 'دخول / تسجيل' : 'Login')}</span>
                <ArrowIcon className="w-3 h-3" />
              </Link>
            </div>

            {/* Instant Phone Lookup Form */}
            <div className="mt-4">
              <p className="text-xs text-brand-cream/80 mb-2">
                {isAr
                  ? 'أدخل رقم هاتفك لمشاهدة حالة وتفاصيل طلباتك فوراً:'
                  : 'Enter your phone number to track active orders instantly:'}
              </p>
              <form onSubmit={handleLookupOrder} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="tel"
                    inputMode="tel"
                    value={orderLookupPhone}
                    onChange={(e) => setOrderLookupPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    required
                    className="w-full bg-brand-black border border-brand-border px-3 py-2.5 text-xs text-brand-ivory placeholder-brand-muted font-mono rounded-xs focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={orderSearching}
                  className="px-4 py-2.5 bg-brand-gold text-brand-black text-xs font-bold font-mono uppercase rounded-xs hover:bg-brand-gold-hover transition-colors shadow-gold shrink-0 disabled:opacity-50"
                >
                  {orderSearching ? (isAr ? '...' : '...') : (isAr ? 'بحث' : 'Search')}
                </button>
              </form>
            </div>

            {/* Lookup Results */}
            {orderLookupResult !== null && (
              <div className="mt-4 space-y-3">
                {orderLookupResult.length === 0 ? (
                  <div className="p-4 bg-brand-stone/40 border border-brand-border/60 text-center text-xs text-brand-cream/60 font-mono">
                    {isAr
                      ? 'لا توجد طلبات مسجلة بهذا الرقم حالياً.'
                      : 'No orders found matching this phone number.'}
                  </div>
                ) : (
                  orderLookupResult.map((ord: any) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-brand-black border border-brand-border hover:border-brand-gold/60 transition-colors rounded-xs text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-brand-gold">
                          #{ord.orderNumber || ord.id}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/40">
                          {ord.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-brand-cream/70 font-mono">
                        <span>{ord.shippingAddress?.fullName || ord.customerName}</span>
                        <span className="text-brand-ivory font-bold">{ord.totalAmount} ج.م</span>
                      </div>
                      <Link
                        href={`/track-order?ref=${ord.orderNumber || ord.id}`}
                        onClick={() => setShowOrdersModal(false)}
                        className="text-[10px] text-brand-gold hover:underline font-mono inline-flex items-center space-x-1 rtl:space-x-reverse pt-1"
                      >
                        <span>{isAr ? 'عرض التفاصيل الكاملة وتتبع الشحنة' : 'View full details & track'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
