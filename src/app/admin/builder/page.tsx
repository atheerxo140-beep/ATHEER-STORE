'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { BuilderSection, HomepageContent, ThemeConfig } from '@/types';
import { adminFetch } from '@/lib/adminAuthClient';
import { hexToRgb, adjustHexBrightness } from '@/lib/themeService';
import { ARABIC_FONTS, ENGLISH_FONTS } from '@/lib/fontConstants';
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
  Upload,
  Camera,
  Film,
  Loader2,
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

  // Direct Studio / Gallery Media Upload Refs & State
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const heroVideoFileRef = useRef<HTMLInputElement>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);
  const futureFileRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showManualHeroUrl, setShowManualHeroUrl] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);

  // Luxury streetwear pre-composed palettes
  const luxuryPalettes = [
    {
      id: 'royal-gold',
      nameAr: 'الذهب الملكي (الأصلي)',
      nameEn: 'Royal Gold & Onyx',
      gold: '#C5A880',
      black: '#0A0A0A',
      charcoal: '#141414',
      border: '#282828',
    },
    {
      id: 'imperial-emerald',
      nameAr: 'الزمرد الإمبراطوري',
      nameEn: 'Imperial Emerald',
      gold: '#10B981',
      black: '#070C0A',
      charcoal: '#0F1A15',
      border: '#1B3329',
    },
    {
      id: 'crimson-ruby',
      nameAr: 'العنابي والياقوت الفاخر',
      nameEn: 'Crimson Ruby',
      gold: '#E11D48',
      black: '#0C0708',
      charcoal: '#1A0F12',
      border: '#33171F',
    },
    {
      id: 'electric-amber',
      nameAr: 'أمبر نيون وستريت',
      nameEn: 'Electric Amber',
      gold: '#F59E0B',
      black: '#09090C',
      charcoal: '#141419',
      border: '#2D281E',
    },
    {
      id: 'royal-sapphire',
      nameAr: 'الأزرق الملكي (سفاير)',
      nameEn: 'Royal Sapphire',
      gold: '#3B82F6',
      black: '#060913',
      charcoal: '#0D1424',
      border: '#1E2C48',
    },
    {
      id: 'cyber-chrome',
      nameAr: 'كروم فضي مونوكروم',
      nameEn: 'Cyber Chrome',
      gold: '#E2E8F0',
      black: '#050505',
      charcoal: '#121212',
      border: '#2B2B2B',
    },
    {
      id: 'warm-bronze',
      nameAr: 'البرونز والموكا الدافئ',
      nameEn: 'Artisan Bronze',
      gold: '#D97706',
      black: '#0E0B08',
      charcoal: '#18130F',
      border: '#33271D',
    },
    {
      id: 'imperial-violet',
      nameAr: 'البنفسجي الإمبراطوري',
      nameEn: 'Imperial Violet',
      gold: '#A855F7',
      black: '#0B0714',
      charcoal: '#150E24',
      border: '#2E1A47',
    },
  ];

  const applyPalette = (p: typeof luxuryPalettes[0]) => {
    if (!theme) return;
    setTheme({
      ...theme,
      brandGold: p.gold,
      brandBlack: p.black,
      brandCharcoal: p.charcoal,
      brandBorder: p.border,
      announcementBg: p.gold,
      announcementColor: p.black,
    });
  };

  const handleSaveThemeDirectly = async () => {
    if (!theme) return;
    setSavingTheme(true);
    setFeedback(null);
    try {
      const res = await adminFetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: isAr
            ? 'تم حفظ وتطبيق ألوان وهوية المتجر بالكامل بنجاح على المتجر الحقيقي!'
            : 'Theme colors and identity applied live to the storefront successfully!',
        });
        setTimeout(() => setFeedback(null), 5000);
      } else {
        alert(data.error || 'Failed to save theme');
      }
    } catch (e: any) {
      alert(e.message || 'Error saving theme');
    } finally {
      setSavingTheme(false);
    }
  };

  // Direct file uploader to Supabase Storage
  const handleUploadFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    folder: string,
    targetKey: string,
    isHero = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSection(targetKey);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await adminFetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        if (isHero) {
          const isVideo = file.type.startsWith('video/');
          setContent((prev: any) => ({
            ...prev,
            heroMediaType: isVideo ? 'video' : 'image',
            ...(isVideo ? { heroBgVideo: data.url } : { heroBgImage: data.url }),
          }));
        } else {
          setContent((prev: any) => ({
            ...prev,
            [targetKey]: data.url,
          }));
        }
        setFeedback({
          type: 'success',
          message: isAr
            ? 'تم رفع الصورة من الاستوديو بنجاح! لا تنسَ الضغط على "نشر على الموقع" أو "حفظ مسودة".'
            : 'Visual uploaded from your device successfully! Remember to click Publish Live.',
        });
        setTimeout(() => setFeedback(null), 5000);
      } else {
        alert(data.error || (isAr ? 'فشل رفع الملف من الاستوديو' : 'Failed to upload file'));
      }
    } catch (err: any) {
      alert(err.message || (isAr ? 'حدث خطأ أثناء رفع الملف' : 'Upload error occurred'));
    } finally {
      setUploadingSection(null);
      e.target.value = '';
    }
  };

  // Direct Category Card Image Uploader
  const handleCategoryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSection(`cat-${idx}`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'categories');

      const res = await adminFetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setContent((prev: any) => {
          const currentCats = [...(prev.categories || [])];
          if (currentCats[idx]) {
            currentCats[idx] = { ...currentCats[idx], image: data.url };
          }
          return { ...prev, categories: currentCats };
        });
        setFeedback({
          type: 'success',
          message: isAr
            ? `تم رفع صورة بطاقة التشكيلة #${idx + 1} بنجاح!`
            : `Category card #${idx + 1} image uploaded!`,
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      alert(err.message || 'Upload error');
    } finally {
      setUploadingSection(null);
      e.target.value = '';
    }
  };

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

          {/* REAL DYNAMIC THEME & COLOR ENGINE */}
          {theme && (
            <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-brand-border/60">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Palette className="w-4 h-4 text-brand-gold" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ivory">
                    {isAr ? 'تخصيص وهوية ألوان المتجر الحقيقية' : 'Store Theme & Live Colors'}
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {isAr ? '● ينعكس فوراً على المتجر' : '● Live Applied'}
                </span>
              </div>

              {/* 1. Quick Streetwear Luxury Palettes */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-brand-ivory font-mono">
                  {isAr ? 'باليتات ألوان جاهزة بضغطة زر:' : 'Curated Luxury Palettes:'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  {luxuryPalettes.map((p) => {
                    const isSelected =
                      theme.brandGold.toLowerCase() === p.gold.toLowerCase() &&
                      theme.brandBlack.toLowerCase() === p.black.toLowerCase();
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPalette(p)}
                        className={`p-2 rounded-xs border text-right transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-brand-gold bg-brand-stone/90 shadow-sm'
                            : 'border-brand-border/70 bg-brand-black/60 hover:border-brand-gold/60'
                        }`}
                      >
                        <span className={`truncate text-[10px] ${isSelected ? 'text-brand-gold font-bold' : 'text-brand-cream/80'}`}>
                          {isAr ? p.nameAr : p.nameEn}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0 mr-1 rtl:mr-0 rtl:ml-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: p.gold }}
                            title="Accent Color"
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: p.black }}
                            title="Background Color"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Custom Color Pickers */}
              <div className="border-t border-brand-border/60 pt-3 space-y-3">
                <label className="block text-[11px] font-bold text-brand-ivory font-mono">
                  {isAr ? 'أو اختر درجاتك المخصصة بدقة:' : 'Or Fine-Tune Custom Colors:'}
                </label>

                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  <div>
                    <label className="block text-[10px] text-brand-cream/70 mb-1">{isAr ? 'اللون الرئيسي / الذهبي' : 'Primary / Gold'}</label>
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse bg-brand-stone/40 border border-brand-border p-1.5 rounded-xs">
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
                    <label className="block text-[10px] text-brand-cream/70 mb-1">{isAr ? 'خلفية المتجر' : 'Background'}</label>
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse bg-brand-stone/40 border border-brand-border p-1.5 rounded-xs">
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
                    <label className="block text-[10px] text-brand-cream/70 mb-1">{isAr ? 'لون الحاويات والبطاقات' : 'Cards / Charcoal'}</label>
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse bg-brand-stone/40 border border-brand-border p-1.5 rounded-xs">
                      <input
                        type="color"
                        value={theme.brandCharcoal || '#141414'}
                        onChange={(e) => setTheme({ ...theme, brandCharcoal: e.target.value })}
                        className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded-xs"
                      />
                      <input
                        type="text"
                        value={theme.brandCharcoal || '#141414'}
                        onChange={(e) => setTheme({ ...theme, brandCharcoal: e.target.value })}
                        className="w-full bg-transparent text-brand-ivory font-mono text-[11px] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-brand-cream/70 mb-1">{isAr ? 'لون الحدود والفواصل' : 'Borders'}</label>
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse bg-brand-stone/40 border border-brand-border p-1.5 rounded-xs">
                      <input
                        type="color"
                        value={theme.brandBorder || '#282828'}
                        onChange={(e) => setTheme({ ...theme, brandBorder: e.target.value })}
                        className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded-xs"
                      />
                      <input
                        type="text"
                        value={theme.brandBorder || '#282828'}
                        onChange={(e) => setTheme({ ...theme, brandBorder: e.target.value })}
                        className="w-full bg-transparent text-brand-ivory font-mono text-[11px] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Typography & Button Corners */}
              <div className="space-y-3 text-xs font-mono border-t border-brand-border/60 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-brand-cream/70 mb-1">
                      {isAr ? 'الخط العربي الأساسي' : 'Arabic Font'}
                    </label>
                    <select
                      value={theme.fontFamilyAr}
                      onChange={(e) => setTheme({ ...theme, fontFamilyAr: e.target.value })}
                      className="w-full bg-brand-stone/60 border border-brand-border px-2 py-1.5 text-brand-ivory text-xs rounded-xs font-bold"
                    >
                      {ARABIC_FONTS.map((font) => (
                        <option key={font.name} value={font.name}>
                          {font.name} — {font.categoryAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-brand-cream/70 mb-1">
                      {isAr ? 'الخط الإنجليزي الأساسي' : 'English Font'}
                    </label>
                    <select
                      value={theme.fontFamilyEn || 'Cinzel'}
                      onChange={(e) => setTheme({ ...theme, fontFamilyEn: e.target.value })}
                      className="w-full bg-brand-stone/60 border border-brand-border px-2 py-1.5 text-brand-ivory text-xs rounded-xs font-bold"
                    >
                      {ENGLISH_FONTS.map((font) => (
                        <option key={font.name} value={font.name}>
                          {font.name} — {font.categoryAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-brand-cream/70 mb-1">{isAr ? 'زوايا الأزرار والبطاقات' : 'Button Style'}</label>
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

              {/* 4. Live Contrast & Swatch Test Strip */}
              <div
                className="p-3 rounded-xs border space-y-2 transition-colors"
                style={{
                  backgroundColor: theme.brandBlack,
                  borderColor: theme.brandBorder || '#282828',
                }}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span style={{ color: theme.brandGold }} className="font-bold">
                    {isAr ? 'معاينة حية للتباين:' : 'Contrast Preview:'}
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                    style={{
                      backgroundColor: theme.brandGold,
                      color: theme.brandBlack,
                    }}
                  >
                    500 GSM
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="p-2 rounded-xs border text-[10px] font-mono flex-1 text-center truncate"
                    style={{
                      backgroundColor: theme.brandCharcoal || '#141414',
                      borderColor: theme.brandBorder || '#282828',
                      color: theme.brandIvory || '#FAF9F6',
                    }}
                  >
                    {isAr ? 'بطاقة المنتج' : 'Card Surface'}
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 font-bold text-[10px] font-mono transition-opacity flex-1 truncate"
                    style={{
                      backgroundColor: theme.brandGold,
                      color: theme.brandBlack,
                      borderRadius:
                        theme.borderRadius === 'pill'
                          ? '9999px'
                          : theme.borderRadius === 'rounded'
                          ? '6px'
                          : theme.borderRadius === 'subtle'
                          ? '2px'
                          : '0px',
                    }}
                  >
                    {isAr ? 'تسوق التشكيلة' : 'Shop Drop'}
                  </button>
                </div>
              </div>

              {/* 5. Direct Save Theme Button */}
              <button
                type="button"
                onClick={handleSaveThemeDirectly}
                disabled={savingTheme}
                className="w-full py-2.5 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-gold disabled:opacity-50"
              >
                {savingTheme ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>
                  {savingTheme
                    ? (isAr ? 'جاري تطبيق الهوية...' : 'Applying Theme...')
                    : (isAr ? '💾 حفظ وتطبيق الألوان فوراً على المتجر' : 'Save & Apply Theme Live')}
                </span>
              </button>
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
                {/* Hidden File Inputs for Direct Studio / Phone Gallery Upload */}
                <input
                  ref={heroFileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => handleUploadFile(e, 'hero', 'heroBgImage', true)}
                />
                <input
                  ref={heroVideoFileRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/mov,video/x-m4v"
                  className="hidden"
                  onChange={(e) => handleUploadFile(e, 'hero-video', 'heroBgVideo', true)}
                />

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

                {/* 1-CLICK STUDIO / PHONE GALLERY UPLOADER */}
                <div className="md:col-span-2 p-3.5 bg-brand-black/80 border border-brand-gold/40 rounded-sm space-y-3 shadow-inner">
                  <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-gold font-bold">
                      <Camera className="w-4 h-4" />
                      <span>{isAr ? 'صورة أو فيديو خلفية البانر (رفع مباشر من الاستوديو)' : 'Hero Background Visual (Direct Studio Upload)'}</span>
                    </div>
                    <span className="text-[10px] text-brand-cream/60 font-mono">
                      {content.heroMediaType === 'video' && content.heroBgVideo
                        ? (isAr ? '🎬 فيديو نشط' : 'Active Video')
                        : (isAr ? '📸 صورة نشطة' : 'Active Image')}
                    </span>
                  </div>

                  {/* Thumbnail & Replace Controls if Media exists */}
                  {(content.heroBgImage || content.heroBgVideo) && (
                    <div className="rounded-xs border border-brand-border bg-brand-stone/30 p-2.5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {content.heroMediaType === 'video' && content.heroBgVideo ? (
                        <video
                          src={content.heroBgVideo}
                          className="w-24 h-20 object-cover rounded-xs border border-brand-gold/40 bg-black flex-shrink-0"
                          muted
                          autoPlay
                          loop
                        />
                      ) : (
                        <img
                          src={content.heroBgImage}
                          alt="Hero Preview"
                          className="w-24 h-20 object-cover rounded-xs border border-brand-gold/40 bg-black flex-shrink-0"
                        />
                      )}

                      <div className="flex-1 min-w-0 space-y-1.5 w-full">
                        <div className="text-[11px] font-bold text-brand-ivory flex items-center justify-between">
                          <span>
                            {content.heroMediaType === 'video' && content.heroBgVideo
                              ? (isAr ? '🎬 فيديو سينمائي مرفوع' : 'Uploaded Video')
                              : (isAr ? '📸 صورة خلفية مرفوعة من الاستوديو' : 'Uploaded Image')}
                          </span>
                        </div>
                        <p className="text-[10px] text-brand-cream/50 font-mono truncate" dir="ltr">
                          {content.heroMediaType === 'video' ? content.heroBgVideo : content.heroBgImage}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => heroFileRef.current?.click()}
                            disabled={uploadingSection === 'heroBgImage'}
                            className="px-3 py-1.5 bg-brand-gold hover:bg-brand-gold-hover text-brand-black font-bold text-xs rounded-xs transition-colors flex items-center gap-1.5 shadow-gold disabled:opacity-50"
                          >
                            {uploadingSection === 'heroBgImage' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Camera className="w-3.5 h-3.5" />
                            )}
                            <span>{isAr ? '📸 رفع صورة بديلة من الاستوديو' : 'Change from Studio'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => heroVideoFileRef.current?.click()}
                            disabled={uploadingSection === 'heroBgVideo'}
                            className="px-3 py-1.5 bg-brand-stone hover:bg-brand-stone/80 text-brand-ivory font-bold text-xs rounded-xs transition-colors flex items-center gap-1.5 border border-brand-border disabled:opacity-50"
                          >
                            {uploadingSection === 'heroBgVideo' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Film className="w-3.5 h-3.5 text-brand-gold" />
                            )}
                            <span>{isAr ? '🎬 رفع فيديو بديل' : 'Upload Video'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setContent({
                                ...content,
                                heroBgImage: '',
                                heroBgVideo: '',
                                heroMediaType: 'image',
                              });
                            }}
                            className="px-2 py-1 text-rose-400 hover:text-rose-300 text-xs hover:underline"
                          >
                            {isAr ? 'إزالة الصورة' : 'Remove Visual'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Big Upload Dropzone if no media */}
                  {!content.heroBgImage && !content.heroBgVideo && (
                    <div className="border border-dashed border-brand-gold/60 rounded-xs p-5 text-center space-y-3 bg-brand-stone/15">
                      <Camera className="w-8 h-8 mx-auto text-brand-gold animate-bounce" />
                      <div>
                        <p className="text-xs font-bold text-brand-ivory">
                          {isAr ? 'ارفع صورة أو فيديو الخلفية من الاستوديو أو الهاتف مباشرة' : 'Upload background photo or video from studio'}
                        </p>
                        <p className="text-[10px] text-brand-cream/60">
                          {isAr ? 'يدعم الصور JPG, PNG, WEBP ومقاطع الفيديو MP4 (يتم حفظها في التخزين السحابي فوراً)' : 'Supports JPG, PNG, WEBP, and MP4'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => heroFileRef.current?.click()}
                          disabled={uploadingSection === 'heroBgImage'}
                          className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-bold rounded-xs transition-colors flex items-center gap-1.5 shadow-gold disabled:opacity-50"
                        >
                          {uploadingSection === 'heroBgImage' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span>{isAr ? '📸 ارفع صورة من الاستوديو' : 'Upload Photo'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => heroVideoFileRef.current?.click()}
                          disabled={uploadingSection === 'heroBgVideo'}
                          className="px-3.5 py-2 bg-brand-stone/80 border border-brand-border hover:border-brand-gold text-brand-ivory text-xs font-bold rounded-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {uploadingSection === 'heroBgVideo' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Film className="w-4 h-4 text-brand-gold" />
                          )}
                          <span>{isAr ? '🎬 ارفع فيديو' : 'Upload Video'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Advanced manual URL toggle */}
                  <div className="pt-1.5 border-t border-brand-border/40">
                    <button
                      type="button"
                      onClick={() => setShowManualHeroUrl(!showManualHeroUrl)}
                      className="text-[10px] text-brand-cream/50 hover:text-brand-gold underline flex items-center gap-1 font-mono"
                    >
                      <span>{isAr ? (showManualHeroUrl ? '▲ إخفاء خانة الرابط اليدوي' : '▼ إدخال رابط صورة يدوياً (متقدم)') : (showManualHeroUrl ? '▲ Hide manual URL' : '▼ Enter manual image URL')}</span>
                    </button>
                    {showManualHeroUrl && (
                      <div className="mt-2 space-y-1">
                        <label className="block text-[10px] text-brand-cream/60">{isAr ? 'رابط الصورة المباشر:' : 'Direct Image URL:'}</label>
                        <input
                          type="text"
                          value={content.heroBgImage || ''}
                          onChange={(e) => setContent({ ...content, heroBgImage: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-brand-stone/40 border border-brand-border px-3 py-1.5 text-brand-ivory rounded-xs font-mono text-[11px] focus:border-brand-gold focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
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
              <div className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-cream/80 mb-1">
                      {isAr ? 'شارة قصة الدار (عربي)' : 'Story Badge (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={content.storyBadgeAr || ''}
                      onChange={(e) => setContent({ ...content, storyBadgeAr: e.target.value })}
                      placeholder="فلسفة أثير في أزياء الشارع"
                      className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-cream/80 mb-1">
                      {isAr ? 'العنوان الرئيسي (عربي)' : 'Story Title (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={content.storyTitleAr || ''}
                      onChange={(e) => setContent({ ...content, storyTitleAr: e.target.value })}
                      placeholder="ثقل حقيقي مصمم لتحمل الحركة اليومية"
                      className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-cream/80 mb-1">
                      {isAr ? 'الفقرة الأولى (عربي)' : 'Paragraph 1 (Arabic)'}
                    </label>
                    <textarea
                      rows={3}
                      value={content.storyParagraph1Ar || ''}
                      onChange={(e) => setContent({ ...content, storyParagraph1Ar: e.target.value })}
                      className="w-full bg-brand-stone/40 border border-brand-border p-2.5 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-cream/80 mb-1">
                      {isAr ? 'الفقرة الثانية (عربي)' : 'Paragraph 2 (Arabic)'}
                    </label>
                    <textarea
                      rows={3}
                      value={content.storyParagraph2Ar || ''}
                      onChange={(e) => setContent({ ...content, storyParagraph2Ar: e.target.value })}
                      className="w-full bg-brand-stone/40 border border-brand-border p-2.5 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Photo & Direct Studio Upload Section */}
                <input
                  ref={storyFileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => handleUploadFile(e, 'story-media', 'storyImage')}
                />
                <div className="border-t border-brand-border/60 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {content.storyImage ? (
                      <img
                        src={content.storyImage}
                        alt="Story Visual"
                        className="w-14 h-16 object-cover rounded-xs border border-brand-gold/50 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-16 bg-brand-stone/40 rounded-xs border border-brand-border flex items-center justify-center text-brand-cream/30">
                        <Camera className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="text-[11px] font-bold text-brand-ivory">
                        {isAr ? 'صورة الموديل المرفقة بالقسم' : 'Story Model Image'}
                      </div>
                      <div className="text-[10px] text-brand-cream/60">
                        {isAr ? 'ارفع صورة الموديل أو الأتيليه من الاستوديو مباشرة' : 'Upload model photo from studio'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => storyFileRef.current?.click()}
                      disabled={uploadingSection === 'storyImage'}
                      className="px-3.5 py-2 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-bold rounded-xs transition-colors flex items-center gap-1.5 shadow-gold disabled:opacity-50"
                    >
                      {uploadingSection === 'storyImage' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                      <span>{isAr ? '📸 ارفع صورة من الاستوديو' : 'Upload from Studio'}</span>
                    </button>

                    <a
                      href="/admin/content?tab=story"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-2 bg-brand-stone/60 border border-brand-border hover:border-brand-gold text-brand-cream hover:text-brand-ivory text-[11px] rounded-xs transition-colors flex items-center gap-1"
                      title={isAr ? 'تعديل أرقام الجراماج 500 GSM والمقاييس' : 'Edit Specs'}
                    >
                      <span>{isAr ? 'المقاييس' : 'Specs'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
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

                {/* Cards Preview & Direct studio image upload */}
                <div className="border-t border-brand-border/60 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-brand-ivory">
                      {isAr ? 'بطاقات التشكيلات الأربعة الحالية (رفع مباشر من الاستوديو):' : 'Showcase Cards (Direct Studio Upload):'}
                    </span>
                    <a
                      href="/admin/content?tab=categories"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-brand-gold hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>{isAr ? 'تعديل نصوص وتفاصيل البطاقات بالكامل ←' : 'Full Cards Content Editor →'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(content.categories || []).map((cat: any, idx: number) => (
                      <div key={cat.id || idx} className="bg-brand-black/60 border border-brand-border p-2.5 rounded-xs flex items-center justify-between gap-2.5">
                        <input
                          type="file"
                          ref={(el) => { categoryFileInputRefs.current[idx] = el; }}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleCategoryUpload(e, idx)}
                        />
                        <div className="flex items-center gap-2.5 min-w-0">
                          {cat.image ? (
                            <img src={cat.image} alt="" className="w-11 h-11 object-cover rounded-xs border border-brand-gold/40 flex-shrink-0" />
                          ) : (
                            <div className="w-11 h-11 bg-brand-stone/50 rounded-xs flex-shrink-0 flex items-center justify-center text-brand-cream/40">
                              <Camera className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-brand-ivory truncate">{isAr ? cat.titleAr : cat.titleEn}</div>
                            <div className="text-[9px] text-brand-gold truncate">{isAr ? cat.tagAr : cat.tagEn}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => categoryFileInputRefs.current[idx]?.click()}
                          disabled={uploadingSection === `cat-${idx}`}
                          className="px-2.5 py-1.5 bg-brand-gold/20 hover:bg-brand-gold text-brand-gold hover:text-brand-black text-[10px] font-mono font-bold rounded-xs border border-brand-gold/40 transition-colors flex items-center gap-1 flex-shrink-0 disabled:opacity-50"
                        >
                          {uploadingSection === `cat-${idx}` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Camera className="w-3 h-3" />
                          )}
                          <span>{isAr ? '📸 رفع صورة' : 'Upload'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection?.id === 'future' && (
              <div className="space-y-4 text-xs font-mono">
                {/* Hidden File Input for Future Drop */}
                <input
                  ref={futureFileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => handleUploadFile(e, 'future-drop', 'futureImage')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-cream/80 mb-1">
                      {isAr ? 'شارة الإصدار القادم (عربي)' : 'Badge (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={content.futureBadgeAr || ''}
                      onChange={(e) => setContent({ ...content, futureBadgeAr: e.target.value })}
                      placeholder="الإصدار القادم · قريباً"
                      className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-cream/80 mb-1">
                      {isAr ? 'العنوان الرئيسي (عربي)' : 'Title (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={content.futureTitleAr || ''}
                      onChange={(e) => setContent({ ...content, futureTitleAr: e.target.value })}
                      placeholder="تي شيرت أثير البوكسي الثقيل 320 GSM"
                      className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-brand-cream/80 mb-1">
                      {isAr ? 'الوصف التفصيلي (عربي)' : 'Description (Arabic)'}
                    </label>
                    <textarea
                      rows={2}
                      value={content.futureDescAr || ''}
                      onChange={(e) => setContent({ ...content, futureDescAr: e.target.value })}
                      className="w-full bg-brand-stone/40 border border-brand-border p-2.5 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-cream/80 mb-1">
                      {isAr ? 'الشارة على الصورة (عربي)' : 'Image Overlay Badge'}
                    </label>
                    <input
                      type="text"
                      value={content.futureBadgeBottomAr || ''}
                      onChange={(e) => setContent({ ...content, futureBadgeBottomAr: e.target.value })}
                      placeholder="مرحلة العينات · قريباً في الأسواق"
                      className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-xs text-right focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-brand-cream/80 mb-1">{isAr ? 'وسم 1' : 'Chip 1'}</label>
                      <input
                        type="text"
                        value={content.futureChip1 || ''}
                        onChange={(e) => setContent({ ...content, futureChip1: e.target.value })}
                        className="w-full bg-brand-stone/40 border border-brand-border px-2 py-1.5 text-brand-ivory rounded-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-brand-cream/80 mb-1">{isAr ? 'وسم 2' : 'Chip 2'}</label>
                      <input
                        type="text"
                        value={content.futureChip2 || ''}
                        onChange={(e) => setContent({ ...content, futureChip2: e.target.value })}
                        className="w-full bg-brand-stone/40 border border-brand-border px-2 py-1.5 text-brand-ivory rounded-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Photo & Direct Studio Upload Section */}
                <div className="border-t border-brand-border/60 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {content.futureImage ? (
                      <img
                        src={content.futureImage}
                        alt="Future Visual"
                        className="w-14 h-14 object-cover rounded-xs border border-brand-gold/50 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-brand-stone/40 rounded-xs border border-brand-border flex items-center justify-center text-brand-cream/30">
                        <Camera className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="text-[11px] font-bold text-brand-ivory">
                        {isAr ? 'صورة التي شيرت / الإصدار القادم' : 'Future Drop Teaser Photo'}
                      </div>
                      <div className="text-[10px] text-brand-cream/60">
                        {isAr ? 'ارفع صورة التي شيرت من الاستوديو أو استبدلها بضغطة زر' : 'Upload or replace photo from studio'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => futureFileRef.current?.click()}
                      disabled={uploadingSection === 'futureImage'}
                      className="px-3.5 py-2 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-bold rounded-xs transition-colors flex items-center gap-1.5 shadow-gold disabled:opacity-50"
                    >
                      {uploadingSection === 'futureImage' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                      <span>{isAr ? '📸 ارفع صورة من الاستوديو' : 'Upload from Studio'}</span>
                    </button>

                    <a
                      href="/admin/content?tab=future"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-2 bg-brand-stone/60 border border-brand-border hover:border-brand-gold text-brand-cream hover:text-brand-ivory text-[11px] rounded-xs transition-colors flex items-center gap-1"
                      title={isAr ? 'تعديل تفاصيل وأوسمة الإصدار القادم' : 'Edit Details'}
                    >
                      <span>{isAr ? 'التفاصيل' : 'Details'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {!['hero', 'offers', 'story', 'categories', 'future'].includes(activeSection?.id || '') && (
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

            {/* Scaled Responsive Iframe Wrapper with Dynamic Live Theme CSS Variables */}
            <div className="flex justify-center bg-black/60 p-4 rounded-xs overflow-x-auto min-h-[480px]">
              <div
                style={{
                  width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
                  transition: 'width 0.3s ease, background-color 0.2s ease',
                  backgroundColor: theme?.brandBlack || '#0A0A0A',
                  '--brand-gold': theme?.brandGold || '#C5A880',
                  '--brand-gold-rgb': hexToRgb(theme?.brandGold || '#C5A880'),
                  '--brand-gold-hover': adjustHexBrightness(theme?.brandGold || '#C5A880', -15),
                  '--brand-gold-hover-rgb': hexToRgb(adjustHexBrightness(theme?.brandGold || '#C5A880', -15)),
                  '--brand-black': theme?.brandBlack || '#0A0A0A',
                  '--brand-black-rgb': hexToRgb(theme?.brandBlack || '#0A0A0A'),
                  '--brand-charcoal': theme?.brandCharcoal || adjustHexBrightness(theme?.brandBlack || '#0A0A0A', 10),
                  '--brand-charcoal-rgb': hexToRgb(theme?.brandCharcoal || adjustHexBrightness(theme?.brandBlack || '#0A0A0A', 10)),
                  '--brand-stone': theme?.brandStone || adjustHexBrightness(theme?.brandBlack || '#0A0A0A', 22),
                  '--brand-stone-rgb': hexToRgb(theme?.brandStone || adjustHexBrightness(theme?.brandBlack || '#0A0A0A', 22)),
                  '--brand-border': theme?.brandBorder || adjustHexBrightness(theme?.brandBlack || '#0A0A0A', 28),
                  '--brand-border-rgb': hexToRgb(theme?.brandBorder || adjustHexBrightness(theme?.brandBlack || '#0A0A0A', 28)),
                  '--brand-ivory': theme?.brandIvory || '#FAF9F6',
                  '--brand-ivory-rgb': hexToRgb(theme?.brandIvory || '#FAF9F6'),
                } as React.CSSProperties}
                className="bg-brand-black border border-brand-border shadow-2xl overflow-hidden rounded-xs flex flex-col transition-colors duration-200"
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
                          <div
                            className="relative overflow-hidden rounded-xs p-3.5 min-h-[110px] flex flex-col justify-end border border-brand-gold/30 bg-cover bg-center"
                            style={content.heroBgImage ? { backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3)), url('${content.heroBgImage}')` } : {}}
                          >
                            <span className="text-[10px] bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded-full font-mono inline-block w-fit mb-1 border border-brand-gold/40">
                              {content.heroBadgeAr || '500 GSM HEAVYWEIGHT'}
                            </span>
                            <h4 className="text-base font-black text-brand-ivory font-serif drop-shadow-md">
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

                        {sec.id === 'categories' && (
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-bold text-brand-ivory">{content.categoriesTitleAr || 'خزانة الستريتوير'}</h4>
                            <div className="grid grid-cols-4 gap-1">
                              {(content.categories || []).slice(0, 4).map((c: any, i: number) => (
                                <div key={i} className="text-center">
                                  {c.image ? (
                                    <img src={c.image} alt="" className="w-full h-10 object-cover rounded-xs border border-brand-border mb-0.5" />
                                  ) : (
                                    <div className="w-full h-10 bg-brand-stone/40 rounded-xs mb-0.5" />
                                  )}
                                  <div className="text-[8px] text-brand-cream/70 truncate">{c.titleAr || c.titleEn}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {sec.id === 'story' && (
                          <div className="flex items-center gap-3">
                            {content.storyImage ? (
                              <img src={content.storyImage} alt="" className="w-12 h-14 object-cover rounded-xs border border-brand-gold/40 flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-14 bg-brand-stone/40 rounded-xs border border-brand-border flex-shrink-0" />
                            )}
                            <div>
                              <div className="text-xs font-bold text-brand-ivory">{content.storyTitleAr || 'فلسفة دار أثير'}</div>
                              <p className="text-[10px] text-brand-cream/60 line-clamp-2 mt-0.5">{content.storyParagraph1Ar || ''}</p>
                            </div>
                          </div>
                        )}

                        {sec.id === 'future' && (
                          <div className="flex items-center gap-3">
                            {content.futureImage ? (
                              <img src={content.futureImage} alt="" className="w-12 h-12 object-cover rounded-xs border border-brand-gold/40 flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-12 bg-brand-stone/40 rounded-xs border border-brand-border flex-shrink-0" />
                            )}
                            <div>
                              <div className="text-xs font-bold text-brand-ivory">{content.futureTitleAr || 'تي شيرت أثير الثقيل 320 GSM'}</div>
                              <span className="text-[9px] text-brand-gold font-mono">{content.futureBadgeAr || 'قريباً'}</span>
                            </div>
                          </div>
                        )}

                        {!['hero', 'offers', 'categories', 'story', 'future'].includes(sec.id) && (
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
