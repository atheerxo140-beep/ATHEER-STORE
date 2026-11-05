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
  Calendar,
  AlertTriangle,
  X,
  Percent,
  Banknote,
  Copy,
} from 'lucide-react';

export default function AdminCouponsPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
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
      if (data.success) {
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
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to create coupon' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await adminFetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(isAr ? `هل تريد حذف كود الخصم ${code}؟` : `Delete coupon ${code}?`)) return;
    try {
      const res = await adminFetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr ? 'تم حذف الكوبون' : 'Coupon deleted',
        });
        fetchCoupons();
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
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

  return (
    <div className="space-y-8 font-sans">
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
              ? 'إنشاء كوبونات الخصم بالنسبة المئوية أو القيمة الثابتة بالجنيه المصري، وتحديد حدود الاستخدام'
              : 'Create percentage or fixed EGP discounts with usage limits and minimum spend'}
          </p>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={fetchCoupons}
            className="p-2.5 bg-brand-charcoal border border-brand-border text-brand-cream/80 hover:text-brand-gold hover:border-brand-gold/40 transition-colors rounded-sm"
            title={isAr ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 rtl:space-x-reverse bg-brand-gold text-brand-black px-4 py-2.5 text-xs font-mono font-bold tracking-widest uppercase hover:bg-brand-gold-light transition-colors shadow-gold rounded-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إنشاء كود خصم جديد' : 'New Coupon'}</span>
          </button>
        </div>
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isAr ? 'بحث بكود الخصم...' : 'Search coupon code...'}
          className="w-full bg-brand-charcoal border border-brand-border/60 text-brand-ivory text-xs px-9 py-2 rounded-sm focus:outline-none focus:border-brand-gold font-mono"
        />
      </div>

      {/* Coupons Table */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="border-b border-brand-border/80 bg-brand-stone/30 text-[10px] uppercase font-mono tracking-widest text-brand-cream/60">
                <th className="py-3 px-4">{isAr ? 'كود الخصم' : 'Promo Code'}</th>
                <th className="py-3 px-4">{isAr ? 'نوع الخصم وقيمته' : 'Discount'}</th>
                <th className="py-3 px-4">{isAr ? 'الحد الأدنى للطلب' : 'Min Spend (EGP)'}</th>
                <th className="py-3 px-4">{isAr ? 'عدد مرات الاستخدام' : 'Usage / Limit'}</th>
                <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
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
                    {isAr ? 'لا توجد كوبونات مسجلة' : 'No coupons found.'}
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
                          onClick={() => copyCode(coupon.code)}
                          className="p-1 text-brand-cream/40 hover:text-brand-ivory"
                          title="Copy Code"
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
                      {coupon.minOrderAmount ? `${coupon.minOrderAmount.toLocaleString()} EGP` : 'No minimum'}
                    </td>

                    {/* Usage */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-ivory">{coupon.timesUsed}</span>
                      <span className="text-brand-cream/40"> / {coupon.usageLimit || '∞'} uses</span>
                    </td>

                    {/* Active Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(coupon.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-xs border transition-colors ${
                          coupon.isActive
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                            : 'bg-rose-950/60 text-rose-400 border-rose-500/40'
                        }`}
                      >
                        {coupon.isActive
                          ? isAr ? 'نشط ✓' : 'Active ✓'
                          : isAr ? 'معطل ✕' : 'Inactive ✕'}
                      </button>
                    </td>

                    {/* Delete */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                        className="p-1.5 text-brand-cream/60 hover:text-rose-400 hover:bg-rose-950/30 rounded-xs transition-colors"
                        title={isAr ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-charcoal border border-brand-border w-full max-w-md rounded-sm p-6 shadow-2xl space-y-5 font-mono text-xs">
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
                  className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-gold font-bold tracking-wider rounded-sm focus:border-brand-gold focus:outline-none uppercase"
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
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
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
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
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
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
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
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
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
                  className="px-5 py-2 bg-brand-gold text-brand-black font-bold uppercase tracking-wider rounded-xs hover:bg-brand-gold-light"
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
