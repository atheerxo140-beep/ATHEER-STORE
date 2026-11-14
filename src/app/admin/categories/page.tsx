'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryItem } from '@/types';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await adminFetch('/api/admin/categories');
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories.sort((a: CategoryItem, b: CategoryItem) => a.order - b.order));
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await adminFetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: isAr ? 'تم حفظ وتحديث التصنيف بنجاح!' : 'Category saved successfully!',
        });
        setEditingCategory(null);
        setIsCreatingNew(false);
        loadCategories();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to save category' });
      }
    } catch {
      setFeedback({ type: 'error', message: isAr ? 'فشل حفظ التصنيف' : 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(isAr ? `هل أنت متأكد من حذف تصنيف "${name}"؟` : `Delete category "${name}"?`)) return;

    try {
      const res = await adminFetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: isAr ? 'تم حذف التصنيف بنجاح.' : 'Category deleted successfully.',
        });
        loadCategories();
      }
    } catch {
      setFeedback({ type: 'error', message: isAr ? 'فشل حذف التصنيف' : 'Delete failed' });
    }
  };

  const startCreate = () => {
    setEditingCategory({
      id: '',
      slug: '',
      nameEn: '',
      nameAr: '',
      descriptionEn: '',
      descriptionAr: '',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop',
      badgeEn: '',
      badgeAr: '',
      itemCount: 0,
      order: categories.length + 1,
      isActive: true,
    });
    setIsCreatingNew(true);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border/80">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-[11px] font-mono uppercase tracking-widest text-brand-gold mb-1">
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'إدارة وتصنيف الكتالوج' : 'Garment Categories CMS'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-brand-ivory">
            {isAr ? 'تصنيفات منتجات أثير (الهوديز، السويت شيرت، التي شيرت)' : 'Product Categories & Drops'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-0.5">
            {isAr
              ? 'تحكم في أقسام المتجر وترتيبها وصورها وشاراتها الترويجية التي تظهر في الواجهة الرئيسية وفلاتر البحث.'
              : 'Manage category taxonomy, banner visuals, and promotional badges.'}
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="px-4 py-2.5 bg-brand-gold text-brand-black font-bold text-xs font-mono rounded-xs hover:bg-brand-gold-hover transition-colors shadow-gold flex items-center space-x-1.5 rtl:space-x-reverse self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة تصنيف جديد' : 'Add New Category'}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xs border text-xs font-mono flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-brand-cream/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-brand-charcoal border border-brand-border/80 rounded-sm overflow-hidden flex flex-col justify-between shadow-xl"
          >
            {/* Visual Header */}
            <div className="relative h-44 bg-brand-stone/40 overflow-hidden">
              <img
                src={cat.image}
                alt={cat.nameEn}
                className="w-full h-full object-cover grayscale contrast-125 brightness-90 hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-black/60" />

              <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center space-x-1.5 rtl:space-x-reverse">
                <span className="px-2 py-0.5 bg-brand-black/80 border border-brand-gold/60 text-brand-gold text-[10px] font-mono rounded-xs">
                  {cat.slug}
                </span>
                {cat.badgeAr && (
                  <span className="px-2 py-0.5 bg-brand-gold text-brand-black font-bold text-[10px] font-mono rounded-xs">
                    {isAr ? cat.badgeAr : cat.badgeEn}
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono text-brand-ivory">
                <span className="font-bold">{isAr ? cat.nameAr : cat.nameEn}</span>
                <span className="text-[10px] text-brand-cream/70 bg-black/60 px-2 py-0.5 rounded-full">
                  ترتيب: #{cat.order}
                </span>
              </div>
            </div>

            {/* Description & Details */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <p className="text-xs text-brand-cream/70 font-sans leading-relaxed line-clamp-2">
                {isAr ? cat.descriptionAr : cat.descriptionEn}
              </p>

              <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    cat.isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {cat.isActive ? (isAr ? 'نشط بالمتجر' : 'Active') : isAr ? 'مخفي' : 'Hidden'}
                </span>

                <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(cat);
                      setIsCreatingNew(false);
                    }}
                    className="p-1.5 bg-brand-stone border border-brand-border text-brand-ivory hover:border-brand-gold rounded-xs"
                    title={isAr ? 'تعديل التصنيف' : 'Edit Category'}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, isAr ? cat.nameAr : cat.nameEn)}
                    className="p-1.5 bg-brand-stone border border-brand-border text-rose-400 hover:border-rose-500 rounded-xs"
                    title={isAr ? 'حذف التصنيف' : 'Delete Category'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-brand-charcoal border border-brand-border max-w-xl w-full p-6 rounded-sm space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-serif font-black text-brand-ivory flex items-center space-x-2 rtl:space-x-reverse">
                <Layers className="w-5 h-5 text-brand-gold" />
                <span>
                  {isCreatingNew
                    ? isAr
                      ? 'إضافة تصنيف جديد للكتالوج'
                      : 'Add New Category'
                    : isAr
                    ? `تعديل تصنيف: ${editingCategory.nameAr}`
                    : `Edit Category: ${editingCategory.nameEn}`}
                </span>
              </h3>
              <button onClick={() => setEditingCategory(null)} className="text-brand-cream/60 hover:text-brand-ivory">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'اسم التصنيف (عربي) *' : 'Name (Arabic) *'}</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.nameAr}
                    onChange={(e) => setEditingCategory({ ...editingCategory, nameAr: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'اسم التصنيف (إنجليزي) *' : 'Name (English) *'}</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.nameEn}
                    onChange={(e) => setEditingCategory({ ...editingCategory, nameEn: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'المعرّف البرمجي (Slug) *' : 'Slug *'}</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.slug}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '-'),
                      })
                    }
                    placeholder="e.g. hoodies or tshirts"
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'ترتيب الظهور' : 'Order'}</label>
                  <input
                    type="number"
                    value={editingCategory.order}
                    onChange={(e) => setEditingCategory({ ...editingCategory, order: parseInt(e.target.value) || 1 })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'رابط صورة البانر *' : 'Banner Image URL *'}</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.image}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-brand-cream/80 mb-1">{isAr ? 'الوصف العربي' : 'Arabic Description'}</label>
                <textarea
                  rows={2}
                  value={editingCategory.descriptionAr}
                  onChange={(e) => setEditingCategory({ ...editingCategory, descriptionAr: e.target.value })}
                  className="w-full bg-brand-stone/40 border border-brand-border p-2.5 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-brand-border/60">
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCategory.isActive}
                    onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                    className="accent-brand-gold w-4 h-4"
                  />
                  <span>{isAr ? 'تفعيل التصنيف بالمتجر العام' : 'Active in Storefront'}</span>
                </label>

                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 border border-brand-border text-brand-cream rounded-xs hover:bg-brand-stone"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-brand-gold text-brand-black font-bold rounded-xs hover:bg-brand-gold-hover shadow-gold flex items-center space-x-1 rtl:space-x-reverse"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? '...' : isAr ? 'حفظ التصنيف' : 'Save Category'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
