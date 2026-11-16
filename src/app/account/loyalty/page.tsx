'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { BackButton } from '@/components/BackButton';
import {
  Award,
  Sparkles,
  Check,
  Copy,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Gift,
  Flame,
} from 'lucide-react';

export default function LoyaltyCardPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading } = useCustomerAuth();
  const { language, isRtl, formatPrice } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/account/login?redirect=/account/loyalty');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (customer?.email) {
      fetch(`/api/loyalty/me?email=${encodeURIComponent(customer.email)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setLoyaltyData(d);
        })
        .catch(() => {});
    }
  }, [customer]);

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center font-mono text-xs text-brand-gold">
        {isAr ? 'جاري فتح بطاقة المكافآت...' : 'Loading rewards card...'}
      </div>
    );
  }

  const account = loyaltyData?.account;
  const config = loyaltyData?.config;
  const stampsCount = account?.stampsCount ?? 0;
  const stampsRequired = config?.stampsRequired ?? 5;
  const progressPercent = Math.min(100, Math.round((stampsCount / stampsRequired) * 100));

  const handleCopyVoucher = (code: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(code);
      localStorage.setItem('atheer_active_coupon', code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory py-8 sm:py-12 px-3 sm:px-6 lg:px-8 selection:bg-brand-gold selection:text-brand-black pb-28 sm:pb-12">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Back Action & Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <BackButton label={isAr ? 'رجوع للخطوة السابقة' : 'Back to previous'} fallbackUrl="/account" />
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-cream/60">
            <Link href="/account" className="hover:text-brand-gold transition-colors">
              {isAr ? 'حسابي' : 'My Account'}
            </Link>
            <span>/</span>
            <span className="text-brand-gold font-bold">{isAr ? 'مكافآت أثير' : 'ATHEER REWARDS'}</span>
          </div>
        </div>

        {/* Master Digital Stamp Card Visual */}
        <div className="relative rounded-xs border-2 border-brand-gold bg-gradient-to-br from-brand-charcoal via-brand-stone/40 to-brand-black p-4 sm:p-10 shadow-gold overflow-hidden">
          {/* Subtle Ambient Gold Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
              <div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="font-sans font-black text-2xl tracking-[0.2em] text-brand-ivory uppercase">
                    {isAr ? 'أثير' : 'ATHEER'}
                  </span>
                  <span className="text-brand-gold font-light">/</span>
                  <span className="text-xs font-mono font-bold text-brand-gold tracking-widest uppercase">
                    {isAr ? 'كارت المكافآت' : 'REWARDS PASS'}
                  </span>
                </div>
                <p className="text-xs text-brand-cream/60 font-mono mt-1">
                  {isAr ? 'بطاقة الأختام الرقمية الرسمية لأزياء الشارع' : 'Official Digital Streetwear Stamp Pass'}
                </p>
              </div>

              <div className="text-start sm:text-end">
                <span className="text-[10px] font-mono text-brand-cream/50 uppercase block">
                  {isAr ? 'فئة العضوية' : 'Membership Tier'}
                </span>
                <span className="text-sm font-mono font-bold text-brand-gold uppercase">
                  {isAr
                    ? (account?.tier === 'Gold' ? 'عضو ذهبي' : account?.tier === 'Silver' ? 'عضو فضي' : 'عضو برونزي')
                    : `${account?.tier || 'Bronze'} Member`}
                </span>
              </div>
            </div>

            {/* Stamp Slots Grid (Interactive 5-Slot Stamp Area) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-brand-ivory font-bold">
                  {isAr ? 'تقدم الأختام في البطاقة الحالية:' : 'Current Stamp Card Progress:'}
                </span>
                <span className="text-brand-gold font-bold">
                  {stampsCount} / {stampsRequired} ({progressPercent}%)
                </span>
              </div>

              {/* Progress Line */}
              <div className="w-full h-1.5 bg-brand-black rounded-full overflow-hidden border border-brand-border">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-brand-gold transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* 5 Physical Stamp Circles */}
              <div className="grid grid-cols-5 gap-1.5 xs:gap-3 sm:gap-6 pt-4">
                {Array.from({ length: stampsRequired }).map((_, index) => {
                  const isEarned = index < stampsCount;
                  const isLastSlot = index === stampsRequired - 1;

                  return (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-full flex flex-col items-center justify-center p-2 transition-all duration-300 ${
                        isEarned
                          ? 'bg-brand-gold text-brand-black shadow-gold scale-105 border-2 border-brand-gold'
                          : isLastSlot
                          ? 'bg-brand-stone/30 border-2 border-dashed border-brand-gold/60 text-brand-gold'
                          : 'bg-brand-stone/20 border-2 border-dashed border-brand-border/60 text-brand-cream/40'
                      }`}
                    >
                      {isEarned ? (
                        <>
                          <Check className="w-6 h-6 stroke-[3]" />
                          <span className="text-[9px] font-mono font-black uppercase mt-0.5">
                            STAMP {index + 1}
                          </span>
                        </>
                      ) : isLastSlot ? (
                        <>
                          <Gift className="w-5 h-5 animate-pulse" />
                          <span className="text-[8px] font-mono font-bold text-center mt-0.5 leading-none">
                            {isAr ? 'المكافأة' : 'REWARD'}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-mono font-bold">{index + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reward Notification Banner */}
            <div className="p-4 bg-brand-black/80 border border-brand-border/80 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Sparkles className="w-5 h-5 text-brand-gold flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-brand-ivory block">
                    {isAr ? 'المكافأة عند اكتمال الـ 5 أختام:' : 'Reward upon 5 stamps completion:'}
                  </span>
                  <span className="text-brand-cream/70 text-[11px]">
                    {config?.rewardDescriptionAr || 'قسيمة خصم نقدية بقيمة 250 ج.م تطبق على أي طلب قادم.'}
                  </span>
                </div>
              </div>

              <Link
                href="/#products"
                className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase rounded-xs transition-colors text-center"
              >
                {isAr ? 'تسوق لكسب الأختام' : 'Shop To Earn'}
              </Link>
            </div>

            {/* Active Reward Vouchers Ready to Redeem */}
            {account?.activeVouchers && account.activeVouchers.filter((v: any) => !v.isUsed).length > 0 && (
              <div className="space-y-3 pt-4 border-t border-brand-border/60">
                <h4 className="text-xs font-mono uppercase tracking-wider text-brand-gold font-bold">
                  {isAr ? 'قسائم المكافآت الجاهزة للاستخدام بالسلة:' : 'Active Reward Vouchers For Checkout:'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {account.activeVouchers
                    .filter((v: any) => !v.isUsed)
                    .map((voucher: any) => {
                      const isCopied = copiedCode === voucher.code;

                      return (
                        <div
                          key={voucher.code}
                          className="p-3 bg-brand-black border border-brand-gold/60 rounded-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono font-bold text-sm text-brand-gold block">
                              {voucher.code}
                            </span>
                            <span className="text-[10px] font-mono text-brand-cream/60">
                              {formatPrice(voucher.discountAmount)} {isAr ? 'خصم فوري' : 'Instant Cash Discount'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyVoucher(voucher.code)}
                            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xs flex items-center space-x-1 rtl:space-x-reverse transition-colors ${
                              isCopied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-brand-gold text-brand-black hover:bg-brand-gold-hover'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{isAr ? 'تم النسخ' : 'Copied'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>{isAr ? 'نسخ واستخدام' : 'Copy'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rules & Transparency Explainer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-brand-charcoal border border-brand-border/70 rounded-xs space-y-1.5">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono font-bold text-brand-gold">
              <Award className="w-4 h-4" />
              <span>{isAr ? 'ختم تلقائي مع كل أوردر' : 'Automatic Stamp Addition'}</span>
            </div>
            <p className="text-[11px] text-brand-cream/60 leading-relaxed font-sans">
              {isAr
                ? 'يضاف الختم تلقائياً لحسابك المسجل عند توصيل كل طلب مؤهل (فوق 800 ج.م) بنجاح لباب بيتك.'
                : 'Stamps are auto-credited when an eligible order above 800 EGP is delivered.'}
            </p>
          </div>

          <div className="p-4 bg-brand-charcoal border border-brand-border/70 rounded-xs space-y-1.5">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono font-bold text-brand-gold">
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'حماية من التكرار والإلغاء' : 'Consistent Reversals'}</span>
            </div>
            <p className="text-[11px] text-brand-cream/60 leading-relaxed font-sans">
              {isAr
                ? 'في حالة إلغاء الطلب أو استرجاعه بالكامل، يتم خصم الختم المقابل لضمان نزاهة البرنامج للجميع.'
                : 'Cancelled or refunded orders reverse their awarded stamp fairly.'}
            </p>
          </div>

          <div className="p-4 bg-brand-charcoal border border-brand-border/70 rounded-xs space-y-1.5">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono font-bold text-brand-gold">
              <Clock className="w-4 h-4" />
              <span>{isAr ? 'صلاحية ممتدة بدون قلق' : 'Extended Validity'}</span>
            </div>
            <p className="text-[11px] text-brand-cream/60 leading-relaxed font-sans">
              {isAr
                ? 'أختامك الرقمية وقسائم المكافآت صالحة لمدة 90 يوماً من تاريخ الإصدار لاستخدامها في أي وقت.'
                : 'Rewards remain valid for 90 days from issuance.'}
            </p>
          </div>
        </div>

        {/* Stamp History Log */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-brand-ivory font-serif">
            {isAr ? 'سجل معاملات الأختام والمكافآت' : 'Stamp Activity Log'}
          </h3>

          {(!account?.history || account.history.length === 0) ? (
            <p className="text-xs text-brand-cream/50 font-mono py-4 text-center">
              {isAr ? 'لا توجد معاملات مسجلة حتى الآن' : 'No activity recorded yet'}
            </p>
          ) : (
            <div className="divide-y divide-brand-border/40 font-mono text-xs">
              {account.history.map((tx: any) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-brand-ivory font-bold block">{tx.notes}</span>
                    <span className="text-[10px] text-brand-cream/50">
                      {new Date(tx.date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                    </span>
                  </div>

                  <span
                    className={`font-bold px-2 py-0.5 rounded-xs text-[11px] ${
                      tx.type === 'earn'
                        ? 'text-emerald-400 bg-emerald-950/40'
                        : tx.type === 'redeem'
                        ? 'text-brand-gold bg-brand-gold/15'
                        : 'text-rose-400 bg-rose-950/40'
                    }`}
                  >
                    {tx.stamps > 0 ? `+${tx.stamps}` : tx.stamps} {isAr ? 'ختم' : 'Stamp'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
