'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading } = useCustomerAuth();
  const { language, isRtl, formatPrice } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/account/login?redirect=/account/orders');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (customer?.email) {
      fetch(`/api/orders?search=${encodeURIComponent(customer.email)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.orders)) {
            setOrders(d.orders);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [customer]);

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center font-mono text-xs text-brand-gold">
        {isAr ? 'جاري فتح الطلبات...' : 'Loading orders...'}
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { label: isAr ? 'تم التأكيد' : 'Confirmed', color: 'bg-blue-950/50 text-blue-400 border-blue-500/40' };
      case 'processing':
        return { label: isAr ? 'قيد التجهيز' : 'Processing', color: 'bg-amber-950/50 text-amber-400 border-amber-500/40' };
      case 'shipped':
        return { label: isAr ? 'تم الشحن مع المندوب' : 'Shipped', color: 'bg-purple-950/50 text-purple-400 border-purple-500/40' };
      case 'delivered':
        return { label: isAr ? 'تم التوصيل بنجاح' : 'Delivered', color: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40' };
      case 'cancelled':
        return { label: isAr ? 'ملغي' : 'Cancelled', color: 'bg-rose-950/50 text-rose-400 border-rose-500/40' };
      default:
        return { label: isAr ? 'قيد المراجعة' : 'Pending', color: 'bg-brand-stone text-brand-cream border-brand-border' };
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-gold selection:text-brand-black">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-cream/60">
          <Link href="/account" className="hover:text-brand-gold transition-colors">
            {isAr ? 'حسابي' : 'My Account'}
          </Link>
          <span>/</span>
          <span className="text-brand-gold font-bold">{isAr ? 'سجل الطلبات' : 'Order History'}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
          <div>
            <h1 className="text-2xl font-sans font-black text-brand-ivory">
              {isAr ? 'سجل طلبات الدار والفواتير' : 'Your Orders & Deliveries'}
            </h1>
            <p className="text-xs text-brand-cream/60 font-mono mt-1">
              {isAr ? 'تتبع مسار شحن الطلبات مع المندوب وضمان المعاينة قبل الاستلام' : 'Track live carrier progress with open box inspection'}
            </p>
          </div>

          <Link
            href="/track-order"
            className="px-4 py-2 bg-brand-charcoal border border-brand-gold/40 text-brand-gold text-xs font-mono font-bold rounded-xs hover:bg-brand-gold hover:text-brand-black transition-colors"
          >
            {isAr ? 'تتبع أي شحنة برقم الطلب' : 'Track By Reference'}
          </Link>
        </div>

        {/* Orders List */}
        {loadingOrders ? (
          <div className="text-center py-12 font-mono text-xs text-brand-gold">
            {isAr ? 'جاري استرجاع الطلبات...' : 'Fetching orders...'}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-brand-charcoal border border-brand-border/80 rounded-xs p-12 text-center space-y-4">
            <Package className="w-12 h-12 text-brand-gold/50 mx-auto" />
            <h3 className="text-base font-bold text-brand-ivory">
              {isAr ? 'لا توجد طلبات مسجلة على هذا الحساب بعد' : 'No orders recorded yet'}
            </h3>
            <p className="text-xs text-brand-cream/60 max-w-sm mx-auto">
              {isAr
                ? 'استكشف تشكيلات الهوديز والسويت شيرتات الشتوية الثقيلة واطلب قطعتك الأولى الآن.'
                : 'Explore our heavyweight winter drops and place your first streetwear order.'}
            </p>
            <Link
              href="/#products"
              className="inline-block px-6 py-2.5 bg-brand-gold text-brand-black text-xs font-bold uppercase rounded-xs tracking-wider shadow-gold"
            >
              {isAr ? 'تسوق المجموعة الافتتاحية' : 'Shop The Drop'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.orderStatus);

              return (
                <div
                  key={order.id}
                  className="bg-brand-charcoal border border-brand-border/80 rounded-xs p-6 space-y-4 shadow-luxury-dark"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/40 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="font-mono font-black text-base text-brand-gold">
                          {order.orderReference}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold uppercase ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-brand-cream/60 block">
                        {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="text-start sm:text-end">
                      <span className="text-base font-mono font-black text-brand-ivory block">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <span className="text-[10px] font-mono text-brand-cream/60">
                        {order.paymentMethod === 'cash_on_delivery'
                          ? (isAr ? 'الدفع عند الاستلام (COD)' : 'Cash on Delivery')
                          : order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="font-mono text-brand-gold font-bold">{item.quantity}x</span>
                          <span className="text-brand-ivory font-medium">
                            {isAr ? item.product?.nameAr || item.product?.nameEn : item.product?.nameEn}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-brand-stone/40 border border-brand-border text-brand-cream/70 rounded-xs">
                            {item.selectedSize} • {item.selectedColor}
                          </span>
                        </div>
                        <span className="font-mono text-brand-cream/80">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location & Notes */}
                  <div className="pt-3 border-t border-brand-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-brand-cream/70">
                    <div>
                      <span className="font-bold text-brand-ivory block">
                        {isAr ? 'عنوان التوصيل:' : 'Delivery Location:'}
                      </span>
                      <span className="text-[11px] text-brand-cream/60">
                        {order.governorate} — {order.shippingCity} ({order.shippingAddress})
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      {/* WhatsApp Support Direct Inquiry */}
                      <a
                        href={`https://wa.me/201015993802?text=${encodeURIComponent(
                          `مرحباً دار أثير، أستفسر بخصوص طلبي رقم (${order.orderReference}).`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50 text-[11px] font-mono rounded-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isAr ? 'واتساب الدار' : 'WhatsApp'}</span>
                      </a>

                      <Link
                        href={`/track-order?ref=${encodeURIComponent(order.orderReference)}`}
                        className="px-3 py-1.5 bg-brand-black border border-brand-border/80 hover:border-brand-gold text-[11px] font-mono text-brand-gold rounded-xs transition-colors"
                      >
                        {isAr ? 'تتبع الشحنة' : 'Track Order'}
                      </Link>
                    </div>
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
