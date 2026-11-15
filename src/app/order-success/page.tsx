'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { StoredOrder } from '@/data/localOrdersStore';
import {
  formatOrderWhatsAppMessage,
  getWhatsAppOrderUrl,
  DEFAULT_STORE_WHATSAPP,
} from '@/lib/whatsappUtils';
import {
  CheckCircle2,
  Package,
  Truck,
  Banknote,
  ArrowRight,
  ArrowLeft,
  Clock,
  MessageCircle,
  Copy,
  Check,
  Send,
  Phone,
  Share2,
} from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderRef = searchParams.get('ref');
  const isFromCheckout = searchParams.get('whatsapp') === '1';
  const { language, t, formatPrice, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [storeWhatsApp, setStoreWhatsApp] = useState<string>(DEFAULT_STORE_WHATSAPP);
  const [loading, setLoading] = useState(true);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  useEffect(() => {
    // 1. Fetch store settings to get the dynamic WhatsApp number
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings?.whatsappNumber) {
          setStoreWhatsApp(data.settings.whatsappNumber);
        }
      })
      .catch((e) => console.error('Failed to load store settings:', e));

    // 2. Fetch order details
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

  // Compute WhatsApp URLs using the shared utility
  const whatsappUrlStore = order
    ? getWhatsAppOrderUrl(order, 'store', storeWhatsApp, language as 'ar' | 'en')
    : `https://wa.me/${storeWhatsApp}?text=${encodeURIComponent(
        language === 'ar'
          ? `مرحباً دار أثير، أود الاستفسار عن طلبي برقم ${orderRef || ''}`
          : `Greetings ATHEER, I would like to inquire about my order reference ${orderRef || ''}`
      )}`;

  const whatsappUrlCustomer = order
    ? getWhatsAppOrderUrl(order, 'customer', storeWhatsApp, language as 'ar' | 'en')
    : '#';

  // Prominent WhatsApp button available on screen for user to click voluntarily without intrusive auto-popup
  const handleCopyInvoice = () => {
    if (!order) return;
    const msg = formatOrderWhatsAppMessage(order, language as 'ar' | 'en');
    navigator.clipboard.writeText(msg).then(() => {
      setCopiedInvoice(true);
      setTimeout(() => setCopiedInvoice(false), 3000);
    });
  };

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full">
      {/* Success Header */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center mb-5 shadow-gold">
          <CheckCircle2 className="w-9 h-9 stroke-[2]" />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] text-brand-gold font-mono font-bold block mb-2">
          {language === 'ar' ? 'تم تأكيد وحفظ الطلب بنجاح' : 'ORDER CONFIRMED & REGISTERED'}
        </span>

        <h1 className="font-sans font-black text-3xl sm:text-5xl uppercase tracking-tight text-brand-ivory mb-3">
          {language === 'ar' ? 'شكراً لاختيارك دار أثير' : 'Thank You For Choosing ATHEER'}
        </h1>

        <p className="text-sm text-brand-cream/80 max-w-lg mx-auto font-light leading-relaxed">
          {language === 'ar'
            ? 'تم تسجيل طلبك وتجهيزه للشحن السريع في مصر. سيتواصل معك مندوب التوصيل للتسليم والدفع نقداً أو بالبطاقة عند الاستلام.'
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

      {/* PROMINENT WHATSAPP RECEIPT & DISPATCH CARD */}
      <div className="mb-10 p-6 sm:p-7 bg-gradient-to-br from-emerald-950/70 via-brand-charcoal to-brand-charcoal border-2 border-emerald-500/80 rounded-sm shadow-2xl relative overflow-hidden animate-slide-down">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4 rtl:space-x-reverse text-center md:text-start rtl:md:text-right">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-lg">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{language === 'ar' ? '⚡ تم إرسال إشعار طلبك آلياً للإدارة' : '⚡ ORDER AUTO-DISPATCHED TO MANAGEMENT'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {language === 'ar' ? 'طلبك قيد المراجعة الفورية — تم إشعارنا تلقائياً' : 'Your Order is in Review — Auto-Notified to ATHEER'}
              </h3>
              <p className="text-xs text-brand-cream/80 mt-1 max-w-lg leading-relaxed">
                {language === 'ar'
                  ? 'تم تسجيل طلبك وإرسال تفاصيله تلقائياً إلى إدارة أثير عبر الواتساب الآلي للبدء فوراً في التجهيز. لا يلزمك الضغط على أي زر لتأكيد الطلب؛ وسيقوم فريق العمل بالتواصل معك هاتفياً قبل خروج المندوب للتسليم والدفع عند الاستلام.'
                  : 'Your order details have been automatically transmitted to ATHEER management via our server automation. No further action is required from you. Our team will contact you prior to courier delivery.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto flex-shrink-0">
            {/* Primary Action: Direct Customer Service Concierge */}
            <a
              href={whatsappUrlStore}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xs flex items-center justify-center space-x-2 rtl:space-x-reverse transition-all shadow-lg hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{language === 'ar' ? 'محادثة خدمة العملاء (اختياري)' : 'Contact Support via WhatsApp (Optional)'}</span>
            </a>

            {/* Secondary Action: Send copy to customer's own phone */}
            {order && (
              <a
                href={whatsappUrlCustomer}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-brand-stone/80 hover:bg-brand-stone text-brand-cream/90 hover:text-white border border-brand-border text-[11px] font-mono rounded-xs flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors"
                title={language === 'ar' ? 'فتح الفاتورة على رقم هاتفك الشخصي' : 'Open invoice on your phone'}
              >
                <Phone className="w-3.5 h-3.5 text-brand-gold" />
                <span>{language === 'ar' ? 'نسخة الفاتورة إلى رقمي' : 'Send Copy to My Number'}</span>
              </a>
            )}

            {/* Tertiary: Copy full invoice */}
            {order && (
              <button
                onClick={handleCopyInvoice}
                className="px-4 py-1.5 bg-brand-charcoal hover:bg-brand-stone text-brand-cream/70 hover:text-brand-ivory border border-brand-border/60 text-[10px] font-mono rounded-xs flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors"
              >
                {copiedInvoice ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">
                      {language === 'ar' ? 'تم نسخ الفاتورة!' : 'Invoice Copied!'}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{language === 'ar' ? 'نسخ نص الفاتورة بالكامل' : 'Copy Full Invoice Text'}</span>
                  </>
                )}
              </button>
            )}
          </div>
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
              {language === 'ar' ? 'حالة الطلب: مؤكد ومسجل' : 'Status: Confirmed'}
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
              <span className="font-bold text-brand-ivory">
                {order.governorate ? `${order.governorate} — ` : ''}
                {order.shippingCity}, {order.shippingCountry}
              </span>
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
                      {item.selectedSize} • {item.quantity}x • {item.gsm} {language === 'ar' ? 'جم/م²' : 'GSM'} • {item.selectedColor}
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
            {order.discountAmount ? (
              <div className="flex justify-between text-emerald-400">
                <span>{language === 'ar' ? 'كود الخصم:' : 'Discount:'} ({order.couponCode})</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            ) : null}
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
          href={whatsappUrlStore}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-emerald-500/80 text-emerald-400 hover:bg-emerald-500 hover:text-black text-xs font-bold uppercase tracking-widest transition-colors font-mono"
        >
          <MessageCircle className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
          <span>{language === 'ar' ? 'تواصل عبر واتساب المتجر' : 'WhatsApp Support'}</span>
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
