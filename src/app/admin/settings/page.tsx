'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { StoreSettings, PaymentMethodConfig } from '@/types';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  Settings,
  Save,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Globe,
  Instagram,
  CheckCircle2,
  X,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Plus,
  Trash2,
  Edit3,
  Smartphone,
  Building2,
  Banknote,
  Check,
  Sparkles,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { PermanentQrCard } from '@/components/PermanentQrCard';

export default function AdminSettingsPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);

  // Form State for Adding / Editing Payment Method
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formType, setFormType] = useState<PaymentMethodConfig['type']>('instapay');
  const [formAccountDetails, setFormAccountDetails] = useState('');
  const [formInstructionsAr, setFormInstructionsAr] = useState('');
  const [formInstructionsEn, setFormInstructionsEn] = useState('');
  const [formDescriptionAr, setFormDescriptionAr] = useState('');
  const [formDescriptionEn, setFormDescriptionEn] = useState('');
  const [modalSaving, setModalSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/settings', {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to load store settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQr = async (visible: boolean) => {
    try {
      await adminFetch('/api/admin/homepage-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showQrCode: visible }),
      });
      if (settings) {
        setSettings({ ...settings, showQrCode: visible });
      }
      setFeedbackMsg({
        type: 'success',
        text: isAr
          ? (visible ? 'تم تفعيل ظهور رمز الـ QR للعملاء في الموقع العام!' : 'تم إخفاء رمز الـ QR من الموقع العام بنجاح.')
          : 'QR visibility preference saved.',
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveQrUrl = async (newUrl: string) => {
    try {
      await adminFetch('/api/admin/homepage-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrTargetUrl: newUrl }),
      });
      if (settings) {
        setSettings({ ...settings, qrTargetUrl: newUrl });
      }
      setFeedbackMsg({
        type: 'success',
        text: isAr ? 'تم تحديث وحفظ رابط الـ QR الدائم بنجاح!' : 'QR code target URL saved successfully!',
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPaymentMethods = async () => {
    setLoadingMethods(true);
    try {
      const res = await adminFetch('/api/admin/payment-methods', {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.methods)) {
        setPaymentMethods(data.methods);
      }
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    } finally {
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchPaymentMethods();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr ? 'تم حفظ إعدادات المتجر بنجاح.' : 'Store settings updated successfully.',
        });
        fetchSettings();
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePaymentMethod = async (id: string) => {
    try {
      const res = await adminFetch('/api/admin/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'toggle' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPaymentMethods();
        setFeedbackMsg({
          type: 'success',
          text: isAr ? 'تم تحديث حالة طريقة الدفع بنجاح.' : 'Payment method status updated.',
        });
        setTimeout(() => setFeedbackMsg(null), 2500);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to toggle status' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  const openAddModal = () => {
    setEditingMethod(null);
    setFormType('instapay');
    setFormNameAr('إنستاباي (التحويل الفوري)');
    setFormNameEn('InstaPay Transfer');
    setFormAccountDetails('username@instapay');
    setFormInstructionsAr('حول المبلغ لحساب إنستاباي واكتب رقم العملية');
    setFormInstructionsEn('Transfer order total to our InstaPay handle');
    setFormDescriptionAr('تحويل فوري مباشر عبر إنستاباي بدون رسوم');
    setFormDescriptionEn('Direct instant transfer via InstaPay');
    setShowModal(true);
  };

  const openEditModal = (method: PaymentMethodConfig) => {
    setEditingMethod(method);
    setFormType(method.type);
    setFormNameAr(method.nameAr);
    setFormNameEn(method.nameEn);
    setFormAccountDetails(method.accountDetails || '');
    setFormInstructionsAr(method.instructionsAr || '');
    setFormInstructionsEn(method.instructionsEn || '');
    setFormDescriptionAr(method.descriptionAr || '');
    setFormDescriptionEn(method.descriptionEn || '');
    setShowModal(true);
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim() || !formNameEn.trim()) {
      alert(isAr ? 'يرجى إدخال اسم طريقة الدفع بالعربية والإنجليزية' : 'Please provide names in both languages');
      return;
    }

    setModalSaving(true);
    try {
      const isEditing = Boolean(editingMethod);
      const url = '/api/admin/payment-methods';
      const method = isEditing ? 'PUT' : 'POST';
      const body = {
        ...(isEditing && { id: editingMethod?.id }),
        nameAr: formNameAr.trim(),
        nameEn: formNameEn.trim(),
        type: formType,
        accountDetails: formAccountDetails.trim(),
        instructionsAr: formInstructionsAr.trim(),
        instructionsEn: formInstructionsEn.trim(),
        descriptionAr: formDescriptionAr.trim(),
        descriptionEn: formDescriptionEn.trim(),
      };

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchPaymentMethods();
        setFeedbackMsg({
          type: 'success',
          text: isAr ? 'تم حفظ طريقة الدفع بنجاح.' : 'Payment method saved successfully.',
        });
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        alert(data.error || 'Failed to save payment method');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف طريقة الدفع هذه؟' : 'Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const res = await adminFetch(`/api/admin/payment-methods?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchPaymentMethods();
        setFeedbackMsg({
          type: 'success',
          text: isAr ? 'تم حذف طريقة الدفع بنجاح.' : 'Payment method deleted successfully.',
        });
        setTimeout(() => setFeedbackMsg(null), 2500);
      } else {
        alert(data.error || 'Failed to delete payment method');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-24 text-center font-mono text-xs text-brand-cream/60">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
        {isAr ? 'جاري تحميل إعدادات المتجر...' : 'Loading store configuration...'}
      </div>
    );
  }

  const getMethodIcon = (type: PaymentMethodConfig['type']) => {
    switch (type) {
      case 'cash_on_delivery':
        return <Banknote className="w-5 h-5 text-brand-gold" />;
      case 'instapay':
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'vodafone_cash':
        return <Smartphone className="w-5 h-5 text-rose-400" />;
      case 'credit_card':
        return <CreditCard className="w-5 h-5 text-blue-400" />;
      case 'bank_transfer':
        return <Building2 className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-brand-gold" />;
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-gold uppercase tracking-widest mb-1">
            <Settings className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'تكوين وهوية المتجر' : 'Brand & Operations Setup'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-ivory font-serif">
            {isAr ? 'إعدادات متجر أثير' : 'Store Settings'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-1">
            {isAr
              ? 'إدارة قنوات الدفع، وأرقام التحويل، والعملة، ومعلومات الكونسيرج المعتمدة.'
              : 'Manage payment rails, collection accounts, currency, and concierge contacts.'}
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center justify-center space-x-2 rtl:space-x-reverse px-6 py-2.5 bg-brand-gold text-brand-black text-xs font-mono font-bold uppercase tracking-wider rounded-xs hover:bg-brand-cream transition-all shadow-sm disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ التغييرات' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-sm border flex items-center justify-between text-xs font-mono animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-400'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-brand-cream/50 hover:text-brand-ivory">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* NEW: DYNAMIC PAYMENT METHODS MANAGER SECTION                  */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <CreditCard className="w-5 h-5 text-brand-gold" />
            <div>
              <h2 className="text-base font-serif font-black text-brand-ivory">
                {isAr ? 'العملة وطرق الدفع وقنوات التحصيل' : 'Currency & Payment Rails Management'}
              </h2>
              <p className="text-[11px] text-brand-cream/60">
                {isAr
                  ? 'تحكم في تفعيل أو تعطيل طرق الدفع للعملاء في مصر (إنستاباي، فودافون كاش، الدفع عند الاستلام، بطاقات، وإضافة طرق مخصصة).'
                  : 'Control customer payment methods (InstaPay, Vodafone Cash, COD, Cards, and custom rails).'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 bg-brand-gold/15 text-brand-gold border border-brand-gold/40 text-xs font-mono font-bold uppercase tracking-wider rounded-xs hover:bg-brand-gold hover:text-brand-black transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? '+ إضافة طريقة دفع جديدة' : '+ Add Payment Method'}</span>
          </button>
        </div>

        {/* Currency Card (Egypt Standard) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 bg-brand-stone/40 p-4 border border-brand-border/60 rounded-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-brand-cream/60 block mb-1">
                {isAr ? 'عملة المتجر المعتمدة' : 'Official Checkout Currency'}
              </span>
              <div className="text-xl font-bold font-serif text-brand-gold">
                Egyptian Pound (EGP)
              </div>
            </div>
            <p className="text-[11px] text-brand-cream/50 mt-3 leading-relaxed">
              {isAr
                ? 'العملة مقفلة رسمياً على الجنيه المصري (EGP) لكافة المنتجات ومناطق الشحن وحسابات الطلبات.'
                : 'Locked to EGP for consistent catalog, shipping, and order calculations.'}
            </p>
          </div>

          <div className="md:col-span-2 bg-brand-stone/30 p-4 border border-brand-border/40 rounded-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-brand-cream/60 block mb-1">
                {isAr ? 'ملخص القنوات النشطة للعملاء' : 'Active Customer Payment Rails'}
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {paymentMethods.filter((m) => m.isActive).map((m) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center space-x-1 rtl:space-x-reverse text-xs font-mono px-2.5 py-1 bg-brand-black border border-brand-border text-brand-ivory rounded-xs"
                  >
                    {getMethodIcon(m.type)}
                    <span className="font-bold">{isAr ? m.nameAr : m.nameEn}</span>
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-brand-cream/50 mt-3">
              {isAr
                ? 'القنوات المفعلة ستظهر للعملاء في صفحة إنهاء الطلب مباشرة مع تفاصيل الحساب وتعليمات التحويل.'
                : 'Enabled rails appear immediately on the customer checkout page with account details.'}
            </p>
          </div>
        </div>

        {/* Payment Methods Cards Grid */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-brand-cream/70 tracking-wider">
            {isAr ? 'قائمة طرق الدفع المتاحة بالنظام:' : 'Configured Payment Methods:'}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {paymentMethods.map((method) => {
              const isCod = method.id === 'cod';

              return (
                <div
                  key={method.id}
                  className={`p-4 bg-brand-black border rounded-xs transition-all flex flex-col justify-between ${
                    method.isActive
                      ? 'border-brand-border/90 bg-brand-stone/20'
                      : 'border-brand-border/40 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                        <div className="p-2 bg-brand-stone/60 border border-brand-border rounded-xs">
                          {getMethodIcon(method.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <h3 className="font-sans font-bold text-sm text-brand-ivory">
                              {isAr ? method.nameAr : method.nameEn}
                            </h3>
                            {method.isActive ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 font-bold uppercase rounded-xs">
                                {isAr ? 'مفعل' : 'Active'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-700 font-bold uppercase rounded-xs">
                                {isAr ? 'معطل' : 'Disabled'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-brand-cream/50 font-mono block">
                            {method.nameEn}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Toggle, Edit, Delete */}
                      <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                        <button
                          type="button"
                          onClick={() => handleTogglePaymentMethod(method.id)}
                          className={`text-xs font-mono px-3 py-1 rounded-xs border transition-colors ${
                            method.isActive
                              ? 'bg-amber-950/30 border-amber-500/50 text-amber-400 hover:bg-amber-900/40'
                              : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/40'
                          }`}
                        >
                          {method.isActive ? (isAr ? 'تعطيل' : 'Disable') : (isAr ? 'تفعيل' : 'Enable')}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(method)}
                          className="p-1.5 text-brand-cream/60 hover:text-brand-gold border border-brand-border/60 hover:border-brand-gold rounded-xs transition-colors"
                          title={isAr ? 'تعديل البيانات' : 'Edit details'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {!isCod && (
                          <button
                            type="button"
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            className="p-1.5 text-rose-400/70 hover:text-rose-400 border border-rose-900/40 hover:border-rose-700 rounded-xs transition-colors"
                            title={isAr ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-brand-cream/70 leading-relaxed font-light">
                      {isAr ? method.descriptionAr : method.descriptionEn}
                    </p>

                    {method.accountDetails && (
                      <div className="p-2.5 bg-brand-stone/40 border border-brand-border/60 rounded-xs font-mono text-xs">
                        <span className="text-[10px] text-brand-cream/50 uppercase block mb-0.5">
                          {isAr ? 'بيانات الحساب / الرقم للعميل:' : 'Destination Account / ID:'}
                        </span>
                        <span className="text-brand-gold font-bold select-all">
                          {method.accountDetails}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PERMANENT STORE QR CODE MANAGER (LIFETIME · NO EXPIRY)        */}
      {/* ------------------------------------------------------------- */}
      <PermanentQrCard
        initialUrl={settings?.qrTargetUrl || 'https://atheer.store'}
        isVisible={settings?.showQrCode ?? true}
        onToggleVisibility={handleToggleQr}
        onSaveUrl={handleSaveQrUrl}
        isAdminMode={true}
      />

      {/* ------------------------------------------------------------- */}
      {/* STORE IDENTITY & GENERAL SETTINGS FORM                        */}
      {/* ------------------------------------------------------------- */}
      <form onSubmit={handleSaveSettings} className="space-y-8">
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-5">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-serif font-black text-brand-ivory">
            <Globe className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'هوية ومسمى العلامة التجارية' : 'Brand Identity & Labels'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-brand-cream/80 mb-1">
                {isAr ? 'اسم المتجر (إنجليزي)' : 'Store Name (English)'}
              </label>
              <input
                type="text"
                value={settings.storeNameEn}
                onChange={(e) => setSettings({ ...settings, storeNameEn: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-brand-cream/80 mb-1">
                {isAr ? 'اسم المتجر (عربي)' : 'Store Name (Arabic)'}
              </label>
              <input
                type="text"
                value={settings.storeNameAr}
                onChange={(e) => setSettings({ ...settings, storeNameAr: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-brand-cream/80 mb-1">
                {isAr ? 'الشعار اللفظي (إنجليزي)' : 'Tagline (English)'}
              </label>
              <input
                type="text"
                value={settings.taglineEn}
                onChange={(e) => setSettings({ ...settings, taglineEn: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-brand-cream/80 mb-1">
                {isAr ? 'الشعار اللفظي (عربي)' : 'Tagline (Arabic)'}
              </label>
              <input
                type="text"
                value={settings.taglineAr}
                onChange={(e) => setSettings({ ...settings, taglineAr: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right"
              />
            </div>
          </div>
        </div>

        {/* Egyptian WhatsApp & Concierge Contact */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-5">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-serif font-black text-brand-ivory">
            <MessageCircle className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'قنوات خدمة العملاء والواتساب المصري' : 'Customer Service & Egyptian WhatsApp'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-brand-cream/80 mb-1">
                {isAr ? 'رقم الواتساب الرسمي (الصيغة الدولية بدون +)' : 'WhatsApp Number (Intl format, no +)'}
              </label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="201000000000"
                className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
              />
              <p className="text-[10px] text-brand-gold/70 mt-1">
                {isAr
                  ? 'اكتب رقمك العادي (مثال: 01012345678 أو 201012345678) وسيتم ربطه تلقائياً برابط الواتساب المباشر للعميل.'
                  : 'Enter regular Egyptian mobile (010..., 011...) or international (201...) format.'}
              </p>
            </div>

            <div>
              <label className="block text-brand-cream/80 mb-1">
                {isAr ? 'البريد الإلكتروني للكونسيرج' : 'Concierge Support Email'}
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Physical Showrooms & Socials */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-5">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-serif font-black text-brand-ivory">
            <MapPin className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'صالات العرض بالقاهرة ومنصات التواصل' : 'Cairo Showrooms & Social Presence'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-brand-cream/80 mb-1">
                {isAr ? 'صالات العرض (إنجليزي)' : 'Cairo Showrooms (English)'}
              </label>
              <input
                type="text"
                value={settings.cairoShowroomsEn}
                onChange={(e) => setSettings({ ...settings, cairoShowroomsEn: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-brand-cream/80 mb-1">
                {isAr ? 'صالات العرض (عربي)' : 'Cairo Showrooms (Arabic)'}
              </label>
              <input
                type="text"
                value={settings.cairoShowroomsAr}
                onChange={(e) => setSettings({ ...settings, cairoShowroomsAr: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-brand-cream/80 mb-1">Instagram URL</label>
              <input
                type="url"
                value={settings.socialInstagram}
                onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-brand-cream/80 mb-1">TikTok URL</label>
              <input
                type="url"
                value={settings.socialTiktok}
                onChange={(e) => setSettings({ ...settings, socialTiktok: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PAYMENT METHOD                              */}
      {/* ------------------------------------------------------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-brand-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-charcoal border border-brand-gold/60 w-full max-w-lg p-6 sm:p-8 rounded-sm shadow-2xl space-y-5 animate-fade-in font-sans">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <CreditCard className="w-5 h-5 text-brand-gold" />
                <h3 className="font-serif font-bold text-base text-brand-ivory">
                  {editingMethod
                    ? isAr ? 'تعديل طريقة الدفع' : 'Edit Payment Method'
                    : isAr ? 'إضافة طريقة دفع جديدة للمتجر' : 'Add New Payment Method'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-brand-cream/50 hover:text-brand-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePaymentMethod} className="space-y-4 text-xs">
              {/* Type Selector */}
              <div>
                <label className="block font-mono text-brand-cream/80 uppercase mb-1">
                  {isAr ? 'نوع القناة / الطريقة' : 'Payment Rail Type'}
                </label>
                <select
                  value={formType}
                  onChange={(e) => {
                    const val = e.target.value as PaymentMethodConfig['type'];
                    setFormType(val);
                    if (val === 'instapay' && !editingMethod) {
                      setFormNameAr('إنستاباي (التحويل الفوري)');
                      setFormNameEn('InstaPay Transfer');
                      setFormAccountDetails('username@instapay');
                      setFormDescriptionAr('تحويل فوري مباشر عبر إنستاباي لجميع البنوك المصرية');
                      setFormDescriptionEn('Direct instant transfer via InstaPay');
                    } else if (val === 'vodafone_cash' && !editingMethod) {
                      setFormNameAr('فودافون كاش ومحافظ المحمول');
                      setFormNameEn('Vodafone Cash & Mobile Wallets');
                      setFormAccountDetails('01012345678');
                      setFormDescriptionAr('تحويل فوري لمحفظة الهاتف الذكية');
                      setFormDescriptionEn('Instant mobile wallet transfer');
                    } else if (val === 'bank_transfer' && !editingMethod) {
                      setFormNameAr('تحويل بنكي مباشر (CIB / الأهلي)');
                      setFormNameEn('Bank Wire Transfer');
                      setFormAccountDetails('CIB Egypt - IBAN: EG4200100000000000000000000');
                    }
                  }}
                  className="w-full bg-brand-stone/50 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none font-mono"
                >
                  <option value="instapay">⚡ إنستاباي - InstaPay (التحويل اللحظي المباشر)</option>
                  <option value="vodafone_cash">📱 فودافون كاش والمحافظ الذكية (Vodafone Cash & Wallets)</option>
                  <option value="credit_card">💳 بطاقة بنكية أونلاين (Credit / Debit Card)</option>
                  <option value="bank_transfer">🏦 تحويل بنكي رسمي (Bank Wire Transfer)</option>
                  <option value="custom">✨ طريقة مخصصة أخرى (Custom Payment Rail)</option>
                </select>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-brand-cream/80 uppercase mb-1">
                    {isAr ? 'الاسم بالعربية *' : 'Name in Arabic *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثال: إنستاباي"
                    className="w-full bg-brand-black border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none text-right font-sans"
                  />
                </div>

                <div>
                  <label className="block font-mono text-brand-cream/80 uppercase mb-1">
                    {isAr ? 'الاسم بالإنجليزية *' : 'Name in English *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="e.g. InstaPay"
                    className="w-full bg-brand-black border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* Account / Handle Details */}
              <div>
                <label className="block font-mono text-brand-cream/80 uppercase mb-1">
                  {isAr ? 'بيانات الحساب / الرقم الذي يحول له العميل' : 'Account Details / Wallet Phone / Handle'}
                </label>
                <input
                  type="text"
                  value={formAccountDetails}
                  onChange={(e) => setFormAccountDetails(e.target.value)}
                  placeholder={isAr ? 'مثال: atheer@instapay أو 01012345678' : 'e.g. atheer@instapay or 01012345678'}
                  className="w-full bg-brand-black border border-brand-border px-3 py-2 text-brand-gold font-mono font-bold rounded-xs focus:border-brand-gold focus:outline-none"
                />
                <p className="text-[10px] text-brand-cream/50 mt-1">
                  {isAr
                    ? 'سيظهر هذا العنوان أو الرقم للعميل في صفحة إنهاء الطلب مع زر لنسخه بضغطة واحدة.'
                    : 'Customer sees this value on checkout with a 1-click copy button.'}
                </p>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-brand-cream/80 uppercase mb-1">
                    {isAr ? 'الوصف المختصر (عربي)' : 'Short Description (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={formDescriptionAr}
                    onChange={(e) => setFormDescriptionAr(e.target.value)}
                    placeholder="تحويل فوري بدون رسوم"
                    className="w-full bg-brand-black border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none text-right font-sans"
                  />
                </div>

                <div>
                  <label className="block font-mono text-brand-cream/80 uppercase mb-1">
                    {isAr ? 'الوصف المختصر (إنجليزي)' : 'Short Description (English)'}
                  </label>
                  <input
                    type="text"
                    value={formDescriptionEn}
                    onChange={(e) => setFormDescriptionEn(e.target.value)}
                    placeholder="Direct transfer without fees"
                    className="w-full bg-brand-black border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* Customer Instructions */}
              <div>
                <label className="block font-mono text-brand-cream/80 uppercase mb-1">
                  {isAr ? 'تعليمات التحويل للعميل (عربي)' : 'Payment Instructions (Arabic)'}
                </label>
                <textarea
                  rows={2}
                  value={formInstructionsAr}
                  onChange={(e) => setFormInstructionsAr(e.target.value)}
                  placeholder="حول قيمة الطلب واحتفظ برقم المعاملة لإدخاله لتأكيد طلبك"
                  className="w-full bg-brand-black border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none text-right font-sans"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-brand-border text-brand-cream/70 hover:text-brand-ivory text-xs font-mono uppercase rounded-xs"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="px-6 py-2 bg-brand-gold text-brand-black text-xs font-mono font-bold uppercase tracking-wider rounded-xs hover:bg-brand-cream transition-all disabled:opacity-50 flex items-center space-x-1.5 rtl:space-x-reverse"
                >
                  {modalSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{modalSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ طريقة الدفع' : 'Save Payment Rail'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
