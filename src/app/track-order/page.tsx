'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { BackButton } from '@/components/BackButton';
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
  AlertCircle,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Check,
  X,
  FileText,
  BadgeCheck,
} from 'lucide-react';

interface OrderItem {
  productId: string;
  productNameEn: string;
  productNameAr: string;
  selectedSize: string;
  selectedColor: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  image?: string;
  gsm?: number;
}

interface OrderRecord {
  id: string;
  orderReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingCountry?: string;
  governorate?: string;
  shippingCity: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  discountAmount?: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery =
    searchParams.get('ref') ||
    searchParams.get('phone') ||
    searchParams.get('email') ||
    searchParams.get('q') ||
    '';

  const { language, isRtl, formatPrice } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick recent order from localStorage if available
  const [recentOrderRef, setRecentOrderRef] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRef = localStorage.getItem('atheer_last_order_ref');
      if (savedRef) {
        setRecentOrderRef(savedRef);
      }
    }
  }, []);

  const fetchOrders = async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setLoading(true);
    setErrorMsg(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(cleanQuery)}&_t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setOrders(data.orders);
        setSelectedOrder(data.orders[0]); // Select most recent by default
      } else {
        setOrders([]);
        setSelectedOrder(null);
        setErrorMsg(
          isAr
            ? 'لم يتم العثور على أي طلبات مطابقة لرقم الهاتف أو البريد أو رقم الطلب الذي أدخلته. يرجى مراجعة البيانات والمحاولة مجدداً.'
            : 'No matching orders found for this phone number, email, or order reference. Please verify and try again.'
        );
      }
    } catch (e: any) {
      setOrders([]);
      setSelectedOrder(null);
      setErrorMsg(e.message || (isAr ? 'حدث خطأ في الاتصال بالخادم.' : 'Error contacting server.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchOrders(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setOrders([]);
    setSelectedOrder(null);
    setSearched(false);
    setErrorMsg(null);
  };

  // Status mapping: Where is the order now ("وصل في شنو") and what remains ("فاضل له شنو")
  const getStatusInsights = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          stepIndex: 0,
          titleAr: 'قيد استلام ومراجعة الطلب',
          titleEn: 'Order Received & Under Review',
          badgeBg: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
          // وصل في شنو
          currentStageAr:
            'تم تسجيل طلبك بنجاح وحجز القطع في مخزن الأتيليه، وجاري مراجعته من فريق خدمة العملاء للتأكيد.',
          currentStageEn:
            'Your order has been recorded and pieces reserved in our atelier inventory. Customer care is currently reviewing details.',
          // فاضل له شنو
          remainingStageAr:
            'متبقي: تأكيد موعد التوصيل معك، فحص جودة النسيج وتغليف الطرد، ثم تسليمه لمندوب الشحن للخروج به إلى محافظتك.',
          remainingStageEn:
            'Remaining: Order phone/WhatsApp confirmation, 500 GSM fabric quality check, packaging, and hand-off to the regional courier.',
          nextActionAdviceAr:
            'كن جاهزاً لتلقي مكالمة أو رسالة واتساب لتأكيد جاهزية العنوان والشحن.',
          nextActionAdviceEn:
            'Keep your phone accessible for a confirmation message or call from our concierge team.',
          estimatedTimeAr: 'التأكيد خلال ساعتين إلى ٤ ساعات عمل',
          estimatedTimeEn: 'Confirmation within 2 to 4 business hours',
        };

      case 'confirmed':
        return {
          stepIndex: 1,
          titleAr: 'تم التأكيد وفحص الجودة بالأتيليه',
          titleEn: 'Confirmed & Quality Check',
          badgeBg: 'bg-blue-950/60 border-blue-500/40 text-blue-300',
          // وصل في شنو
          currentStageAr:
            'تم تأكيد الطلب رسمياً واجتياز القطع فحص الجودة لمعايير نسيج القطن الثقيل ٥٠٠ جم/م² ودقة التقفيل والخياطة.',
          currentStageEn:
            'Order confirmed. Garments have passed our 500 GSM heavyweight fabric finishing and craftsmanship inspection.',
          // فاضل له شنو
          remainingStageAr:
            'متبقي: إصدار بوليصة الشحن، وضع الطرد في علبة أثير الفاخرة، وتسليمه للمندوب للانطلاق إلى وجهتك.',
          remainingStageEn:
            'Remaining: Courier shipping waybill generation, luxury boxed packaging, and dispatch handover.',
          nextActionAdviceAr:
            'الطلب في مرحلة التجهيز النهائي وسينطلق مع شركة الشحن اليوم.',
          nextActionAdviceEn:
            'Final packaging is underway and the shipment will be handed to the courier today.',
          estimatedTimeAr: 'التسليم للمندوب خلال اليوم',
          estimatedTimeEn: 'Courier dispatch within 24 hours',
        };

      case 'processing':
        return {
          stepIndex: 1,
          titleAr: 'قيد التجهيز والتغليف للشحن',
          titleEn: 'Packed & Awaiting Courier',
          badgeBg: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
          // وصل في شنو
          currentStageAr:
            'تم تغليف طلبك بالكامل داخل العبوة الرسمية، وطباعة بوليصة الشحن الخاصة بعنوانك، وهو الآن في انتظار استلام المندوب.',
          currentStageEn:
            'Your pieces are fully boxed with official shipping labels attached, awaiting courier route pick-up.',
          // فاضل له شنو
          remainingStageAr:
            'متبقي: استلام مندوب الشحن للشحنة وبدء خط سير الرحلة والتوصيل المباشر إلى باب بيتك.',
          remainingStageEn:
            'Remaining: Driver route departure and direct door-to-door transit to your address.',
          nextActionAdviceAr:
            'الشحنة جاهزة ومعدة للانطلاق إلى محافظتك فوراً.',
          nextActionAdviceEn:
            'Your parcel is ready for immediate dispatch to your governorate.',
          estimatedTimeAr: 'الانطلاق مع المندوب خلال ساعات قليلة',
          estimatedTimeEn: 'Handover to courier within hours',
        };

      case 'shipped':
        return {
          stepIndex: 2,
          titleAr: 'الشحنة خرجت مع المندوب وفي الطريق إليك',
          titleEn: 'Out for Delivery / In Transit',
          badgeBg: 'bg-brand-gold/20 border-brand-gold text-brand-gold font-bold',
          // وصل في شنو
          currentStageAr:
            'الشحنة غادرت الأتيليه بالفعل وهي الآن في عهدة مندوب الشحن وفي طريقها المباشر إلى عنوانك بمحافظتك.',
          currentStageEn:
            'Parcel has departed our Cairo atelier and is currently in transit with the regional delivery courier en route to your address.',
          // فاضل له شنو
          remainingStageAr:
            'متبقي خطوة واحدة فقط: وصول المندوب لباب بيتك، فتح الطرد ومعاينة جودة النسيج والمقاس، ثم سداد المبلغ كاش عند الاستلام.',
          remainingStageEn:
            'Only one final step remaining: Courier doorstep arrival, open-box inspection of fabric & fit, and cash payment on delivery.',
          nextActionAdviceAr:
            'يرجى التأكد من إتاحة الهاتف للرد على مندوب الشحن وتجهيز المبلغ المطلوب كاش.',
          nextActionAdviceEn:
            'Please ensure your phone is reachable and have the exact cash amount ready for the driver.',
          estimatedTimeAr: 'خلال ٢٤ إلى ٤٨ ساعة كحد أقصى',
          estimatedTimeEn: 'Within 24 to 48 hours maximum',
        };

      case 'delivered':
        return {
          stepIndex: 3,
          titleAr: 'تم التوصيل والاستلام بنجاح',
          titleEn: 'Delivered & Completed',
          badgeBg: 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 font-bold',
          // وصل في شنو
          currentStageAr:
            'تم تسليم الشحنة للعميل بنجاح، وإجراء المعاينة، وسداد المبلغ للمندوب. مبارك عليك قطع أثير الفاخرة!',
          currentStageEn:
            'Delivered successfully! Open-box inspection completed and COD payment collected. Enjoy your bespoke ATHEER drop!',
          // فاضل له شنو
          remainingStageAr:
            'متبقي لك كامل حقوقك في خدمة ما بعد البيع: حق الاستبدال أو الاسترجاع المجاني خلال ١٤ يوماً في أي وقت، وإضافة نقاط الولاء لحسابك.',
          remainingStageEn:
            'All post-purchase guarantees active: 14-day free exchange/return window and ATHEER loyalty rewards added.',
          nextActionAdviceAr:
            'في حال احتجت لأي مساعدة أو تبديل للمقاس، فريق الكونسيرج متاح لك على مدار الساعة عبر الواتساب.',
          nextActionAdviceEn:
            'Should you need a size exchange or care assistance, our concierge is available 24/7 on WhatsApp.',
          estimatedTimeAr: 'اكتمل بنجاح',
          estimatedTimeEn: 'Completed',
        };

      case 'cancelled':
        return {
          stepIndex: -1,
          titleAr: 'تم إلغاء الطلب',
          titleEn: 'Order Cancelled',
          badgeBg: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
          currentStageAr:
            'تم إلغاء هذا الطلب بناءً على رغبة العميل أو عدم إمكانية الوصول للعنوان.',
          currentStageEn:
            'This order was cancelled per customer request or unreachable address.',
          remainingStageAr:
            'الطلب ملغي. يمكنك إعادة الطلب في أي وقت من المتجر أو التواصل مع خدمة العملاء.',
          remainingStageEn:
            'Order cancelled. You can place a new order anytime or contact our concierge.',
          nextActionAdviceAr:
            'تواصل معنا عبر الواتساب إذا كنت ترغب في إعادة تفعيل الطلب وتأكيد البيانات.',
          nextActionAdviceEn:
            'Reach out via WhatsApp if you wish to reactivate or update delivery details.',
          estimatedTimeAr: 'ملغي',
          estimatedTimeEn: 'Cancelled',
        };

      default:
        return {
          stepIndex: 0,
          titleAr: 'قيد المراجعة',
          titleEn: 'Pending Review',
          badgeBg: 'bg-stone-900 border-stone-700 text-stone-300',
          currentStageAr: 'الطلب مسجل في النظام وجاري تحديث حالته.',
          currentStageEn: 'Order recorded, status updating.',
          remainingStageAr: 'متبقي مراجعة الطلب والشحن.',
          remainingStageEn: 'Awaiting dispatch confirmation.',
          nextActionAdviceAr: 'ترقب تحديث الحالة قريباً.',
          nextActionAdviceEn: 'Status update coming shortly.',
          estimatedTimeAr: 'قريباً',
          estimatedTimeEn: 'Soon',
        };
    }
  };

  const insights = selectedOrder ? getStatusInsights(selectedOrder.orderStatus) : null;

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory py-8 sm:py-14 px-3 sm:px-6 lg:px-8 pb-28 sm:pb-16 selection:bg-brand-gold selection:text-brand-black">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Navigation & Back Action */}
        <div className="flex items-center justify-between">
          <BackButton
            label={isAr ? 'رجوع للخطوة السابقة' : 'Back to previous'}
            fallbackUrl="/"
          />
        </div>

        {/* Brand Hallmark & Page Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center justify-center space-x-2.5 rtl:space-x-reverse group mb-2">
            <img src="/images/atheer-emblem-transparent.png" alt="ATHEER" className="w-8 h-8 object-contain filter drop-shadow group-hover:scale-105 transition-transform" />
            <span className="font-sans font-black text-2xl sm:text-3xl tracking-[0.25em] text-brand-ivory uppercase group-hover:text-brand-gold transition-colors">
              ATHEER
            </span>
            <span className="text-brand-gold font-light mx-2 text-2xl">/</span>
            <span className="font-arabic font-bold text-2xl sm:text-3xl text-brand-gold">أثير</span>
          </Link>

          <h1 className="text-2xl sm:text-4xl font-sans font-black text-brand-ivory tracking-tight">
            {isAr ? 'تتبع مسار شحنتك المباشر' : 'Live Order & Delivery Tracker'}
          </h1>

          <p className="text-xs sm:text-sm text-brand-cream/70 font-light max-w-xl mx-auto leading-relaxed">
            {isAr
              ? 'اكتب رقم هاتفك المحمول (010...) أو بريدك الإلكتروني أو رقم الطلب (ATH-...) لمعرفة أين وصل طلبك الآن وماذا تبقى على استلامه.'
              : 'Enter your mobile phone number, email address, or order reference (ATH-...) to see your shipment status and next steps.'}
          </p>
        </div>

        {/* Universal Search Form (Phone, Email, Order ID) */}
        <div className="bg-brand-charcoal border-2 border-brand-gold/60 rounded-xs p-4 sm:p-5 shadow-gold space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3.5 text-brand-gold" />
              <input
                type="text"
                required
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={
                  isAr
                    ? 'رقم هاتفك (010...) أو بريدك الإلكتروني أو رقم الطلب (ATH-...)'
                    : 'Your phone (010...), email, or order reference (ATH-...)'
                }
                className="w-full bg-brand-stone/50 border border-brand-border text-brand-ivory text-xs sm:text-sm px-10 py-3 rounded-xs focus:outline-none focus:border-brand-gold font-mono placeholder:text-brand-cream/40"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-brand-cream/40 hover:text-brand-ivory p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-brand-gold hover:bg-brand-gold-hover text-brand-black font-mono text-xs sm:text-sm uppercase font-bold tracking-wider rounded-xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 rtl:space-x-reverse shrink-0 shadow-gold"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? (isAr ? 'جاري البحث...' : 'Searching...') : (isAr ? 'تتبع الطلب' : 'Track Order')}</span>
            </button>
          </form>

          {/* Quick Search Helper & Recent Order Button */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-brand-cream/60 font-mono gap-2 pt-1 border-t border-brand-border/40">
            <span>
              {isAr
                ? '💡 يمكنك البحث برقم الموبايل المسجل لمعرفة مكان شحنتك فوراً'
                : '💡 You can search by your mobile number to instantly track your order'}
            </span>

            {recentOrderRef && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput(recentOrderRef);
                  fetchOrders(recentOrderRef);
                }}
                className="text-brand-gold hover:underline flex items-center space-x-1 rtl:space-x-reverse font-bold"
              >
                <span>{isAr ? 'آخر طلب قمت به:' : 'Your last order:'}</span>
                <span className="font-mono bg-brand-black px-1.5 py-0.5 rounded-xs border border-brand-gold/40">
                  {recentOrderRef}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Error Feedback */}
        {errorMsg && (
          <div className="p-4 bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs sm:text-sm font-mono rounded-xs text-center flex items-center justify-center space-x-2 rtl:space-x-reverse animate-fade-in shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Multi-Order Tabs Selector (When search by phone/email returns multiple orders) */}
        {orders.length > 1 && (
          <div className="bg-brand-charcoal/90 border border-brand-border/80 rounded-xs p-4 space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-brand-cream/70 font-mono">
              <span className="font-bold text-brand-gold">
                {isAr
                  ? `عثرنا على ${orders.length} طلبات مسجلة بهذه البيانات:`
                  : `Found ${orders.length} orders registered with this contact:`}
              </span>
              <span>{isAr ? 'اختر طلباً لعرض تفاصيله' : 'Select an order to view details'}</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {orders.map((o) => {
                const isSelected = selectedOrder?.id === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedOrder(o)}
                    className={`px-3.5 py-2 rounded-xs text-xs font-mono transition-all shrink-0 border text-start ${
                      isSelected
                        ? 'bg-brand-gold text-brand-black border-brand-gold font-bold shadow-gold'
                        : 'bg-brand-stone/50 hover:bg-brand-stone border-brand-border text-brand-cream/80'
                    }`}
                  >
                    <span className="block">{o.orderReference}</span>
                    <span className="text-[10px] opacity-80 block mt-0.5">
                      {formatPrice(o.totalAmount)} • {new Date(o.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Order Details & Pipeline Showcase */}
        {selectedOrder && insights && (
          <div className="bg-brand-charcoal border-2 border-brand-gold/70 rounded-xs p-5 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
            {/* Order Reference & Date Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-5">
              <div>
                <span className="text-[10px] font-mono text-brand-cream/50 uppercase tracking-wider block">
                  {isAr ? 'رقم الشحنة المعتمد' : 'Official Order Reference'}
                </span>
                <span className="font-mono font-black text-xl sm:text-2xl text-brand-gold tracking-wide">
                  {selectedOrder.orderReference}
                </span>
              </div>

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className={`px-3 py-1.5 rounded-xs text-xs font-mono border ${insights.badgeBg}`}>
                  {isAr ? insights.titleAr : insights.titleEn}
                </div>

                <div className="text-end hidden sm:block">
                  <span className="text-[10px] font-mono text-brand-cream/50 uppercase block">
                    {isAr ? 'تاريخ الطلب' : 'Order Date'}
                  </span>
                  <span className="font-mono text-xs text-brand-ivory">
                    {new Date(selectedOrder.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* KEY USER REQUIREMENT: Two Highlighted Cards — "طلبك وصل في شنو" و "فاضل له شنو" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: وصل في شنو (Current Completed Stage) */}
              <div className="p-4 sm:p-5 rounded-xs bg-brand-stone/40 border-2 border-emerald-500/50 space-y-2.5 relative overflow-hidden">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-400">
                  <div className="p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-brand-ivory font-serif">
                    {isAr ? '📍 أين وصل طلبك الآن؟' : 'Current Order Location & Stage'}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-brand-cream/90 leading-relaxed font-sans">
                  {isAr ? insights.currentStageAr : insights.currentStageEn}
                </p>

                <div className="pt-2 border-t border-brand-border/40 text-[11px] font-mono text-emerald-300/90 flex items-center space-x-1.5 rtl:space-x-reverse">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isAr ? 'الموعد المتوقع: ' : 'Estimated timing: '}
                    {isAr ? insights.estimatedTimeAr : insights.estimatedTimeEn}
                  </span>
                </div>
              </div>

              {/* Box 2: فاضل له شنو (What Remains / Next Steps) */}
              <div className="p-4 sm:p-5 rounded-xs bg-brand-stone/40 border-2 border-brand-gold/60 space-y-2.5 relative overflow-hidden">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-gold">
                  <div className="p-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30">
                    <Truck className="w-5 h-5 text-brand-gold" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-brand-ivory font-serif">
                    {isAr ? '⏳ ماذا تبقى لإتمام طلبك؟' : 'Remaining Steps to Complete'}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-brand-cream/90 leading-relaxed font-sans">
                  {isAr ? insights.remainingStageAr : insights.remainingStageEn}
                </p>

                <div className="pt-2 border-t border-brand-border/40 text-[11px] font-mono text-brand-gold/90 flex items-center space-x-1.5 rtl:space-x-reverse">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{isAr ? insights.nextActionAdviceAr : insights.nextActionAdviceEn}</span>
                </div>
              </div>
            </div>

            {/* Visual 4-Step Pipeline Stepper */}
            <div className="py-4 border-t border-b border-brand-border/60">
              <div className="grid grid-cols-4 gap-2 text-center relative">
                {/* Step 1: استلام الطلب */}
                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      insights.stepIndex >= 0
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-brand-stone/40 border border-brand-border text-brand-cream/40'
                    }`}
                  >
                    ✓
                  </div>
                  <span className="text-[11px] font-mono block font-bold text-brand-ivory">
                    {isAr ? 'استلام الطلب' : 'Received'}
                  </span>
                  <span className="text-[9px] text-brand-cream/50 block">
                    {insights.stepIndex >= 0 ? (isAr ? 'مكتمل' : 'Done') : ''}
                  </span>
                </div>

                {/* Step 2: فحص النسيج والتجهيز */}
                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      insights.stepIndex > 1
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : insights.stepIndex === 1
                        ? 'bg-brand-gold text-brand-black shadow-gold ring-4 ring-brand-gold/20 animate-pulse'
                        : 'bg-brand-stone/40 border border-brand-border text-brand-cream/40'
                    }`}
                  >
                    {insights.stepIndex > 1 ? '✓' : '2'}
                  </div>
                  <span className="text-[11px] font-mono block font-bold text-brand-ivory">
                    {isAr ? 'فحص النسيج والتجهيز' : 'Quality & Prep'}
                  </span>
                  <span className="text-[9px] text-brand-cream/50 block">
                    {insights.stepIndex > 1
                      ? isAr
                        ? 'مكتمل'
                        : 'Done'
                      : insights.stepIndex === 1
                      ? isAr
                        ? 'جاري الآن'
                        : 'In Progress'
                      : isAr
                      ? 'متبقي'
                      : 'Pending'}
                  </span>
                </div>

                {/* Step 3: مع المندوب بالطريق */}
                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      insights.stepIndex > 2
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : insights.stepIndex === 2
                        ? 'bg-brand-gold text-brand-black shadow-gold ring-4 ring-brand-gold/20 animate-pulse'
                        : 'bg-brand-stone/40 border border-brand-border text-brand-cream/40'
                    }`}
                  >
                    {insights.stepIndex > 2 ? '✓' : '3'}
                  </div>
                  <span className="text-[11px] font-mono block font-bold text-brand-ivory">
                    {isAr ? 'مع المندوب بالطريق' : 'With Courier'}
                  </span>
                  <span className="text-[9px] text-brand-cream/50 block">
                    {insights.stepIndex > 2
                      ? isAr
                        ? 'مكتمل'
                        : 'Done'
                      : insights.stepIndex === 2
                      ? isAr
                        ? 'في الطريق إليك'
                        : 'Out for Delivery'
                      : isAr
                      ? 'متبقي'
                      : 'Upcoming'}
                  </span>
                </div>

                {/* Step 4: المعاينة والاستلام كاش */}
                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      insights.stepIndex >= 3
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-brand-stone/40 border border-brand-border text-brand-cream/40'
                    }`}
                  >
                    {insights.stepIndex >= 3 ? '✓' : '4'}
                  </div>
                  <span className="text-[11px] font-mono block font-bold text-brand-ivory">
                    {isAr ? 'المعاينة والاستلام' : 'Delivery & COD'}
                  </span>
                  <span className="text-[9px] text-brand-cream/50 block">
                    {insights.stepIndex >= 3 ? (isAr ? 'مكتمل' : 'Delivered') : isAr ? 'المرحلة الأخيرة' : 'Final Step'}
                  </span>
                </div>
              </div>
            </div>

            {/* Caesar Open-Box Inspection Trust Strip */}
            <div className="p-4 bg-brand-black/80 border border-brand-gold/50 rounded-xs flex items-center space-x-3.5 rtl:space-x-reverse shadow-inner">
              <ShieldCheck className="w-6 h-6 text-brand-gold shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-brand-ivory block text-sm">
                  {isAr ? 'ضمان المعاينة الكاملة قبل الاستلام والدفع' : 'Open Box Inspection Guarantee'}
                </span>
                <span className="text-brand-cream/70 text-[11px] leading-relaxed block mt-0.5">
                  {isAr
                    ? 'يحق لك فتح الطرد مع المندوب والتأكد من المقاس وجودة النسيج ٥٠٠ جم/م² قبل سداد أي مبلغ كاش للمندوب.'
                    : 'You have full rights to inspect the 500 GSM fabric and fit with the courier prior to paying.'}
                </span>
              </div>
            </div>

            {/* Order Items & Financial Summary */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-brand-gold font-bold">
                  {isAr ? 'محتويات الشحنة والقطع المطلوبة:' : 'Shipped Pieces & Contents:'}
                </h4>
                <span className="text-[11px] text-brand-cream/50 font-mono">
                  {selectedOrder.shippingCity ? `${selectedOrder.shippingCity} • مصر` : 'مصر'}
                </span>
              </div>

              <div className="divide-y divide-brand-border/40 font-mono text-xs">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-brand-ivory font-bold block sm:inline">
                        {item.quantity}x {isAr ? item.productNameAr || item.productNameEn : item.productNameEn}
                      </span>
                      <span className="text-[10px] text-brand-cream/60 block sm:inline sm:mx-2 mt-0.5 sm:mt-0">
                        {item.selectedSize} • {item.selectedColor}
                      </span>
                    </div>
                    <span className="font-bold text-brand-gold">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="pt-3 border-t border-brand-border/60 space-y-1.5 font-mono text-xs text-brand-cream/70">
                <div className="flex justify-between">
                  <span>{isAr ? 'قيمة القطع:' : 'Subtotal:'}</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? 'مصاريف الشحن والتوصيل:' : 'Delivery Fee:'}</span>
                  <span>{selectedOrder.shippingFee > 0 ? formatPrice(selectedOrder.shippingFee) : (isAr ? 'مجاني' : 'Free')}</span>
                </div>
                {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 ? (
                  <div className="flex justify-between text-emerald-400">
                    <span>{isAr ? 'الخصم المطبق:' : 'Discount:'}</span>
                    <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                  </div>
                ) : null}

                {/* Final Total COD Highlight */}
                <div className="pt-2 border-t border-brand-gold/40 flex items-center justify-between text-sm sm:text-base font-black text-brand-ivory">
                  <span>{isAr ? 'المطلوب دفعه للمندوب كاش (COD):' : 'Total Payable on Delivery (COD):'}</span>
                  <span className="text-brand-gold text-lg font-mono">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Concierge Support */}
            <div className="pt-4 border-t border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-brand-cream/70 font-mono">
                <span className="block font-bold text-brand-ivory">
                  {isAr ? 'هل لديك أي استفسار حول موعد وصول المندوب؟' : 'Need help with delivery timing?'}
                </span>
                <span className="text-[11px] text-brand-cream/50">
                  {isAr ? 'تواصل مباشرة مع خدمة عملاء أثير عبر الواتساب' : 'Chat with ATHEER concierge on WhatsApp'}
                </span>
              </div>

              <a
                href={`https://wa.me/201015993802?text=${encodeURIComponent(
                  `مرحباً دار أثير، أرغب بالاستفسار عن موعد توصيل طلبي رقم (${selectedOrder.orderReference}) المسجل برقم هاتف (${selectedOrder.customerPhone}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-xs flex items-center justify-center space-x-2 rtl:space-x-reverse transition-colors shadow-lg shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isAr ? 'محادثة فورية مع المندوب / الدار' : 'WhatsApp Concierge'}</span>
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
