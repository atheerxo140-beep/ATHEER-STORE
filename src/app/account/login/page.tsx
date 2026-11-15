'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, User, Lock, Mail, Phone, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Award, Gift } from 'lucide-react';

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get('redirect');

  const { login, register, isAuthenticated } = useCustomerAuth();
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const redirectUrl = explicitRedirect || (activeTab === 'register' ? '/account/loyalty' : '/account');

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(explicitRedirect || '/account');
    }
  }, [isAuthenticated, explicitRedirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setErrorCode(null);

    try {
      if (activeTab === 'login') {
        const res: any = await login(identifier || email, password);
        if (res.success) {
          router.push(redirectUrl);
        } else {
          setErrorMsg(res.error || (isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials'));
          setErrorCode(res.code || null);
        }
      } else {
        if (!phone && !email) {
          setErrorMsg(isAr ? 'يرجى إدخال رقم هاتفك لتفعيل كارت الولاء' : 'Please enter your phone number');
          setLoading(false);
          return;
        }
        const res: any = await register({ email, pass: password || '123456', fullName, phone });
        if (res.success) {
          router.push(redirectUrl);
        } else {
          setErrorMsg(res.error || (isAr ? 'فشل إنشاء الحساب' : 'Failed to register'));
          setErrorCode(res.code || null);
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
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-xs shadow-luxury-dark p-4 sm:p-8">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 border-b border-brand-border/60 mb-6 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
              }}
              className={`py-3 text-center font-bold border-b-2 transition-colors flex items-center justify-center space-x-1.5 rtl:space-x-reverse ${
                activeTab === 'register'
                  ? 'border-brand-gold text-brand-gold bg-brand-stone/30'
                  : 'border-transparent text-brand-cream/60 hover:text-brand-ivory'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isAr ? 'كارت الولاء (تسجيل سريع)' : 'VIP Loyalty Card (Fast Sign Up)'}</span>
            </button>
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
          </div>

          {/* Loyalty VIP Banner */}
          {activeTab === 'register' && (
            <div className="p-3.5 bg-gradient-to-r from-brand-gold/20 via-brand-gold/10 to-transparent border border-brand-gold/60 rounded-xs mb-5 text-xs font-mono text-brand-gold flex items-center space-x-3 rtl:space-x-reverse shadow-sm">
              <div className="w-9 h-9 rounded-full bg-brand-gold/20 border border-brand-gold flex items-center justify-center flex-shrink-0 text-brand-gold">
                <Gift className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="font-bold block text-brand-ivory text-xs mb-0.5">
                  {isAr ? '💳 كارت ولاء دار أثير الرقمي (VIP Pass)' : '💳 ATHEER VIP Digital Loyalty Pass'}
                </span>
                <span className="text-[11px] text-brand-cream/80 font-sans block">
                  {isAr
                    ? 'سجل برقم هاتفك الآن لاستلام كارت الولاء فوراً مع 100 ج.م كاش هدية ترحيبية وأختام لكل طلب!'
                    : 'Register your mobile number to unlock your instant VIP rewards card + 100 EGP welcome bonus!'}
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 mb-4 bg-rose-950/50 border border-rose-500/60 text-rose-300 text-xs font-mono rounded-xs space-y-2.5 animate-fade-in">
              <div className="flex items-start space-x-2 rtl:space-x-reverse">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <p className="leading-relaxed font-sans">{errorMsg}</p>
              </div>

              {/* Direct 1-Click Transition to Login when account already exists */}
              {(errorCode === 'PHONE_EXISTS' || errorCode === 'EMAIL_EXISTS') && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setIdentifier(phone || email);
                    setErrorMsg(null);
                    setErrorCode(null);
                  }}
                  className="w-full py-2 px-3 bg-brand-gold text-brand-black text-xs font-mono font-bold uppercase rounded-xs hover:bg-brand-gold-hover transition-colors flex items-center justify-center space-x-1.5 rtl:space-x-reverse shadow-gold"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>
                    {isAr
                      ? 'هذا الحساب موجود بالفعل — اضغط هنا لتسجيل الدخول مباشرة'
                      : 'Account Already Exists — Click to Sign In Now'}
                  </span>
                </button>
              )}

              {/* Direct 1-Click Transition to Register when account not found */}
              {errorCode === 'NOT_FOUND' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    if (identifier && /^[0-9+ ]+$/.test(identifier)) {
                      setPhone(identifier);
                    } else if (identifier) {
                      setEmail(identifier);
                    }
                    setErrorMsg(null);
                    setErrorCode(null);
                  }}
                  className="w-full py-2 px-3 bg-brand-gold text-brand-black text-xs font-mono font-bold uppercase rounded-xs hover:bg-brand-gold-hover transition-colors flex items-center justify-center space-x-1.5 rtl:space-x-reverse shadow-gold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isAr
                      ? 'إنشاء حساب جديد واستلام كارت الولاء VIP بضغطة زر'
                      : 'Create New Account & Claim VIP Pass Now'}
                  </span>
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' ? (
              <>
                <div>
                  <label className="block text-xs font-mono text-brand-cream/80 mb-1">
                    {isAr ? 'الاسم بالكامل' : 'Full Name'} <span className="text-brand-gold">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isAr ? 'مثال: أحمد محمود' : 'e.g. Ahmed Mahmoud'}
                      className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-9 py-2.5 rounded-xs focus:outline-none focus:border-brand-gold font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-brand-cream/80 mb-1">
                    {isAr ? 'رقم الهاتف المحمول (لتفعيل كارت الولاء)' : 'Mobile Phone (for Loyalty Pass)'} <span className="text-brand-gold">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-gold" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010xxxxxxxx"
                      className="w-full bg-brand-stone/40 border border-brand-gold/60 text-brand-gold text-xs px-9 py-2.5 rounded-xs focus:outline-none focus:border-brand-gold font-mono font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-brand-cream/60 mt-1 font-mono">
                    {isAr ? 'يتم ربط كارت الولاء وأختام المكافآت برقم هاتفك تلقائياً' : 'Your rewards card will be tied to this phone number'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-brand-cream/80 mb-1">
                    {isAr ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-9 py-2.5 rounded-xs focus:outline-none focus:border-brand-gold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-brand-cream/80 mb-1">
                    {isAr ? 'كلمة المرور أو رمز PIN' : 'Password or PIN'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-9 py-2.5 rounded-xs focus:outline-none focus:border-brand-gold font-mono"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-mono text-brand-cream/80 mb-1">
                    {isAr ? 'رقم الهاتف أو البريد الإلكتروني' : 'Phone Number or Email'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={isAr ? '010xxxxxxxx أو البريد' : '010xxxxxxxx or Email'}
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
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-gold hover:bg-brand-gold-hover text-brand-black font-sans text-xs uppercase tracking-wider font-bold rounded-xs transition-all duration-200 shadow-gold flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 mt-6"
            >
              <span>
                {loading
                  ? (isAr ? 'جاري المعالجة...' : 'Processing...')
                  : activeTab === 'login'
                  ? (isAr ? 'دخول الحساب' : 'Sign In')
                  : (isAr ? '🎁 تسجيل واستلام كارت الولاء VIP' : '🎁 Claim VIP Loyalty Pass')}
              </span>
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
