'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { Clock, Flame, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

export const FutureTeaser: React.FC = () => {
  const { language, isRtl } = useLanguage();
  const { content } = useHomepageContent();
  const isAr = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (content.showFutureTeaser === false) {
    return null;
  }

  const badge = isAr
    ? content.futureBadgeAr || 'الإصدار القادم · قريباً'
    : content.futureBadgeEn || 'FUTURE DROP · IN SAMPLING';

  const title = isAr
    ? content.futureTitleAr || 'تي شيرت أثير البوكسي الثقيل 320 GSM'
    : content.futureTitleEn || 'The Essential 320 GSM Heavy Boxy Youth Tee';

  const desc = isAr
    ? content.futureDescAr || 'بينما نركز حالياً على إطلاق الهوديز والسويت شيرتات الثقيلة، نعمل في مختبر أثير على تجهيز التي شيرت الشبابي الأوفرسايز المثالي: قطن جيرسي 320 GSM فائق الكثافة، ياقة ضيقة متماسكة، وأكمام بوكسي واسعة.'
    : content.futureDescEn || 'While our launch collection is dedicated to 500 GSM heavyweight hoodies and sweatshirts, we are currently engineering the ultimate youth boxy tee: 320 GSM ultra-dense combed cotton, structured mock-neck ribbing, and relaxed elbow-length sleeves.';

  const img = content.futureImage || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop';
  const chip1 = content.futureChip1 || '320 GSM Jersey';
  const chip2 = content.futureChip2 || 'High-Neck Rib';
  const chip3 = content.futureChip3 || 'Oversized Youth Cut';
  const bottomBadge = isAr
    ? content.futureBadgeBottomAr || 'مرحلة العينات · قريباً في الأسواق'
    : content.futureBadgeBottomEn || 'DEVELOPMENT LAB · COMING SOON';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section id="future-drop" className="py-20 sm:py-28 bg-brand-charcoal text-brand-ivory border-b border-brand-border/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-brand-black border border-brand-gold/40 p-8 sm:p-14 overflow-hidden shadow-2xl">
          {/* Background Streetwear Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-brand-gold text-[10px] sm:text-xs uppercase tracking-widest font-mono font-bold mb-4">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>{badge}</span>
              </div>

              <h2 className="font-sans font-black text-3xl sm:text-5xl text-brand-ivory uppercase tracking-tight leading-tight mb-4">
                {title}
              </h2>

              <p className="text-sm sm:text-base text-brand-cream/80 font-sans font-light leading-relaxed mb-6">
                {desc}
              </p>

              <div className="flex flex-wrap gap-2 text-xs font-mono text-brand-gold mb-8">
                <span className="px-3 py-1 bg-brand-charcoal border border-brand-border">{chip1}</span>
                <span className="px-3 py-1 bg-brand-charcoal border border-brand-border">{chip2}</span>
                <span className="px-3 py-1 bg-brand-charcoal border border-brand-border">{chip3}</span>
              </div>

              {/* VIP Drop Notification Input */}
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    isAr ? 'أدخل بريدك لتصلك دعوة الإطلاق...' : 'Enter email for early tee access...'
                  }
                  required
                  className="flex-1 bg-brand-charcoal border border-brand-border px-4 py-3 text-xs text-brand-ivory placeholder-brand-muted focus:outline-none focus:border-brand-gold"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-gold text-brand-black text-xs uppercase tracking-widest font-bold hover:bg-brand-gold-hover transition-colors shadow-gold flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  {submitted ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{isAr ? 'تم التسجيل' : 'Notified'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isAr ? 'إشعار الإطلاق' : 'Notify Me'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Teaser Photo */}
            <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-square w-full overflow-hidden border border-brand-border/60 shadow-xl">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('${img}')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 bg-brand-black/90 backdrop-blur-md px-3 py-1.5 border border-brand-gold/40 text-[10px] font-mono text-brand-gold">
                {bottomBadge}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
