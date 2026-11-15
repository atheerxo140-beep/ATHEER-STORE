'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  User,
  ShoppingBag,
  Award,
  MapPin,
  Heart,
  LogOut,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  Package,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, logout } = useCustomerAuth();
  const { language, isRtl, formatPrice } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/account/login?redirect=/account');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (customer?.email) {
      // Fetch loyalty stamps
      fetch(`/api/loyalty/me?email=${encodeURIComponent(customer.email)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setLoyaltyData(d);
        })
        .catch(() => {});

      // Fetch customer orders
      fetch(`/api/orders?search=${encodeURIComponent(customer.email)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.orders)) setOrders(d.orders);
        })
        .catch(() => {});
    }
  }, [customer]);

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center font-mono text-xs text-brand-gold">
        {isAr ? 'جاري فتح حساب العميل...' : 'Loading customer account...'}
      </div>
    );
  }

  const stampsCount = loyaltyData?.account?.stampsCount ?? 0;
  const stampsRequired = loyaltyData?.config?.stampsRequired ?? 5;
  const tier = customer.tier || loyaltyData?.account?.tier || 'Bronze';

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory py-8 sm:py-12 px-3 sm:px-6 lg:px-8 selection:bg-brand-gold selection:text-brand-black pb-28 sm:pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-luxury-dark">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-14 h-14 rounded-full bg-brand-stone/60 border-2 border-brand-gold flex items-center justify-center text-brand-gold text-xl font-bold font-mono">
              {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h1 className="text-xl sm:text-2xl font-sans font-black text-brand-ivory">
                  {customer.fullName || customer.email}
                </h1>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/40 font-bold uppercase">
                  {tier} Member
                </span>
              </div>
              <p className="text-xs text-brand-cream/60 font-mono mt-1">
                {customer.email} {customer.phone ? `• ${customer.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Link
              href="/"
              className="px-4 py-2 bg-brand-black border border-brand-border text-xs font-mono text-brand-ivory hover:text-brand-gold hover:border-brand-gold transition-colors rounded-xs"
            >
              {isAr ? 'تسوق المتجر' : 'Shop Drops'}
            </Link>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="px-4 py-2 bg-brand-stone/40 border border-brand-border/80 text-xs font-mono text-rose-400 hover:bg-rose-950/40 transition-colors rounded-xs flex items-center space-x-1.5 rtl:space-x-reverse"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isAr ? 'خروج' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* ATHEER REWARDS Stamp Card Banner */}
        <div className="bg-gradient-to-r from-brand-charcoal via-brand-stone/50 to-brand-charcoal border-2 border-brand-gold/70 rounded-xs p-6 sm:p-8 shadow-gold relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-[11px] font-mono text-brand-gold font-bold uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                <span>ATHEER REWARDS • {isAr ? 'بطاقة الأختام الرقمية' : 'Digital Stamp Card'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-sans font-black text-brand-ivory mb-2">
                {isAr
                  ? `أكملت ${stampsCount} من ${stampsRequired} أختام للمكافأة القادمة`
                  : `You have ${stampsCount} of ${stampsRequired} stamps for next reward`}
              </h2>
              <p className="text-xs text-brand-cream/70 font-sans max-w-xl">
                {loyaltyData?.config?.rewardDescriptionAr ||
                  'احصل على قسيمة خصم نقدية 250 ج.م تلقائياً عند إكمال 5 أختام من طلباتك.'}
              </p>
            </div>

            {/* Stamp Slots Visual */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse bg-brand-black/80 p-3 rounded-xs border border-brand-gold/40">
              {Array.from({ length: stampsRequired }).map((_, i) => {
                const filled = i < stampsCount;
                return (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      filled
                        ? 'bg-brand-gold text-brand-black shadow-gold scale-105'
                        : 'border-2 border-dashed border-brand-border/80 text-brand-cream/40 bg-brand-stone/20'
                    }`}
                  >
                    {filled ? '✓' : i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-brand-border/40 flex items-center justify-between">
            <span className="text-xs font-mono text-brand-cream/60">
              {isAr ? 'تضاف الأختام تلقائياً فور توصيل الطلب بنجاح' : 'Stamps are auto-awarded on delivered orders'}
            </span>
            <Link
              href="/account/loyalty"
              className="text-xs font-mono text-brand-gold hover:underline flex items-center space-x-1 rtl:space-x-reverse font-bold"
            >
              <span>{isAr ? 'عرض تفاصيل البطاقة والمكافآت' : 'View Stamp Card Details'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/account/orders"
            className="p-5 bg-brand-charcoal border border-brand-border/80 hover:border-brand-gold rounded-xs transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-brand-black border border-brand-border/80 rounded-xs text-brand-gold group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <span className="text-xl font-mono font-bold text-brand-gold">{orders.length}</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-ivory group-hover:text-brand-gold transition-colors">
                {isAr ? 'سجل الطلبات' : 'Order History'}
              </h3>
              <p className="text-[11px] text-brand-cream/60 mt-1">
                {isAr ? 'تتبع حالات الشحن والفواتير' : 'Track orders & invoices'}
              </p>
            </div>
          </Link>

          <Link
            href="/account/loyalty"
            className="p-5 bg-brand-charcoal border border-brand-border/80 hover:border-brand-gold rounded-xs transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-brand-black border border-brand-border/80 rounded-xs text-brand-gold group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </span>
              <span className="text-xl font-mono font-bold text-brand-gold">{stampsCount} / {stampsRequired}</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-ivory group-hover:text-brand-gold transition-colors">
                {isAr ? 'بطاقة المكافآت الرقمية' : 'Digital Loyalty Card'}
              </h3>
              <p className="text-[11px] text-brand-cream/60 mt-1">
                {isAr ? 'أختامك وقسائم الخصم النقدية' : 'Digital stamps & vouchers'}
              </p>
            </div>
          </Link>

          <Link
            href="/account/addresses"
            className="p-5 bg-brand-charcoal border border-brand-border/80 hover:border-brand-gold rounded-xs transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-brand-black border border-brand-border/80 rounded-xs text-brand-gold group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </span>
              <span className="text-xl font-mono font-bold text-brand-gold">{customer.addresses?.length || 0}</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-ivory group-hover:text-brand-gold transition-colors">
                {isAr ? 'دفتر العناوين' : 'Address Book'}
              </h3>
              <p className="text-[11px] text-brand-cream/60 mt-1">
                {isAr ? 'عناوين التوصيل بمصر' : 'Saved Egypt addresses'}
              </p>
            </div>
          </Link>

          <Link
            href="/account/wishlist"
            className="p-5 bg-brand-charcoal border border-brand-border/80 hover:border-brand-gold rounded-xs transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-brand-black border border-brand-border/80 rounded-xs text-brand-gold group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5" />
              </span>
              <ArrowIcon className="w-4 h-4 text-brand-cream/40 group-hover:text-brand-gold" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-ivory group-hover:text-brand-gold transition-colors">
                {isAr ? 'قائمة المفضلة' : 'Wishlist'}
              </h3>
              <p className="text-[11px] text-brand-cream/60 mt-1">
                {isAr ? 'القطع المحفوظة للشراء لاحقاً' : 'Saved drop pieces'}
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
            <h3 className="text-base font-bold text-brand-ivory font-serif">
              {isAr ? 'آخر الطلبات المسجلة' : 'Recent Drop Orders'}
            </h3>
            <Link
              href="/account/orders"
              className="text-xs font-mono text-brand-gold hover:underline flex items-center space-x-1 rtl:space-x-reverse"
            >
              <span>{isAr ? 'عرض الكل' : 'View All'}</span>
              <ArrowIcon className="w-3 h-3" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-brand-cream/50 text-xs font-mono">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-brand-gold" />
              <p>{isAr ? 'لم تقم بطلب أي قطعة بعد' : 'No orders placed yet'}</p>
              <Link
                href="/#products"
                className="mt-3 inline-block px-4 py-2 bg-brand-gold text-brand-black font-bold uppercase rounded-xs text-[11px]"
              >
                {isAr ? 'استكشف تشكيلة الهوديز' : 'Explore Hoodies Drop'}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-brand-border/40">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="font-mono font-bold text-brand-gold text-xs">
                        {order.orderReference}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-stone/60 text-brand-ivory border border-brand-border">
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-brand-cream/60 mt-1">
                      {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')} • {order.items?.length || 0} {isAr ? 'قطع' : 'items'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <span className="font-mono font-bold text-sm text-brand-ivory">
                      {formatPrice(order.totalAmount)}
                    </span>
                    <Link
                      href={`/track-order?ref=${encodeURIComponent(order.orderReference)}`}
                      className="px-3 py-1.5 bg-brand-black border border-brand-border/80 hover:border-brand-gold text-[11px] font-mono text-brand-gold rounded-xs transition-colors"
                    >
                      {isAr ? 'تتبع الطلب' : 'Track Order'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
