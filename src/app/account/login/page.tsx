'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, User, Lock, Mail, Phone, ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const { login, register, isAuthenticated } = useCustomerAuth();
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (activeTab === 'login') {
        const res = await login(email, password);
        if (res.success) {
          router.push(redirectUrl);
        } else {
          setErrorMsg(res.error || (isAr ? 'البريد أو كلمة المرور غير صحيحة' : 'Invalid email or password'));
        }
      } else {
        const res = await register({ email, pass: password, fullName, phone });
        if (res.success) {
          router.push(redirectUrl);
        } else {
          setErrorMsg(res.error || (isAr ? 'فشل إنشاء الحساب' : 'Failed to register'));
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-gold selection:text-brand-black">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <span className="font-sans font-black text-3xl tracking-[0.25em] text-brand-ivory uppercase group-hover:text-brand-gold transition-colors">
              ATHEER
            </span>
            <span className="text-brand-gold text-2xl font-light mx-2">/</span>
            <span className="font-arabic font-bold text-3xl text-brand-gold">أثير</span>
          </Link>
          <p className="text-xs uppercase tracking-widest text-brand-cream/60 font-mono mt-2">
            {isAr ? 'بوابة حساب العميل وبرنامج المكافآت' : 'Customer Account & Rewards Portal'}
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-xs shadow-luxury-dark p-6 sm:p-8">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 border-b border-brand-border/60 mb-6 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
              }}
              className={`py-3 text-center font-bold border-b-2 transition-colors ${
                activeTab === 'login'
                  ? 'border-brand-gold text-brand-gold bg-brand-stone/30'
                  : 'border-transparent text-brand-cream/60 hover:text-brand-ivory'
              }`}
            >
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
              }}
              className={`py-3 text-center font-bold border-b-2 transition-colors ${
                activeTab === 'register'
                  ? 'border-brand-gold text-brand-gold bg-brand-stone/30'
                  : 'border-transparent text-brand-cream/60 hover:text-brand-ivory'
              }`}
            >
              {isAr ? 'حساب جديد' : 'New Account'}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 bg-rose-950/40 border border-rose-500/50 text-rose-400 text-xs font-mono rounded-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-mono text-brand-cream/80 mb-1">
                    {isAr ? 'الاسم بالكامل' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isAr ? 'مثال: كريم أحمد' : 'e.g. Karim Ahmed'}
                      className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-9 py-2.5 rounded-xs focus:outline-none focus:border-brand-gold font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-brand-cream/80 mb-1">
                    {isAr ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010xxxxxxxx"
                      className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-9 py-2.5 rounded-xs focus:outline-none focus:border-brand-gold font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-mono text-brand-cream/80 mb-1">
                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@example.com"
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-9 py-2.5 rounded-xs focus:outline-none focus:border-brand-gold font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-brand-cream/80 mb-1">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-9 py-2.5 rounded-xs focus:outline-none focus:border-brand-gold font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-gold hover:bg-brand-gold-hover text-brand-black font-sans text-xs uppercase tracking-wider font-bold rounded-xs transition-all duration-200 shadow-gold flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 mt-6"
            >
              <span>{loading ? (isAr ? 'جاري المعالجة...' : 'Processing...') : activeTab === 'login' ? (isAr ? 'دخول الحساب' : 'Sign In') : (isAr ? 'تأكيد التسجيل' : 'Create Account')}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Perks Preview */}
          <div className="mt-8 pt-6 border-t border-brand-border/60 space-y-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-brand-cream/80">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>{isAr ? 'أختام رقمية تلقائية مع كل طلب (ATHEER REWARDS)' : 'Earn digital stamps automatically on every order'}</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-brand-cream/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{isAr ? 'تتبع فوري لمراحل الشحن ومعاينة القطع مع المندوب' : 'Live tracking & open-box inspection guarantee'}</span>
            </div>
          </div>
        </div>

        {/* Guest Return Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-brand-cream/50 hover:text-brand-gold font-mono transition-colors">
            ← {isAr ? 'العودة لواجهة المتجر الرئيسية' : 'Return to Storefront'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-brand-black" />}>
      <CustomerLoginForm />
    </React.Suspense>
  );
}
