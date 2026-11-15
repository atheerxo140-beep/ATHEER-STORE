'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  User,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Award,
  Gift,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface CustomerAuthFormProps {
  initialMode?: 'login' | 'register';
}

export const CustomerAuthForm: React.FC<CustomerAuthFormProps> = ({ initialMode = 'register' }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get('redirect');

  const { login, register, isAuthenticated } = useCustomerAuth();
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const isRegister = mode === 'register';

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Status & Validation State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const redirectUrl = explicitRedirect || (isRegister ? '/account/loyalty' : '/account');

  // If already authenticated, redirect smoothly
  useEffect(() => {
    if (isAuthenticated) {
      router.push(explicitRedirect || '/account');
    }
  }, [isAuthenticated, explicitRedirect, router]);

  const handleFieldChange = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (errorMsg) setErrorMsg(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (isRegister) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        errors.fullName = isAr ? 'يرجى إدخال اسمك بالكامل (حرفين على الأقل).' : 'Please enter your full name.';
      }

      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 8) {
        errors.phone = isAr ? 'يرجى إدخال رقم هاتف محمول صحيح.' : 'Please enter a valid mobile number.';
      } else if (!/^01[0125]/.test(cleanPhone) && !/^\+?201[0125]/.test(phone.trim())) {
        errors.phone = isAr ? 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 010xxxxxxxx).' : 'Please enter a valid Egyptian mobile number.';
      }

      if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
        errors.email = isAr ? 'صيغة البريد الإلكتروني غير صحيحة.' : 'Please enter a valid email address.';
      }

      if (password && password.length < 6) {
        errors.password = isAr ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف.' : 'Password must be at least 6 characters.';
      }

      if (password && passwordConfirm && password !== passwordConfirm) {
        errors.passwordConfirm = isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.';
      }
    } else {
      if (!identifier.trim()) {
        errors.identifier = isAr ? 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني.' : 'Please enter your phone number or email.';
      }
      if (!password.trim()) {
        errors.password = isAr ? 'يرجى إدخال كلمة المرور.' : 'Please enter your password.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg(null);
    setErrorCode(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const res: any = await login(identifier, password);
        if (res.success) {
          setSuccessMsg(isAr ? 'تم تسجيل الدخول بنجاح! جاري التوجيه...' : 'Logged in successfully! Redirecting...');
          setTimeout(() => router.push(redirectUrl), 400);
        } else {
          setErrorMsg(res.error || (isAr ? 'بيانات الدخول غير صحيحة، يرجى التأكد وإعادة المحاولة.' : 'Invalid login credentials.'));
          setErrorCode(res.code || null);
        }
      } else {
        const finalEmail = email.trim();
        const res: any = await register({
          email: finalEmail,
          pass: password || '123456',
          fullName: fullName.trim(),
          phone: phone.trim(),
        });

        if (res.success) {
          setSuccessMsg(isAr ? 'تم إنشاء حسابك وتفعيل كارت الولاء الذهبي بنجاح! جاري التوجيه...' : 'Account created & Gold Loyalty Pass activated! Redirecting...');
          setTimeout(() => router.push(redirectUrl), 400);
        } else {
          setErrorMsg(res.error || (isAr ? 'تعذر إنشاء الحساب حالياً. يرجى المحاولة مرة أخرى.' : 'Failed to register account.'));
          setErrorCode(res.code || null);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? 'حدث خطأ في الاتصال بالشبكة.' : 'Network connection error.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-brand-black text-brand-ivory flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative selection:bg-brand-gold selection:text-brand-black overflow-hidden">
      {/* Editorial Luxury Ambient Background Glow & Watermark Lines */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[360px] bg-brand-gold/[0.04] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.025] pointer-events-none" />

      <div className="w-full max-w-md sm:max-w-lg mx-auto relative z-10 space-y-6">
        {/* Brand Header & Architectural Eyebrow */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group focus:outline-none">
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse whitespace-nowrap">
              {isAr ? (
                <>
                  <span className="font-arabic font-bold text-3xl sm:text-4xl text-brand-ivory group-hover:text-brand-gold transition-colors">
                    أثير
                  </span>
                  <span className="text-brand-gold text-2xl sm:text-3xl font-light">/</span>
                  <span className="font-english font-black text-3xl sm:text-4xl tracking-[0.2em] text-brand-gold uppercase">
                    ATHEER
                  </span>
                </>
              ) : (
                <>
                  <span className="font-english font-black text-3xl sm:text-4xl tracking-[0.2em] text-brand-ivory uppercase group-hover:text-brand-gold transition-colors">
                    ATHEER
                  </span>
                  <span className="text-brand-gold text-2xl sm:text-3xl font-light">/</span>
                  <span className="font-arabic font-bold text-3xl sm:text-4xl text-brand-gold">
                    أثير
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-brand-cream/60 font-mono mt-1">
              {isAr ? 'أزياء الشارع المصرية الراقية · أقمشة فاخرة' : 'Premium Egyptian Streetwear · Heavyweight Drops'}
            </p>
          </Link>

          {/* Eyebrow with Decorative Lines (Inspired by elnahatdecor.com) */}
          <div className="flex items-center justify-center gap-3 text-brand-gold text-xs font-mono uppercase tracking-widest pt-2">
            <span className="w-8 h-[1px] bg-brand-gold/40 inline-block" />
            <span>{isRegister ? (isAr ? 'حساب جديد' : 'New Account') : (isAr ? 'مرحبًا بعودتك' : 'Welcome Back')}</span>
            <span className="w-8 h-[1px] bg-brand-gold/40 inline-block" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-black text-brand-ivory tracking-tight">
            {isRegister
              ? (isAr ? 'ابدأ تجربتك مع دار أثير.' : 'Start Your Journey With ATHEER.')
              : (isAr ? 'عد إلى عالم دار أثير.' : 'Return To ATHEER Atelier.')}
          </h1>

          <p className="text-xs sm:text-sm text-brand-cream/70 font-sans leading-relaxed max-w-md mx-auto">
            {isRegister
              ? (isAr
                  ? 'أنشئ حسابك برقم هاتفك لتحصل فوراً على كارت الولاء الذهبي و١٠٠ ج.م رصيد ترحيبي مع تتبع شحناتك بسهولة.'
                  : 'Register with your phone number to unlock your instant Gold Loyalty Pass + 100 EGP welcome bonus.')
              : (isAr
                  ? 'سجل دخولك برقم هاتفك أو بريدك لمتابعة شحناتك المباشرة ورصيد أختام كارت الولاء.'
                  : 'Sign in with your mobile number or email to manage your orders and rewards.')}
          </p>
        </div>

        {/* Main Auth Architecture Container */}
        <div className="bg-brand-charcoal/90 border border-brand-border/80 rounded-sm shadow-luxury-dark backdrop-blur-md p-5 sm:p-8 space-y-6">
          {/* Top Segmented Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-brand-black/70 border border-brand-border/60 rounded-xs font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setFieldErrors({});
              }}
              className={`py-2.5 px-3 rounded-xs font-bold transition-all flex items-center justify-center space-x-1.5 rtl:space-x-reverse ${
                isRegister
                  ? 'bg-brand-gold text-brand-black shadow-gold font-black'
                  : 'text-brand-cream/60 hover:text-brand-ivory hover:bg-brand-stone/30'
              }`}
            >
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span>{isAr ? 'إنشاء حساب جديد' : 'Create Account'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setFieldErrors({});
              }}
              className={`py-2.5 px-3 rounded-xs font-bold transition-all flex items-center justify-center space-x-1.5 rtl:space-x-reverse ${
                !isRegister
                  ? 'bg-brand-gold text-brand-black shadow-gold font-black'
                  : 'text-brand-cream/60 hover:text-brand-ivory hover:bg-brand-stone/30'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>
          </div>

          {/* Loyalty Pass Hero Banner (For Registration) */}
          {isRegister && (
            <div className="p-3.5 bg-gradient-to-r from-brand-gold/20 via-brand-gold/10 to-transparent border border-brand-gold/50 rounded-xs text-xs font-mono text-brand-gold flex items-center space-x-3 rtl:space-x-reverse shadow-sm">
              <div className="w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold/80 flex items-center justify-center flex-shrink-0 text-brand-gold shadow-sm">
                <Gift className="w-5 h-5 text-brand-gold" />
              </div>
              <div className="leading-snug min-w-0">
                <span className="font-bold text-brand-ivory text-xs block truncate">
                  {isAr ? '💳 كارت ولاء دار أثير الرقمي (عضوية ذهبية)' : '💳 ATHEER Digital Gold Pass'}
                </span>
                <span className="text-[11px] text-brand-cream/80 font-sans block mt-0.5">
                  {isAr
                    ? 'سجل برقمك لاستلام قسيمة ١٠٠ ج.م كاش فورية وأختام تلقائية مع كل طلب.'
                    : 'Instant 100 EGP welcome voucher + digital stamps with every delivery.'}
                </span>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs font-mono rounded-xs flex items-center space-x-2 rtl:space-x-reverse animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error & Quick Transition Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs font-mono rounded-xs space-y-2.5 animate-fade-in">
              <div className="flex items-start space-x-2 rtl:space-x-reverse">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <p className="leading-relaxed font-sans">{errorMsg}</p>
              </div>

              {/* Direct 1-Click Transition to Login when account exists */}
              {(errorCode === 'PHONE_EXISTS' || errorCode === 'EMAIL_EXISTS') && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setIdentifier(phone || email);
                    setErrorMsg(null);
                    setErrorCode(null);
                  }}
                  className="w-full py-2 px-3 bg-brand-gold text-brand-black text-xs font-mono font-bold uppercase rounded-xs hover:bg-brand-gold-hover transition-colors flex items-center justify-center space-x-1.5 rtl:space-x-reverse shadow-gold"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>
                    {isAr
                      ? 'هذا الحساب مسجل لدينا بالفعل — اضغط هنا لتسجيل الدخول مباشرة'
                      : 'Account Already Exists — Click to Sign In Now'}
                  </span>
                </button>
              )}

              {/* Direct 1-Click Transition to Register when account not found */}
              {errorCode === 'NOT_FOUND' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
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
                      ? 'إنشاء حساب واستلام كارت الولاء بضغطة زر'
                      : 'Create Account & Claim Loyalty Pass Now'}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {isRegister ? (
              <>
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-medium text-brand-cream/80">
                    {isAr ? 'الاسم بالكامل' : 'Full Name'} <span className="text-brand-gold">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3.5 text-brand-cream/40" />
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(e) => handleFieldChange('fullName', e.target.value, setFullName)}
                      placeholder={isAr ? 'مثال: أحمد محمود' : 'e.g. Ahmed Mahmoud'}
                      className={`w-full bg-brand-stone/40 border text-brand-ivory text-base sm:text-sm px-10 py-3 rounded-xs focus:outline-none transition-colors font-sans min-h-[48px] ${
                        fieldErrors.fullName ? 'border-rose-500 focus:border-rose-400' : 'border-brand-border/80 focus:border-brand-gold'
                      }`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-rose-400 font-mono mt-0.5">{fieldErrors.fullName}</p>
                  )}
                </div>

                {/* Mobile Phone (Egyptian format, clean ergonomics) */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-medium text-brand-cream/80">
                    {isAr ? 'رقم الهاتف المحمول' : 'Mobile Phone'} <span className="text-brand-gold">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3.5 text-brand-gold" />
                    <input
                      type="tel"
                      name="phone"
                      inputMode="tel"
                      autoComplete="tel"
                      dir="ltr"
                      required
                      value={phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value, setPhone)}
                      placeholder="010XXXXXXXX"
                      className={`w-full bg-brand-stone/40 border text-brand-gold text-base sm:text-sm px-10 py-3 rounded-xs focus:outline-none transition-colors font-mono font-bold min-h-[48px] tracking-wider text-left ${
                        fieldErrors.phone ? 'border-rose-500 focus:border-rose-400' : 'border-brand-gold/60 focus:border-brand-gold'
                      }`}
                    />
                  </div>
                  {fieldErrors.phone ? (
                    <p className="text-[11px] text-rose-400 font-mono mt-0.5">{fieldErrors.phone}</p>
                  ) : (
                    <p className="text-[10px] text-brand-cream/60 font-mono mt-0.5">
                      {isAr ? 'يتم ربط كارت الولاء وأختام المكافآت برقم هاتفك تلقائياً' : 'Tied to your digital loyalty card & delivery SMS'}
                    </p>
                  )}
                </div>

                {/* Email Address (Optional for fast phone signups) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono font-medium text-brand-cream/80">
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <span className="text-[10px] text-brand-cream/50 font-mono">
                      {isAr ? '(اختياري)' : '(Optional)'}
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3.5 text-brand-cream/40" />
                    <input
                      type="email"
                      name="email"
                      inputMode="email"
                      autoComplete="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
                      placeholder="name@example.com"
                      className={`w-full bg-brand-stone/40 border text-brand-ivory text-base sm:text-sm px-10 py-3 rounded-xs focus:outline-none transition-colors font-mono min-h-[48px] text-left ${
                        fieldErrors.email ? 'border-rose-500 focus:border-rose-400' : 'border-brand-border/80 focus:border-brand-gold'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-400 font-mono mt-0.5">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password with Eye Toggle */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono font-medium text-brand-cream/80">
                      {isAr ? 'كلمة المرور' : 'Password'}
                    </label>
                    <span className="text-[10px] text-brand-cream/50 font-mono">
                      {isAr ? '(٦ أحرف على الأقل)' : '(Min 6 chars)'}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3.5 text-brand-cream/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="new-password"
                      dir="ltr"
                      value={password}
                      onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
                      placeholder="••••••••"
                      className={`w-full bg-brand-stone/40 border text-brand-ivory text-base sm:text-sm pl-10 pr-12 rtl:pr-10 rtl:pl-12 py-3 rounded-xs focus:outline-none transition-colors font-mono min-h-[48px] text-left ${
                        fieldErrors.password ? 'border-rose-500 focus:border-rose-400' : 'border-brand-border/80 focus:border-brand-gold'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 p-1 text-brand-cream/50 hover:text-brand-gold transition-colors"
                      title={showPassword ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-rose-400 font-mono mt-0.5">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Password Confirmation */}
                {password && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="block text-xs font-mono font-medium text-brand-cream/80">
                      {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3.5 text-brand-cream/40" />
                      <input
                        type={showPasswordConfirm ? 'text' : 'password'}
                        name="passwordConfirm"
                        autoComplete="new-password"
                        dir="ltr"
                        value={passwordConfirm}
                        onChange={(e) => handleFieldChange('passwordConfirm', e.target.value, setPasswordConfirm)}
                        placeholder="••••••••"
                        className={`w-full bg-brand-stone/40 border text-brand-ivory text-base sm:text-sm pl-10 pr-12 rtl:pr-10 rtl:pl-12 py-3 rounded-xs focus:outline-none transition-colors font-mono min-h-[48px] text-left ${
                          fieldErrors.passwordConfirm ? 'border-rose-500 focus:border-rose-400' : 'border-brand-border/80 focus:border-brand-gold'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 p-1 text-brand-cream/50 hover:text-brand-gold transition-colors"
                        title={showPasswordConfirm ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
                      >
                        {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.passwordConfirm ? (
                      <p className="text-[11px] text-rose-400 font-mono mt-0.5">{fieldErrors.passwordConfirm}</p>
                    ) : password === passwordConfirm && passwordConfirm ? (
                      <p className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center space-x-1 rtl:space-x-reverse">
                        <Check className="w-3 h-3" />
                        <span>{isAr ? 'كلمتا المرور متطابقتان' : 'Passwords match'}</span>
                      </p>
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Sign In Identifier (Phone or Email) */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-medium text-brand-cream/80">
                    {isAr ? 'رقم الهاتف أو البريد الإلكتروني' : 'Phone Number or Email'} <span className="text-brand-gold">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3.5 text-brand-gold" />
                    <input
                      type="text"
                      name="identifier"
                      autoComplete="username"
                      dir="ltr"
                      required
                      value={identifier}
                      onChange={(e) => handleFieldChange('identifier', e.target.value, setIdentifier)}
                      placeholder={isAr ? '010XXXXXXXX أو البريد' : '010XXXXXXXX or email'}
                      className={`w-full bg-brand-stone/40 border text-brand-ivory text-base sm:text-sm px-10 py-3 rounded-xs focus:outline-none transition-colors font-mono min-h-[48px] text-left ${
                        fieldErrors.identifier ? 'border-rose-500 focus:border-rose-400' : 'border-brand-border/80 focus:border-brand-gold'
                      }`}
                    />
                  </div>
                  {fieldErrors.identifier && (
                    <p className="text-[11px] text-rose-400 font-mono mt-0.5">{fieldErrors.identifier}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono font-medium text-brand-cream/80">
                      {isAr ? 'كلمة المرور' : 'Password'} <span className="text-brand-gold">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-brand-cream/60">
                      {isAr ? 'كلمة المرور لحسابك' : 'Account password'}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3.5 text-brand-cream/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      dir="ltr"
                      required
                      value={password}
                      onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
                      placeholder="••••••••"
                      className={`w-full bg-brand-stone/40 border text-brand-ivory text-base sm:text-sm pl-10 pr-12 rtl:pr-10 rtl:pl-12 py-3 rounded-xs focus:outline-none transition-colors font-mono min-h-[48px] text-left ${
                        fieldErrors.password ? 'border-rose-500 focus:border-rose-400' : 'border-brand-border/80 focus:border-brand-gold'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 p-1 text-brand-cream/50 hover:text-brand-gold transition-colors"
                      title={showPassword ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-rose-400 font-mono mt-0.5">{fieldErrors.password}</p>
                  )}
                </div>
              </>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-gold hover:bg-brand-gold-hover text-brand-black font-sans text-xs uppercase tracking-wider font-bold rounded-xs transition-all duration-200 shadow-gold flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 min-h-[48px] mt-6"
            >
              <span>
                {loading
                  ? (isAr ? 'جاري المعالجة والتأكيد...' : 'Processing...')
                  : isRegister
                  ? (isAr ? '🎁 إنشاء الحساب وتفعيل كارت الولاء' : '🎁 Create Account & Activate Pass')
                  : (isAr ? 'تسجيل الدخول إلى حسابي' : 'Sign In To My Account')}
              </span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Switch Link Between Login & Register (Inspired by elnahatdecor.com) */}
          <div className="pt-4 border-t border-brand-border/60 text-center font-sans text-xs text-brand-cream/70">
            <span>{isRegister ? (isAr ? 'لديك حساب مسجل بالفعل؟' : 'Already have an account?') : (isAr ? 'ليس لديك حساب حتى الآن؟' : "Don't have an account?")}</span>{' '}
            <button
              type="button"
              onClick={() => {
                setMode(isRegister ? 'login' : 'register');
                setErrorMsg(null);
                setFieldErrors({});
              }}
              className="font-bold text-brand-gold hover:underline transition-colors focus:outline-none"
            >
              {isRegister ? (isAr ? 'تسجيل الدخول' : 'Sign In') : (isAr ? 'إنشاء حساب جديد' : 'Create Account')}
            </button>
          </div>

          {/* Luxury Streetwear Guarantee Strip */}
          <div className="pt-3 border-t border-brand-border/40 space-y-2 text-[11px] text-brand-cream/70 font-sans">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>{isAr ? 'حق معاينة وفتح الشحنة مع المندوب قبل الدفع' : 'Open box inspection guarantee before payment'}</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>{isAr ? 'أختام ولاء رقمية وهدايا كاش تضاف تلقائياً لحسابك' : 'Digital stamps & cash rewards credited on delivery'}</span>
            </div>
          </div>
        </div>

        {/* Guest Return Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-brand-cream/50 hover:text-brand-gold font-mono transition-colors inline-flex items-center space-x-1 rtl:space-x-reverse">
            <ArrowIcon className="w-3.5 h-3.5 rotate-180" />
            <span>{isAr ? 'العودة لواجهة المتجر الرئيسية' : 'Return to Storefront'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
