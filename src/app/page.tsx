import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CategoryShowcase } from '@/components/CategoryShowcase';
import { ProductGrid } from '@/components/ProductGrid';
import { AtelierStory } from '@/components/AtelierStory';
import { FutureTeaser } from '@/components/FutureTeaser';
import { LuxuryFeatures } from '@/components/LuxuryFeatures';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-black text-brand-ivory flex flex-col selection:bg-brand-gold selection:text-brand-black">
      {/* Global Navigation & Header */}
      <Header />

      {/* Hero Showcase (Heavyweight Hoodies Focus) */}
      <Hero />

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
    </main>
  );
}
