'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  EGYPTIAN_GOVERNORATES,
  getZoneByGovernorate,
  calculateShippingFee,
} from '@/data/shippingZones';
import {
  ShieldCheck,
  Truck,
  Banknote,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Lock,
  ShoppingBag,
  MapPin,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, totalCount } = useCart();
  const { language, t, formatPrice, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Form Fields tailored for Egypt
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('Cairo');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingDistrict, setShippingDistrict] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Submission & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate Egyptian shipping fee based on selected governorate
  const activeZone = getZoneByGovernorate(selectedGovernorate);
  const { fee: shippingFee, isFree: isFreeShipping } = calculateShippingFee(
    activeZone.id,
    subtotal
  );
  const finalTotal = Math.max(0, subtotal + shippingFee - (appliedCoupon?.discountAmount || 0));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();

      if (data.success) {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          discountType: data.discountType,
          discountValue: data.discountValue,
        });
        setCouponInput('');
      } else {
        setCouponError(language === 'ar' ? data.errorAr || data.error : data.error);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Validation & Order Submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName || customerName.trim().length < 3) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى إدخال الاسم بالكامل بشكل صحيح (٣ أحرف على الأقل).'
          : 'Please enter a valid full name (at least 3 characters).'
      );
      return;
    }

    // Validate Egyptian Mobile: 010, 011, 012, 015
    const cleanPhone = customerPhone.replace(/[\s\-\(\)\+]/g, '');
    const isLocalEgy = /^01[0125][0-9]{8}$/.test(cleanPhone);
    const isIntlEgy = /^201[0125][0-9]{8}$/.test(cleanPhone);

    if (!isLocalEgy && !isIntlEgy) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى إدخال رقم هاتف محمول مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015 ومكون من ١١ رقماً.'
          : 'Please enter a valid 11-digit Egyptian mobile number (e.g. 010xxxxxxxx, 011xxxxxxxx, 012xxxxxxxx, or 015xxxxxxxx).'
      );
      return;
    }

    if (!shippingCity || shippingCity.trim().length < 2) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى إدخال اسم المدينة أو المنطقة (مثال: التجمع الخامس، المعادي، الشيخ زايد، سموحة).'
          : 'Please enter your city / area (e.g. New Cairo, Maadi, Sheikh Zayed, Smouha).'
      );
      return;
    }

    if (!shippingAddress || shippingAddress.trim().length < 5) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى إدخال عنوان التوصيل بالتفصيل (اسم الشارع، رقم العمارة، رقم الشقة أو الفيلا).'
          : 'Please enter a detailed street address, building number, and apartment/villa details.'
      );
      return;
    }

    if (items.length === 0) {
      setErrorMessage(
        language === 'ar' ? 'حقيبة التسوق فارغة.' : 'Your shopping bag is empty.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const fullDetailedAddress = shippingDistrict
        ? `${shippingDistrict.trim()} — ${shippingAddress.trim()}`
        : shippingAddress.trim();

      const payload = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        shippingCountry: 'Egypt',
        governorate: selectedGovernorate,
        shippingCity: shippingCity.trim(),
        shippingAddress: fullDetailedAddress,
        shippingZoneId: activeZone.id,
        couponCode: appliedCoupon?.code,
        notes: deliveryNotes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorText = language === 'ar' ? data.errorAr || data.error : data.error;
        setErrorMessage(errorText || 'Failed to confirm order. Please verify your details.');
        setIsSubmitting(false);
        return;
      }

      // Backend Confirmed!
      clearCart();
      const ref = data.order?.orderReference;
      router.push(`/order-success?ref=${encodeURIComponent(ref)}`);
    } catch (err: any) {
      console.error('Order submission failed:', err);
      setErrorMessage(
        language === 'ar'
          ? 'تعذر الاتصال بالخادم لتسجيل طلبك. يرجى المحاولة مجدداً.'
          : 'Could not connect to the server. Please check your connection and try again.'
      );
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-black text-brand-ivory flex flex-col justify-between">
        <Header />
        <div className="max-w-md mx-auto text-center py-28 px-4">
          <ShoppingBag className="w-16 h-16 text-brand-muted/40 mx-auto stroke-[1] mb-6" />
          <h1 className="font-sans font-bold text-2xl uppercase mb-3">
            {language === 'ar' ? 'حقيبة التسوق فارغة' : 'Your Bag is Empty'}
          </h1>
          <p className="text-xs text-brand-cream/70 font-light mb-8">
            {language === 'ar'
              ? 'أضف هودي أو سويت شيرت لحقيبتك لمتابعة إتمام الطلب والدفع عند الاستلام داخل مصر.'
              : 'Add a hoodie or sweatshirt to your bag to proceed to checkout with Cash on Delivery across Egypt.'}
          </p>
          <Link
            href="/#products"
            className="px-8 py-3.5 bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-widest hover:bg-brand-gold-hover transition-colors font-mono"
          >
            {language === 'ar' ? 'تصفح التشكيلة' : 'Explore The Collection'}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Checkout Header */}
        <div className="pb-6 border-b border-brand-border/60 mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-brand-gold font-mono uppercase tracking-widest mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>
                {language === 'ar'
                  ? 'دفع آمن نقدياً عند الاستلام في مصر (EGP)'
                  : 'SECURE CASH ON DELIVERY IN EGYPT (EGP)'}
              </span>
            </div>
            <h1 className="font-sans font-black text-3xl sm:text-4xl uppercase tracking-tight">
              {language === 'ar' ? 'إتمام الطلب — جمهورية مصر العربية' : 'Complete Your Order — Egypt'}
            </h1>
          </div>

          <Link
            href="/cart"
            className="text-xs text-brand-cream/70 hover:text-brand-gold font-mono underline"
          >
            {language === 'ar' ? 'تعديل الحقيبة' : 'Edit Bag'}
          </Link>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-8 p-4 bg-rose-950/60 border border-rose-700/80 text-rose-200 text-xs sm:text-sm flex items-start space-x-3 rtl:space-x-reverse animate-fade-in font-sans">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Left Column: Delivery Form (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Step 1: Customer Contact Info */}
              <div className="p-6 sm:p-8 bg-brand-charcoal border border-brand-border space-y-5">
                <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-brand-border/60 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-gold text-brand-black text-xs font-mono font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-sans font-bold text-base sm:text-lg uppercase tracking-wider">
                    {language === 'ar' ? 'بيانات المستلم في مصر' : 'Customer Delivery Details'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={language === 'ar' ? 'أحمد الشناوي' : 'Ahmed El-Shennawy'}
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold transition-colors font-sans"
                    />
                  </div>

                  {/* Egyptian Mobile Phone Number */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'رقم الهاتف المحمول (مصر) *' : 'Egyptian Mobile Phone *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold transition-colors font-mono"
                    />
                    <span className="text-[10px] text-brand-gold font-mono mt-1 block">
                      {language === 'ar' ? 'يبدأ بـ 010 أو 011 أو 012 أو 015' : '11 digits starting with 010, 011, 012, or 015'}
                    </span>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="ahmed@example.com"
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Egyptian Governorate & Address */}
              <div className="p-6 sm:p-8 bg-brand-charcoal border border-brand-border space-y-5">
                <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-brand-border/60 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-gold text-brand-black text-xs font-mono font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-sans font-bold text-base sm:text-lg uppercase tracking-wider">
                    {language === 'ar' ? 'المحافظة وعنوان التوصيل' : 'Governorate & Delivery Address'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Governorate Selector (All 27 Egyptian Governorates) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'المحافظة *' : 'Egyptian Governorate *'}
                    </label>
                    <select
                      value={selectedGovernorate}
                      onChange={(e) => setSelectedGovernorate(e.target.value)}
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory focus:outline-none focus:border-brand-gold font-sans"
                    >
                      {EGYPTIAN_GOVERNORATES.map((gov) => (
                        <option key={gov.id} value={gov.id}>
                          {language === 'ar' ? gov.nameAr : gov.nameEn}
                        </option>
                      ))}
                    </select>

                    <div className="mt-2 p-2.5 bg-brand-black/80 border border-brand-border/60 text-xs font-mono flex items-center justify-between">
                      <span className="text-brand-cream/70">
                        {language === 'ar' ? 'منطقة الشحن:' : 'Zone:'} {language === 'ar' ? activeZone.nameAr : activeZone.nameEn}
                      </span>
                      <span className="text-brand-gold font-bold">
                        {language === 'ar' ? activeZone.estimatedDaysAr : activeZone.estimatedDaysEn}
                      </span>
                    </div>
                  </div>

                  {/* City / Area */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'المدينة / المنطقة *' : 'City / Area *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder={
                        language === 'ar'
                          ? 'التجمع الخامس / المعادي / الشيخ زايد / سموحة...'
                          : 'New Cairo / Maadi / Sheikh Zayed / Smouha...'
                      }
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold transition-colors font-sans"
                    />
                  </div>

                  {/* District / Neighborhood */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'الحي / المجاورة (اختياري)' : 'District / Neighborhood (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={shippingDistrict}
                      onChange={(e) => setShippingDistrict(e.target.value)}
                      placeholder={language === 'ar' ? 'الحي الأول / النرجس / لوران...' : 'District 1 / El-Narges / Loran...'}
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold transition-colors font-sans"
                    />
                  </div>

                  {/* Detailed Street Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'اسم الشارع، رقم العمارة، رقم الشقة *' : 'Street Name, Building & Apartment *'}
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder={
                        language === 'ar'
                          ? 'شارع التسعين، عمارة 42، الدور الثالث، شقة 6'
                          : '90th Street, Building 42, Floor 3, Apt 6'
                      }
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold transition-colors font-sans"
                    />
                  </div>

                  {/* Courier Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'ملاحظات لمندوب التوصيل (اختياري)' : 'Notes for Courier (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder={
                        language === 'ar' ? 'بجوار المسجد الكبير، الاتصال قبل الوصول' : 'Next to landmark, call before arrival'
                      }
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method (Cash on Delivery in Egypt) */}
              <div className="p-6 sm:p-8 bg-brand-charcoal border border-brand-border space-y-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-brand-border/60 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-gold text-brand-black text-xs font-mono font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-sans font-bold text-base sm:text-lg uppercase tracking-wider">
                    {language === 'ar' ? 'طريقة الدفع في مصر' : 'Payment Method (Egypt)'}
                  </h2>
                </div>

                <div className="p-4 bg-brand-black border-2 border-brand-gold flex items-start space-x-3.5 rtl:space-x-reverse">
                  <Banknote className="w-6 h-6 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="font-sans font-bold text-sm text-brand-ivory">
                        {language === 'ar' ? 'الدفع نقدياً عند الاستلام (COD)' : 'Cash on Delivery (COD)'}
                      </span>
                      <span className="text-[10px] font-mono bg-brand-gold text-brand-black px-2 py-0.5 font-bold uppercase">
                        {language === 'ar' ? 'الجنيه المصري EGP' : 'EGP'}
                      </span>
                    </div>
                    <p className="text-xs text-brand-cream/80 leading-relaxed font-light">
                      {language === 'ar'
                        ? 'ادفع نقداً لمندوب شركة الشحن عند استلام شحنتك وفحص العبوة في منزلك.'
                        : 'Pay in Egyptian Pounds upon courier delivery directly to your residence.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary in EGP (5 cols) */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 bg-brand-charcoal border border-brand-border sticky top-28 space-y-6">
                <h3 className="font-sans font-bold text-base uppercase tracking-wider border-b border-brand-border pb-3">
                  {language === 'ar' ? 'ملخص الفاتورة (EGP)' : 'Order Breakdown (EGP)'}
                </h3>

                {/* Items Preview */}
                <div className="max-h-64 overflow-y-auto divide-y divide-brand-border/40 pr-1">
                  {items.map((item) => {
                    const title = language === 'ar' ? item.product.nameAr : item.product.nameEn;
                    return (
                      <div
                        key={`${item.product.id}-${item.selectedSize}`}
                        className="py-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-12 h-14 bg-brand-black border border-brand-border overflow-hidden flex-shrink-0">
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url('${item.product.image}')` }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-brand-ivory line-clamp-1">{title}</p>
                            <p className="text-[11px] text-brand-cream/70 font-mono">
                              {item.selectedSize} • {item.quantity}x • {item.product.gsm} GSM
                            </p>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-brand-gold">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Input */}
                <div className="pt-3 border-t border-brand-border/60">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-mono rounded-xs">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="font-bold">{appliedCoupon.code}</span>
                        <span className="text-[10px] text-emerald-300">
                          (-{formatPrice(appliedCoupon.discountAmount)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-emerald-400/70 hover:text-rose-400 text-[10px] uppercase underline"
                      >
                        {language === 'ar' ? 'إزالة' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder={language === 'ar' ? 'كود الخصم (مثال: ATHEER10)' : 'Promo Code (e.g. ATHEER10)'}
                          className="flex-1 bg-brand-stone/40 border border-brand-border/80 px-3 py-2 text-xs font-mono text-brand-gold uppercase tracking-wider rounded-xs focus:border-brand-gold focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={couponLoading || !couponInput.trim()}
                          onClick={handleApplyCoupon}
                          className="px-4 py-2 bg-brand-stone border border-brand-border text-brand-gold text-xs font-mono font-bold hover:border-brand-gold transition-colors disabled:opacity-50 rounded-xs"
                        >
                          {couponLoading
                            ? language === 'ar' ? '...' : '...'
                            : language === 'ar' ? 'تطبيق' : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[10px] text-rose-400 font-mono mt-1">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="space-y-3 pt-3 border-t border-brand-border/60 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-brand-cream/70">{t('cartSubtotal')}</span>
                    <span className="text-brand-ivory font-bold">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-brand-cream/70">
                      {language === 'ar' ? `شحن (${activeZone.nameAr}):` : `Shipping (${activeZone.nameEn}):`}
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

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>{language === 'ar' ? 'الخصم المطبق:' : 'Coupon Discount:'}</span>
                      <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-brand-border text-base font-bold">
                    <span className="text-brand-gold uppercase">
                      {language === 'ar' ? 'المطلوب عند الاستلام:' : 'Payable on Delivery:'}
                    </span>
                    <span className="font-mono text-2xl text-brand-gold">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Final Order Confirmation CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-gold flex items-center justify-center space-x-2 rtl:space-x-reverse font-mono ${
                    isSubmitting
                      ? 'bg-brand-stone text-brand-muted cursor-not-allowed'
                      : 'bg-brand-gold text-brand-black hover:bg-brand-gold-hover'
                  }`}
                >
                  {isSubmitting ? (
                    <span>
                      {language === 'ar' ? 'جاري تأكيد وتسجيل الطلب...' : 'Registering Order on Server...'}
                    </span>
                  ) : (
                    <>
                      <span>
                        {language === 'ar' ? 'تأكيد الطلب والدفع عند الاستلام' : 'Confirm Order (Pay on Delivery)'}
                      </span>
                      <ArrowIcon className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-brand-cream/60 leading-relaxed font-sans">
                  {language === 'ar'
                    ? 'يتم فحص الطلب والتواصل معك هاتفياً قبل خروج المندوب لضمان استلامك السلس.'
                    : 'Your order will be prepared and confirmed via phone before express dispatch.'}
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
