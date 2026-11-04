'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { StoredOrder } from '@/data/localOrdersStore';
import {
  CheckCircle2,
  Package,
  Truck,
  Banknote,
  ArrowRight,
  ArrowLeft,
  Clock,
  MessageCircle,
} from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderRef = searchParams.get('ref');
  const { language, t, formatPrice, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderRef) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderRef}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (e) {
        console.error('Failed to fetch order', e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderRef]);

  const whatsappMessage = encodeURIComponent(
    language === 'ar'
      ? `مرحباً دار أثير، أود الاستفسار عن طلبي برقم ${orderRef || ''}`
      : `Greetings ATHEER, I would like to inquire about my order reference ${orderRef || ''}`
  );
  const whatsappUrl = `https://wa.me/966500000000?text=${whatsappMessage}`;

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full">
      {/* Success Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center mb-5 shadow-gold">
          <CheckCircle2 className="w-9 h-9 stroke-[2]" />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] text-brand-gold font-mono font-bold block mb-2">
          {language === 'ar' ? 'تم تأكيد الطلب بنجاح' : 'ORDER CONFIRMED & REGISTERED'}
        </span>

        <h1 className="font-sans font-black text-3xl sm:text-5xl uppercase tracking-tight text-brand-ivory mb-3">
          {language === 'ar' ? 'شكراً لاختيارك دار أثير' : 'Thank You For Choosing ATHEER'}
        </h1>

        <p className="text-sm text-brand-cream/80 max-w-lg mx-auto font-light leading-relaxed">
          {language === 'ar'
            ? 'تم تسجيل طلبك وتجهيزه للشحن السريع. سيتواصل معك مندوب التوصيل للتسليم والدفع نقداً أو بالبطاقة عند الاستلام.'
            : 'Your order has been registered on our servers. The courier will contact you upon arrival for Cash on Delivery.'}
        </p>

        {/* Reference Badge */}
        <div className="mt-6 inline-block p-3 px-6 bg-brand-charcoal border border-brand-gold/60 font-mono">
          <span className="text-xs text-brand-cream/60 uppercase block mb-1">
            {language === 'ar' ? 'رقم تتبع الطلب الخاص بك' : 'Your Order Reference'}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-brand-gold tracking-wider">
            {orderRef || 'ATH-2026-CONFIRMED'}
          </span>
        </div>
      </div>

      {/* Order Details Card */}
      {order && (
        <div className="p-6 sm:p-8 bg-brand-charcoal border border-brand-border space-y-6 animate-slide-down mb-10">
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse font-mono text-xs">
              <Package className="w-4 h-4 text-brand-gold" />
              <span className="font-bold text-brand-ivory">
                {language === 'ar' ? 'تفاصيل الشحنة' : 'Shipment Package'}
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
              {language === 'ar' ? 'حالة الطلب: مؤكد' : 'Status: Confirmed'}
            </span>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono p-4 bg-brand-black border border-brand-border/60">
            <div>
              <span className="text-brand-cream/60 block mb-1">
                {language === 'ar' ? 'المستلم:' : 'Recipient:'}
              </span>
              <span className="font-bold text-brand-ivory text-sm">{order.customerName}</span>
              <span className="block text-brand-cream/80 mt-1">{order.customerPhone}</span>
            </div>

            <div>
              <span className="text-brand-cream/60 block mb-1">
                {language === 'ar' ? 'عنوان التوصيل:' : 'Delivery Destination:'}
              </span>
              <span className="font-bold text-brand-ivory">{order.shippingCity}, {order.shippingCountry}</span>
              <span className="block text-brand-cream/80 mt-1">{order.shippingAddress}</span>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-brand-border/40">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div>
                    <p className="font-bold text-brand-ivory">
                      {language === 'ar' ? item.productNameAr : item.productNameEn}
                    </p>
                    <p className="text-[11px] text-brand-cream/70 font-mono">
                      {item.selectedSize} • {item.quantity}x • {item.gsm} GSM • {item.selectedColor}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-brand-gold">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Financials */}
          <div className="pt-4 border-t border-brand-border/60 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-brand-cream/70">
              <span>{language === 'ar' ? 'المجموع الجزئي:' : 'Subtotal:'}</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-brand-cream/70">
              <span>{language === 'ar' ? 'رسوم الشحن:' : 'Shipping Fee:'}</span>
              <span>
                {order.shippingFee === 0
                  ? language === 'ar' ? 'مجاني' : 'FREE'
                  : formatPrice(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-brand-border text-brand-gold">
              <span>{language === 'ar' ? 'المبلغ المطلوب عند الاستلام:' : 'Total Payable on Delivery:'}</span>
              <span className="text-xl">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Payment COD Status */}
          <div className="p-3 bg-brand-black border border-brand-border flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-gold">
              <Banknote className="w-4 h-4" />
              <span>{language === 'ar' ? 'الدفع نقداً أو بالبطاقة عند الاستلام' : 'Cash on Delivery (Pending Courier Arrival)'}</span>
            </div>
            <span className="text-[10px] uppercase text-emerald-400 font-bold">
              {order.paymentStatus}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-widest hover:bg-brand-gold-hover transition-colors font-mono shadow-gold"
        >
          <span>{language === 'ar' ? 'العودة للمتجر الرئيسي' : 'Return to Home Store'}</span>
          <ArrowIcon className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
        </Link>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-brand-gold/60 text-brand-gold hover:bg-brand-gold hover:text-brand-black text-xs font-bold uppercase tracking-widest transition-colors font-mono"
        >
          <MessageCircle className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
          <span>{language === 'ar' ? 'استفسار عبر واتساب عن الطلب' : 'WhatsApp Support'}</span>
        </a>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory flex flex-col">
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-32 text-brand-gold font-mono text-sm">
            Loading order details...
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
