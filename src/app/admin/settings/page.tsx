'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { StoreSettings, PaymentMethodConfig } from '@/types';
import { defaultStoreSettings } from '@/data/defaultStoreSettings';
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
  Lock,
  Eye,
  EyeOff,
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
  Bell,
  Palette,
} from 'lucide-react';
import { PermanentQrCard } from '@/components/PermanentQrCard';

export default function AdminSettingsPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin Account & Password Credentials State
  const [adminEmail, setAdminEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [credSaving, setCredSaving] = useState(false);
  const [credMsg, setCredMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Automated Server WhatsApp Gateway State
  const [waGateway, setWaGateway] = useState<any>({ provider: 'callmebot', callmebotApiKey: '', ultramsgInstanceId: '', ultramsgToken: '' });
  const [waSaving, setWaSaving] = useState(false);
  const [waTesting, setWaTesting] = useState(false);
  const [waMsg, setWaMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Website Theme & Colors State
  const [themeConfig, setThemeConfig] = useState<any>({
    brandGold: '#C5A880',
    brandBlack: '#0A0A0A',
    brandCharcoal: '#141414',
    brandStone: '#1F1F1F',
    brandBorder: '#282828',
    brandIvory: '#FAF9F6',
    brandCream: '#F0EAE1',
  });
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeMsg, setThemeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const COLOR_PRESETS = [
    {
      id: 'classic-gold',
      nameAr: 'الذهب الملكي الكلاسيكي',
      nameEn: 'Atheer Classic Gold',
      gold: '#C5A880',
      black: '#0A0A0A',
      charcoal: '#141414',
      border: '#282828',
      accentLabel: 'Gold on Jet Black',
      accentLabelAr: 'ذهب كلاسيكي على أسود داكن',
    },
    {
      id: 'cyber-gold',
      nameAr: 'ذهب نيون ستريتوير',
      nameEn: 'Cyber Street Gold',
      gold: '#E5C378',
      black: '#0D0E12',
      charcoal: '#161922',
      border: '#2D3240',
      accentLabel: 'Vibrant Neon Gold',
      accentLabelAr: 'ذهب نيون شبابي متوهج',
    },
    {
      id: 'platinum-silver',
      nameAr: 'الفضة الماتينج الراقية',
      nameEn: 'Platinum & Onyx',
      gold: '#E0E0E0',
      black: '#0E0E0E',
      charcoal: '#1A1A1A',
      border: '#333333',
      accentLabel: 'Matte Platinum Silver',
      accentLabelAr: 'فضة بلاتينيوم مطفأة',
    },
    {
      id: 'imperial-burgundy',
      nameAr: 'الخمري والذهب الإمبراطوري',
      nameEn: 'Imperial Burgundy & Gold',
      gold: '#D4AF37',
      black: '#12080B',
      charcoal: '#1E1015',
      border: '#3D1B26',
      accentLabel: 'Deep Imperial Burgundy',
      accentLabelAr: 'خمري ملكي عميق مع لمسات ذهبية',
    },
    {
      id: 'emerald-luxe',
      nameAr: 'الزمرد الملكي الفاخر',
      nameEn: 'Emerald Luxe',
      gold: '#50C878',
      black: '#070F0A',
      charcoal: '#0F1A13',
      border: '#1E3827',
      accentLabel: 'Luxe Emerald Green',
      accentLabelAr: 'أخضر زمردي فاخر مع ذهب',
    },
  ];

  const handleApplyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    const updated = {
      ...themeConfig,
      brandGold: preset.gold,
      brandBlack: preset.black,
      brandCharcoal: preset.charcoal,
      brandBorder: preset.border,
    };
    setThemeConfig(updated);
  };

  const handleSaveTheme = async (themeToSave?: any) => {
    const target = themeToSave || themeConfig;
    setThemeSaving(true);
    setThemeMsg(null);
    try {
      const res = await adminFetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target),
      });
      const data = await res.json();
      if (data.success) {
        setThemeConfig(data.theme);
        setThemeMsg({
          type: 'success',
          text: isAr ? 'تم حفظ وتطبيق ألوان وهوية الموقع بنجاح على المتجر بالكامل!' : 'Website colors saved and applied successfully!',
        });
        setTimeout(() => setThemeMsg(null), 4000);
      } else {
        setThemeMsg({ type: 'error', text: data.error || 'فشل حفظ الألوان' });
      }
    } catch (e: any) {
      setThemeMsg({ type: 'error', text: e.message || 'خطأ في الاتصال' });
    } finally {
      setThemeSaving(false);
    }
  };

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

      adminFetch('/api/admin/credentials')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.email) setAdminEmail(d.email);
        })
        .catch(() => {});

      adminFetch('/api/admin/whatsapp-gateway')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.config) setWaGateway(d.config);
        })
        .catch(() => {});

      adminFetch('/api/admin/theme')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.theme) setThemeConfig(d.theme);
        })
        .catch(() => {});
    } catch (err) {
      console.error('Failed to load store settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWaGateway = async () => {
    setWaSaving(true);
    setWaMsg(null);
    try {
      const res = await adminFetch('/api/admin/whatsapp-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: waGateway }),
      });
      const data = await res.json();
      if (data.success) {
        setWaMsg({ type: 'success', text: isAr ? 'تم حفظ إعدادات بوابة الواتساب التلقائية بنجاح!' : 'WhatsApp Gateway saved successfully!' });
        setTimeout(() => setWaMsg(null), 4000);
      } else {
        setWaMsg({ type: 'error', text: data.error || 'Failed to save gateway' });
      }
    } catch (e: any) {
      setWaMsg({ type: 'error', text: e.message });
    } finally {
      setWaSaving(false);
    }
  };

  const handleTestWaGateway = async () => {
    setWaTesting(true);
    setWaMsg(null);
    try {
      const res = await adminFetch('/api/admin/whatsapp-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: waGateway, testPhone: waGateway.targetPhone || settings?.whatsappNumber || '201015993802' }),
      });
      const data = await res.json();
      if (data.testResult?.success) {
        setWaMsg({
          type: 'success',
          text: isAr
            ? 'نجح الإرسال! تم إرسال رسالة واتساب تجريبية لهاتفك بنجاح الآن ✓'
            : 'Test message sent to your WhatsApp successfully!',
        });
      } else {
        setWaMsg({
          type: 'error',
          text: data.testResult?.error || (isAr ? 'لم ينجح الإرسال: تأكد من تفعيل الكود وإرسال رسالة التفعيل أولاً' : 'Failed to send test message'),
        });
      }
    } catch (e: any) {
      setWaMsg({ type: 'error', text: e.message });
    } finally {
      setWaTesting(false);
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

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim()) {
      setCredMsg({ type: 'error', text: isAr ? 'يرجى إدخال البريد الإلكتروني' : 'Email is required' });
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setCredMsg({ type: 'error', text: isAr ? 'كلمة المرور يجب ألا تقل عن 6 أحرف' : 'Password must be at least 6 characters' });
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setCredMsg({ type: 'error', text: isAr ? 'كلمة المرور وتأكيدها غير متطابقين' : 'Passwords do not match' });
      return;
    }

    setCredSaving(true);
    setCredMsg(null);
    try {
      const res = await adminFetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim(), newPassword: newPassword || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setCredMsg({
          type: 'success',
          text: isAr ? 'تم تحديث البريد الإلكتروني وكلمة المرور بنجاح وبسرية تامة!' : 'Credentials updated securely!',
        });
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setCredMsg(null), 4000);
      } else {
        setCredMsg({ type: 'error', text: data.error || (isAr ? 'فشل في تحديث بيانات الدخول' : 'Update failed') });
      }
    } catch (err: any) {
      setCredMsg({ type: 'error', text: err.message || (isAr ? 'خطأ في الاتصال' : 'Connection error') });
    } finally {
      setCredSaving(false);
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
                  ? 'اكتب رقمك العادي (مثال: 01012345678 أو 201012345678) — يُستخدم هذا الرقم لاستقبال فواتير الطلبات الجديدة مباشرة من العملاء وتأكيدها، ولزر المحادثة العائم.'
                  : 'Enter Egyptian mobile (010..., 011...) or international (201...) format — receives incoming order receipts and powers the concierge chat.'}
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

          {/* Order Notification Status Box */}
          <div className="p-4 bg-brand-stone/20 border border-brand-border/60 rounded-xs space-y-2 text-xs font-mono">
            <div className="font-bold text-brand-gold flex items-center space-x-2 rtl:space-x-reverse">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'قنوات استلام إشعارات الطلبات الجديدة لصاحب المتجر' : 'Store Owner Order Notification Channels'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
              <div className="p-2.5 bg-brand-charcoal border border-brand-border/40 rounded-xs">
                <span className="text-brand-cream/60 block text-[10px] uppercase font-bold">1. واتساب المتجر (WhatsApp)</span>
                <span className="text-emerald-400 font-bold">توجيه فوري ✓</span>
                <span className="text-[10px] text-brand-cream/70 block mt-0.5">فتح محادثة واتساب للعميل بإشعار الفاتورة لرقمك</span>
              </div>
              <div className="p-2.5 bg-brand-charcoal border border-brand-border/40 rounded-xs">
                <span className="text-brand-cream/60 block text-[10px] uppercase font-bold">2. لوحة التحكم (Live Sound & Bell)</span>
                <span className="text-emerald-400 font-bold">رنين وإشعار لحظي ✓</span>
                <span className="text-[10px] text-brand-cream/70 block mt-0.5">صوت تنبيه وجرس إشعارات حي بالطلبات</span>
              </div>
              <div className="p-2.5 bg-brand-charcoal border border-brand-border/40 rounded-xs">
                <span className="text-brand-cream/60 block text-[10px] uppercase font-bold">3. بريد الإدارة (Admin Email)</span>
                <span className="text-emerald-400 font-bold">مسجل ومعتمد ✓</span>
                <span className="text-[10px] text-brand-cream/70 block mt-0.5">توثيق طلبات المتجر بسجل الإشعارات</span>
              </div>
            </div>
          </div>
        </div>

        {/* Automated WhatsApp Gateway Dispatcher */}
        <div className="bg-brand-charcoal border border-emerald-500/50 rounded-sm p-6 space-y-5 shadow-luxury-dark">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-border/60">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse text-sm font-serif font-black text-brand-ivory">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-4 h-4 fill-emerald-400/20" />
              </div>
              <div>
                <span className="block">{isAr ? 'إرسال إشعارات الواتساب تلقائياً من السيرفر (بدون تدخل العميل)' : 'Automated Server WhatsApp Dispatch'}</span>
                <span className="text-[11px] text-brand-cream/60 font-sans font-normal">
                  {isAr ? 'أول ما العميل يطلب، السيرفر يرسل رسالة واتساب فورية إلى رقم هاتفك مباشرة' : 'Server automatically pings your WhatsApp number the instant an order is placed'}
                </span>
              </div>
            </div>
          </div>

          {waMsg && (
            <div
              className={`p-3 rounded-xs border text-xs font-mono flex items-center justify-between ${
                waMsg.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
              }`}
            >
              <span>{waMsg.text}</span>
              <button onClick={() => setWaMsg(null)} className="text-white/60 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="space-y-4 text-xs font-mono">
            {/* Provider Select */}
            <div>
              <label className="block text-brand-cream/80 mb-1 font-bold">
                {isAr ? 'بوابة إرسال الواتساب التلقائية:' : 'WhatsApp Automation Gateway Provider:'}
              </label>
              <select
                value={waGateway.provider || 'callmebot'}
                onChange={(e) => setWaGateway({ ...waGateway, provider: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
              >
                <option value="callmebot">{isAr ? 'خدمة CallMeBot (مجانية 100% — تفعيل سهل في دقيقة واحدة)' : 'CallMeBot (100% Free - 1 minute activation)'}</option>
                <option value="ultramsg">{isAr ? 'خدمة UltraMsg / GreenAPI (بوابة رمز QR مخصصة)' : 'UltraMsg / GreenAPI (Dedicated QR Gateway)'}</option>
                <option value="custom_webhook">{isAr ? 'رابط Webhook مخصص (Custom Webhook)' : 'Custom Webhook'}</option>
              </select>
            </div>

            {/* CallMeBot Settings & Guide */}
            {(!waGateway.provider || waGateway.provider === 'callmebot') && (
              <div className="p-4 bg-brand-stone/20 border border-brand-border/60 rounded-xs space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-ivory mb-1 font-bold">
                      {isAr ? '1. رقم هاتفك المستلم للإشعارات (مع كود مصر 20):' : '1. Recipient WhatsApp Number (with country code):'}
                    </label>
                    <input
                      type="text"
                      value={waGateway.targetPhone || settings.whatsappNumber || ''}
                      onChange={(e) => setWaGateway({ ...waGateway, targetPhone: e.target.value.trim() })}
                      placeholder="201015993802"
                      className="w-full bg-brand-charcoal border border-brand-border px-3 py-2 text-brand-ivory font-mono rounded-sm focus:border-brand-gold focus:outline-none"
                    />
                    <p className="text-[10px] text-brand-cream/60 mt-1">
                      {isAr ? 'يجب أن يكون نفس الرقم الذي تستخدمه في الواتساب لمراسلة البوت.' : 'Must match the phone number you use on WhatsApp.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-brand-ivory mb-1 font-bold">
                      {isAr ? '2. كود الـ API Key المستلم من البوت:' : '2. API Key received from bot:'}
                    </label>
                    <input
                      type="text"
                      value={waGateway.callmebotApiKey || ''}
                      onChange={(e) => setWaGateway({ ...waGateway, callmebotApiKey: e.target.value.trim() })}
                      placeholder={isAr ? 'مثال: 1234567' : 'e.g. 1234567'}
                      className="w-full bg-brand-charcoal border border-brand-border px-3 py-2 text-brand-gold font-mono font-bold rounded-sm focus:border-brand-gold focus:outline-none"
                    />
                    <p className="text-[10px] text-brand-cream/60 mt-1">
                      {isAr ? 'الكود الرقمي الذي سيرسله لك البوت في رسالة الرد.' : 'The numeric key replied by CallMeBot.'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-brand-charcoal/80 border border-brand-border/80 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-brand-ivory">
                      {isAr ? 'الخطوة الأولى: فتح المحادثة مع بوت التفعيل' : 'Step 1: Open chat with activation bot'}
                    </p>
                    <p className="text-[11px] text-brand-cream/60">
                      {isAr ? 'اضغط الزر الأخضر وسيفتح لك واتساب تلقائياً مع الرسالة الجاهزة: "I allow callmebot to send me messages".' : 'Click the button to open WhatsApp with the pre-filled message.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 w-full sm:w-auto">
                    <a
                      href={`https://wa.me/34698288973?text=${encodeURIComponent('I allow callmebot to send me messages')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xs text-xs font-bold flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{isAr ? 'اضغط هنا لمراسلة البوت الرسمي (+34 698 28 89 73)' : 'Message Official Bot (+34 698 28 89 73)'}</span>
                    </a>
                    <a
                      href={`https://wa.me/34621062163?text=${encodeURIComponent('I allow callmebot to send me messages')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-brand-stone/60 hover:bg-brand-stone text-brand-cream border border-brand-border/60 rounded-xs text-[11px] flex items-center justify-center space-x-1 rtl:space-x-reverse transition-colors"
                      title={isAr ? 'سيرفر بديل في حال كان السيرفر الأول مشغولاً' : 'Alternative bot if primary is busy'}
                    >
                      <span>{isAr ? 'بوت بديل (+34 621 06 21 63)' : 'Alternative Bot (+34 621 06 21 63)'}</span>
                    </a>
                  </div>
                </div>

                <div className="text-[11px] text-brand-cream/80 font-sans leading-relaxed pt-2 border-t border-brand-border/40">
                  <p className="font-bold text-brand-gold mb-1">{isAr ? 'خطوات التفعيل في 30 ثانية:' : 'Easy 30-second Activation:'}</p>
                  <ol className="list-decimal list-inside space-y-1 text-brand-cream/80">
                    <li>{isAr ? 'اضغط على الزر الأخضر بالأعلى لفتح محادثة الواتساب مع بوت CallMeBot.' : 'Click the green button above to message the activation bot on WhatsApp.'}</li>
                    <li>{isAr ? 'اضغط إرسال (Send) للرسالة الجاهزة؛ سيرد عليك البوت في ثوانٍ برسالة: "Your APIKEY is: 1234567".' : 'Send the pre-filled message; the bot responds with your API Key in seconds.'}</li>
                    <li>{isAr ? 'انسخ هذا الرقم وضعه في خانة (كود الـ API Key) أعلاه، ثم اضغط بالأسفل "حفظ إعدادات البوابة" ثم "تجربة إرسال رسالة لهاتفي الآن".' : 'Paste that key into the box above, click Save then Test!'}</li>
                  </ol>
                </div>
              </div>
            )}

            {/* UltraMsg Settings */}
            {waGateway.provider === 'ultramsg' && (
              <div className="p-4 bg-brand-stone/20 border border-brand-border/60 rounded-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-brand-cream/80 mb-1 font-bold">UltraMsg Instance ID:</label>
                    <input
                      type="text"
                      value={waGateway.ultramsgInstanceId || ''}
                      onChange={(e) => setWaGateway({ ...waGateway, ultramsgInstanceId: e.target.value.trim() })}
                      placeholder="instance12345"
                      className="w-full bg-brand-charcoal border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-cream/80 mb-1 font-bold">UltraMsg Token:</label>
                    <input
                      type="text"
                      value={waGateway.ultramsgToken || ''}
                      onChange={(e) => setWaGateway({ ...waGateway, ultramsgToken: e.target.value.trim() })}
                      placeholder="token_xxxx"
                      className="w-full bg-brand-charcoal border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={waTesting}
                onClick={handleTestWaGateway}
                className="px-4 py-2 border border-emerald-500/70 text-emerald-400 hover:bg-emerald-950/40 rounded-xs font-bold transition-colors flex items-center space-x-1.5 rtl:space-x-reverse"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{waTesting ? (isAr ? 'جاري الإرسال التجريبي...' : 'Sending Test...') : (isAr ? 'تجربة إرسال رسالة لهاتفي الآن' : 'Test WhatsApp Ping')}</span>
              </button>

              <button
                type="button"
                disabled={waSaving}
                onClick={handleSaveWaGateway}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xs transition-colors flex items-center space-x-1.5 rtl:space-x-reverse shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{waSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ إعدادات البوابة' : 'Save Gateway')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Website Colors & Visual Identity Control */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-serif font-black text-brand-ivory">
              <Palette className="w-4 h-4 text-brand-gold" />
              <span>{isAr ? 'التحكم في ألوان وهوية المتجر (Website Colors & Visual Identity)' : 'Website Colors & Visual Identity'}</span>
            </div>
            <span className="text-[11px] font-mono text-brand-cream/60">
              {isAr ? 'تحديث فوري لجميع صفحات المتجر عبر CSS Variables' : 'Instant live update via CSS variables'}
            </span>
          </div>

          {themeMsg && (
            <div
              className={`p-3 text-xs font-mono rounded-xs flex items-center space-x-2 rtl:space-x-reverse ${
                themeMsg.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/80 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/80 text-rose-300'
              }`}
            >
              {themeMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{themeMsg.text}</span>
            </div>
          )}

          {/* 1-Click Color Presets */}
          <div>
            <label className="block text-xs font-bold text-brand-ivory mb-2 font-mono">
              {isAr ? '🎨 باقات ألوان ستريتوير فاخرة جاهزة بضغطة واحدة:' : '🎨 1-Click Luxury Streetwear Color Presets:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {COLOR_PRESETS.map((preset) => {
                const isActive = themeConfig.brandGold === preset.gold && themeConfig.brandBlack === preset.black;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-3 text-start rtl:text-right border rounded-xs transition-all flex items-center justify-between ${
                      isActive
                        ? 'border-brand-gold bg-brand-gold/15 shadow-gold ring-1 ring-brand-gold'
                        : 'border-brand-border/80 bg-brand-stone/20 hover:border-brand-gold/60'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-brand-ivory block font-sans">
                        {isAr ? preset.nameAr : preset.nameEn}
                      </span>
                      <span className="text-[10px] text-brand-cream/60 font-mono block mt-0.5">
                        {isAr ? preset.accentLabelAr : preset.accentLabel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse flex-shrink-0 ml-2 rtl:mr-2">
                      <span className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: preset.black }} title="Background" />
                      <span className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: preset.charcoal }} title="Surface" />
                      <span className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: preset.gold }} title="Accent Gold" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-brand-ivory mb-3 font-mono">
              {isAr ? '⚙️ تخصيص الألوان بدقة (Color Pickers & Hex Codes):' : '⚙️ Custom Color Palette:'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Brand Gold / Accent */}
              <div className="p-3 bg-brand-stone/30 border border-brand-border/80 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-ivory font-mono">
                    {isAr ? '1. لون الذهب واللمسات (Accent):' : '1. Accent / Gold Color:'}
                  </span>
                  <input
                    type="color"
                    value={themeConfig.brandGold || '#C5A880'}
                    onChange={(e) => setThemeConfig({ ...themeConfig, brandGold: e.target.value })}
                    className="w-7 h-7 rounded-xs border border-brand-border cursor-pointer bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={themeConfig.brandGold || ''}
                  onChange={(e) => setThemeConfig({ ...themeConfig, brandGold: e.target.value })}
                  placeholder="#C5A880"
                  className="w-full bg-brand-charcoal border border-brand-border px-3 py-1.5 text-xs text-brand-gold font-mono font-bold rounded-xs focus:border-brand-gold focus:outline-none"
                />
                <span className="text-[10px] text-brand-cream/60 block">
                  {isAr ? 'يحدد ألوان الأزرار الرئيسية، والأختام، والأسعار' : 'Powers primary buttons, badges, prices'}
                </span>
              </div>

              {/* Brand Black / Main Background */}
              <div className="p-3 bg-brand-stone/30 border border-brand-border/80 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-ivory font-mono">
                    {isAr ? '2. لون الخلفية الأساسية (Main BG):' : '2. Main Background:'}
                  </span>
                  <input
                    type="color"
                    value={themeConfig.brandBlack || '#0A0A0A'}
                    onChange={(e) => setThemeConfig({ ...themeConfig, brandBlack: e.target.value })}
                    className="w-7 h-7 rounded-xs border border-brand-border cursor-pointer bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={themeConfig.brandBlack || ''}
                  onChange={(e) => setThemeConfig({ ...themeConfig, brandBlack: e.target.value })}
                  placeholder="#0A0A0A"
                  className="w-full bg-brand-charcoal border border-brand-border px-3 py-1.5 text-xs text-brand-ivory font-mono font-bold rounded-xs focus:border-brand-gold focus:outline-none"
                />
                <span className="text-[10px] text-brand-cream/60 block">
                  {isAr ? 'خلفية المتجر الرئيسية بالوضع الداكن' : 'Main background for dark theme'}
                </span>
              </div>

              {/* Brand Charcoal / Surface Cards */}
              <div className="p-3 bg-brand-stone/30 border border-brand-border/80 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-ivory font-mono">
                    {isAr ? '3. لون البطاقات والحاويات (Cards):' : '3. Card & Surface BG:'}
                  </span>
                  <input
                    type="color"
                    value={themeConfig.brandCharcoal || '#141414'}
                    onChange={(e) => setThemeConfig({ ...themeConfig, brandCharcoal: e.target.value })}
                    className="w-7 h-7 rounded-xs border border-brand-border cursor-pointer bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={themeConfig.brandCharcoal || ''}
                  onChange={(e) => setThemeConfig({ ...themeConfig, brandCharcoal: e.target.value })}
                  placeholder="#141414"
                  className="w-full bg-brand-charcoal border border-brand-border px-3 py-1.5 text-xs text-brand-ivory font-mono font-bold rounded-xs focus:border-brand-gold focus:outline-none"
                />
                <span className="text-[10px] text-brand-cream/60 block">
                  {isAr ? 'خلفيات بطاقات المنتجات والنوافذ' : 'Surfaces of product cards & modals'}
                </span>
              </div>

              {/* Brand Border */}
              <div className="p-3 bg-brand-stone/30 border border-brand-border/80 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-ivory font-mono">
                    {isAr ? '4. لون الإطارات والحواف (Borders):' : '4. Borders & Dividers:'}
                  </span>
                  <input
                    type="color"
                    value={themeConfig.brandBorder || '#282828'}
                    onChange={(e) => setThemeConfig({ ...themeConfig, brandBorder: e.target.value })}
                    className="w-7 h-7 rounded-xs border border-brand-border cursor-pointer bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={themeConfig.brandBorder || ''}
                  onChange={(e) => setThemeConfig({ ...themeConfig, brandBorder: e.target.value })}
                  placeholder="#282828"
                  className="w-full bg-brand-charcoal border border-brand-border px-3 py-1.5 text-xs text-brand-ivory font-mono font-bold rounded-xs focus:border-brand-gold focus:outline-none"
                />
                <span className="text-[10px] text-brand-cream/60 block">
                  {isAr ? 'خطوط التقسيم وحواف العناصر' : 'Border lines and dividers'}
                </span>
              </div>

              {/* Brand Ivory / Text */}
              <div className="p-3 bg-brand-stone/30 border border-brand-border/80 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-ivory font-mono">
                    {isAr ? '5. لون العناوين والنصوص (Text):' : '5. Headings & Text:'}
                  </span>
                  <input
                    type="color"
                    value={themeConfig.brandIvory || '#FAF9F6'}
                    onChange={(e) => setThemeConfig({ ...themeConfig, brandIvory: e.target.value })}
                    className="w-7 h-7 rounded-xs border border-brand-border cursor-pointer bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={themeConfig.brandIvory || ''}
                  onChange={(e) => setThemeConfig({ ...themeConfig, brandIvory: e.target.value })}
                  placeholder="#FAF9F6"
                  className="w-full bg-brand-charcoal border border-brand-border px-3 py-1.5 text-xs text-brand-ivory font-mono font-bold rounded-xs focus:border-brand-gold focus:outline-none"
                />
                <span className="text-[10px] text-brand-cream/60 block">
                  {isAr ? 'لون الخط الرئيسي للعناوين' : 'Primary text and heading color'}
                </span>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 border rounded-xs flex flex-col justify-between" style={{ backgroundColor: themeConfig.brandBlack || '#0A0A0A', borderColor: themeConfig.brandBorder || '#282828' }}>
                <span className="text-[10px] font-mono text-brand-cream/60 uppercase block mb-1">
                  {isAr ? '👁️ معاينة حية للمظهر:' : '👁️ Live Visual Preview:'}
                </span>
                <div className="p-3 border rounded-xs space-y-2" style={{ backgroundColor: themeConfig.brandCharcoal || '#141414', borderColor: themeConfig.brandBorder || '#282828' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: themeConfig.brandIvory || '#FAF9F6' }}>
                      {isAr ? 'هودي أثير ٥٠٠ جم/م²' : 'ATHEER 500 GSM Hoodie'}
                    </span>
                    <span className="text-xs font-bold font-mono" style={{ color: themeConfig.brandGold || '#C5A880' }}>
                      1,850 ج.م
                    </span>
                  </div>
                  <div className="py-1 px-2 text-center text-[10px] font-bold uppercase rounded-xs" style={{ backgroundColor: themeConfig.brandGold || '#C5A880', color: themeConfig.brandBlack || '#0A0A0A' }}>
                    شراء فوري (الدفع عند الاستلام)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Theme Button */}
          <div className="flex justify-end pt-3 border-t border-brand-border/60">
            <button
              type="button"
              disabled={themeSaving}
              onClick={() => handleSaveTheme()}
              className="px-6 py-2.5 bg-brand-gold hover:bg-brand-gold-hover text-brand-black font-bold font-mono text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-1.5 rtl:space-x-reverse shadow-gold disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{themeSaving ? (isAr ? 'جاري تطبيق الألوان...' : 'Applying Colors...') : (isAr ? 'حفظ وتطبيق ألوان المتجر فوراً' : 'Save & Apply Live Colors')}</span>
            </button>
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
      {/* ADMIN ACCOUNT & CREDENTIALS SECURITY SECTION                  */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-brand-charcoal border border-brand-gold/50 rounded-sm p-6 sm:p-7 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-4">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-xs bg-brand-gold/15 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
              <ShieldCheck className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h2 className="text-base font-serif font-black text-brand-ivory">
                {isAr ? 'حساب الإدارة وكلمة المرور (سري ومحمي)' : 'Admin Credentials & Security'}
              </h2>
              <p className="text-[11px] font-mono text-brand-cream/60 mt-0.5">
                {isAr
                  ? 'يمكنك تغيير بريد الإدارة وكلمة السر مباشرة من هنا بأمان وتشفير تام دون أن يراها أحد.'
                  : 'Update admin login email and secret password directly with end-to-end encryption.'}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2.5 py-1 rounded-xs bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 self-start sm:self-center">
            {isAr ? 'تشفير PBKDF2 نشط' : 'PBKDF2 Encrypted'}
          </span>
        </div>

        {credMsg && (
          <div
            className={`p-3.5 rounded-xs border text-xs font-mono animate-fade-in flex items-center space-x-2 rtl:space-x-reverse ${
              credMsg.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                : 'bg-rose-950/50 border-rose-500 text-rose-300'
            }`}
          >
            {credMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{credMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateCredentials} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Admin Email */}
            <div>
              <label className="block text-xs font-mono text-brand-cream/80 uppercase mb-1.5">
                {isAr ? 'البريد الإلكتروني للإدارة' : 'Admin Login Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-gold/60 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@atheer.store"
                  className="w-full bg-brand-stone/40 border border-brand-border focus:border-brand-gold pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2.5 text-xs text-brand-ivory rounded-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-mono text-brand-cream/80 uppercase mb-1.5">
                {isAr ? 'كلمة السر الجديدة' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-gold/60 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isAr ? 'اتركه فارغاً إن لم ترغب بتغييره' : 'Leave empty to keep unchanged'}
                  className="w-full bg-brand-stone/40 border border-brand-border focus:border-brand-gold pl-9 pr-9 rtl:pl-9 rtl:pr-9 py-2.5 text-xs text-brand-ivory rounded-xs font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-brand-cream/50 hover:text-brand-ivory"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-mono text-brand-cream/80 uppercase mb-1.5">
                {isAr ? 'تأكيد كلمة السر' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-gold/60 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isAr ? 'أعد كتابة كلمة السر' : 'Re-enter password'}
                  className="w-full bg-brand-stone/40 border border-brand-border focus:border-brand-gold pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2.5 text-xs text-brand-ivory rounded-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={credSaving}
              className="px-6 py-2.5 bg-brand-gold text-brand-black text-xs font-mono font-bold uppercase tracking-wider rounded-xs hover:bg-brand-gold-hover transition-all shadow-gold flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
            >
              {credSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{credSaving ? (isAr ? 'جاري التحديث...' : 'Saving...') : isAr ? 'تحديث بيانات الدخول بأمان' : 'Save Credentials'}</span>
            </button>
          </div>
        </form>
      </div>

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
