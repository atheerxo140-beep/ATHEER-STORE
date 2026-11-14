'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { CustomPage } from '@/types';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AdminPagesPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadPages = async () => {
    try {
      setLoading(true);
      const res = await adminFetch('/api/admin/pages');
      const data = await res.json();
      if (data.success && Array.isArray(data.pages)) {
        setPages(data.pages);
      }
    } catch (e) {
      console.error('Failed to load pages', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await adminFetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPage),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: isAr ? 'تم حفظ وتحديث الصفحة بنجاح!' : 'Page saved successfully!',
        });
        setEditingPage(null);
        setIsCreatingNew(false);
        loadPages();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to save page' });
      }
    } catch {
      setFeedback({ type: 'error', message: isAr ? 'فشل حفظ الصفحة' : 'Failed to save page' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(isAr ? `هل أنت متأكد من حذف صفحة "${title}"؟` : `Delete page "${title}"?`)) return;

    try {
      const res = await adminFetch(`/api/admin/pages?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: isAr ? 'تم حذف الصفحة بنجاح.' : 'Page deleted successfully.',
        });
        loadPages();
      }
    } catch {
      setFeedback({ type: 'error', message: isAr ? 'فشل حذف الصفحة' : 'Delete failed' });
    }
  };

  const startCreate = () => {
    setEditingPage({
      id: '',
      slug: '',
      titleEn: '',
      titleAr: '',
      seoTitleEn: '',
      seoTitleAr: '',
      seoDescriptionEn: '',
      seoDescriptionAr: '',
      contentEn: '',
      contentAr: '',
      isPublished: true,
      showInHeader: false,
      showInFooter: true,
      updatedAt: new Date().toISOString(),
    });
    setIsCreatingNew(true);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border/80">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-[11px] font-mono uppercase tracking-widest text-brand-gold mb-1">
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'إدارة محتوى الصفحات والسياسات' : 'Custom Pages & Policies CMS'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-brand-ivory">
            {isAr ? 'صفحات المتجر والسياسات العامة' : 'Store Pages & Content CMS'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-0.5">
            {isAr
              ? 'أنشئ وعدل صفحات المتجر (من نحن، الشحن، الاستبدال، الشروط والأحكام، الأسئلة الشائعة) دون لمس الكود.'
              : 'Create and edit About, Shipping, Exchange, FAQ and Policy pages without coding.'}
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="px-4 py-2.5 bg-brand-gold text-brand-black font-bold text-xs font-mono rounded-xs hover:bg-brand-gold-hover transition-colors shadow-gold flex items-center space-x-1.5 rtl:space-x-reverse self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إنشاء صفحة جديدة' : 'Create New Page'}</span>
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

      {/* Pages Directory Table */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm overflow-hidden shadow-xl">
        <div className="p-4 border-b border-brand-border/60 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-brand-ivory">
            {isAr ? `إجمالي الصفحات النشطة: ${pages.length}` : `Total Active Pages: ${pages.length}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right font-sans">
            <thead className="bg-brand-stone/40 border-b border-brand-border/60 text-brand-cream/70 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">{isAr ? 'عنوان الصفحة' : 'Page Title'}</th>
                <th className="py-3 px-4">{isAr ? 'رابط الصفحة (Slug)' : 'URL Slug'}</th>
                <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4">{isAr ? 'آخر تحديث' : 'Updated'}</th>
                <th className="py-3 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 font-mono">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-brand-stone/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-brand-ivory">
                    <p>{isAr ? p.titleAr : p.titleEn}</p>
                    <p className="text-[10px] text-brand-cream/50 font-normal">{isAr ? p.titleEn : p.titleAr}</p>
                  </td>
                  <td className="py-3.5 px-4 text-brand-gold">
                    <span className="px-2 py-0.5 bg-brand-stone border border-brand-border rounded-xs">
                      /p/{p.slug}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.isPublished
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {p.isPublished ? (isAr ? 'منشور' : 'Published') : isAr ? 'مسودة' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-brand-cream/50 text-[11px]">
                    {new Date(p.updatedAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                      <Link
                        href={`/p/${p.slug}`}
                        target="_blank"
                        className="p-1.5 bg-brand-stone border border-brand-border text-brand-gold hover:border-brand-gold rounded-xs"
                        title={isAr ? 'معاينة الصفحة' : 'Preview Page'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPage(p);
                          setIsCreatingNew(false);
                        }}
                        className="p-1.5 bg-brand-stone border border-brand-border text-brand-ivory hover:border-brand-gold rounded-xs"
                        title={isAr ? 'تعديل المحتوى' : 'Edit Page'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, isAr ? p.titleAr : p.titleEn)}
                        className="p-1.5 bg-brand-stone border border-brand-border text-rose-400 hover:border-rose-500 rounded-xs"
                        title={isAr ? 'حذف الصفحة' : 'Delete Page'}
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
      </div>

      {/* Edit / Create Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-brand-charcoal border border-brand-border max-w-3xl w-full p-6 rounded-sm space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <h3 className="text-base font-serif font-black text-brand-ivory flex items-center space-x-2 rtl:space-x-reverse">
                <FileText className="w-5 h-5 text-brand-gold" />
                <span>
                  {isCreatingNew
                    ? isAr
                      ? 'إنشاء صفحة مخصصة جديدة'
                      : 'Create New Store Page'
                    : isAr
                    ? `تعديل صفحة: ${editingPage.titleAr}`
                    : `Edit Page: ${editingPage.titleEn}`}
                </span>
              </h3>
              <button onClick={() => setEditingPage(null)} className="text-brand-cream/60 hover:text-brand-ivory">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'عنوان الصفحة (عربي) *' : 'Title (Arabic) *'}</label>
                  <input
                    type="text"
                    required
                    value={editingPage.titleAr}
                    onChange={(e) => setEditingPage({ ...editingPage, titleAr: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'عنوان الصفحة (إنجليزي) *' : 'Title (English) *'}</label>
                  <input
                    type="text"
                    required
                    value={editingPage.titleEn}
                    onChange={(e) => setEditingPage({ ...editingPage, titleEn: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-brand-cream/80 mb-1">
                    {isAr ? 'الرابط المخصص (Slug) *' : 'URL Slug *'}{' '}
                    <span className="text-brand-gold">/p/{editingPage.slug || 'example'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPage.slug}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '-'),
                      })
                    }
                    placeholder="e.g. vip-club or winter-guide"
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs font-mono focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Bilingual Content Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-brand-border/60">
                <div>
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'محتوى الصفحة (عربي) *' : 'Content (Arabic) *'}</label>
                  <textarea
                    rows={10}
                    required
                    value={editingPage.contentAr}
                    onChange={(e) => setEditingPage({ ...editingPage, contentAr: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border p-3 text-brand-ivory rounded-xs text-right font-sans text-xs focus:border-brand-gold focus:outline-none leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'محتوى الصفحة (إنجليزي) *' : 'Content (English) *'}</label>
                  <textarea
                    rows={10}
                    required
                    value={editingPage.contentEn}
                    onChange={(e) => setEditingPage({ ...editingPage, contentEn: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border p-3 text-brand-ivory rounded-xs font-sans text-xs focus:border-brand-gold focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Status and Visibility Toggles */}
              <div className="pt-3 border-t border-brand-border/60 flex flex-wrap gap-6 items-center">
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.isPublished}
                    onChange={(e) => setEditingPage({ ...editingPage, isPublished: e.target.checked })}
                    className="accent-brand-gold w-4 h-4"
                  />
                  <span>{isAr ? 'نشر الصفحة على المتجر العام' : 'Published Live'}</span>
                </label>

                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.showInFooter}
                    onChange={(e) => setEditingPage({ ...editingPage, showInFooter: e.target.checked })}
                    className="accent-brand-gold w-4 h-4"
                  />
                  <span>{isAr ? 'إظهار الرابط في الفوتر' : 'Show in Footer Links'}</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 border border-brand-border text-brand-cream text-xs font-mono rounded-xs hover:bg-brand-stone"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-brand-gold text-brand-black font-bold text-xs font-mono rounded-xs hover:bg-brand-gold-hover shadow-gold flex items-center space-x-1.5 rtl:space-x-reverse"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? '...' : isAr ? 'حفظ التعديلات' : 'Save Page'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
