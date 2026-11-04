'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { getShippingZones, calculateShippingFee, ShippingZone } from '@/data/shippingZones';
import {
  ShieldCheck,
  Truck,
  Banknote,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Flame,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, totalCount } = useCart();
  const { language, t, formatPrice, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingCountry, setShippingCountry] = useState('SA');
  const [shippingCity, setShippingCity] = useState('Riyadh');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Shipping Zones
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState('ksa-main');

  // Submission & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadedZones = getShippingZones();
    setZones(loadedZones);
    if (loadedZones.length > 0) {
      setSelectedZoneId(loadedZones[0].id);
    }
  }, []);

  // Update zone automatically when country changes
  const handleCountryChange = (country: string) => {
    setShippingCountry(country);
    if (country === 'SA') {
      setSelectedZoneId('ksa-main');
    } else if (country === 'AE') {
      setSelectedZoneId('uae-all');
    } else {
      setSelectedZoneId('gcc-gulf');
    }
  };

  const { fee: shippingFee, isFree: isFreeShipping, zone: activeZone } = calculateShippingFee(
    selectedZoneId,
    subtotal
  );
  const finalTotal = subtotal + shippingFee;

  // Validation & Order Submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick checks
    if (!customerName || customerName.trim().length < 3) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى إدخال الاسم بالكامل بشكل صحيح (٣ أحرف على الأقل).'
          : 'Please enter a valid full name (at least 3 characters).'
      );
      return;
    }

    const cleanPhone = customerPhone.replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى إدخال رقم جوال صحيح للتنسيق مع مندوب التوصيل (مثال: 0501234567).'
          : 'Please enter a valid mobile number for delivery coordination.'
      );
      return;
    }

    if (!shippingCity || shippingCity.trim().length < 2) {
      setErrorMessage(
        language === 'ar' ? 'يرجى تحديد مدينة التوصيل.' : 'Please enter the delivery city.'
      );
      return;
    }

    if (!shippingAddress || shippingAddress.trim().length < 5) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى إدخال عنوان التوصيل بالتفصيل (الحي، اسم الشارع، رقم المبنى).'
          : 'Please enter a complete delivery address (district, street, building number).'
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
      const payload = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        shippingCountry,
        shippingCity: shippingCity.trim(),
        shippingAddress: shippingAddress.trim(),
        shippingPostalCode: shippingPostalCode.trim() || undefined,
        shippingZoneId: selectedZoneId,
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
          ? 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.'
          : 'Could not connect to the server. Please check your internet connection and try again.'
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
              ? 'أضف هودي أو سويت شيرت لحقيبتك لمتابعة إتمام الطلب والدفع عند الاستلام.'
              : 'Add a hoodie or sweatshirt to your bag to proceed to checkout with Cash on Delivery.'}
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
              <span>{language === 'ar' ? 'دفع آمن · الدفع عند الاستلام' : 'SECURE COD CHECKOUT'}</span>
            </div>
            <h1 className="font-sans font-black text-3xl sm:text-4xl uppercase tracking-tight">
              {language === 'ar' ? 'إتمام الطلب' : 'Complete Your Order'}
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
                    {language === 'ar' ? 'معلومات المستلم للتوصيل' : 'Customer Delivery Contact'}
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
                      placeholder={language === 'ar' ? 'محمد العتيبي' : 'Khalid Al-Mansoor'}
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'رقم الجوال للتوصيل *' : 'Mobile Phone (for Courier) *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="050 123 4567"
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold transition-colors font-mono"
                    />
                    <span className="text-[10px] text-brand-muted font-mono mt-1 block">
                      {language === 'ar' ? 'يتصل بك مندوب الشحن لتأكيد موقع التسليم' : 'Courier contacts this number upon arrival'}
                    </span>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="khalid@example.com"
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold transition-colors font-mono"
                    />
                    <span className="text-[10px] text-brand-muted font-mono mt-1 block">
                      {language === 'ar' ? 'لتلقي إشعار التتبع وتفاصيل الفاتورة' : 'For digital order receipt & tracking updates'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Destination & Zone */}
              <div className="p-6 sm:p-8 bg-brand-charcoal border border-brand-border space-y-5">
                <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-brand-border/60 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-gold text-brand-black text-xs font-mono font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-sans font-bold text-base sm:text-lg uppercase tracking-wider">
                    {language === 'ar' ? 'عنوان التوصيل ومنطقة الشحن' : 'Delivery Address & Shipping Zone'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Country Selector */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'الدولة *' : 'Country *'}
                    </label>
                    <select
                      value={shippingCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory focus:outline-none focus:border-brand-gold"
                    >
                      <option value="SA">Saudi Arabia | المملكة العربية السعودية</option>
                      <option value="AE">United Arab Emirates | الإمارات العربية المتحدة</option>
                      <option value="KW">Kuwait | الكويت</option>
                      <option value="QA">Qatar | قطر</option>
                      <option value="BH">Bahrain | البحرين</option>
                      <option value="OM">Oman | عُمان</option>
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'المدينة *' : 'City *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder={language === 'ar' ? 'الرياض / جدة / دبي...' : 'Riyadh / Jeddah / Dubai...'}
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  {/* Configurable Shipping Zone Selection */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'خيار ومنطقة الشحن المحددة *' : 'Shipping Zone & Speed *'}
                    </label>
                    <div className="space-y-2.5">
                      {zones.map((zone) => {
                        const isSelected = selectedZoneId === zone.id;
                        const { fee: zFee, isFree: zFree } = calculateShippingFee(zone.id, subtotal);
                        return (
                          <label
                            key={zone.id}
                            className={`flex items-center justify-between p-3.5 border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-brand-gold bg-brand-gold/10'
                                : 'border-brand-border/60 hover:border-brand-gold/60 bg-brand-black'
                            }`}
                          >
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              <input
                                type="radio"
                                name="shippingZone"
                                value={zone.id}
                                checked={isSelected}
                                onChange={() => setSelectedZoneId(zone.id)}
                                className="accent-[#C5A880]"
                              />
                              <div>
                                <p className="text-xs font-bold text-brand-ivory">
                                  {language === 'ar' ? zone.nameAr : zone.nameEn}
                                </p>
                                <p className="text-[11px] text-brand-cream/60 font-mono">
                                  {language === 'ar' ? zone.estimatedDaysAr : zone.estimatedDaysEn}
                                </p>
                              </div>
                            </div>

                            <span className="font-mono text-xs font-bold text-brand-gold">
                              {zFree ? (
                                <span className="text-emerald-400 uppercase">
                                  {language === 'ar' ? 'مجاني' : 'FREE'}
                                </span>
                              ) : (
                                formatPrice(zFee)
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'العنوان التفصيلي (الحي، الشارع، المبنى) *' : 'Street Address & District *'}
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder={
                        language === 'ar'
                          ? 'حي النخيل، شارع الأمير تركي، فيلا رقم 14'
                          : 'Al-Nakheel District, Prince Turki St, Villa 14'
                      }
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold transition-colors font-sans"
                    />
                  </div>

                  {/* Postal Code & Notes */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'الرمز البريدي (اختياري)' : 'Postal Code (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={shippingPostalCode}
                      onChange={(e) => setShippingPostalCode(e.target.value)}
                      placeholder="12345"
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-cream/80 mb-2">
                      {language === 'ar' ? 'ملاحظات للمندوب (اختياري)' : 'Courier Notes (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder={
                        language === 'ar' ? 'الاتصال قبل الوصول بربع ساعة' : 'Call 15 mins before arrival'
                      }
                      className="w-full bg-brand-black border border-brand-border px-4 py-3 text-xs sm:text-sm text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method (Cash on Delivery) */}
              <div className="p-6 sm:p-8 bg-brand-charcoal border border-brand-border space-y-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-brand-border/60 pb-3">
                  <span className="w-6 h-6 rounded-full bg-brand-gold text-brand-black text-xs font-mono font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-sans font-bold text-base sm:text-lg uppercase tracking-wider">
                    {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                  </h2>
                </div>

                {/* Exclusive COD Card */}
                <div className="p-4 bg-brand-black border-2 border-brand-gold flex items-start space-x-3.5 rtl:space-x-reverse">
                  <Banknote className="w-6 h-6 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="font-sans font-bold text-sm text-brand-ivory">
                        {language === 'ar' ? 'الدفع عند الاستلام (COD)' : 'Cash on Delivery (COD)'}
                      </span>
                      <span className="text-[10px] font-mono bg-brand-gold text-brand-black px-2 py-0.5 font-bold uppercase">
                        {language === 'ar' ? 'معتمد' : 'ACTIVE'}
                      </span>
                    </div>
                    <p className="text-xs text-brand-cream/80 leading-relaxed font-light">
                      {language === 'ar'
                        ? 'ادفع بأمان عند استلام طلبك لمنزلك. يقبل المندوب الدفع نقداً أو عبر جهاز نقاط البيع لبطاقات مدى، فيزا، وماستركارد، وApple Pay.'
                        : 'Pay securely upon arrival. The courier accepts cash or mobile POS card terminals (Mada, Visa, Mastercard, Apple Pay).'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Review & Confirmation (5 cols) */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 bg-brand-charcoal border border-brand-border sticky top-28 space-y-6">
                <h3 className="font-sans font-bold text-base uppercase tracking-wider border-b border-brand-border pb-3">
                  {language === 'ar' ? 'مراجعة وتأكيد الطلب' : 'Order Review'}
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

                {/* Breakdown */}
                <div className="space-y-3 pt-4 border-t border-brand-border/60 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-brand-cream/70">{t('cartSubtotal')}</span>
                    <span className="text-brand-ivory font-bold">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-brand-cream/70">
                      {language === 'ar' ? 'رسوم الشحن:' : 'Shipping Fee:'}
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

                  <div className="flex justify-between items-center pt-3 border-t border-brand-border text-base font-bold">
                    <span className="text-brand-gold uppercase">
                      {language === 'ar' ? 'الإجمالي للدفع عند الاستلام:' : 'Total (Pay on Delivery):'}
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
                      {language === 'ar' ? 'جاري تأكيد وتسجيل الطلب...' : 'Confirming Order on Server...'}
                    </span>
                  ) : (
                    <>
                      <span>
                        {language === 'ar' ? 'تأكيد الطلب والدفع عند الاستلام' : 'Confirm Order (Cash on Delivery)'}
                      </span>
                      <ArrowIcon className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-brand-cream/60 leading-relaxed font-sans">
                  {language === 'ar'
                    ? 'بالضغط على تأكيد الطلب، يتم تسجيل طلبك في نظام الدار وإرسال رسالة برقم الشحنة إلى جوالك فوراً.'
                    : 'By confirming, your order is registered on our server and dispatched via express courier.'}
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
