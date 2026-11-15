import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PromoOffersSection } from '@/components/PromoOffersSection';
import { CategoryShowcase } from '@/components/CategoryShowcase';
import { ProductGrid } from '@/components/ProductGrid';
import { AtelierStory } from '@/components/AtelierStory';
import { FutureTeaser } from '@/components/FutureTeaser';
import { LuxuryFeatures } from '@/components/LuxuryFeatures';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { StorefrontQrModal } from '@/components/StorefrontQrModal';
import { Footer } from '@/components/Footer';
import { FloatingCartToast } from '@/components/FloatingCartToast';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { getThemeConfig } from '@/lib/themeService';
import { getSectionsOrder } from '@/lib/builderService';
import { ShieldCheck, MessageCircle, Clock, Flame } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  const theme = getThemeConfig();
  const sections = getSectionsOrder();

  // If Owner activated Maintenance Mode
  if (theme.maintenanceMode) {
    return (
      <main className="min-h-screen bg-brand-black text-brand-ivory flex flex-col justify-between items-center text-center p-6 selection:bg-brand-gold selection:text-brand-black font-sans">
        <div className="pt-8 flex items-center space-x-2 rtl:space-x-reverse">
          <span className="font-sans font-black text-3xl tracking-[0.2em] text-brand-ivory">ATHEER</span>
          <span className="text-brand-gold text-2xl font-light">/</span>
          <span className="font-arabic font-bold text-3xl text-brand-gold">أثير</span>
        </div>

        <div className="max-w-xl space-y-6 py-12">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 bg-brand-gold/15 text-brand-gold border border-brand-gold/30 rounded-full text-xs font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>ATELIER MAINTENANCE MODE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-black text-brand-ivory leading-tight">
            {theme.maintenanceMessageAr || 'جاري تجهيز الإصدار الشتوي القادم... سنعود للعمل قريباً!'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-cream/70 font-mono">
            {theme.maintenanceMessageEn || 'Our digital atelier is preparing the next drop. Back online shortly.'}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/201015993802"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-xs flex items-center justify-center space-x-2 rtl:space-x-reverse transition-colors shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span>تواصل مع كونسيرج أثير (واتساب)</span>
            </a>
          </div>
        </div>

        <div className="text-[11px] text-brand-cream/40 font-mono pb-4">
          © 2026 ATHEER Luxury Streetwear • Cairo, Egypt
        </div>
      </main>
    );
  }

  // Section Component Registry
  const renderSection = (id: string, type: string) => {
    switch (id) {
      case 'hero':
        return <Hero key="hero" />;
      case 'offers':
        return <PromoOffersSection key="offers" />;
      case 'categories':
        return <CategoryShowcase key="categories" />;
      case 'products':
        return <ProductGrid key="products" />;
      case 'story':
        return <AtelierStory key="story" />;
      case 'future':
        return <FutureTeaser key="future" />;
      case 'features':
        return <LuxuryFeatures key="features" />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-brand-black text-brand-ivory flex flex-col selection:bg-brand-gold selection:text-brand-black pb-20 sm:pb-0">
      {/* Global Navigation & Header */}
      <Header />

      {/* Dynamic Section Sequence (Ordered and Filtered by Visual Builder) */}
      {sections.filter((s) => s.enabled).map((s) => renderSection(s.id, s.type))}

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* WhatsApp Drop & Sizing Concierge */}
      <WhatsAppButton />

      {/* Permanent Store QR Code Quick Scanner Widget */}
      <StorefrontQrModal />

      {/* Sleek Floating Cart Notification Toast (Video Replica) */}
      <FloatingCartToast />

      {/* JSON-LD Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ClothingStore',
            name: 'ATHEER | أثير',
            alternateName: 'ATHEER Luxury Streetwear',
            url: 'https://atheer.store',
            description: 'Egyptian luxury streetwear brand specializing in heavyweight 500 GSM hoodies and premium apparel.',
            currenciesAccepted: 'EGP',
            paymentAccepted: 'Cash on Delivery, InstaPay, Mobile Wallets',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'EG',
              addressLocality: 'Cairo',
            },
            telephone: '+201015993802',
          }),
        }}
      />
    </main>
  );
}
