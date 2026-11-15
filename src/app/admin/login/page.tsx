'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Database,
  CheckCircle2,
  Globe,
  Clock,
} from 'lucide-react';
import { syncAdminToken } from '@/lib/adminAuthClient';

export default function AdminLoginPage() {
  const router = useRouter();
  const { language, setLanguage, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [email, setEmail] = useState('atheerxo140@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reason') === 'expired') {
        setIsSessionExpired(true);
      }
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasKeys = Boolean(
      url &&
      publishableKey &&
      !url.includes('your-project-id') &&
      !url.includes('<') &&
      !publishableKey.includes('...') &&
      !publishableKey.includes('<')
    );
    setSupabaseConfigured(hasKeys);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        syncAdminToken(data.token);
        router.push('/admin');
        return;
      } else {
        setErrorMsg(data.error || (isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'));
        setLoading(false);
        return;
      }
    } catch (err: any) {
      setErrorMsg(isAr ? 'تعذر الاتصال بخدمة التحقق' : 'Unable to connect to login service');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col justify-between p-4 sm:p-12 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-charcoal/80 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between z-10">
        <Link
          href="/"
          className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-cream/60 hover:text-brand-gold transition-colors"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة لمتجر أثير' : 'Return to Customer Storefront'}</span>
        </Link>

        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-mono text-brand-gold hover:text-brand-gold-light border border-brand-border/60 px-3 py-1.5 rounded-xs"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-6 sm:py-0">
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-5 sm:p-8 shadow-2xl space-y-6">
          {/* Brand Mark */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center p-3 bg-brand-stone/40 border border-brand-gold/30 rounded-xs mb-2">
              <ShieldCheck className="w-7 h-7 text-brand-gold" />
            </div>
            <h1 className="font-sans font-black text-2xl tracking-[0.25em] text-brand-ivory">ATHEER</h1>
            <p className="font-arabic font-bold text-lg text-brand-gold">أثير · إدارة المتجر</p>
            <p className="text-[11px] font-mono text-brand-cream/50 uppercase tracking-widest mt-1">
              Authorized Personnel Portal
            </p>
          </div>

          {/* Transparent Supabase Status Notification */}
          <div
            className={`p-3.5 rounded-xs border text-[11px] font-mono leading-relaxed ${
              supabaseConfigured
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-brand-stone/30 border-brand-gold/30 text-brand-cream/80'
            }`}
          >
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse font-bold text-brand-gold mb-1">
              <Database className="w-3.5 h-3.5 text-brand-gold" />
              <span>
                {supabaseConfigured
                  ? 'Supabase Cloud Authentication Active'
                  : 'Local Development Environment Active'}
              </span>
            </div>
            <p className="text-[10px] text-brand-cream/60">
              {supabaseConfigured
                ? isAr
                  ? 'تم ربط مفاتيح Supabase السحابية بنجاح. التحقق من الصلاحيات يتم عبر خادم قاعدة البيانات.'
                  : 'Connected to Supabase Auth cloud instance.'
                : isAr
                  ? 'المتجر يعمل حالياً بذاكرة التخزين المحلية المؤكدة. يمكنك تسجيل الدخول مباشرة بدون إدخال مفاتيح سحابية.'
                  : 'Running in high-fidelity local admin mode. You can sign in directly to manage all modules.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
            {isSessionExpired && !errorMsg && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/50 text-amber-300 rounded-xs flex items-center space-x-2 rtl:space-x-reverse leading-relaxed text-[11px]">
                <Clock className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>
                  {isAr
                    ? 'انتهت صلاحية جلسة الأمان السابقة تلقائياً لحماية المتجر. يرجى تسجيل الدخول مجدداً للمتابعة.'
                    : 'Your previous security session has expired. Please sign in again to continue.'}
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-xs flex items-center space-x-2 rtl:space-x-reverse">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-brand-cream/80 mb-1">
                {isAr ? 'البريد الإلكتروني للإدارة' : 'Admin Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 px-9 py-2.5 text-brand-ivory text-base sm:text-xs rounded-xs focus:border-brand-gold focus:outline-none font-mono"
                  placeholder="admin@atheer.store"
                />
              </div>
            </div>

            <div>
              <label className="block text-brand-cream/80 mb-1">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 px-9 py-2.5 text-brand-ivory text-base sm:text-xs rounded-xs focus:border-brand-gold focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-gold text-brand-black font-bold uppercase tracking-widest text-xs hover:bg-brand-gold-light transition-all rounded-xs shadow-gold mt-2 flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <span>{loading ? (isAr ? 'جاري التحقق...' : 'Authenticating...') : (isAr ? 'دخول لوحة التحكم' : 'Enter Admin Hub')}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="text-center pt-2 border-t border-brand-border/40 text-[10px] font-mono text-brand-cream/40">
            ATHEER Streetwear Operating System v2.5 · Cairo, EG
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] font-mono text-brand-cream/40 z-10">
        © 2026 ATHEER STORE | أثير. All Rights Reserved. Restricted to Authorized Administrators.
      </div>
    </div>
  );
}
