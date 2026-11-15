'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  XCircle,
  HelpCircle,
} from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const { language, isRtl, formatPrice } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [searchInput, setSearchInput] = useState(initialRef);
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrder = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setOrder(data.orders[0]);
      } else {
        setOrder(null);
        setErrorMsg(
          isAr
            ? 'لم يتم العثور على طلب بهذا الرقم أو الهاتف. يرجى التأكد من كتابة الرقم بالشكل الصحيح.'
            : 'No matching order found for this reference or phone number.'
        );
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error tracking order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchOrder(initialRef);
    }
  }, [initialRef]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchInput);
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'delivered':
        return 4;
      case 'shipped':
        return 3;
      case 'processing':
        return 2;
      case 'confirmed':
        return 1;
      case 'pending':
        return 0;
      default:
        return 0;
    }
  };

  const stepIndex = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory py-10 sm:py-16 px-3 sm:px-6 lg:px-8 pb-28 sm:pb-16 selection:bg-brand-gold selection:text-brand-black">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block group mb-3">
            <span className="font-sans font-black text-2xl tracking-[0.25em] text-brand-ivory uppercase group-hover:text-brand-gold transition-colors">
              ATHEER
            </span>
            <span className="text-brand-gold font-light mx-2">/</span>
            <span className="font-arabic font-bold text-2xl text-brand-gold">أثير</span>
          </Link>
          <h1 className="text-3xl font-sans font-black text-brand-ivory tracking-tight">
            {isAr ? 'تتبع مسار شحنتك المباشر' : 'Live Order & Delivery Tracker'}
          </h1>
          <p className="text-xs text-brand-cream/60 font-mono">
            {isAr
              ? 'أدخل رقم الطلب (ATH-xxxxxx) أو رقم الهاتف لمتابعة موقع الشحنة وموعد وصول المندوب'
              : 'Enter order reference (ATH-xxxxxx) or phone number'}
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="bg-brand-charcoal border border-brand-border/80 rounded-xs p-3 shadow-luxury-dark flex items-center space-x-2 rtl:space-x-reverse">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
            <input
              type="text"
              required
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={isAr ? 'رقم الطلب (مثال: ATH-001092) أو رقم هاتفك...' : 'Order ref (e.g. ATH-001092) or phone...'}
              className="w-full bg-brand-stone/40 border-0 text-brand-ivory text-xs px-9 py-2.5 rounded-xs focus:ring-0 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-brand-gold hover:bg-brand-gold-hover text-brand-black font-mono text-xs uppercase font-bold tracking-wider rounded-xs transition-colors disabled:opacity-50"
          >
            {loading ? (isAr ? 'جاري البحث...' : 'Searching...') : (isAr ? 'تتبع الآن' : 'Track')}
          </button>
        </form>

        {errorMsg && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/40 text-rose-400 text-xs font-mono rounded-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Order Result Card */}
        {order && (
          <div className="bg-brand-charcoal border-2 border-brand-gold/70 rounded-xs p-6 sm:p-8 space-y-6 shadow-gold animate-fade-in">
            {/* Top Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-5">
              <div>
                <span className="text-[10px] font-mono text-brand-cream/50 uppercase block">
                  {isAr ? 'رقم الشحنة المعتمد' : 'Official Order Reference'}
                </span>
                <span className="font-mono font-black text-xl text-brand-gold">
                  {order.orderReference}
                </span>
              </div>

              <div className="text-start sm:text-end">
                <span className="text-[10px] font-mono text-brand-cream/50 uppercase block">
                  {isAr ? 'تاريخ الطلب' : 'Order Date'}
                </span>
                <span className="font-mono text-xs text-brand-ivory">
                  {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Pipeline Visual Stepper */}
            <div className="py-4">
              <div className="grid grid-cols-4 gap-2 text-center relative">
                {/* Step 1: Pending */}
                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      stepIndex >= 0
                        ? 'bg-brand-gold text-brand-black shadow-gold'
                        : 'bg-brand-stone/40 border border-brand-border text-brand-cream/40'
                    }`}
                  >
                    1
                  </div>
                  <span className="text-[11px] font-mono block font-bold text-brand-ivory">
                    {isAr ? 'تم استلام الطلب' : 'Received'}
                  </span>
                </div>

                {/* Step 2: Confirmed */}
                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      stepIndex >= 1
                        ? 'bg-brand-gold text-brand-black shadow-gold'
                        : 'bg-brand-stone/40 border border-brand-border text-brand-cream/40'
                    }`}
                  >
                    2
                  </div>
                  <span className="text-[11px] font-mono block font-bold text-brand-ivory">
                    {isAr ? 'تم التأكيد والتجهيز' : 'Processing'}
                  </span>
                </div>

                {/* Step 3: Shipped */}
                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      stepIndex >= 3
                        ? 'bg-brand-gold text-brand-black shadow-gold'
                        : 'bg-brand-stone/40 border border-brand-border text-brand-cream/40'
                    }`}
                  >
                    3
                  </div>
                  <span className="text-[11px] font-mono block font-bold text-brand-ivory">
                    {isAr ? 'مع مندوب الشحن' : 'In Transit'}
                  </span>
                </div>

                {/* Step 4: Delivered */}
                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      stepIndex >= 4
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-brand-stone/40 border border-brand-border text-brand-cream/40'
                    }`}
                  >
                    ✓
                  </div>
                  <span className="text-[11px] font-mono block font-bold text-brand-ivory">
                    {isAr ? 'تم التوصيل' : 'Delivered'}
                  </span>
                </div>
              </div>
            </div>

            {/* Inspection Trust Strip */}
            <div className="p-4 bg-brand-black/70 border border-brand-gold/40 rounded-xs flex items-center space-x-3 rtl:space-x-reverse">
              <ShieldCheck className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-brand-ivory block">
                  {isAr ? 'حق المعاينة الكاملة قبل الاستلام والدفع' : 'Open Box Inspection Guarantee'}
                </span>
                <span className="text-brand-cream/60 text-[11px]">
                  {isAr
                    ? 'يحق لك فتح الطرد مع المندوب والتأكد من المقاس وجودة القطن 500 GSM قبل دفع أي مبلغ.'
                    : 'Check your 500 GSM fabric and fit with the courier before paying.'}
                </span>
              </div>
            </div>

            {/* Order Items & Summary */}
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-brand-cream/80 font-bold">
                {isAr ? 'محتويات الشحنة:' : 'Order Contents:'}
              </h4>
              <div className="divide-y divide-brand-border/40 font-mono text-xs">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-brand-ivory font-bold">
                        {item.quantity}x {isAr ? item.product?.nameAr || item.product?.nameEn : item.product?.nameEn}
                      </span>
                      <span className="text-[10px] text-brand-cream/60 block mt-0.5">
                        {item.selectedSize} • {item.selectedColor}
                      </span>
                    </div>
                    <span className="font-bold text-brand-gold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-sm font-mono font-black">
                <span>{isAr ? 'إجمالي التحصيل عند الاستلام (COD):' : 'Total Payable on Delivery (COD):'}</span>
                <span className="text-brand-gold text-base">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* WhatsApp Concierge Contact */}
            <div className="pt-4 border-t border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-brand-cream/60 font-mono">
                {isAr ? 'هل تحتاج لمساعدة في موعد استلام شحنتك؟' : 'Need help with delivery timing?'}
              </span>

              <a
                href={`https://wa.me/201015993802?text=${encodeURIComponent(
                  `مرحباً دار أثير، أرغب بالاستفسار عن موعد توصيل طلبي رقم (${order.orderReference}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-xs flex items-center justify-center space-x-2 rtl:space-x-reverse transition-colors shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isAr ? 'تواصل واتساب مع الدار' : 'WhatsApp Concierge'}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-brand-black" />}>
      <TrackOrderContent />
    </React.Suspense>
  );
}
