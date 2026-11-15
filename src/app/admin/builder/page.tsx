'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { BuilderSection, HomepageContent, ThemeConfig } from '@/types';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  Layout,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Copy,
  Save,
  Send,
  History,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Sliders,
  Type,
  Image as ImageIcon,
  Palette,
  CheckCircle2,
  X,
  RotateCcw,
} from 'lucide-react';

export default function VisualBuilderPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Viewport mode
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Builder State
  const [sections, setSections] = useState<BuilderSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('hero');
  const [content, setContent] = useState<any>({});
  const [theme, setTheme] = useState<ThemeConfig | null>(null);

  // Modals & Panels
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [publishSummary, setPublishSummary] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Load builder state
  const loadBuilderData = async () => {
    try {
      setLoading(true);
      const [builderRes, contentRes, themeRes] = await Promise.all([
        adminFetch('/api/admin/builder'),
        adminFetch('/api/admin/homepage-content'),
        adminFetch('/api/admin/theme'),
      ]);

      const builderData = await builderRes.json();
      const contentData = await contentRes.json();
      const themeData = await themeRes.json();

      if (builderData.success) {
        setSections(builderData.sections || []);
        setVersions(builderData.versions || []);
      }
      if (contentData.success && contentData.content) {
        setContent(contentData.content);
      }
      if (themeData.success && themeData.theme) {
        setTheme(themeData.theme);
      }
    } catch (e: any) {
      console.error('Failed to load builder data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuilderData();
  }, []);

  // Section Ordering (Move Up / Down)
  const moveSection = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sections.length - 1) return;

    const newSections = [...sections];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = newSections[idx];
    newSections[idx] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    // Re-index orders
    newSections.forEach((s, i) => (s.order = i + 1));
    setSections(newSections);
  };

  // Toggle Visibility
  const toggleSectionVisibility = (id: string) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Delete Section
  const deleteSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((s) => s.id !== id));
    if (selectedSectionId === id) {
      setSelectedSectionId(sections[0].id);
    }
  };

  // Duplicate Section
  const duplicateSection = (sec: BuilderSection) => {
    const clone: BuilderSection = {
      ...sec,
      id: `${sec.id}-copy-${Date.now().toString().slice(-4)}`,
      nameEn: `${sec.nameEn} (Copy)`,
      nameAr: `${sec.nameAr} (نسخة)`,
      order: sections.length + 1,
    };
    setSections([...sections, clone]);
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await adminFetch('/api/admin/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_draft',
          draftData: { sections, content, theme },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: isAr ? 'تم حفظ المسودة بنجاح! يمكنك مواصلة التحرير.' : 'Draft saved successfully!',
        });
      }
    } catch {
      setFeedback({ type: 'error', message: isAr ? 'فشل حفظ المسودة' : 'Failed to save draft' });
    } finally {
      setSaving(false);
    }
  };

  // Publish Live
  const handlePublishLive = async () => {
    setPublishing(true);
    setFeedback(null);
    try {
      const res = await adminFetch('/api/admin/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          homepageContent: content,
          themeConfig: theme,
          sectionsOrder: sections,
          summary: publishSummary.trim() || 'Visual Builder Storefront Update',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPublishModal(false);
        setPublishSummary('');
        setFeedback({
          type: 'success',
          message: isAr
            ? 'تم نشر التعديلات بنجاح على المتجر العام وأخذ لقطة استرجاع (Snapshot)!'
            : 'Published live to storefront with restore snapshot!',
        });
        loadBuilderData();
      }
    } catch {
      setFeedback({ type: 'error', message: isAr ? 'فشل النشر على الموقع' : 'Failed to publish' });
    } finally {
      setPublishing(false);
    }
  };

  // Rollback to version
  const handleRollback = async (versionId: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من استرجاع هذا الإصدار؟ ستلغي التعديلات الحالية.' : 'Restore this version?')) return;
    try {
      const res = await adminFetch('/api/admin/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rollback', versionId }),
      });
      const data = await res.json();
      if (data.success) {
        setShowHistoryModal(false);
        setFeedback({
          type: 'success',
          message: isAr ? 'تم استرجاع الإصدار المطلوب بنجاح!' : 'Version restored successfully!',
        });
        loadBuilderData();
      }
    } catch {
      setFeedback({ type: 'error', message: isAr ? 'فشل الاسترجاع' : 'Rollback failed' });
    }
  };

  // Selected Section Object
  const activeSection = sections.find((s) => s.id === selectedSectionId);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-border/80">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-[11px] font-mono uppercase tracking-widest text-brand-gold mb-1">
            <Layout className="w-4 h-4" />
            <span>{isAr ? 'محرر الواجهة المرئي والشامل' : 'Visual Storefront Builder'}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px]">
              {isAr ? 'مباشر وتفاعلي' : 'Live Interactive'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-brand-ivory">
            {isAr ? 'التحكم المرئي في تصميم وتنسيق المتجر' : 'Visual Website Builder & Layout Control'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-0.5">
            {isAr
              ? 'أعد ترتيب الأقسام، عدل النصوص والبانرات، واختر الألوان والخطوط مع معاينة فورية لجميع الشاشات.'
              : 'Reorder sections, update banners & typography, with instant multi-device preview.'}
          </p>
        </div>

        {/* Viewport Switcher & Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Device Switcher */}
          <div className="flex items-center bg-brand-stone/60 border border-brand-border rounded-xs p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-xs transition-colors ${
                previewDevice === 'desktop' ? 'bg-brand-gold text-brand-black font-bold' : 'text-brand-cream/60 hover:text-brand-ivory'
              }`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('tablet')}
              className={`p-1.5 rounded-xs transition-colors ${
                previewDevice === 'tablet' ? 'bg-brand-gold text-brand-black font-bold' : 'text-brand-cream/60 hover:text-brand-ivory'
              }`}
              title="Tablet (iPad)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-xs transition-colors ${
                previewDevice === 'mobile' ? 'bg-brand-gold text-brand-black font-bold' : 'text-brand-cream/60 hover:text-brand-ivory'
              }`}
              title="Mobile (iPhone)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* History / Snapshots */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-2 bg-brand-charcoal border border-brand-border text-brand-cream hover:border-brand-gold text-xs font-mono rounded-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-colors"
          >
            <History className="w-3.5 h-3.5 text-brand-gold" />
            <span>{isAr ? 'سجل الإصدارات' : 'History'}</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveDraft}
            className="px-3.5 py-2 bg-brand-stone border border-brand-border text-brand-ivory hover:border-brand-gold text-xs font-mono rounded-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? '...' : isAr ? 'حفظ مسودة' : 'Save Draft'}</span>
          </button>

          {/* Live Preview in New Tab */}
          <Link
            href="/"
            target="_blank"
            className="px-3 py-2 bg-brand-charcoal border border-brand-border text-brand-gold hover:bg-brand-stone text-xs font-mono rounded-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isAr ? 'فتح المتجر' : 'Live Store'}</span>
          </Link>

          {/* Publish to Live Site */}
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-2 bg-brand-gold text-brand-black font-bold text-xs font-mono rounded-xs hover:bg-brand-gold-hover transition-colors shadow-gold flex items-center space-x-1.5 rtl:space-x-reverse"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAr ? 'نشر على المتجر الحي' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
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

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Span 4): Section List & Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Layout className="w-4 h-4 text-brand-gold" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ivory">
                  {isAr ? 'أقسام الصفحة والترتيب' : 'Sections & Layout'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSectionModal(true)}
                className="px-2.5 py-1 bg-brand-gold/15 border border-brand-gold/40 text-brand-gold text-[11px] font-mono rounded-xs flex items-center space-x-1 rtl:space-x-reverse hover:bg-brand-gold hover:text-brand-black transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>{isAr ? 'إضافة قسم' : 'Add Section'}</span>
              </button>
            </div>

            {/* Draggable / Reorderable Section Items */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {sections.map((sec, idx) => {
                const isSelected = sec.id === selectedSectionId;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`p-3 rounded-xs border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-stone/80 border-brand-gold shadow-md'
                        : 'bg-brand-black/60 border-brand-border hover:border-brand-border/90'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
                      <span className="w-5 h-5 rounded-xs bg-brand-stone text-brand-cream/60 flex items-center justify-center font-mono text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-xs font-mono font-bold truncate ${isSelected ? 'text-brand-gold' : 'text-brand-ivory'}`}>
                          {isAr ? sec.nameAr : sec.nameEn}
                        </p>
                        <p className="text-[10px] text-brand-cream/50 font-mono truncate">
                          type: {sec.type} {sec.enabled ? '• نشط' : '• مخفي'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Section Controls */}
                    <div className="flex items-center space-x-1 rtl:space-x-reverse" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleSectionVisibility(sec.id)}
                        className={`p-1.5 rounded-xs hover:bg-brand-stone ${sec.enabled ? 'text-emerald-400' : 'text-brand-cream/30'}`}
                        title={sec.enabled ? 'إخفاء القسم' : 'إظهار القسم'}
                      >
                        {sec.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded-xs hover:bg-brand-stone text-brand-cream/70 disabled:opacity-20"
                        title="تحريك لأعلى"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === sections.length - 1}
                        className="p-1 rounded-xs hover:bg-brand-stone text-brand-cream/70 disabled:opacity-20"
                        title="تحريك لأسفل"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => duplicateSection(sec)}
                        className="p-1 rounded-xs hover:bg-brand-stone text-brand-cream/60 hover:text-brand-gold"
                        title="نسخ القسم"
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteSection(sec.id)}
                        className="p-1 rounded-xs hover:bg-rose-950/40 text-brand-cream/40 hover:text-rose-400"
                        title="حذف القسم"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Theme Quick Styler */}
          {theme && (
            <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-4 space-y-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse pb-2 border-b border-brand-border/60">
                <Palette className="w-4 h-4 text-brand-gold" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ivory">
                  {isAr ? 'ألوان وهوية المتجر العامة' : 'Theme & Color Palette'}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <label className="block text-[11px] text-brand-cream/70 mb-1">{isAr ? 'اللون الذهبي' : 'Gold Accent'}</label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse bg-brand-stone/40 border border-brand-border p-1.5 rounded-xs">
                    <input
                      type="color"
                      value={theme.brandGold}
                      onChange={(e) => setTheme({ ...theme, brandGold: e.target.value })}
                      className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded-xs"
                    />
                    <input
                      type="text"
                      value={theme.brandGold}
                      onChange={(e) => setTheme({ ...theme, brandGold: e.target.value })}
                      className="w-full bg-transparent text-brand-ivory font-mono text-[11px] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-brand-cream/70 mb-1">{isAr ? 'خلفية المتجر' : 'Background'}</label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse bg-brand-stone/40 border border-brand-border p-1.5 rounded-xs">
                    <input
                      type="color"
                      value={theme.brandBlack}
                      onChange={(e) => setTheme({ ...theme, brandBlack: e.target.value })}
                      className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded-xs"
                    />
                    <input
                      type="text"
                      value={theme.brandBlack}
                      onChange={(e) => setTheme({ ...theme, brandBlack: e.target.value })}
                      className="w-full bg-transparent text-brand-ivory font-mono text-[11px] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-brand-cream/70 mb-1">{isAr ? 'خط العناوين العربي' : 'Arabic Font'}</label>
                  <select
                    value={theme.fontFamilyAr}
                    onChange={(e) => setTheme({ ...theme, fontFamilyAr: e.target.value })}
                    className="w-full bg-brand-stone/60 border border-brand-border px-2 py-1.5 text-brand-ivory text-xs rounded-xs"
                  >
                    <option value="Cairo">Cairo (القاهرة - رسمي)</option>
                    <option value="Amiri">Amiri (أميري كلاسيك)</option>
                    <option value="Tajawal">Tajawal (تجوال مودرن)</option>
                    <option value="Almarai">Almarai (المراعي هادئ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-brand-cream/70 mb-1">{isAr ? 'زوايا الأزرار' : 'Button Style'}</label>
                  <select
                    value={theme.borderRadius}
                    onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value as any })}
                    className="w-full bg-brand-stone/60 border border-brand-border px-2 py-1.5 text-brand-ivory text-xs rounded-xs"
                  >
                    <option value="none">Sharp (حادة فاخرة 0px)</option>
                    <option value="subtle">Subtle (ناعمة 2px)</option>
                    <option value="rounded">Rounded (دائرية 6px)</option>
                    <option value="pill">Pill (كبسولة كاملة)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Span 8): Interactive Preview Canvas & Property Inspector */}
        <div className="lg:col-span-8 space-y-4">
          {/* Section Inspector Tab Header */}
          <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60 mb-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Sliders className="w-4 h-4 text-brand-gold" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ivory">
                  {isAr ? 'خصائص القسم المحدد:' : 'Selected Section Inspector:'}{' '}
                  <span className="text-brand-gold font-bold">
                    {activeSection ? (isAr ? activeSection.nameAr : activeSection.nameEn) : ''}
                  </span>
                </h3>
              </div>
            </div>

            {/* Dynamic Inspector Form based on Section Type */}
            {activeSection?.id === 'hero' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="md:col-span-2">
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'عنوان البانر الرئيسي (عربي)' : 'Hero Title (Arabic)'}</label>
                  <input
                    type="text"
                    value={content.heroTitleAr || ''}
                    onChange={(e) => setContent({ ...content, heroTitleAr: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'شارة الهودي (عربي)' : 'Hero Badge (Arabic)'}</label>
                  <input
                    type="text"
                    value={content.heroBadgeAr || ''}
                    onChange={(e) => setContent({ ...content, heroBadgeAr: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'زر الطلب الأساسي (عربي)' : 'CTA Button (Arabic)'}</label>
                  <input
                    type="text"
                    value={content.heroCtaPrimaryAr || ''}
                    onChange={(e) => setContent({ ...content, heroCtaPrimaryAr: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'رابط صورة الخلفية الفاخرة' : 'Hero Image URL'}</label>
                  <input
                    type="text"
                    value={content.heroBgImage || ''}
                    onChange={(e) => setContent({ ...content, heroBgImage: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs font-mono text-[11px] focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeSection?.id === 'offers' && (
              <div className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-cream/80 mb-1">{isAr ? 'عنوان قسم العروض (عربي)' : 'Section Title (Arabic)'}</label>
                    <input
                      type="text"
                      value={content.promoOffersTitleAr || ''}
                      onChange={(e) => setContent({ ...content, promoOffersTitleAr: e.target.value })}
                      className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-cream/80 mb-1">{isAr ? 'الشارة الترويجية (عربي)' : 'Badge (Arabic)'}</label>
                    <input
                      type="text"
                      value={content.promoOffersSubtitleAr || ''}
                      onChange={(e) => setContent({ ...content, promoOffersSubtitleAr: e.target.value })}
                      className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-brand-cream/60">
                  {isAr
                    ? 'يمكنك تعديل بطاقات وكوبونات العروض بالتفصيل من صفحة: "عروض الباندل والخصومات" في القائمة الجانبية.'
                    : 'Manage specific bundle offers and voucher values from the Bundle Promotions tab.'}
                </p>
              </div>
            )}

            {activeSection?.id === 'story' && (
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'عنوان قصة الدار (عربي)' : 'Story Title (Arabic)'}</label>
                  <input
                    type="text"
                    value={content.storyTitleAr || ''}
                    onChange={(e) => setContent({ ...content, storyTitleAr: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-brand-cream/80 mb-1">{isAr ? 'الفقرة الرئيسية (عربي)' : 'Story Paragraph (Arabic)'}</label>
                  <textarea
                    rows={3}
                    value={content.storyParagraph1Ar || ''}
                    onChange={(e) => setContent({ ...content, storyParagraph1Ar: e.target.value })}
                    className="w-full bg-brand-stone/40 border border-brand-border p-3 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeSection?.id === 'categories' && (
              <div className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-cream/80 mb-1">
                      {isAr ? 'العنوان الرئيسي للقسم (عربي)' : 'Categories Title (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={content.categoriesTitleAr || ''}
                      onChange={(e) => setContent({ ...content, categoriesTitleAr: e.target.value })}
                      placeholder="خزانة الستريتوير الشبابية الفاخرة"
                      className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-cream/80 mb-1">
                      {isAr ? 'الشارة العلوية - بجانب اللهب (عربي)' : 'Badge Tag (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={content.categoriesSubtitleAr || ''}
                      onChange={(e) => setContent({ ...content, categoriesSubtitleAr: e.target.value })}
                      placeholder="فئات الإطلاق الرسمي"
                      className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-brand-cream/80 mb-1">
                      {isAr ? 'الوصف التوضيحي للقسم (عربي)' : 'Description (Arabic)'}
                    </label>
                    <textarea
                      rows={2}
                      value={content.categoriesDescriptionAr || ''}
                      onChange={(e) => setContent({ ...content, categoriesDescriptionAr: e.target.value })}
                      className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Cards Preview & Direct link to upload pictures */}
                <div className="border-t border-brand-border/60 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-brand-ivory">
                      {isAr ? 'بطاقات التشكيلات الأربعة الحالية:' : 'Showcase Cards (4 Items):'}
                    </span>
                    <a
                      href="/admin/content?tab=categories"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-brand-gold hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>{isAr ? 'رفع صور جديدة أو تعديل البطاقات بالكامل ←' : 'Upload Images & Full Cards Editor →'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(content.categories || []).map((cat: any, idx: number) => (
                      <div key={cat.id || idx} className="bg-brand-black/60 border border-brand-border p-2 rounded-xs flex items-center gap-2">
                        {cat.image ? (
                          <img src={cat.image} alt="" className="w-9 h-9 object-cover rounded-xs border border-brand-border flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 bg-brand-stone/50 rounded-xs flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-brand-ivory truncate">{isAr ? cat.titleAr : cat.titleEn}</div>
                          <div className="text-[9px] text-brand-gold truncate">{isAr ? cat.tagAr : cat.tagEn}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!['hero', 'offers', 'story', 'categories'].includes(activeSection?.id || '') && (
              <div className="py-6 text-center text-xs font-mono text-brand-cream/60">
                <Sparkles className="w-5 h-5 mx-auto mb-2 text-brand-gold animate-pulse" />
                <p>{isAr ? 'هذا القسم مهيأ تلقائياً بالكتالوج والبيانات الحية للمتجر.' : 'This section automatically pulls live store data.'}</p>
              </div>
            )}
          </div>

          {/* Device Preview Canvas */}
          <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border/60">
              <span className="text-xs font-mono font-bold text-brand-cream/80 flex items-center space-x-2 rtl:space-x-reverse">
                <span>{isAr ? 'المعاينة الحية حسب مقاس الشاشة:' : 'Live Scaled Viewport:'}</span>
                <span className="text-brand-gold uppercase">{previewDevice}</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">● {isAr ? 'محدث ومتزامن' : 'Synchronized'}</span>
            </div>

            {/* Scaled Responsive Iframe Wrapper */}
            <div className="flex justify-center bg-black/60 p-4 rounded-xs overflow-x-auto min-h-[480px]">
              <div
                style={{
                  width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
                  transition: 'width 0.3s ease',
                }}
                className="bg-brand-black border border-brand-border shadow-2xl overflow-hidden rounded-xs flex flex-col"
              >
                {/* Simulated Header */}
                <div className="p-3 bg-brand-charcoal border-b border-brand-border flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse font-serif font-black text-brand-ivory">
                    <span>ATHEER</span>
                    <span className="text-brand-gold">/</span>
                    <span className="text-brand-gold font-arabic font-bold">أثير</span>
                  </div>
                  <div className="text-[10px] font-mono text-brand-gold bg-brand-stone px-2 py-0.5 rounded-xs">
                    {previewDevice === 'mobile' ? 'Mobile App View' : 'Web Storefront'}
                  </div>
                </div>

                {/* Simulated Sections Preview Flow */}
                <div className="p-4 space-y-4 text-xs font-sans">
                  {sections
                    .filter((s) => s.enabled)
                    .map((sec) => (
                      <div
                        key={sec.id}
                        className={`p-4 rounded-xs border ${
                          sec.id === selectedSectionId
                            ? 'border-brand-gold bg-brand-stone/60'
                            : 'border-brand-border/60 bg-brand-charcoal/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                          <span className="text-brand-gold font-bold">{isAr ? sec.nameAr : sec.nameEn}</span>
                          <span className="text-[9px] text-brand-cream/40 uppercase">{sec.type}</span>
                        </div>

                        {sec.id === 'hero' && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded-full font-mono">
                              {content.heroBadgeAr || '500 GSM HEAVYWEIGHT'}
                            </span>
                            <h4 className="text-base font-black text-brand-ivory font-serif">
                              {content.heroTitleAr || 'إصدار الانطلاق: الهوديز الثقيلة'}
                            </h4>
                          </div>
                        )}

                        {sec.id === 'offers' && (
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-brand-gold">
                            <div className="p-2 border border-brand-border bg-brand-black/60 rounded-xs">
                              كوبون ATHEER10 (10%)
                            </div>
                            <div className="p-2 border border-brand-border bg-brand-black/60 rounded-xs">
                              باندل قطعتين (15%)
                            </div>
                          </div>
                        )}

                        {!['hero', 'offers'].includes(sec.id) && (
                          <p className="text-brand-cream/60 text-[11px]">
                            {isAr ? 'عناصر ومحتوى حي يتزامن مباشرة مع المتجر العام.' : 'Live section element synced with storefront.'}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-charcoal border border-brand-border max-w-lg w-full p-6 rounded-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-sm font-serif font-black text-brand-ivory">
                {isAr ? 'إضافة قسم جديد لصفحة المتجر' : 'Add New Section'}
              </h3>
              <button onClick={() => setShowAddSectionModal(false)} className="text-brand-cream/60 hover:text-brand-ivory">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              {[
                { type: 'countdown', nameEn: 'Drop Countdown Timer', nameAr: 'عداد تنازلي للإصدار القادم' },
                { type: 'banner', nameEn: 'Promotional Image Banner', nameAr: 'بانر إعلاني بصورة عريضة' },
                { type: 'video', nameEn: 'Cinematic Fashion Video', nameAr: 'فيديو سينمائي للأتيليه' },
                { type: 'testimonials', nameEn: 'Customer Reviews & Feedback', nameAr: 'آراء وتقييمات العملاء' },
              ].map((template) => (
                <button
                  key={template.type}
                  type="button"
                  onClick={() => {
                    const newSec: BuilderSection = {
                      id: `${template.type}-${Date.now().toString().slice(-4)}`,
                      type: template.type,
                      nameEn: template.nameEn,
                      nameAr: template.nameAr,
                      enabled: true,
                      order: sections.length + 1,
                    };
                    setSections([...sections, newSec]);
                    setSelectedSectionId(newSec.id);
                    setShowAddSectionModal(false);
                  }}
                  className="p-3 text-right bg-brand-stone/40 border border-brand-border hover:border-brand-gold rounded-xs space-y-1 transition-colors"
                >
                  <p className="font-bold text-brand-ivory">{isAr ? template.nameAr : template.nameEn}</p>
                  <p className="text-[10px] text-brand-cream/50">{template.type}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History & Rollback Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-charcoal border border-brand-border max-w-xl w-full p-6 rounded-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <History className="w-4 h-4 text-brand-gold" />
                <h3 className="text-sm font-serif font-black text-brand-ivory">
                  {isAr ? 'سجل إصدارات المتجر ونقاط الاسترجاع' : 'Published Versions & Rollback'}
                </h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-brand-cream/60 hover:text-brand-ivory">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {versions.length === 0 ? (
                <p className="text-xs font-mono text-brand-cream/60 text-center py-6">
                  {isAr ? 'لا توجد إصدارات سابقة مسجلة بعد.' : 'No previous versions recorded.'}
                </p>
              ) : (
                versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3.5 bg-brand-stone/40 border border-brand-border rounded-xs flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                        <span className="px-2 py-0.5 bg-brand-gold/20 text-brand-gold font-bold rounded-xs text-[10px]">
                          v{ver.version}
                        </span>
                        <span className="text-brand-ivory font-bold">{ver.summary}</span>
                      </div>
                      <p className="text-[10px] text-brand-cream/50">
                        {new Date(ver.timestamp).toLocaleString('ar-EG')} • {ver.authorEmail}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRollback(ver.id)}
                      className="px-3 py-1.5 bg-brand-stone border border-brand-border hover:border-brand-gold text-brand-gold text-[11px] rounded-xs flex items-center space-x-1 rtl:space-x-reverse transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isAr ? 'استرجاع هذا الإصدار' : 'Restore'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-brand-charcoal border border-brand-border max-w-md w-full p-6 rounded-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-sm font-serif font-black text-brand-ivory flex items-center space-x-2 rtl:space-x-reverse">
                <Send className="w-4 h-4 text-brand-gold" />
                <span>{isAr ? 'تأكيد نشر التعديلات على المتجر الحي' : 'Confirm Live Publish'}</span>
              </h3>
              <button onClick={() => setShowPublishModal(false)} className="text-brand-cream/60 hover:text-brand-ivory">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-brand-cream/70 font-sans leading-relaxed">
              {isAr
                ? 'سيتم تطبيق ترتيب الأقسام، النصوص، والألوان مباشرة على المتجر للزوار، وسيتم أخذ لقطة حفظ تلقائية في سجل الإصدارات تمكنك من التراجع في أي وقت.'
                : 'All changes will be published live to public visitors. An automatic snapshot will be saved for instant rollback.'}
            </p>

            <div>
              <label className="block text-xs font-mono text-brand-cream/80 mb-1">
                {isAr ? 'ملاحظة الإصدار (اختياري)' : 'Release Note (Optional)'}
              </label>
              <input
                type="text"
                value={publishSummary}
                onChange={(e) => setPublishSummary(e.target.value)}
                placeholder={isAr ? 'مثال: تعديل بانر الشتاء وترتيب قسم الهوديز' : 'e.g. Winter Drop layout update'}
                className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory text-xs rounded-xs font-mono focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 border border-brand-border text-brand-cream text-xs font-mono rounded-xs hover:bg-brand-stone"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={publishing}
                onClick={handlePublishLive}
                className="px-5 py-2 bg-brand-gold text-brand-black font-bold text-xs font-mono rounded-xs hover:bg-brand-gold-hover shadow-gold flex items-center space-x-1.5 rtl:space-x-reverse"
              >
                <Check className="w-4 h-4" />
                <span>{publishing ? '...' : isAr ? 'تأكيد ونشر الآن' : 'Publish Live Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
