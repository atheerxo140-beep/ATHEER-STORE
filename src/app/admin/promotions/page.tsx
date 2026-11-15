'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  Percent,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Check,
  X,
  Sparkles,
  Tag,
  Flame,
  Search,
  AlertCircle,
} from 'lucide-react';

export default function AdminPromotionsPage() {
  const { language, isRtl, formatPrice } = useLanguage();
  const isAr = language === 'ar';

  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);
  const [deletingPromo, setDeletingPromo] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('bundle_items');
  const [discountValue, setDiscountValue] = useState(15);
  const [minItemsRequired, setMinItemsRequired] = useState(2);
  const [minSpendEgp, setMinSpendEgp] = useState(1400);
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/promotions?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.promotions)) {
        setPromotions(data.promotions);
      }
    } catch (e) {
      console.error('Failed to load promotions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const openAddModal = () => {
    setEditingPromo(null);
    setTitleAr('');
    setTitleEn('');
    setCode('');
    setType('bundle_items');
    setDiscountValue(15);
    setMinItemsRequired(2);
    setMinSpendEgp(1400);
    setIsAutomatic(false);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (promo: any) => {
    setEditingPromo(promo);
    setTitleAr(promo.titleAr || '');
    setTitleEn(promo.titleEn || '');
    setCode(promo.code || '');
    setType(promo.type || 'bundle_items');
    setDiscountValue(promo.discountValue || 15);
    setMinItemsRequired(promo.minItemsRequired || 2);
    setMinSpendEgp(promo.minSpendEgp || 0);
    setIsAutomatic(promo.isAutomatic || false);
    setIsActive(promo.isActive !== false);
    setShowModal(true);
  };

  const getPromoTypeLabel = (promoType: string) => {
    const norm = (promoType || '').toLowerCase().trim();
    if (isAr) {
      switch (norm) {
        case 'bundle_items':
        case 'bundle':
          return 'باندل قطع';
        case 'percentage':
        case 'percent':
          return 'نسبة مئوية';
        case 'fixed_amount':
        case 'fixed':
          return 'مبلغ ثابت';
        case 'free_shipping':
          return 'شحن مجاني';
        default:
          return promoType;
      }
    } else {
      switch (norm) {
        case 'bundle_items':
        case 'bundle':
          return 'Bundle Items';
        case 'percentage':
        case 'percent':
          return 'Percentage';
        case 'fixed_amount':
        case 'fixed':
          return 'Fixed Amount';
        case 'free_shipping':
          return 'Free Shipping';
        default:
          return promoType;
      }
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        titleAr,
        titleEn,
        code: code.trim() || undefined,
        type,
        discountValue: Number(discountValue),
        minItemsRequired: Number(minItemsRequired),
        minSpendEgp: Number(minSpendEgp),
        isAutomatic,
        isActive,
      };

      if (editingPromo) {
        const res = await adminFetch(`/api/admin/promotions?_t=${Date.now()}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPromo.id, ...payload }),
        });
        const data = await res.json();
        if (data.success) {
          setFeedbackMsg({
            type: 'success',
            text: isAr ? 'تم تعديل العرض بنجاح' : 'Promotion updated successfully',
          });
        }
      } else {
        const res = await adminFetch(`/api/admin/promotions?_t=${Date.now()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setFeedbackMsg({
            type: 'success',
            text: isAr ? 'تم إنشاء العرض الترويجي الجديد بنجاح' : 'Promotion created successfully',
          });
        }
      }

      setShowModal(false);
      fetchPromotions();
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (e: any) {
      console.error('Failed to save promotion', e);
      setFeedbackMsg({ type: 'error', text: e.message || 'Error saving promotion' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean, promoTitle: string) => {
    // 1. Instant optimistic UI update
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
    );

    try {
      const res = await adminFetch(`/api/admin/promotions?_t=${Date.now()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr
            ? `تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} العرض "${promoTitle}" بنجاح`
            : `Promotion "${promoTitle}" ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        });
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        // Revert on error
        setPromotions((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: currentStatus } : p))
        );
        setFeedbackMsg({ type: 'error', text: data.error || (isAr ? 'فشل تعديل الحالة' : 'Failed to update') });
      }
    } catch (err: any) {
      setPromotions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: currentStatus } : p))
      );
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeletePromo = (id: string, promoTitle: string) => {
    setDeletingPromo({ id, title: promoTitle });
  };

  const handleConfirmDelete = async () => {
    if (!deletingPromo) return;
    const { id, title: promoTitle } = deletingPromo;
    setIsDeleting(true);

    // 1. Instant optimistic UI deletion
    const previousPromos = [...promotions];
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    setDeletingPromo(null);

    try {
      const res = await adminFetch(`/api/admin/promotions?id=${encodeURIComponent(id)}&_t=${Date.now()}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr ? `تم حذف العرض "${promoTitle}" نهائياً بنجاح` : `Promotion "${promoTitle}" deleted successfully`,
        });
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        // Revert on backend error
        setPromotions(previousPromos);
        setFeedbackMsg({ type: 'error', text: data.error || (isAr ? 'فشل الحذف' : 'Failed to delete') });
      }
    } catch (e: any) {
      setPromotions(previousPromos);
      setFeedbackMsg({ type: 'error', text: e.message || (isAr ? 'حدث خطأ في الاتصال' : 'Connection error') });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPromotions = promotions.filter(
    (p) =>
      p.titleAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.titleEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <Percent className="w-6 h-6 text-brand-gold" />
            <h1 className="text-xl sm:text-2xl font-serif font-black text-brand-ivory">
              {isAr ? 'عروض الباندل والخصومات التلقائية (نظام سيزر)' : 'Bundle Promotions & Drop Offers'}
            </h1>
          </div>
          <p className="text-xs text-brand-cream/60 mt-1">
            {isAr
              ? 'إدارة عروض شراء قطعتين أو أكثر (15% خصم)، خصومات السلة التلقائية، وباقات التوصيل المجاني'
              : 'Multi-item bundle discounts, automatic threshold offers, and promo campaigns'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-2 rtl:space-x-reverse shadow-gold"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? '+ إنشاء عرض باندل جديد' : '+ New Bundle Offer'}</span>
        </button>
      </div>

      {/* Instant Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xs border text-xs font-mono flex items-center justify-between animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {feedbackMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-brand-cream/50 hover:text-brand-ivory text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Promotions List Table */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
          <span className="text-sm font-bold text-brand-ivory font-serif">
            {isAr ? 'العروض النشطة الحالية بالمتجر' : 'Active Store Promotions'}
          </span>

          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث بالعرض أو الكود...' : 'Search promotions...'}
              className="bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-9 py-1.5 rounded-xs font-mono w-64"
            />
          </div>
        </div>

        {filteredPromotions.length === 0 ? (
          <p className="text-center py-8 text-xs font-mono text-brand-cream/50">
            {isAr ? 'لا توجد عروض ترويجية مطابقة' : 'No promotions found.'}
          </p>
        ) : (
          <>
            {/* Mobile View: High-Density Promotion Cards (Phones & Small Tablets) */}
            <div className="md:hidden divide-y divide-brand-border/40 font-mono">
            {filteredPromotions.map((p) => (
              <div key={p.id} className="p-4 space-y-3 bg-brand-charcoal hover:bg-brand-stone/10 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-brand-ivory font-serif">{isAr ? p.titleAr : p.titleEn}</h4>
                    {p.descriptionAr && (
                      <p className="text-[11px] text-brand-cream/60 font-sans mt-0.5 leading-relaxed">{p.descriptionAr}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(p.id, p.isActive, isAr ? p.titleAr : p.titleEn)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all ${
                      p.isActive
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                        : 'bg-stone-900/80 text-stone-400 border border-stone-700/60'
                    }`}
                  >
                    {p.isActive ? (isAr ? '✓ مفعل' : '✓ Active') : (isAr ? '✕ معطل' : '✕ Inactive')}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {p.code ? (
                      <span className="font-bold text-brand-gold bg-brand-black px-2 py-0.5 rounded-xs border border-brand-border">
                        {p.code}
                      </span>
                    ) : (
                      <span className="text-brand-cream/40 text-[11px]">—</span>
                    )}
                    <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-xs font-bold">
                      {(p.type || '').toLowerCase() === 'fixed_amount' ? (isAr ? `${p.discountValue} ج.م` : `${p.discountValue} EGP`) : `${p.discountValue}%`}
                    </span>
                  </div>

                  <div className="text-[11px] text-brand-cream/60">
                    {p.minItemsRequired ? (isAr ? `${p.minItemsRequired} قطع` : `${p.minItemsRequired} items`) : ''} {p.minSpendEgp ? (isAr ? `| ${p.minSpendEgp} ج.م` : `| ${p.minSpendEgp} EGP`) : ''}
                  </div>
                </div>

                {/* Mobile Quick Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-brand-border/40">
                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    className="flex-1 py-1.5 px-3 bg-brand-stone/40 hover:bg-brand-stone border border-brand-border text-brand-ivory text-xs font-bold rounded-xs flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{isAr ? 'تعديل العرض' : 'Edit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePromo(p.id, isAr ? p.titleAr : p.titleEn)}
                    className="py-1.5 px-3 border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 text-xs font-bold rounded-xs flex items-center justify-center space-x-1 rtl:space-x-reverse shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isAr ? 'حذف' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Wide Spreadsheet Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-start text-xs font-mono">
              <thead className="bg-brand-stone/40 text-brand-cream/60 border-b border-brand-border">
                <tr>
                  <th className="py-2.5 px-3 text-start">{isAr ? 'العرض' : 'Promotion'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'الكود' : 'Code'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'النوع' : 'Type'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'قيمة الخصم' : 'Discount'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'الحد الأدنى' : 'Conditions'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'تلقائي؟' : 'Auto?'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {filteredPromotions.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-stone/20 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-brand-ivory block">{isAr ? p.titleAr : p.titleEn}</span>
                      <span className="text-[10px] text-brand-cream/50">{p.descriptionAr}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {p.code ? (
                        <span className="font-bold text-brand-gold bg-brand-black px-2 py-0.5 rounded-xs border border-brand-border">
                          {p.code}
                        </span>
                      ) : (
                        <span className="text-brand-cream/40">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-[10px] uppercase text-brand-cream/70">
                      {getPromoTypeLabel(p.type)}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-brand-gold">
                      {(p.type || '').toLowerCase() === 'fixed_amount' ? (isAr ? `${p.discountValue} ج.م` : `${p.discountValue} EGP`) : `${p.discountValue}%`}
                    </td>
                    <td className="py-3 px-3 text-center text-[10px] text-brand-cream/60">
                      {p.minItemsRequired ? (isAr ? `${p.minItemsRequired} قطع` : `${p.minItemsRequired} items`) : ''} {p.minSpendEgp ? (isAr ? `| ${p.minSpendEgp} ج.م` : `| ${p.minSpendEgp} EGP`) : ''}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {p.isAutomatic ? (
                        <span className="text-emerald-400 font-bold text-[10px]">{isAr ? 'نعم (تلقائي)' : 'Yes (Auto)'}</span>
                      ) : (
                        <span className="text-brand-cream/40 text-[10px]">{isAr ? 'بالكوبون' : 'Coupon'}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p.id, p.isActive, isAr ? p.titleAr : p.titleEn)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                          p.isActive
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/60'
                            : 'bg-stone-900/80 text-stone-400 border border-stone-700/60 hover:bg-stone-800'
                        }`}
                        title={p.isActive ? (isAr ? 'اضغط لتعطيل العرض' : 'Click to deactivate') : (isAr ? 'اضغط لتفعيل العرض' : 'Click to activate')}
                      >
                        {p.isActive ? (isAr ? '✓ مفعل' : '✓ Active') : (isAr ? '✕ معطل' : '✕ Inactive')}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1 text-brand-cream/50 hover:text-brand-gold transition-colors"
                          title="تعديل"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePromo(p.id, isAr ? p.titleAr : p.titleEn)}
                          className="p-1 text-brand-cream/50 hover:text-rose-400 transition-colors"
                          title={isAr ? 'حذف العرض نهائياً' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Modal for Adding / Editing Promotion */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-brand-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleSavePromo}
            className="bg-brand-charcoal border-2 border-brand-gold/60 rounded-xs p-4 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl animate-scale-in"
          >
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <h3 className="text-sm font-bold text-brand-ivory font-serif">
                {editingPromo ? (isAr ? 'تعديل عرض ترويجي' : 'Edit Promotion') : (isAr ? 'إنشاء عرض باندل جديد' : 'New Bundle Offer')}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-brand-cream/50 hover:text-brand-ivory"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'عنوان العرض (عربي)' : 'Offer Title (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: خصم 15% على الباندل عند طلب قطعتين"
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'كود الكوبون (اختياري)' : 'Promo Code (Optional)'}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="FAMILY15"
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-gold text-xs px-3 py-2 rounded-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'نوع العرض' : 'Promotion Type'}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-mono"
                >
                  <option value="bundle_items">{isAr ? 'باندل قطع متعددة' : 'Multi-Item Bundle'}</option>
                  <option value="percentage">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                  <option value="fixed_amount">{isAr ? 'مبلغ كاش ثابت (ج.م)' : 'Fixed Cash Discount (EGP)'}</option>
                  <option value="free_shipping">{isAr ? 'شحن مجاني' : 'Free Shipping'}</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'قيمة الخصم (% أو ج.م)' : 'Discount Value'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-gold text-xs px-3 py-2 rounded-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'الحد الأدنى للقطع' : 'Min Item Count'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={minItemsRequired}
                  onChange={(e) => setMinItemsRequired(parseInt(e.target.value) || 1)}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'الحد الأدنى لقيمة السلة (ج.م)' : 'Min Spend (EGP)'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={minSpendEgp}
                  onChange={(e) => setMinSpendEgp(parseFloat(e.target.value) || 0)}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-mono"
                />
              </div>

              <div className="col-span-2 flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 rtl:space-x-reverse font-mono text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAutomatic}
                    onChange={(e) => setIsAutomatic(e.target.checked)}
                    className="rounded-xs text-brand-gold focus:ring-0"
                  />
                  <span>{isAr ? 'تطبيق تلقائي بدون الحاجة لكتابة كود' : 'Automatic without code'}</span>
                </label>

                <label className="flex items-center space-x-2 rtl:space-x-reverse font-mono text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded-xs text-brand-gold focus:ring-0"
                  />
                  <span>{isAr ? 'العرض مفعل' : 'Active'}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-brand-border text-xs font-mono text-brand-cream/60 hover:text-brand-ivory rounded-xs"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase rounded-xs transition-colors"
              >
                {submitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ العرض' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Confirmation Modal - In-app modal that cannot be blocked by browsers */}
      {deletingPromo && (
        <div className="fixed inset-0 z-50 bg-brand-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-charcoal border-2 border-rose-500/60 rounded-xs p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-in text-center sm:text-right rtl:sm:text-right">
            <div className="flex items-center space-x-3 rtl:space-x-reverse text-rose-400">
              <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/30">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-ivory font-serif">
                  {isAr ? 'تأكيد حذف العرض نهائياً' : 'Confirm Promotion Deletion'}
                </h3>
                <p className="text-xs text-brand-cream/70 font-sans mt-0.5">
                  {isAr ? 'هذا الإجراء سيقوم بحذف العرض من المتجر فوراً' : 'This action will immediately remove the promotion'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-brand-stone/40 border border-brand-border/60 rounded-xs text-xs text-brand-ivory font-mono">
              {deletingPromo.title}
            </div>

            <p className="text-xs text-rose-300/80 leading-relaxed">
              {isAr
                ? 'هل تريد بالتأكيد حذف هذا العرض الترويجي؟ لن يتمكن العملاء من استخدامه بعد الآن.'
                : 'Are you sure you want to delete this promotion? Customers will no longer be able to use it.'}
            </p>

            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-2 border-t border-brand-border/40">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingPromo(null)}
                className="px-4 py-2 border border-brand-border text-brand-cream/80 hover:text-brand-ivory text-xs font-mono rounded-xs transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase rounded-xs transition-colors flex items-center space-x-1.5 rtl:space-x-reverse shadow-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? (isAr ? 'جارٍ الحذف...' : 'Deleting...') : (isAr ? 'نعم، احذف العرض' : 'Yes, Delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
