'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth, CustomerAddress } from '@/context/CustomerAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { defaultEgyptianShippingZones } from '@/data/shippingZones';
import { MapPin, Plus, Trash2, CheckCircle2, ArrowRight, ArrowLeft, Home, Building2, Check } from 'lucide-react';

export default function CustomerAddressesPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, addAddress, deleteAddress, setDefaultAddress } = useCustomerAuth();
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState('المنزل / Home');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/account/login?redirect=/account/addresses');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (customer) {
      setRecipientName(customer.fullName || '');
      setPhone(customer.phone || '');
    }
  }, [customer]);

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center font-mono text-xs text-brand-gold">
        {isAr ? 'جاري فتح دفتر العناوين...' : 'Loading address book...'}
      </div>
    );
  }

  // All 27 Egyptian Governorates from shipping zones
  const allGovernorates = defaultEgyptianShippingZones.flatMap((z) => z.governorates);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addAddress({
        label,
        recipientName,
        phone,
        governorate,
        city,
        streetAddress,
        buildingNumber,
        apartmentNumber,
        deliveryNotes,
        isDefault,
      });
      setShowAddForm(false);
      setCity('');
      setStreetAddress('');
      setBuildingNumber('');
      setApartmentNumber('');
      setDeliveryNotes('');
    } finally {
      setSaving(false);
    }
  };

  const addresses = customer.addresses || [];

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-gold selection:text-brand-black">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-cream/60">
          <Link href="/account" className="hover:text-brand-gold transition-colors">
            {isAr ? 'حسابي' : 'My Account'}
          </Link>
          <span>/</span>
          <span className="text-brand-gold font-bold">{isAr ? 'دفتر العناوين' : 'Address Book'}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
          <div>
            <h1 className="text-2xl font-sans font-black text-brand-ivory">
              {isAr ? 'عناوين التوصيل في مصر' : 'Saved Delivery Addresses'}
            </h1>
            <p className="text-xs text-brand-cream/60 font-mono mt-1">
              {isAr ? 'إدارة عناوين الشحن الخاصة بك عبر الـ 27 محافظة لتسريع الطلب' : 'Manage your shipping addresses across Egypt'}
            </p>
          </div>

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase rounded-xs transition-colors flex items-center space-x-1.5 rtl:space-x-reverse"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? '+ إضافة عنوان جديد' : '+ Add New Address'}</span>
            </button>
          )}
        </div>

        {/* Add Address Form Modal / Box */}
        {showAddForm && (
          <form onSubmit={handleSaveAddress} className="bg-brand-charcoal border-2 border-brand-gold/60 rounded-xs p-6 space-y-4 shadow-luxury-dark">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <h3 className="text-sm font-bold text-brand-ivory font-serif">
                {isAr ? 'تسجيل عنوان شحن مصري جديد' : 'Add New Egyptian Address'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs font-mono text-brand-cream/50 hover:text-brand-ivory"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'اسم المستلم' : 'Recipient Name'}
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'رقم الهاتف للتواصل مع المندوب' : 'Phone Number (for Courier)'}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'المحافظة (مصر)' : 'Governorate (Egypt)'}
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-sans"
                >
                  {allGovernorates.map((gov) => (
                    <option key={gov} value={gov} className="bg-brand-black text-brand-ivory">
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'المدينة / المنطقة / الحي' : 'City / Area'}
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={isAr ? 'مثال: التجمع الخامس، المعادي، سموحة' : 'e.g. New Cairo, Smouha'}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'اسم الشارع والعنوان التفصيلي' : 'Street & Detailed Address'}
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder={isAr ? 'اسم الشارع وأقرب علامة مميزة' : 'Street name, landmark'}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'رقم العمارة / المبنى' : 'Building No.'}
                </label>
                <input
                  type="text"
                  value={buildingNumber}
                  onChange={(e) => setBuildingNumber(e.target.value)}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'رقم الشقة / الدور' : 'Apartment / Floor'}
                </label>
                <input
                  type="text"
                  value={apartmentNumber}
                  onChange={(e) => setApartmentNumber(e.target.value)}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'ملاحظات خاصة بالتوصيل للمندوب' : 'Delivery Notes'}
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder={isAr ? 'مثال: رن الجرس مرتين، الاتصال قبل الوصول' : 'e.g. Call before arrival'}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-brand-border/60">
              <label className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-cream/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded-xs text-brand-gold focus:ring-0"
                />
                <span>{isAr ? 'تعيين كعنوان رئيسي مفضل للطلبات' : 'Set as default shipping address'}</span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase rounded-xs transition-colors"
              >
                {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ العنوان' : 'Save Address')}
              </button>
            </div>
          </form>
        )}

        {/* Existing Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-brand-charcoal border border-brand-border/80 rounded-xs p-10 text-center space-y-3">
            <MapPin className="w-8 h-8 text-brand-gold/60 mx-auto" />
            <p className="text-xs text-brand-cream/60 font-mono">
              {isAr ? 'لم تقم بحفظ أي عنوان بعد.' : 'No saved addresses yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-5 rounded-xs border transition-all ${
                  addr.isDefault
                    ? 'bg-brand-charcoal border-brand-gold shadow-gold'
                    : 'bg-brand-charcoal/80 border-brand-border/80 hover:border-brand-gold/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-mono font-bold text-xs text-brand-gold">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/40">
                        {isAr ? 'الرئيسي' : 'Default'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-brand-cream/40 hover:text-rose-400 transition-colors p-1"
                    title={isAr ? 'حذف العنوان' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-brand-cream/80">
                  <p className="font-bold text-brand-ivory">{addr.recipientName}</p>
                  <p className="font-mono text-brand-cream/70">{addr.phone}</p>
                  <p>
                    {addr.governorate} — {addr.city}
                  </p>
                  <p className="text-brand-cream/60">
                    {addr.streetAddress} {addr.buildingNumber ? `(عمارة ${addr.buildingNumber})` : ''}
                  </p>
                  {addr.deliveryNotes && (
                    <p className="text-[11px] font-mono text-brand-gold/80 italic mt-1">
                      {isAr ? 'ملاحظة:' : 'Note:'} {addr.deliveryNotes}
                    </p>
                  )}
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="mt-4 text-[11px] font-mono text-brand-gold hover:underline flex items-center space-x-1 rtl:space-x-reverse font-medium"
                  >
                    <Check className="w-3 h-3" />
                    <span>{isAr ? 'جعله العنوان الافتراضي' : 'Set as default'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
