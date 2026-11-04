'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { StoreSettings } from '@/types';
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
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

  if (loading || !settings) {
    return (
      <div className="py-24 text-center font-mono text-xs text-brand-cream/60">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
        {isAr ? 'جاري تحميل إعدادات المتجر...' : 'Loading store configuration...'}
      </div>
    );
  }

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
              ? 'تعديل بيانات التواصل المصرية، أرقام الواتساب، العملة المعتمدة (EGP)، وصالات العرض'
              : 'Manage Egyptian contact details, WhatsApp concierge, and EGP currency configurations'}
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center space-x-2 rtl:space-x-reverse bg-brand-gold text-brand-black px-6 py-2.5 text-xs font-mono font-bold tracking-widest uppercase hover:bg-brand-gold-light transition-colors shadow-gold rounded-sm self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التعديلات' : 'Save Settings')}</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-sm border flex items-center justify-between text-xs font-mono ${
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

      <form onSubmit={handleSaveSettings} className="space-y-6 font-mono text-xs">
        {/* Brand Identity & Typography */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-5">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-serif font-black text-brand-ivory">
            <Globe className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'الهوية الاسمية وشعار العلامة' : 'Brand Identity & Name'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-brand-cream/80 mb-1">
                {isAr ? 'اسم العلامة (إنجليزي)' : 'Brand Name (English)'}
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
                {isAr ? 'اسم العلامة (عربي)' : 'Brand Name (Arabic)'}
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

        {/* Currency & Checkout Policy */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-serif font-black text-brand-ivory">
            <CreditCard className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'العملة وطرق الدفع المقررة' : 'Currency & Checkout Rules'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-brand-stone/30 p-4 border border-brand-border/40 rounded-xs">
              <label className="block text-brand-cream/70 mb-1">
                {isAr ? 'العملة المعتمدة للمتجر' : 'Default Checkout Currency'}
              </label>
              <div className="font-bold text-brand-gold text-base">Egyptian Pound (EGP)</div>
              <p className="text-[10px] text-brand-cream/50 mt-1">
                {isAr
                  ? 'تم قفل العملة على الجنيه المصري (EGP) بما يطابق تعليمات إطلاق السوق المصري.'
                  : 'Strictly locked to EGP across customer catalog and admin backend.'}
              </p>
            </div>

            <div className="bg-brand-stone/30 p-4 border border-brand-border/40 rounded-xs">
              <label className="block text-brand-cream/70 mb-1">
                {isAr ? 'طريقة الدفع المعتمدة' : 'Exclusive Payment Rail'}
              </label>
              <div className="font-bold text-emerald-400 text-base">Cash on Delivery (COD)</div>
              <p className="text-[10px] text-brand-cream/50 mt-1">
                {isAr
                  ? 'الدفع عند الاستلام نقداً في كافة المحافظات المصرية.'
                  : 'Customer pays courier upon delivery in Egypt.'}
              </p>
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
              <p className="text-[10px] text-brand-cream/50 mt-1">
                e.g. 201000000000 (Egyptian WhatsApp link format)
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
    </div>
  );
}
