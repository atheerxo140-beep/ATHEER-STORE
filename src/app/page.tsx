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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-black text-brand-ivory flex flex-col selection:bg-brand-gold selection:text-brand-black pb-20 sm:pb-0">
      {/* Global Navigation & Header */}
      <Header />

      {/* Hero Showcase (Heavyweight Hoodies Focus) */}
      <Hero />

      {/* Caesar EG Style Promotional Offers ("اختار عرضك") */}
      <PromoOffersSection />

      {/* Launch Categories (Hoodies, Sweatshirts, Fabric Lab, Future Tees) */}
      <CategoryShowcase />

      {/* Heavyweight Product Grid & Specs */}
      <ProductGrid />

      {/* Brand Streetwear Story & Heavyweight Philosophy */}
      <AtelierStory />

      {/* Dedicated Teaser for Upcoming Youth T-Shirts Drop */}
      <FutureTeaser />

      {/* Streetwear Trust & COD Express Services */}
      <LuxuryFeatures />

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

      {/* Native App-Style Mobile Bottom Navigation Bar (Video Replica) */}
      <MobileBottomNav />

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
