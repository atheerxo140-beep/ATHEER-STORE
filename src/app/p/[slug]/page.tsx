import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { getPageBySlug, getAllPages } from '@/lib/pageService';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck, Clock, MapPin } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPageBySlug(params.slug);
  if (!page) {
    return { title: 'Page Not Found | ATHEER' };
  }
  return {
    title: `${page.titleAr} | ${page.titleEn} - ATHEER`,
    description: page.seoDescriptionAr || page.seoDescriptionEn,
  };
}

export default function CustomDynamicPage({ params }: Props) {
  const page = getPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  // Simple safe markdown paragraph renderer
  const renderContent = (content: string) => {
    return content.split('\n\n').map((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl sm:text-2xl font-bold font-serif text-brand-gold mt-8 mb-4 tracking-wide">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base sm:text-lg font-bold font-mono text-brand-ivory mt-6 mb-3">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').map((li) => li.replace(/^-\s*/, ''));
        return (
          <ul key={idx} className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-brand-cream/80 my-3 font-sans">
            {items.map((it, iIdx) => (
              <li key={iIdx}>{it}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={idx} className="text-xs sm:text-sm text-brand-cream/80 leading-relaxed font-sans mb-4">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory flex flex-col justify-between selection:bg-brand-gold selection:text-brand-black font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-brand-cream/50 font-mono mb-8">
          <Link href="/" className="hover:text-brand-gold transition-colors">
            ATHEER
          </Link>
          <span>/</span>
          <span className="text-brand-gold">{page.titleAr}</span>
        </div>

        {/* Title Header */}
        <div className="border-b border-brand-border/60 pb-8 mb-12">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-brand-gold text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>ATHEER OFFICIAL ATELIER</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif text-brand-ivory mb-4 tracking-tight">
            {page.titleAr}
          </h1>
          <p className="text-sm sm:text-base font-mono text-brand-gold/90 uppercase tracking-widest">
            {page.titleEn}
          </p>

          <div className="flex items-center space-x-4 rtl:space-x-reverse text-[11px] text-brand-cream/50 font-mono mt-6">
            <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <Clock className="w-3.5 h-3.5 text-brand-gold/60" />
              <span>آخر تحديث: {new Date(page.updatedAt).toLocaleDateString('ar-EG')}</span>
            </span>
          </div>
        </div>

        {/* Bilingual Content Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
          {/* Arabic Version (Right in RTL) */}
          <div className="bg-brand-charcoal/40 border border-brand-border/80 rounded-sm p-6 sm:p-8 space-y-4 text-right" dir="rtl">
            <span className="inline-block px-2.5 py-1 bg-brand-gold/15 text-brand-gold text-[10px] font-mono rounded-full mb-2">
              النسخة الرسمية بالعربية
            </span>
            <div className="prose prose-invert prose-brand max-w-none">
              {renderContent(page.contentAr)}
            </div>
          </div>

          {/* English Version (Left in LTR) */}
          <div className="bg-brand-charcoal/40 border border-brand-border/80 rounded-sm p-6 sm:p-8 space-y-4 text-left" dir="ltr">
            <span className="inline-block px-2.5 py-1 bg-brand-stone text-brand-cream/70 text-[10px] font-mono rounded-full mb-2">
              English Atelier Reference
            </span>
            <div className="prose prose-invert prose-brand max-w-none">
              {renderContent(page.contentEn)}
            </div>
          </div>
        </div>

        {/* Concierge Help Box */}
        <div className="mt-16 p-6 sm:p-8 bg-brand-charcoal/70 border border-brand-gold/40 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-right rtl:sm:text-right">
            <h4 className="text-base font-bold text-brand-ivory font-serif">
              هل لديك استفسار إضافي حول هذه الصفحة أو طلبيتك؟
            </h4>
            <p className="text-xs text-brand-cream/70 font-sans">
              تواصل مباشرة مع كونسيرج أثير بالقاهرة عبر الواتساب الرسمي وسنرد فوراً.
            </p>
          </div>
          <a
            href="https://wa.me/201015993802"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-brand-gold text-brand-black text-xs font-mono font-bold uppercase tracking-wider rounded-xs hover:bg-brand-gold-hover transition-colors shadow-gold shrink-0"
          >
            محادثة كونسيرج أثير
          </a>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
