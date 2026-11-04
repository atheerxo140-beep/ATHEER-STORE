'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { HomepageContent, ShowcaseCategoryItem } from '@/types';
import { defaultHomepageContent } from '@/data/defaultHomepageContent';
import {
  Image as ImageIcon,
  Save,
  RefreshCw,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Type,
  Layout,
  Layers,
  ArrowRight,
  ArrowLeft,
  Flame,
  Upload,
  Trash2,
  Camera,
  FolderOpen,
  Check,
  Film,
  Video,
  Play,
} from 'lucide-react';



export default function AdminContentPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'categories'>('hero');

  // File Upload States
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingHeroVideo, setUploadingHeroVideo] = useState(false);
  const [uploadingCategoryIdx, setUploadingCategoryIdx] = useState<number | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const heroVideoFileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage-content');
      const data = await res.json();
      if (data.success && data.content) {
        setContent(data.content);
      }
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Upload handler to upload file from local device/studio directly to Supabase Storage
  const uploadMediaFile = async (file: File, folder: string): Promise<string | null> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('atheer_admin_token') : '';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      } else {
        alert(data.error || (isAr ? 'فشل رفع الملف' : 'Failed to upload file'));
        return null;
      }
    } catch (err: any) {
      alert(err.message || (isAr ? 'حدث خطأ أثناء رفع الملف' : 'Upload error'));
      return null;
    }
  };

  const handleHeroFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !content) return;

    setUploadingHero(true);
    const uploadedUrl = await uploadMediaFile(file, 'hero');
    setUploadingHero(false);

    if (uploadedUrl) {
      setContent({ ...content, heroBgImage: uploadedUrl, heroMediaType: 'image' });
      setFeedback({
        type: 'success',
        message: isAr
          ? 'تم رفع صورة البانر من الاستوديو بنجاح! لا تنسَ الضغط على "حفظ ونشر التعديلات".'
          : 'Hero image uploaded successfully from your device! Remember to click Save & Publish.',
      });
      setTimeout(() => setFeedback(null), 5000);
    }

    if (heroFileInputRef.current) {
      heroFileInputRef.current.value = '';
    }
  };

  const handleHeroVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !content) return;

    setUploadingHeroVideo(true);
    const uploadedUrl = await uploadMediaFile(file, 'hero-video');
    setUploadingHeroVideo(false);

    if (uploadedUrl) {
      setContent({
        ...content,
        heroMediaType: 'video',
        heroBgVideo: uploadedUrl,
      });
      setFeedback({
        type: 'success',
        message: isAr
          ? 'تم رفع مقطع الفيديو للبانر بنجاح! لا تنسَ الضغط على "حفظ ونشر التعديلات".'
          : 'Hero video uploaded successfully! Remember to click Save & Publish.',
      });
      setTimeout(() => setFeedback(null), 5000);
    }

    if (heroVideoFileInputRef.current) {
      heroVideoFileInputRef.current.value = '';
    }
  };

  const handleCategoryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file || !content) return;

    setUploadingCategoryIdx(idx);
    const uploadedUrl = await uploadMediaFile(file, 'categories');
    setUploadingCategoryIdx(null);

    if (uploadedUrl) {
      updateCategory(idx, { image: uploadedUrl });
      setFeedback({
        type: 'success',
        message: isAr
          ? `تم رفع صورة البطاقة #${idx + 1} من جهازك بنجاح!`
          : `Card #${idx + 1} image uploaded successfully!`,
      });
      setTimeout(() => setFeedback(null), 4000);
    }

    if (categoryFileInputRefs.current[idx]) {
      categoryFileInputRefs.current[idx]!.value = '';
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content) return;

    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/homepage-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      const data = await res.json();
      if (data.success) {
        setContent(data.content);
        setFeedback({
          type: 'success',
          message: isAr
            ? 'تم حفظ وتحديث محتوى الواجهة والصور بنجاح على السيرفر!'
            : 'Homepage content and visuals saved to server successfully!',
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: 'error',
          message: data.error || (isAr ? 'تعذر حفظ التعديلات' : 'Failed to save changes'),
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || (isAr ? 'حدث خطأ في الاتصال' : 'Connection error occurred'),
      });
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = (index: number, fields: Partial<ShowcaseCategoryItem>) => {
    if (!content) return;
    const newCategories = [...content.categories];
    newCategories[index] = { ...newCategories[index], ...fields };
    setContent({ ...content, categories: newCategories });
  };

  const resetHeroImage = () => {
    if (!content) return;
    setContent({
      ...content,
      heroBgImage: defaultHomepageContent.heroBgImage,
      heroMediaType: 'image',
      heroBgVideo: '',
    });
  };

  const resetCategoryImage = (idx: number) => {
    if (!content) return;
    const defaultImg = defaultHomepageContent.categories[idx]?.image || '';
    updateCategory(idx, { image: defaultImg });
  };

  if (loading || !content) {
    return (
      <div className="py-24 text-center font-mono text-xs text-brand-cream/60">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
        {isAr ? 'جاري تحميل محتوى الواجهة...' : 'Loading homepage CMS...'}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Hidden File Input for Hero */}
      <input
        ref={heroFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleHeroFileSelect}
        className="hidden"
      />

      {/* Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-border/60">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs uppercase tracking-widest text-brand-gold font-mono mb-1">
            <Camera className="w-3.5 h-3.5 text-brand-gold" />
            <span>{isAr ? 'رفع وتعديل الصور والمحتوى من جهازك' : 'Device Gallery Upload & CMS'}</span>
          </div>
          <h1 className="text-2xl font-sans font-black tracking-tight text-brand-ivory">
            {isAr ? 'محتوى الواجهة وصور الاستوديو' : 'Homepage Hero & Content Editor'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-1">
            {isAr
              ? 'ارفع صورك مباشرة من استوديو هاتفك أو جهازك، وعدل أو احذف العناوين والنصوص بنقرة واحدة.'
              : 'Upload photos directly from your phone gallery or PC, edit headlines, and control visuals.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2.5 bg-brand-charcoal hover:bg-brand-stone/40 border border-brand-border text-brand-ivory text-xs font-mono transition-colors rounded-sm"
          >
            <Eye className="w-3.5 h-3.5 text-brand-cream/70" />
            <span>{isAr ? 'معاينة المتجر' : 'Live Storefront'}</span>
            <ExternalLink className="w-3 h-3 text-brand-cream/40 ml-1 rtl:mr-1 rtl:ml-0" />
          </a>

          <button
            onClick={() => handleSave()}
            disabled={saving || uploadingHero || uploadingHeroVideo || uploadingCategoryIdx !== null}
            className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-2.5 bg-brand-gold text-brand-black text-xs font-mono font-bold tracking-wider hover:bg-brand-gold-hover transition-all duration-200 shadow-gold rounded-sm disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ ونشر التعديلات' : 'Save & Publish')}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-sm border flex items-center space-x-3 rtl:space-x-reverse text-xs font-mono animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Section Switcher Tabs */}
      <div className="flex border-b border-brand-border/60 space-x-2 rtl:space-x-reverse text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center space-x-2 rtl:space-x-reverse px-5 py-3 border-b-2 font-bold transition-colors ${
            activeTab === 'hero'
              ? 'border-brand-gold text-brand-gold bg-brand-charcoal/40'
              : 'border-transparent text-brand-cream/60 hover:text-brand-ivory'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? '1. البانر الرئيسي وصورة الواجهة' : '1. Hero Section & Visual'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center space-x-2 rtl:space-x-reverse px-5 py-3 border-b-2 font-bold transition-colors ${
            activeTab === 'categories'
              ? 'border-brand-gold text-brand-gold bg-brand-charcoal/40'
              : 'border-transparent text-brand-cream/60 hover:text-brand-ivory'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isAr ? '2. صور وبطاقات فئات المتجر (4 فئات)' : '2. Category Showcase Cards'}</span>
        </button>
      </div>

      {/* TAB 1: HERO & ANNOUNCEMENT */}
      {activeTab === 'hero' && (
        <div className="space-y-8 animate-fade-in">
          {/* Live Preview Card */}
          <div className="relative rounded-sm overflow-hidden border border-brand-border/80 bg-brand-black p-6 sm:p-10 text-center min-h-[280px] flex items-center justify-center">
            {content.heroMediaType === 'video' && content.heroBgVideo ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                poster={content.heroBgImage}
                src={content.heroBgVideo}
                className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
              />
            ) : (
              <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-35"
                style={{ backgroundImage: `url('${content.heroBgImage}')` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/90 to-brand-black/70 z-0" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-gold px-3 py-1 bg-brand-black/80 border border-brand-gold/40 rounded-full inline-block">
                {isAr ? content.heroBadgeAr : content.heroBadgeEn}
              </span>

              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-brand-ivory">
                {isAr ? content.heroTitleAr : content.heroTitleEn}
              </h2>

              <p className="text-xs sm:text-sm text-brand-cream/80 font-light leading-relaxed">
                {isAr ? content.heroSubtitleAr : content.heroSubtitleEn}
              </p>

              <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse pt-2">
                <span className="px-5 py-2 bg-brand-gold text-brand-black text-[11px] font-mono font-bold uppercase tracking-wider">
                  {isAr ? content.heroCtaPrimaryAr : content.heroCtaPrimaryEn}
                </span>
                <span className="px-5 py-2 border border-brand-border text-brand-ivory text-[11px] font-mono uppercase tracking-wider">
                  {isAr ? content.heroCtaSecondaryAr : content.heroCtaSecondaryEn}
                </span>
              </div>
            </div>

            <div className="absolute bottom-2 right-3 rtl:right-auto rtl:left-3 text-[10px] font-mono text-brand-cream/50 bg-brand-black/80 px-2 py-0.5 rounded-xs border border-brand-border/60">
              {content.heroMediaType === 'video' && content.heroBgVideo
                ? (isAr ? 'معاينة حية: فيديو خلفية نشط' : 'Live Preview: Active Video')
                : (isAr ? 'معاينة حية: صورة نشطة' : 'Live Preview: Active Image')}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* ISOLATED HERO BACKGROUND MANAGER (PHOTO OR VIDEO)             */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-5">
              <div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                  <span className="text-base font-serif font-black text-brand-ivory">
                    {isAr ? 'خلفية البانر الرئيسي للمتجر' : 'Hero Section Background Media'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-brand-gold/20 text-brand-gold border border-brand-gold/30 rounded-xs font-bold">
                    {content.heroMediaType === 'video' && content.heroBgVideo
                      ? (isAr ? '🎬 فيديو' : 'Video')
                      : (isAr ? '📷 صورة' : 'Image')}
                  </span>
                </div>
                <p className="text-xs text-brand-cream/60">
                  {isAr
                    ? 'تحكم منفصل وخاص بخلفية البانر فقط. اختر نوع الخلفية (صورة أو فيديو) وارفع ملفك مباشرة من جهازك.'
                    : 'Independent background control. Choose media format and upload directly from your device.'}
                </p>
              </div>

              {/* Media Type Switcher: Image vs Video */}
              <div className="inline-flex items-center p-1 bg-brand-black border border-brand-border/80 rounded-xs text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setContent({ ...content, heroMediaType: 'image' })}
                  className={`flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xs font-bold transition-all ${
                    content.heroMediaType !== 'video'
                      ? 'bg-brand-gold text-brand-black shadow-sm'
                      : 'text-brand-cream/60 hover:text-brand-ivory'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{isAr ? 'صورة ثابتة' : 'Static Image'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContent({ ...content, heroMediaType: 'video' })}
                  className={`flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xs font-bold transition-all ${
                    content.heroMediaType === 'video'
                      ? 'bg-brand-gold text-brand-black shadow-sm'
                      : 'text-brand-cream/60 hover:text-brand-ivory'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>{isAr ? 'فيديو سينمائي' : 'Cinematic Video'}</span>
                </button>
              </div>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={heroFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={handleHeroFileSelect}
            />
            <input
              ref={heroVideoFileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/mov,video/x-m4v"
              className="hidden"
              onChange={handleHeroVideoFileSelect}
            />

            {/* OPTION 1: IMAGE BACKGROUND */}
            {content.heroMediaType !== 'video' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 lg:col-span-4">
                  <div className="relative aspect-video rounded-sm overflow-hidden border-2 border-brand-gold/40 bg-brand-black group shadow-lg">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${content.heroBgImage}')` }}
                    />
                    <div className="absolute inset-0 bg-brand-black/20 group-hover:bg-brand-black/5 transition-colors" />
                    {uploadingHero && (
                      <div className="absolute inset-0 bg-brand-black/80 flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-brand-gold" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 bg-brand-black/90 text-brand-gold rounded-xs border border-brand-gold/30">
                      {isAr ? 'صورة الواجهة الحالية' : 'Current Photo'}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 lg:col-span-8 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-brand-ivory">
                      {isAr ? 'تغيير صورة البانر الرئيسية' : 'Change Main Hero Photo'}
                    </h3>
                    <p className="text-xs text-brand-cream/60 leading-relaxed">
                      {isAr
                        ? 'ارفع أي صورة تريدها من جهازك أو استوديو هاتفك (PNG, JPG, WebP) لعرضها فوراً في خلفية المتجر.'
                        : 'Upload any high-res picture from your device studio or gallery.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => heroFileInputRef.current?.click()}
                      disabled={uploadingHero}
                      className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 bg-brand-gold text-brand-black text-xs font-mono font-bold tracking-wider hover:bg-brand-gold-hover transition-colors rounded-sm shadow-gold disabled:opacity-50"
                    >
                      {uploadingHero ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>
                        {uploadingHero
                          ? (isAr ? 'جاري رفع الصورة...' : 'Uploading Image...')
                          : (isAr ? 'ارفع صورة من جهازك / الاستوديو' : 'Upload Photo From Device')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={resetHeroImage}
                      className="flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-3 bg-brand-black hover:bg-rose-950/40 border border-brand-border/80 hover:border-rose-500/60 text-brand-cream/70 hover:text-rose-300 text-xs font-mono transition-colors rounded-sm"
                      title={isAr ? 'استعادة الصورة الافتراضية' : 'Reset to default photo'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'استعادة الافتراضية' : 'Reset'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* OPTION 2: VIDEO BACKGROUND */}
            {content.heroMediaType === 'video' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 lg:col-span-4">
                  <div className="relative aspect-video rounded-sm overflow-hidden border-2 border-brand-gold/60 bg-brand-black shadow-lg">
                    {content.heroBgVideo ? (
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        src={content.heroBgVideo}
                        poster={content.heroBgImage}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-brand-cream/40 space-y-2">
                        <Video className="w-8 h-8 text-brand-gold/60 animate-pulse" />
                        <span className="text-[11px] font-mono">
                          {isAr ? 'لم يتم تعيين فيديو بعد' : 'No video selected yet'}
                        </span>
                      </div>
                    )}
                    {uploadingHeroVideo && (
                      <div className="absolute inset-0 bg-brand-black/85 flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-brand-gold" />
                        <span className="text-[11px] font-mono text-brand-gold">
                          {isAr ? 'جاري رفع الفيديو إلى السيرفر...' : 'Uploading video to server...'}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 bg-brand-black/90 text-brand-gold rounded-xs border border-brand-gold/30">
                      {isAr ? 'معاينة الفيديو' : 'Video Preview'}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 lg:col-span-8 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-brand-ivory flex items-center space-x-2 rtl:space-x-reverse">
                      <Film className="w-4 h-4 text-brand-gold" />
                      <span>{isAr ? 'تغيير فيديو البانر الرئيسي' : 'Change Hero Video Background'}</span>
                    </h3>
                    <p className="text-xs text-brand-cream/60 leading-relaxed">
                      {isAr
                        ? 'ارفع مقطع فيديو من جهازك (MP4, WebM, MOV) ليعمل في خلفية المتجر تلقائياً في حلقة مستمرة بدون صوت وبمظهر سينمائي راقٍ.'
                        : 'Upload an atmospheric short video loop for a dynamic luxury streetwear storefront experience.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => heroVideoFileInputRef.current?.click()}
                      disabled={uploadingHeroVideo}
                      className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 bg-brand-gold text-brand-black text-xs font-mono font-bold tracking-wider hover:bg-brand-gold-hover transition-colors rounded-sm shadow-gold disabled:opacity-50"
                    >
                      {uploadingHeroVideo ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>
                        {uploadingHeroVideo
                          ? (isAr ? 'جاري رفع الفيديو...' : 'Uploading Video...')
                          : (isAr ? 'ارفع فيديو من جهازك / الاستوديو' : 'Upload Video From Device')}
                      </span>
                    </button>

                    {content.heroBgVideo && (
                      <button
                        type="button"
                        onClick={() => setContent({ ...content, heroBgVideo: '', heroMediaType: 'image' })}
                        className="flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-3 bg-brand-black hover:bg-rose-950/40 border border-brand-border/80 hover:border-rose-500/60 text-brand-cream/70 hover:text-rose-300 text-xs font-mono transition-colors rounded-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'حذف الفيديو والرجوع للصورة' : 'Remove Video'}</span>
                      </button>
                    )}
                  </div>

                  {/* Optional Direct Video URL Input */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-mono text-brand-cream/70 mb-1">
                      {isAr ? 'أو اكتب / الصق رابط فيديو مباشر (MP4 URL):' : 'Or enter a direct video URL:'}
                    </label>
                    <input
                      type="url"
                      value={content.heroBgVideo || ''}
                      onChange={(e) => setContent({ ...content, heroBgVideo: e.target.value, heroMediaType: 'video' })}
                      placeholder="https://example.com/streetwear-video.mp4"
                      className="w-full bg-brand-black border border-brand-border px-3 py-2 text-xs font-mono text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields: Announcement & Hero Texts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Announcement Bar */}
            <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-4 md:col-span-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-bold text-brand-ivory">
                <Flame className="w-4 h-4 text-brand-gold" />
                <span>{isAr ? 'نص الشريط الإعلاني العلوي' : 'Top Announcement Bar'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                    {isAr ? 'النص بالعربية' : 'Arabic Text'}
                  </label>
                  <input
                    type="text"
                    value={content.announcementTextAr}
                    onChange={(e) => setContent({ ...content, announcementTextAr: e.target.value })}
                    className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                    {isAr ? 'النص بالإنجليزية' : 'English Text'}
                  </label>
                  <input
                    type="text"
                    value={content.announcementTextEn}
                    onChange={(e) => setContent({ ...content, announcementTextEn: e.target.value })}
                    className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Hero Main Headline */}
            <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-4 md:col-span-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-bold text-brand-ivory">
                <Type className="w-4 h-4 text-brand-gold" />
                <span>{isAr ? 'العنوان الرئيسي للبانر (Headline)' : 'Hero Main Headline'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                    {isAr ? 'العنوان بالعربية (الافتراضي: معيار جديد لأزياء الستريتوير الشبابية)' : 'Arabic Headline'}
                  </label>
                  <textarea
                    rows={2}
                    value={content.heroTitleAr}
                    onChange={(e) => setContent({ ...content, heroTitleAr: e.target.value })}
                    className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                    {isAr ? 'العنوان بالإنجليزية' : 'English Headline'}
                  </label>
                  <textarea
                    rows={2}
                    value={content.heroTitleEn}
                    onChange={(e) => setContent({ ...content, heroTitleEn: e.target.value })}
                    className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Hero Subtitle / Description */}
            <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-4 md:col-span-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-bold text-brand-ivory">
                <Layout className="w-4 h-4 text-brand-gold" />
                <span>{isAr ? 'النص التعريفي للبانر (Subtitle)' : 'Hero Subtitle / Description'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                    {isAr ? 'الوصف بالعربية' : 'Arabic Subtitle'}
                  </label>
                  <textarea
                    rows={3}
                    value={content.heroSubtitleAr}
                    onChange={(e) => setContent({ ...content, heroSubtitleAr: e.target.value })}
                    className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                    {isAr ? 'الوصف بالإنجليزية' : 'English Subtitle'}
                  </label>
                  <textarea
                    rows={3}
                    value={content.heroSubtitleEn}
                    onChange={(e) => setContent({ ...content, heroSubtitleEn: e.target.value })}
                    className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Hero Badge & CTA Buttons */}
            <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-4">
              <div className="text-sm font-bold text-brand-ivory">
                {isAr ? 'شارة الإطلاق العلوية (Badge)' : 'Launch Drop Badge'}
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'نص الشارة بالعربية' : 'Arabic Badge'}
                </label>
                <input
                  type="text"
                  value={content.heroBadgeAr}
                  onChange={(e) => setContent({ ...content, heroBadgeAr: e.target.value })}
                  className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'نص الشارة بالإنجليزية' : 'English Badge'}
                </label>
                <input
                  type="text"
                  value={content.heroBadgeEn}
                  onChange={(e) => setContent({ ...content, heroBadgeEn: e.target.value })}
                  className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none font-sans"
                />
              </div>
            </div>

            {/* Buttons Labels */}
            <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-4">
              <div className="text-sm font-bold text-brand-ivory">
                {isAr ? 'نصوص أزرار البانر (Buttons)' : 'Action Buttons'}
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'الزر الأول (تسوق التشكيلة - عربي)' : 'Primary CTA (Arabic)'}
                </label>
                <input
                  type="text"
                  value={content.heroCtaPrimaryAr}
                  onChange={(e) => setContent({ ...content, heroCtaPrimaryAr: e.target.value })}
                  className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'الزر الثاني (استكشف السويت شيرتات - عربي)' : 'Secondary CTA (Arabic)'}
                </label>
                <input
                  type="text"
                  value={content.heroCtaSecondaryAr}
                  onChange={(e) => setContent({ ...content, heroCtaSecondaryAr: e.target.value })}
                  className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right font-sans"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY CARDS */}
      {activeTab === 'categories' && (
        <div className="space-y-8 animate-fade-in">
          {/* Section Headings */}
          <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-4">
            <div className="text-sm font-bold text-brand-ivory">
              {isAr ? 'عناوين قسم التشكيلات والفئات (Section Headers)' : 'Category Showcase Section Headers'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'العنوان الرئيسي بالعربية (الافتراضي: خزانة الستريتوير الشبابية الفاخرة)' : 'Arabic Title'}
                </label>
                <input
                  type="text"
                  value={content.categoriesTitleAr}
                  onChange={(e) => setContent({ ...content, categoriesTitleAr: e.target.value })}
                  className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'العنوان الرئيسي بالإنجليزية' : 'English Title'}
                </label>
                <input
                  type="text"
                  value={content.categoriesTitleEn}
                  onChange={(e) => setContent({ ...content, categoriesTitleEn: e.target.value })}
                  className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'الوصف التوضيحي بالعربية' : 'Arabic Subtitle / Description'}
                </label>
                <textarea
                  rows={2}
                  value={content.categoriesDescriptionAr}
                  onChange={(e) => setContent({ ...content, categoriesDescriptionAr: e.target.value })}
                  className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'الوصف التوضيحي بالإنجليزية' : 'English Subtitle / Description'}
                </label>
                <textarea
                  rows={2}
                  value={content.categoriesDescriptionEn}
                  onChange={(e) => setContent({ ...content, categoriesDescriptionEn: e.target.value })}
                  className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none font-sans"
                />
              </div>
            </div>
          </div>

          {/* The 4 Category Cards List with Direct File Upload */}
          <div className="space-y-6">
            <div className="text-xs font-mono uppercase text-brand-cream/70 tracking-wider">
              {isAr ? 'البطاقات الأربعة المعروضة في الصفحة الرئيسية:' : 'Configured Category Cards:'}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {content.categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-4 flex flex-col justify-between"
                >
                  {/* Hidden Input for this category card */}
                  <input
                    ref={(el) => {
                      categoryFileInputRefs.current[idx] = el;
                    }}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={(e) => handleCategoryFileSelect(e, idx)}
                    className="hidden"
                  />

                  <div className="space-y-4">
                    {/* Card Header & Preview Image */}
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="w-24 h-32 flex-shrink-0 rounded-sm overflow-hidden border border-brand-border bg-brand-black relative">
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url('${cat.image}')` }}
                        />
                        {uploadingCategoryIdx === idx && (
                          <div className="absolute inset-0 bg-brand-black/80 flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 animate-spin text-brand-gold" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-brand-stone/60 text-brand-gold border border-brand-border rounded-xs">
                            Card #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-brand-ivory">
                            {isAr ? cat.titleAr : cat.titleEn}
                          </span>
                        </div>

                        {/* Direct Upload Button for this Card */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => categoryFileInputRefs.current[idx]?.click()}
                            disabled={uploadingCategoryIdx === idx}
                            className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 bg-brand-gold text-brand-black text-xs font-mono font-bold hover:bg-brand-gold-hover transition-colors rounded-xs shadow-gold disabled:opacity-50"
                          >
                            {uploadingCategoryIdx === idx ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {uploadingCategoryIdx === idx
                                ? (isAr ? 'جاري الرفع...' : 'Uploading...')
                                : (isAr ? 'ارفع صورة من جهازك' : 'Upload photo')}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => resetCategoryImage(idx)}
                            className="p-1.5 text-brand-cream/50 hover:text-rose-400 border border-brand-border rounded-xs transition-colors"
                            title={isAr ? 'استعادة الصورة الافتراضية' : 'Reset image'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Titles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-brand-cream/70 mb-1">
                          {isAr ? 'العنوان (عربي)' : 'Title (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={cat.titleAr}
                          onChange={(e) => updateCategory(idx, { titleAr: e.target.value })}
                          className="w-full bg-brand-black border border-brand-border px-2.5 py-1.5 text-xs text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-brand-cream/70 mb-1">
                          {isAr ? 'العنوان (إنجليزي)' : 'Title (English)'}
                        </label>
                        <input
                          type="text"
                          value={cat.titleEn}
                          onChange={(e) => updateCategory(idx, { titleEn: e.target.value })}
                          className="w-full bg-brand-black border border-brand-border px-2.5 py-1.5 text-xs text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none font-sans"
                        />
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-brand-cream/70 mb-1">
                          {isAr ? 'الوصف (عربي)' : 'Description (Arabic)'}
                        </label>
                        <textarea
                          rows={2}
                          value={cat.descAr}
                          onChange={(e) => updateCategory(idx, { descAr: e.target.value })}
                          className="w-full bg-brand-black border border-brand-border px-2.5 py-1.5 text-xs text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-brand-cream/70 mb-1">
                          {isAr ? 'الوصف (إنجليزي)' : 'Description (English)'}
                        </label>
                        <textarea
                          rows={2}
                          value={cat.descEn}
                          onChange={(e) => updateCategory(idx, { descEn: e.target.value })}
                          className="w-full bg-brand-black border border-brand-border px-2.5 py-1.5 text-xs text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none font-sans"
                        />
                      </div>
                    </div>

                    {/* Tag / Badge */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-brand-cream/70 mb-1">
                          {isAr ? 'الشارة العلوية (عربي)' : 'Tag Badge (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={cat.tagAr}
                          onChange={(e) => updateCategory(idx, { tagAr: e.target.value })}
                          className="w-full bg-brand-black border border-brand-border px-2.5 py-1.5 text-xs text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-brand-cream/70 mb-1">
                          {isAr ? 'الشارة العلوية (إنجليزي)' : 'Tag Badge (English)'}
                        </label>
                        <input
                          type="text"
                          value={cat.tagEn}
                          onChange={(e) => updateCategory(idx, { tagEn: e.target.value })}
                          className="w-full bg-brand-black border border-brand-border px-2.5 py-1.5 text-xs text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none font-sans"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Footer */}
      <div className="pt-6 border-t border-brand-border/60 flex items-center justify-between">
        <span className="text-xs font-mono text-brand-cream/50">
          {isAr
            ? 'أي صورة ترفعها أو نص تعدله يتم حفظه وتطبيقه فوراً على واجهة المتجر.'
            : 'Any photo uploaded or text edited will immediately update the live customer storefront.'}
        </span>

        <button
          onClick={() => handleSave()}
          disabled={saving || uploadingHero || uploadingHeroVideo || uploadingCategoryIdx !== null}
          className="flex items-center space-x-2 rtl:space-x-reverse px-7 py-3 bg-brand-gold text-brand-black text-xs font-mono font-bold tracking-wider hover:bg-brand-gold-hover transition-all duration-200 shadow-gold rounded-sm disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ ونشر التعديلات' : 'Save & Publish')}</span>
        </button>
      </div>
    </div>
  );
}
