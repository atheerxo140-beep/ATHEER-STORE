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
} from 'lucide-react';

export default function AdminPromotionsPage() {
  const { language, isRtl, formatPrice } = useLanguage();
  const isAr = language === 'ar';

  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);

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
      const res = await adminFetch('/api/admin/promotions');
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
        await adminFetch('/api/admin/promotions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPromo.id, ...payload }),
        });
      } else {
        await adminFetch('/api/admin/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      fetchPromotions();
    } catch (e) {
      console.error('Failed to save promotion', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا العرض؟' : 'Are you sure you want to delete this promotion?')) return;
    try {
      await adminFetch(`/api/admin/promotions?id=${id}`, { method: 'DELETE' });
      fetchPromotions();
    } catch (e) {
      console.error('Failed to delete promotion', e);
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
          <div className="overflow-x-auto">
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
                      {p.type}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-brand-gold">
                      {p.type === 'fixed_amount' ? `${p.discountValue} ج.م` : `${p.discountValue}%`}
                    </td>
                    <td className="py-3 px-3 text-center text-[10px] text-brand-cream/60">
                      {p.minItemsRequired ? `${p.minItemsRequired} قطع` : ''} {p.minSpendEgp ? `| ${p.minSpendEgp} ج.م` : ''}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {p.isAutomatic ? (
                        <span className="text-emerald-400 font-bold text-[10px]">نعم (تلقائي)</span>
                      ) : (
                        <span className="text-brand-cream/40 text-[10px]">بالكوبون</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isActive
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
                            : 'bg-stone-900 text-stone-500'
                        }`}
                      >
                        {p.isActive ? (isAr ? 'مفعل' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1 text-brand-cream/50 hover:text-brand-gold"
                          title="تعديل"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePromo(p.id)}
                          className="p-1 text-brand-cream/50 hover:text-rose-400"
                          title="حذف"
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
        )}
      </div>

      {/* Modal for Adding / Editing Promotion */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-brand-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePromo}
            className="bg-brand-charcoal border-2 border-brand-gold/60 rounded-xs p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-in"
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
                  <option value="bundle_items">باندل قطع متعددة (Multi-Item)</option>
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed_amount">مبلغ كاش ثابت (EGP)</option>
                  <option value="free_shipping">شحن مجاني</option>
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
    </div>
  );
}
