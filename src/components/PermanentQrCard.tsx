'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useLanguage } from '@/context/LanguageContext';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Globe,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Printer,
  Smartphone,
  Share2,
} from 'lucide-react';

interface PermanentQrCardProps {
  initialUrl?: string;
  isVisible?: boolean;
  onToggleVisibility?: (visible: boolean) => void;
  onSaveUrl?: (url: string) => void;
  isAdminMode?: boolean;
}

export const PermanentQrCard: React.FC<PermanentQrCardProps> = ({
  initialUrl = 'https://atheer.store',
  isVisible = true,
  onToggleVisibility,
  onSaveUrl,
  isAdminMode = true,
}) => {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [qrUrl, setQrUrl] = useState<string>(initialUrl);
  const [styleMode, setStyleMode] = useState<'luxury' | 'print'>('luxury');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLiveEnabled, setIsLiveEnabled] = useState(isVisible);
  const [savingUrl, setSavingUrl] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setIsLiveEnabled(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (initialUrl && initialUrl !== qrUrl) {
      setQrUrl(initialUrl);
    }
  }, [initialUrl]);

  // Generate QR code whenever URL or style changes
  useEffect(() => {
    const generate = async () => {
      try {
        const target = qrUrl.trim() || 'https://atheer.store';
        const darkColor = styleMode === 'luxury' ? '#C5A880' : '#000000';
        const lightColor = styleMode === 'luxury' ? '#0A0A0A' : '#FFFFFF';

        // 1. Vector SVG (pure resolution-independent)
        const svgString = await QRCode.toString(target, {
          type: 'svg',
          errorCorrectionLevel: 'H',
          margin: 2,
          color: {
            dark: darkColor,
            light: lightColor,
          },
        });
        setQrSvg(svgString);

        // 2. High-res Data URL (PNG for display)
        const dataUrl = await QRCode.toDataURL(target, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 600,
          color: {
            dark: darkColor,
            light: lightColor,
          },
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    generate();
  }, [qrUrl, styleMode]);

  // Copy URL to clipboard
  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(qrUrl.trim() || 'https://atheer.store');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Toggle Visibility
  const handleToggle = () => {
    const nextState = !isLiveEnabled;
    setIsLiveEnabled(nextState);
    if (onToggleVisibility) {
      onToggleVisibility(nextState);
    }
  };

  // Download Vector SVG
  const handleDownloadSvg = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atheer-store-qr-${styleMode}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download High-Resolution 300 DPI PNG Poster for Apparel Hang Tags & Packaging
  const handleDownloadHighResPng = async () => {
    try {
      const target = qrUrl.trim() || 'https://atheer.store';
      const canvas = document.createElement('canvas');
      const size = 1600; // 1600x2000px high-res poster
      const height = 2000;
      canvas.width = size;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const isLux = styleMode === 'luxury';
      const bgColor = isLux ? '#0A0A0A' : '#FFFFFF';
      const textColor = isLux ? '#FBF9F5' : '#0A0A0A';
      const goldColor = '#C5A880';
      const borderColor = isLux ? '#2C2C2E' : '#E5E5E5';

      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, height);

      // Gold Framing
      ctx.lineWidth = 14;
      ctx.strokeStyle = goldColor;
      ctx.strokeRect(50, 50, size - 100, height - 100);

      // Header Brand
      ctx.fillStyle = textColor;
      ctx.font = 'bold 72px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ATHEER  /  أثير', size / 2, 190);

      ctx.fillStyle = goldColor;
      ctx.font = '600 32px sans-serif';
      ctx.fillText('PREMIUM YOUTH STREETWEAR · 500 GSM HOODIES', size / 2, 255);

      // Generate QR matrix directly on canvas
      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, target, {
        width: 1000,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: isLux ? '#C5A880' : '#000000',
          light: bgColor,
        },
      });

      // Draw QR in center
      const qrY = 340;
      ctx.drawImage(qrCanvas, (size - 1000) / 2, qrY, 1000, 1000);

      // Center Brand Monogram Box
      const centerBoxSize = 140;
      const centerX = size / 2 - centerBoxSize / 2;
      const centerY = qrY + 500 - centerBoxSize / 2;
      ctx.fillStyle = bgColor;
      ctx.fillRect(centerX - 10, centerY - 10, centerBoxSize + 20, centerBoxSize + 20);
      ctx.lineWidth = 6;
      ctx.strokeStyle = goldColor;
      ctx.strokeRect(centerX - 10, centerY - 10, centerBoxSize + 20, centerBoxSize + 20);

      ctx.fillStyle = goldColor;
      ctx.font = 'bold 64px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('أ', size / 2, qrY + 500);

      // Footer Instructions
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('SCAN TO EXPLORE THE OFFICIAL ATELIER', size / 2, 1480);

      ctx.fillStyle = goldColor;
      ctx.font = '36px sans-serif';
      ctx.fillText('امسح الرمز لزيارة المتجر ومشاركة الكتالوج', size / 2, 1545);

      ctx.fillStyle = isLux ? '#9CA3AF' : '#6B7280';
      ctx.font = '28px monospace';
      ctx.fillText(target, size / 2, 1630);

      ctx.font = '24px sans-serif';
      ctx.fillText('EXPRESS CASH ON DELIVERY ACROSS ALL EGYPT GOVERNORATES', size / 2, 1720);

      // Trigger download
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `atheer-official-qr-poster-300dpi.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate high-res QR PNG:', err);
    }
  };

  return (
    <div className="bg-brand-charcoal/95 border border-brand-gold/40 p-5 sm:p-7 rounded-xs shadow-2xl relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-brand-border/60 gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-full bg-brand-gold/15 border border-brand-gold/50 flex items-center justify-center text-brand-gold shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <h3 className="font-bold text-base sm:text-lg text-brand-ivory font-serif">
                {isAr ? 'رمز الاستجابة السريع الدائم (QR Code مدى الحياة)' : 'Permanent Store QR Code'}
              </h3>
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                {isAr ? 'دائم 100% · لا ينتهي أبداً' : 'Permanent · Never Expires'}
              </span>
            </div>
            <p className="text-xs text-brand-cream/70 font-sans mt-0.5">
              {isAr
                ? 'رمز مباشر غير خاضع لأي وسيط أو اشتراك شهري؛ يفتح متجرك العام تلقائياً ويتحدث فوراً مع كل إضافة بالمتجر.'
                : 'Direct ISO QR code with no intermediary subscriptions. Always opens your live storefront.'}
            </p>
          </div>
        </div>

        {/* Visibility Toggle for Storefront */}
        {isAdminMode && (
          <div className="flex items-center space-x-3 rtl:space-x-reverse bg-brand-black/80 border border-brand-border/80 px-4 py-2 rounded-xs self-stretch sm:self-auto justify-between">
            <div className="text-right rtl:text-left">
              <span className="block text-[11px] font-mono text-brand-ivory font-semibold">
                {isAr ? 'الظهور في الموقع للعملاء' : 'Show on Storefront'}
              </span>
              <span className="text-[10px] text-brand-muted">
                {isLiveEnabled
                  ? isAr ? 'ظاهر للعملاء في أسفل الموقع' : 'Visible in storefront footer'
                  : isAr ? 'مخفي حالياً عن الزوار' : 'Hidden from storefront'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isLiveEnabled ? 'bg-brand-gold' : 'bg-brand-charcoal border border-brand-border'
              }`}
              title={isAr ? 'تبديل الظهور' : 'Toggle Visibility'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-brand-black transition-transform ${
                  isLiveEnabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Main Body: QR Preview & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Left Column: QR Code Visual Stage */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div
            className={`p-4 rounded-xs border transition-all duration-300 shadow-2xl relative group ${
              styleMode === 'luxury'
                ? 'bg-brand-black border-brand-gold/60 shadow-gold'
                : 'bg-white border-brand-gold/80'
            }`}
          >
            {/* Live QR Image */}
            {qrDataUrl ? (
              <div className="relative">
                <img
                  src={qrDataUrl}
                  alt="ATHEER Permanent Store QR Code"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xs"
                />
                {/* Center ATHEER Brand Emblem */}
                <div
                  className={`absolute inset-0 m-auto w-12 h-12 rounded-xs flex items-center justify-center border font-bold text-lg select-none shadow-xl ${
                    styleMode === 'luxury'
                      ? 'bg-brand-black border-brand-gold text-brand-gold'
                      : 'bg-white border-black text-black'
                  }`}
                >
                  أ
                </div>
              </div>
            ) : (
              <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-brand-muted">
                <QrCode className="w-12 h-12 animate-pulse" />
              </div>
            )}

            {/* Scan Prompt Overlay on Hover */}
            <div className="mt-3 pt-2.5 border-t border-brand-border/40 text-center">
              <span
                className={`text-[10px] font-mono uppercase tracking-widest font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse ${
                  styleMode === 'luxury' ? 'text-brand-gold' : 'text-neutral-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isAr ? 'وجّه كاميرا هاتفك للمعاينة المباشرة' : 'Scan with mobile camera'}</span>
              </span>
            </div>
          </div>

          {/* Style Selector Tabs */}
          <div className="mt-4 flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono">
            <button
              type="button"
              onClick={() => setStyleMode('luxury')}
              className={`px-3 py-1 rounded-xs transition-colors border ${
                styleMode === 'luxury'
                  ? 'bg-brand-gold text-brand-black border-brand-gold font-bold'
                  : 'bg-brand-black text-brand-cream/70 border-brand-border hover:text-brand-gold'
              }`}
            >
              {isAr ? 'ذهبي وفحم (ستايل الدار)' : 'Luxury Dark'}
            </button>
            <button
              type="button"
              onClick={() => setStyleMode('print')}
              className={`px-3 py-1 rounded-xs transition-colors border ${
                styleMode === 'print'
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-brand-black text-brand-cream/70 border-brand-border hover:text-brand-gold'
              }`}
            >
              <Printer className="w-3 h-3 inline-block mr-1 rtl:ml-1 rtl:mr-0" />
              {isAr ? 'أبيض وأسود (للطباعة والمطابع)' : 'Print Friendly'}
            </button>
          </div>
        </div>

        {/* Right Column: Customization, Features & Downloads */}
        <div className="lg:col-span-7 space-y-5">
          {/* Target URL Configuration */}
          {isAdminMode && (
            <div className="space-y-2">
              <label className="block text-xs font-mono text-brand-gold font-semibold uppercase tracking-wider">
                {isAr ? 'الرابط المشفّر داخل الـ QR (رابط متجرك العام):' : 'Target Storefront URL:'}
              </label>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="relative flex-1">
                  <Globe className="w-4 h-4 text-brand-muted absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    placeholder="https://atheer.store"
                    className="w-full bg-brand-black border border-brand-border focus:border-brand-gold text-brand-ivory text-xs sm:text-sm py-2.5 pl-9 pr-3 rtl:pl-3 rtl:pr-9 rounded-xs font-mono focus:outline-none"
                  />
                </div>
                {onSaveUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setSavingUrl(true);
                      onSaveUrl(qrUrl.trim());
                      setTimeout(() => setSavingUrl(false), 1500);
                    }}
                    className="px-4 py-2.5 bg-brand-gold text-brand-black font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-brand-gold-hover transition-colors font-mono shrink-0"
                  >
                    {savingUrl ? (isAr ? 'تم الحفظ' : 'Saved') : (isAr ? 'حفظ الرابط' : 'Save')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-2.5 bg-brand-black border border-brand-border hover:border-brand-gold text-brand-ivory hover:text-brand-gold rounded-xs transition-colors shrink-0"
                  title={isAr ? 'نسخ الرابط' : 'Copy URL'}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-brand-cream/60">
                {isAr
                  ? '💡 يمكنك تركه على الرابط الحالي أو تغييره لأي دومين خاص تريده لاحقاً وسيعمل الـ QR دائماً وبدون توقف.'
                  : 'Encodes the direct store URL. Changes here update the QR instantly.'}
              </p>
            </div>
          )}

          {/* Guarantee Highlights (Why it never expires) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-brand-black/70 border border-brand-border/60 rounded-xs space-y-1">
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-brand-gold text-xs font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>{isAr ? 'بدون اشتراكات أو وسطاء' : 'Zero Middlemen Services'}</span>
              </div>
              <p className="text-[11px] text-brand-cream/70 leading-relaxed">
                {isAr
                  ? 'مشفر مباشرة بنظام المصفوفات العالمي المفتوح، مفيش طرف تالت ولا اشتراك ينتهي فيقفل الـ QR.'
                  : 'Encodes direct URL with zero SaaS subscriptions or expiring redirect gates.'}
              </p>
            </div>

            <div className="p-3 bg-brand-black/70 border border-brand-border/60 rounded-xs space-y-1">
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-brand-gold text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحديث تلقائي لمحتوى المتجر' : 'Real-time Live Sync'}</span>
              </div>
              <p className="text-[11px] text-brand-cream/70 leading-relaxed">
                {isAr
                  ? 'أي منتج تضيفه أو سعر تعدله في لوحة التحكم، أي حد يمسح الـ QR بيشوفه فوراً بدون الحاجة لإعادة طباعة.'
                  : 'Scanners always see the live, updated products and prices automatically.'}
              </p>
            </div>
          </div>

          {/* Download Action Buttons */}
          <div className="pt-3 border-t border-brand-border/60 flex flex-wrap gap-3">
            {/* 1. Download High-Res PNG (300 DPI for Hang Tags & Packaging) */}
            <button
              type="button"
              onClick={handleDownloadHighResPng}
              className="flex-1 min-w-[200px] py-3 px-4 bg-brand-gold hover:bg-brand-gold-hover text-brand-black font-bold text-xs uppercase tracking-wider rounded-xs transition-all duration-200 shadow-gold flex items-center justify-center space-x-2 rtl:space-x-reverse font-mono"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تحميل بوستر عالي الدقة (PNG للطباعة)' : 'Download Print Poster (300 DPI)'}</span>
            </button>

            {/* 2. Download Vector SVG for Print Shops */}
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="py-3 px-4 bg-brand-black hover:bg-brand-charcoal text-brand-ivory hover:text-brand-gold border border-brand-border hover:border-brand-gold font-bold text-xs uppercase tracking-wider rounded-xs transition-all duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse font-mono"
            >
              <Layers className="w-4 h-4 text-brand-gold" />
              <span>{isAr ? 'تحميل فيكتور (SVG للمطابع)' : 'Vector (SVG)'}</span>
            </button>

            {/* 3. Open Live Store in New Tab */}
            <a
              href={qrUrl.trim() || '/'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-brand-black hover:bg-brand-charcoal text-brand-cream/70 hover:text-brand-gold border border-brand-border rounded-xs transition-colors flex items-center justify-center"
              title={isAr ? 'فتح المتجر العام' : 'Visit Live Store'}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Use cases banner */}
          <p className="text-[10px] text-brand-muted font-mono tracking-wide">
            {isAr
              ? '🏷️ مثالي للطباعة على: كروت الملابس (Hang Tags)، أكياس الشحن الفاخرة، فواتير الأوردر، وبطاقات الهدايا.'
              : '🏷️ Ideal for: Garment hang tags, luxury courier packaging, unboxing cards, and store stickers.'}
          </p>
        </div>
      </div>
    </div>
  );
};
