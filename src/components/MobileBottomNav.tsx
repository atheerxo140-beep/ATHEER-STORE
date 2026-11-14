'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  Search,
  ClipboardList,
  X,
  Phone,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { language, isRtl } = useLanguage();
  const { totalCount, setIsCartOpen } = useCart();
  const { content } = useHomepageContent();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'cart' | 'search' | 'orders'>('home');
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [orderLookupPhone, setOrderLookupPhone] = useState('');
  const [orderLookupResult, setOrderLookupResult] = useState<any>(null);
  const [orderSearching, setOrderSearching] = useState(false);

  // If disabled by store owner in admin settings, hide completely
  if (content.enableMobileBottomNav === false) {
    return null;
  }

  const handleNavClick = (tab: 'home' | 'categories' | 'cart' | 'search' | 'orders') => {
    setActiveTab(tab);

    if (tab === 'home') {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (tab === 'categories') {
      const el = document.getElementById('categories') || document.getElementById('products');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tab === 'cart') {
      setIsCartOpen(true);
    } else if (tab === 'search') {
      // Trigger search drawer in header
      const searchBtn = document.querySelector('button[aria-label="Search"]') as HTMLButtonElement;
      if (searchBtn) {
        searchBtn.click();
      } else {
        const prodSection = document.getElementById('products');
        if (prodSection) prodSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tab === 'orders') {
      setShowOrdersModal(true);
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
      {/* Fixed Mobile Bottom Bar (iOS/Android App Style) */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-brand-black/95 backdrop-blur-xl border-t border-brand-border/80 px-2 py-1.5 shadow-2xl safe-area-pb select-none transition-transform duration-300"
      >
        <div className="grid grid-cols-5 items-center justify-around text-center">
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
              activeTab === 'home' ? 'text-brand-gold' : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5 stroke-[1.8]" />
            <span className="text-[10px] font-sans font-medium">
              {isAr ? 'الرئيسية' : 'Home'}
            </span>
          </button>

          {/* 2. Categories */}
          <button
            type="button"
            onClick={() => handleNavClick('categories')}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
              activeTab === 'categories' ? 'text-brand-gold' : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            <LayoutGrid className="w-5 h-5 mb-0.5 stroke-[1.8]" />
            <span className="text-[10px] font-sans font-medium">
              {isAr ? 'الأصناف' : 'Categories'}
            </span>
          </button>

          {/* 3. Cart with Badge */}
          <button
            type="button"
            onClick={() => handleNavClick('cart')}
            className="relative flex flex-col items-center justify-center py-1 transition-all active:scale-90 text-brand-cream/60 hover:text-brand-cream"
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

          {/* 4. Search */}
          <button
            type="button"
            onClick={() => handleNavClick('search')}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
              activeTab === 'search' ? 'text-brand-gold' : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            <Search className="w-5 h-5 mb-0.5 stroke-[1.8]" />
            <span className="text-[10px] font-sans font-medium">
              {isAr ? 'بحث' : 'Search'}
            </span>
          </button>

          {/* 5. My Orders / Track */}
          <button
            type="button"
            onClick={() => handleNavClick('orders')}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
              activeTab === 'orders' ? 'text-brand-gold' : 'text-brand-cream/60 hover:text-brand-cream'
            }`}
          >
            <ClipboardList className="w-5 h-5 mb-0.5 stroke-[1.8]" />
            <span className="text-[10px] font-sans font-medium">
              {isAr ? 'طلباتي' : 'Orders'}
            </span>
          </button>
        </div>
      </nav>

      {/* Orders Tracking Slide-Up Bottom Sheet Modal */}
      {showOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-fade-in font-sans">
          <div
            className="fixed inset-0"
            onClick={() => {
              setShowOrdersModal(false);
              setOrderLookupResult(null);
            }}
          />

          <div className="relative w-full sm:max-w-md bg-brand-charcoal border-t-2 sm:border border-brand-gold/60 rounded-t-2xl sm:rounded-xs p-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto animate-slide-up-sheet">
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-brand-border/80 rounded-full mx-auto mb-4 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-gold font-bold text-sm">
                <Truck className="w-4 h-4" />
                <span>{isAr ? 'متابعة وتتبع طلباتي' : 'Track My Orders'}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowOrdersModal(false);
                  setOrderLookupResult(null);
                }}
                className="text-brand-cream/60 hover:text-brand-ivory p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lookup Form */}
            <form onSubmit={handleLookupOrder} className="mt-4 space-y-3">
              <label className="block text-xs font-mono text-brand-cream/80">
                {isAr
                  ? 'أدخل رقم هاتفك المسجل بالطلب:'
                  : 'Enter your phone number used at checkout:'}
              </label>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="tel"
                  value={orderLookupPhone}
                  onChange={(e) => setOrderLookupPhone(e.target.value)}
                  placeholder="01012345678"
                  className="flex-1 bg-brand-black border border-brand-border/80 focus:border-brand-gold text-brand-ivory px-3 py-2.5 text-xs rounded-xs font-mono focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={orderSearching}
                  className="px-4 py-2.5 bg-brand-gold text-brand-black text-xs font-mono font-bold uppercase rounded-xs hover:bg-brand-gold-hover transition-colors shrink-0 disabled:opacity-50"
                >
                  {orderSearching ? (isAr ? 'بحث...' : 'Search...') : isAr ? 'استعلام' : 'Track'}
                </button>
              </div>
            </form>

            {/* Lookup Results */}
            {orderLookupResult && (
              <div className="mt-5 space-y-3 pt-3 border-t border-brand-border/40">
                {orderLookupResult.length > 0 ? (
                  orderLookupResult.map((ord: any) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-brand-black/80 border border-brand-border/80 rounded-xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-brand-gold font-bold">#{ord.id.slice(-6)}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-gold/15 text-brand-gold border border-brand-gold/30">
                          {ord.orderStatus || ord.status || 'قيد المعالجة'}
                        </span>
                      </div>
                      <p className="text-brand-cream/80 text-[11px]">
                        {isAr ? 'الإجمالي:' : 'Total:'}{' '}
                        <strong className="text-brand-ivory font-mono">{ord.totalAmount || ord.total} ج.م</strong>
                      </p>
                      <p className="text-brand-muted text-[10px] font-mono">
                        {ord.governorate} · {new Date(ord.createdAt || ord.created_at || Date.now()).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-brand-black/60 text-center rounded-xs space-y-1">
                    <p className="text-xs text-brand-cream/80">
                      {isAr
                        ? 'لم يتم العثور على طلبات سابقة بهذا الرقم.'
                        : 'No past orders found with this phone number.'}
                    </p>
                    <p className="text-[10px] text-brand-muted">
                      {isAr
                        ? 'تأكد من إدخال نفس رقم الهاتف الذي سجلت به الطلب.'
                        : 'Please ensure you entered the exact number used in your checkout.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
