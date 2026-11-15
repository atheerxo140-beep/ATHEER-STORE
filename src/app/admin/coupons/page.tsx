'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Coupon } from '@/types';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Percent,
  Banknote,
  Copy,
  PowerOff,
  Power,
  RotateCcw,
  Sparkles,
  Info,
  ExternalLink,
  X,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminCouponsPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const initialForm = {
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderAmount: 1000,
    usageLimit: 200,
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminFetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr ? `تم إنشاء كود الخصم "${data.coupon.code}" بنجاح.` : `Coupon "${data.coupon.code}" created.`,
        });
        setIsCreateModalOpen(false);
        setFormData(initialForm);
        fetchCoupons();
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to create coupon' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle single coupon active/inactive with instant optimistic UI
  const handleToggleActive = async (id: string, currentStatus: boolean, code: string) => {
    // 1. Instant optimistic update
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
    );

    try {
      const res = await adminFetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr
            ? `تم ${!currentStatus ? 'تفعيل' : 'تعطيل وإلغاء'} كود الخصم "${code}" بنجاح`
            : `Coupon "${code}" ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        });
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        // Revert on error
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: currentStatus } : c))
        );
        setFeedbackMsg({ type: 'error', text: data.error || (isAr ? 'فشل تعديل الحالة' : 'Failed to update') });
      }
    } catch (err: any) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: currentStatus } : c))
      );
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  // Delete single coupon with instant optimistic UI
  const handleDeleteCoupon = async (id: string, code: string) => {
    const confirmed = window.confirm(
      isAr
        ? `هل تريد بالتأكيد حذف كود الخصم "${code}" نهائياً؟ لن يتمكن أي عميل من استخدامه.`
        : `Are you sure you want to delete coupon "${code}"?`
    );
    if (!confirmed) return;

    const previousCoupons = [...coupons];
    setCoupons((prev) => prev.filter((c) => c.id !== id));

    try {
      const res = await adminFetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr ? `تم حذف كود الخصم "${code}" بنجاح` : `Coupon "${code}" deleted`,
        });
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        setCoupons(previousCoupons);
        setFeedbackMsg({ type: 'error', text: data.error || (isAr ? 'فشل الحذف' : 'Failed to delete') });
      }
    } catch (err: any) {
      setCoupons(previousCoupons);
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  // Batch: Deactivate or Activate All
  const handleBatchToggle = async (action: 'deactivate_all' | 'activate_all') => {
    const isDeactivate = action === 'deactivate_all';
    const confirmed = window.confirm(
      isAr
        ? isDeactivate
          ? 'هل تريد تعطيل وإلغاء كافة كوبونات الخصم فوراً؟ لن يتمكن أي عميل من استخدام أي خصم.'
          : 'هل تريد تفعيل كافة كوبونات الخصم المسجلة؟'
        : isDeactivate
        ? 'Deactivate all discount coupons now?'
        : 'Activate all discount coupons?'
    );
    if (!confirmed) return;

    setBatchLoading(true);
    try {
      const res = await adminFetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
        setFeedbackMsg({
          type: 'success',
          text: isAr
            ? isDeactivate
              ? 'تم تعطيل وإلغاء كافة كوبونات الخصم بالكامل!'
              : 'تم تفعيل كافة كوبونات الخصم!'
            : data.message,
        });
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setBatchLoading(false);
    }
  };

  // Batch: Delete All Coupons
  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      isAr
        ? 'هل تريد بالتأكيد حذف كافة كوبونات الخصم نهائياً من قاعدة البيانات والمتجر؟'
        : 'Are you sure you want to permanently delete all coupons?'
    );
    if (!confirmed) return;

    setBatchLoading(true);
    try {
      const res = await adminFetch('/api/admin/coupons?all=true', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCoupons([]);
        setFeedbackMsg({
          type: 'success',
          text: isAr ? 'تم حذف كافة كوبونات الخصم بنجاح!' : 'All coupons deleted successfully!',
        });
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setBatchLoading(false);
    }
  };

  // Batch: Restore Defaults
  const handleResetDefaults = async () => {
    setBatchLoading(true);
    try {
      const res = await adminFetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_defaults' }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
        setFeedbackMsg({
          type: 'success',
          text: isAr ? 'تمت استعادة الكوبونات الافتراضية بنجاح' : 'Default coupons restored',
        });
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setBatchLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setFeedbackMsg({
      type: 'success',
      text: isAr ? `تم نسخ الكود "${code}" للحافظة` : `Copied "${code}" to clipboard!`,
    });
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = coupons.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-gold uppercase tracking-widest mb-1">
            <Tag className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'العروض والخصومات الترويجية' : 'Promotions & Discounts'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-ivory font-serif">
            {isAr ? 'إدارة كوبونات الخصم' : 'Coupon Codes'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-1">
            {isAr
              ? 'التحكم الفوري في تفعيل، إلغاء، وحذف كوبونات الخصم المئوية والثابتة بالجنيه المصري'
              : 'Direct control to activate, cancel, or delete percentage and fixed EGP coupon codes'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Action: Deactivate All */}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => handleBatchToggle('deactivate_all')}
              disabled={batchLoading}
              className="px-3 py-2 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/40 text-rose-400 text-xs font-mono font-bold rounded-xs transition-colors flex items-center space-x-1.5 rtl:space-x-reverse"
              title={isAr ? 'إلغاء وتعطيل كافة الكوبونات بضغطة واحدة' : 'Deactivate all coupons'}
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span>{isAr ? 'تعطيل كافة الكوبونات' : 'Disable All'}</span>
            </button>
          )}

          {/* Quick Action: Activate All */}
          {coupons.length > 0 && activeCount < coupons.length && (
            <button
              type="button"
              onClick={() => handleBatchToggle('activate_all')}
              disabled={batchLoading}
              className="px-3 py-2 bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold rounded-xs transition-colors flex items-center space-x-1.5 rtl:space-x-reverse"
              title={isAr ? 'تفعيل كافة الكوبونات' : 'Activate all coupons'}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isAr ? 'تفعيل الكل' : 'Enable All'}</span>
            </button>
          )}

          {/* Quick Action: Delete All */}
          {coupons.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={batchLoading}
              className="px-3 py-2 bg-brand-charcoal hover:bg-rose-950/40 border border-brand-border hover:border-rose-500/40 text-brand-cream/70 hover:text-rose-400 text-xs font-mono font-bold rounded-xs transition-colors flex items-center space-x-1.5 rtl:space-x-reverse"
              title={isAr ? 'حذف كافة الكوبونات نهائياً' : 'Delete all coupons'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'حذف الكل' : 'Delete All'}</span>
            </button>
          )}

          {/* Restore Defaults */}
          {coupons.length === 0 && (
            <button
              type="button"
              onClick={handleResetDefaults}
              disabled={batchLoading}
              className="px-3 py-2 bg-brand-charcoal hover:bg-brand-stone/60 border border-brand-gold/40 text-brand-gold text-xs font-mono font-bold rounded-xs transition-colors flex items-center space-x-1.5 rtl:space-x-reverse"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'استعادة الكوبونات الافتراضية' : 'Restore Defaults'}</span>
            </button>
          )}

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchCoupons}
            className="p-2.5 bg-brand-charcoal border border-brand-border text-brand-cream/80 hover:text-brand-gold hover:border-brand-gold/40 transition-colors rounded-xs"
            title={isAr ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Create New */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 rtl:space-x-reverse bg-brand-gold text-brand-black px-4 py-2.5 text-xs font-mono font-bold tracking-widest uppercase hover:bg-brand-gold-hover transition-colors shadow-gold rounded-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إنشاء كود خصم جديد' : 'New Coupon'}</span>
          </button>
        </div>
      </div>

      {/* Helpful Guidance Banner */}
      <div className="p-4 bg-brand-stone/30 border border-brand-border/60 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-start space-x-2.5 rtl:space-x-reverse">
          <Info className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-brand-cream/80 leading-relaxed">
            <p>
              <strong className="text-brand-ivory">{isAr ? 'طريقة إلغاء أو حذف الكوبونات:' : 'How to cancel coupons:'}</strong>{' '}
              {isAr
                ? 'اضغط مباشرة على زر الحالة الأخضر «نشط» ليتحول فوراً إلى «معطل / ملغي» ويتوقف الخصم تماماً، أو اضغط على سلة المهملات لحذف الكود نهائياً.'
                : 'Click directly on the green "Active" button to toggle it to "Inactive / Disabled", or click the trash icon to permanently remove it.'}
            </p>
            <p className="text-[11px] text-brand-cream/60">
              {isAr
                ? '💡 إذا أردت إخفاء شريط العروض والكوبونات من الصفحة الرئيسية للمتجر بالكامل، يمكنك إيقافه بضغطة واحدة من '
                : '💡 To hide the entire promotional offers banner from the homepage, toggle it off in '}
              <Link href="/admin/builder" className="text-brand-gold underline hover:text-brand-gold-hover inline-flex items-center space-x-1 rtl:space-x-reverse">
                <span>{isAr ? 'المحرر المرئي للمتجر' : 'Storefront Builder'}</span>
                <ExternalLink className="w-3 h-3 inline" />
              </Link>
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 text-left rtl:text-right">
          <span className="px-2.5 py-1 bg-brand-stone/60 border border-brand-border text-[11px] text-brand-gold font-bold rounded-xs">
            {isAr ? `الكوبونات النشطة: ${activeCount} من أصل ${coupons.length}` : `Active: ${activeCount} / ${coupons.length}`}
          </span>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xs border flex items-center justify-between text-xs font-mono animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-400'
          }`}
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-brand-cream/50 hover:text-brand-ivory">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isAr ? 'بحث بكود الخصم...' : 'Search coupon code...'}
          className="w-full bg-brand-charcoal border border-brand-border/60 text-brand-ivory text-xs px-9 py-2 rounded-xs focus:outline-none focus:border-brand-gold font-mono"
        />
      </div>

      {/* Coupons Container: Desktop Table + Mobile Responsive Cards */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-xs overflow-hidden shadow-2xl">
        {/* Mobile View: High-Density Coupon Cards (Phones & Small Tablets) */}
        <div className="md:hidden divide-y divide-brand-border/40 font-mono">
          {loading ? (
            <div className="py-12 text-center text-brand-cream/50 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
              {isAr ? 'جاري تحميل الكوبونات...' : 'Loading coupons...'}
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="py-12 text-center text-brand-cream/50 text-xs p-6 space-y-2">
              <p className="text-sm font-bold text-brand-cream/70 mb-1">
                {isAr ? 'لا توجد أي كوبونات خصم مسجلة حالياً' : 'No discount coupons found.'}
              </p>
              <p className="text-xs text-brand-cream/40">
                {isAr
                  ? 'المتجر يعمل الآن بالأسعار الرسمية دون خصومات. يمكنك إنشاء كود جديد في أي وقت.'
                  : 'Store is running without active discount codes. You can add new ones anytime.'}
              </p>
            </div>
          ) : (
            filteredCoupons.map((coupon) => (
              <div key={coupon.id} className="p-4 space-y-3 bg-brand-charcoal hover:bg-brand-stone/10 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-bold text-base text-brand-gold tracking-wider bg-brand-black px-2.5 py-1 rounded-xs border border-brand-border/80">
                      {coupon.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode(coupon.code)}
                      className="p-1.5 text-brand-cream/60 hover:text-brand-ivory border border-brand-border/60 rounded-xs bg-brand-stone/40"
                      title={isAr ? 'نسخ الكود' : 'Copy Code'}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(coupon.id, coupon.isActive, coupon.code)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-xs border transition-all ${
                      coupon.isActive
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50'
                        : 'bg-rose-950/60 text-rose-400 border-rose-500/50'
                    }`}
                  >
                    {coupon.isActive ? (isAr ? '✓ نشط' : '✓ Active') : (isAr ? '✕ معطل' : '✕ Inactive')}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                  <div>
                    {coupon.discountType === 'percentage' ? (
                      <span className="font-bold text-brand-ivory text-sm">
                        {coupon.discountValue}% <span className="text-brand-gold text-xs">OFF</span>
                      </span>
                    ) : (
                      <span className="font-bold text-brand-ivory text-sm">
                        {coupon.discountValue} <span className="text-brand-gold text-xs">EGP OFF</span>
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-brand-cream/70">
                    <span>{isAr ? 'الحد الأدنى: ' : 'Min: '}</span>
                    <span className="text-brand-ivory font-bold">
                      {coupon.minOrderAmount ? `${coupon.minOrderAmount.toLocaleString()} EGP` : (isAr ? 'بدون حد' : 'None')}
                    </span>
                    <span className="text-brand-border mx-1">·</span>
                    <span>{coupon.timesUsed || 0} / {coupon.usageLimit || '∞'}</span>
                  </div>
                </div>

                {/* Mobile Quick Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border/40">
                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                    className="py-1.5 px-3 border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 text-xs font-bold rounded-xs flex items-center space-x-1.5 rtl:space-x-reverse"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isAr ? 'حذف الكوبون نهائياً' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Wide Spreadsheet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="border-b border-brand-border/80 bg-brand-stone/30 text-[10px] uppercase font-mono tracking-widest text-brand-cream/60">
                <th className="py-3 px-4">{isAr ? 'كود الخصم' : 'Promo Code'}</th>
                <th className="py-3 px-4">{isAr ? 'نوع الخصم وقيمته' : 'Discount'}</th>
                <th className="py-3 px-4">{isAr ? 'الحد الأدنى للطلب' : 'Min Spend (EGP)'}</th>
                <th className="py-3 px-4">{isAr ? 'عدد مرات الاستخدام' : 'Usage / Limit'}</th>
                <th className="py-3 px-4">{isAr ? 'الحالة (اضغط للتغيير)' : 'Status (Click to toggle)'}</th>
                <th className="py-3 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-cream/50">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
                    {isAr ? 'جاري تحميل الكوبونات...' : 'Loading coupons...'}
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-cream/50">
                    <p className="text-sm font-bold text-brand-cream/70 mb-1">
                      {isAr ? 'لا توجد أي كوبونات خصم مسجلة حالياً' : 'No discount coupons found.'}
                    </p>
                    <p className="text-xs text-brand-cream/40">
                      {isAr
                        ? 'المتجر يعمل الآن بالأسعار الرسمية دون خصومات. يمكنك إنشاء كود جديد في أي وقت.'
                        : 'Store is running without active discount codes. You can add new ones anytime.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-brand-stone/20 transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="font-bold text-base text-brand-gold tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyCode(coupon.code)}
                          className="p-1 text-brand-cream/40 hover:text-brand-ivory"
                          title={isAr ? 'نسخ الكود' : 'Copy Code'}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[10px] text-brand-cream/40 mt-0.5">{coupon.id}</div>
                    </td>

                    {/* Discount Value */}
                    <td className="py-3.5 px-4">
                      {coupon.discountType === 'percentage' ? (
                        <div className="flex items-center space-x-1.5 rtl:space-x-reverse font-bold text-brand-ivory text-sm">
                          <Percent className="w-3.5 h-3.5 text-brand-gold" />
                          <span>{coupon.discountValue}% OFF</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 rtl:space-x-reverse font-bold text-brand-ivory text-sm">
                          <Banknote className="w-3.5 h-3.5 text-brand-gold" />
                          <span>{coupon.discountValue} EGP OFF</span>
                        </div>
                      )}
                    </td>

                    {/* Min Spend */}
                    <td className="py-3.5 px-4 text-brand-cream/80">
                      {coupon.minOrderAmount ? `${coupon.minOrderAmount.toLocaleString()} EGP` : (isAr ? 'بدون حد أدنى' : 'No minimum')}
                    </td>

                    {/* Usage */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-ivory">{coupon.timesUsed || 0}</span>
                      <span className="text-brand-cream/40"> / {coupon.usageLimit || '∞'} {isAr ? 'استخدام' : 'uses'}</span>
                    </td>

                    {/* Active Toggle Button */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(coupon.id, coupon.isActive, coupon.code)}
                        className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xs border transition-all flex items-center space-x-1.5 rtl:space-x-reverse ${
                          coupon.isActive
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-500/50'
                            : 'bg-rose-950/60 text-rose-400 border-rose-500/50 hover:bg-emerald-950/40 hover:text-emerald-300 hover:border-emerald-500/50'
                        }`}
                        title={
                          coupon.isActive
                            ? isAr ? 'الكوبون نشط حالياً - اضغط لإلغائه وتعطيله فوراً' : 'Active - click to deactivate'
                            : isAr ? 'الكوبون معطل حالياً - اضغط لتفعيله' : 'Inactive - click to activate'
                        }
                      >
                        <span className={`w-2 h-2 rounded-full ${coupon.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        <span>
                          {coupon.isActive
                            ? isAr ? 'نشط (اضغط للإلغاء)' : 'Active (Click to disable)'
                            : isAr ? 'معطل / ملغي (اضغط للتفعيل)' : 'Inactive (Click to enable)'}
                        </span>
                      </button>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                        className="p-2 text-rose-400/70 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/40 rounded-xs transition-colors"
                        title={isAr ? `حذف كود ${coupon.code} نهائياً` : `Delete ${coupon.code}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE COUPON MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
          <div className="bg-brand-charcoal border border-brand-border w-full max-w-md max-h-[92vh] overflow-y-auto rounded-xs p-4 sm:p-6 shadow-2xl space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/80">
              <div>
                <span className="text-[10px] text-brand-gold uppercase tracking-widest font-bold">
                  {isAr ? 'كوبون جديد' : 'New Promotion'}
                </span>
                <h3 className="text-lg font-black text-brand-ivory font-serif">
                  {isAr ? 'إنشاء كود خصم جديد' : 'Create Promo Code'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-brand-cream/60 hover:text-brand-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-brand-cream/80 mb-1">
                  {isAr ? 'كود الخصم (أحرف إنجليزية كبيرة) *' : 'Promo Code (Uppercase) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. ATHEER20"
                  className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-gold font-bold tracking-wider rounded-xs focus:border-brand-gold focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'نوع الخصم *' : 'Discount Type *'}
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (EGP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {formData.discountType === 'percentage'
                      ? isAr ? 'نسبة الخصم (%) *' : 'Percentage (%) *'
                      : isAr ? 'قيمة الخصم (EGP) *' : 'Amount (EGP) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formData.discountType === 'percentage' ? 100 : 10000}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'الحد الأدنى للطلب (EGP)' : 'Min Order (EGP)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'أقصى عدد مرات استخدام' : 'Usage Limit'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-3 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-brand-border text-brand-cream/80 hover:text-brand-ivory rounded-xs"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-gold text-brand-black font-bold uppercase tracking-wider rounded-xs hover:bg-brand-gold-hover shadow-gold"
                >
                  {isAr ? 'تأكيد وحفظ الكوبون' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
