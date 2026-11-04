'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, Flame, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

export const FutureTeaser: React.FC = () => {
  const { language, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
                <span>
                  {language === 'ar' ? 'الإصدار القادم · قريباً' : 'FUTURE DROP · IN SAMPLING'}
                </span>
              </div>

              <h2 className="font-sans font-black text-3xl sm:text-5xl text-brand-ivory uppercase tracking-tight leading-tight mb-4">
                {language === 'ar'
                  ? 'تي شيرت أثير البوكسي الثقيل 320 GSM'
                  : 'The Essential 320 GSM Heavy Boxy Youth Tee'}
              </h2>

              <p className="text-sm sm:text-base text-brand-cream/80 font-sans font-light leading-relaxed mb-6">
                {language === 'ar'
                  ? 'بينما نركز حالياً على إطلاق الهوديز والسويت شيرتات الثقيلة، نعمل في مختبر أثير على تجهيز التي شيرت الشبابي الأوفرسايز المثالي: قطن جيرسي 320 GSM فائق الكثافة، ياقة ضيقة متماسكة، وأكمام بوكسي واسعة.'
                  : 'While our launch collection is dedicated to 500 GSM heavyweight hoodies and sweatshirts, we are currently engineering the ultimate youth boxy tee: 320 GSM ultra-dense combed cotton, structured mock-neck ribbing, and relaxed elbow-length sleeves.'}
              </p>

              <div className="flex flex-wrap gap-2 text-xs font-mono text-brand-gold mb-8">
                <span className="px-3 py-1 bg-brand-charcoal border border-brand-border">320 GSM Jersey</span>
                <span className="px-3 py-1 bg-brand-charcoal border border-brand-border">High-Neck Rib</span>
                <span className="px-3 py-1 bg-brand-charcoal border border-brand-border">Oversized Youth Cut</span>
              </div>

              {/* VIP Drop Notification Input */}
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    language === 'ar' ? 'أدخل بريدك لتصلك دعوة الإطلاق...' : 'Enter email for early tee access...'
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
                      <span>{language === 'ar' ? 'تم التسجيل' : 'Notified'}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'ar' ? 'إشعار الإطلاق' : 'Notify Me'}</span>
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
                  backgroundImage: `url('https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 bg-brand-black/90 backdrop-blur-md px-3 py-1.5 border border-brand-gold/40 text-[10px] font-mono text-brand-gold">
                {language === 'ar' ? 'مرحلة العينات · قريباً في الأسواق' : 'DEVELOPMENT LAB · COMING SOON'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
