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
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { language, setLanguage, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [email, setEmail] = useState('admin@atheer.store');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  useEffect(() => {
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

    const isProd = process.env.NODE_ENV === 'production';

    // In production, NEVER allow simulated login without Supabase credentials!
    if (isProd && !supabaseConfigured) {
      setErrorMsg(
        isAr
          ? 'تنبيه أمني: لا يمكن تفعيل لوحة الإدارة في بيئة الإنتاج دون ربط مفاتيح Supabase Auth وقاعدة البيانات السحابية. تم حظر التجاوز التجريبي تماماً.'
          : 'CRITICAL SECURITY: Production mode requires real Supabase Auth credentials. Development bypass is strictly disabled.'
      );
      setLoading(false);
      return;
    }

    // If Supabase keys exist, attempt Supabase authentication
    if (supabaseConfigured) {
      try {
        const { getSupabaseClient } = await import('@/lib/supabaseClient');
        const supabase = getSupabaseClient();
        if (!supabase) {
          setErrorMsg(isAr ? 'تعذر تهيئة اتصال Supabase' : 'Unable to initialize Supabase client.');
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.session) {
          setErrorMsg(error?.message || 'Authentication failed');
          setLoading(false);
          return;
        }

        const token = data.session.access_token;
        document.cookie = `atheer_admin_token=${token}; path=/; max-age=86400; SameSite=Lax`;
        localStorage.setItem('atheer_admin_token', token);

        router.push('/admin');
      } catch (err: any) {
        setErrorMsg(err.message || 'Authentication failed');
        setLoading(false);
      }
    } else {
      // Controlled Development Session Token (allowed strictly in non-production)
      const devToken = 'dev-admin-session-atheer';
      document.cookie = `atheer_admin_token=${devToken}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem('atheer_admin_token', devToken);
      setTimeout(() => {
        router.push('/admin');
      }, 400);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col justify-between p-6 sm:p-12 font-sans relative overflow-hidden">
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
      <div className="w-full max-w-md mx-auto my-auto z-10">
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-8 shadow-2xl space-y-6">
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
                  className="w-full bg-brand-stone/40 border border-brand-border/80 px-9 py-2.5 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
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
                  className="w-full bg-brand-stone/40 border border-brand-border/80 px-9 py-2.5 text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
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
