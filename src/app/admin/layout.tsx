'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Truck,
  Tag,
  Settings,
  ExternalLink,
  LogOut,
  Globe,
  Database,
  Menu,
  X,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, isRtl } = useLanguage();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDbInfo, setShowDbInfo] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ configured: boolean }>({ configured: false });

  // If on /admin/login, don't show the dashboard shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Check if Supabase keys exist in public environment
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isConfigured = Boolean(
      url && anon && !url.includes('your-project-id') && !anon.includes('...')
    );
    setSupabaseStatus({ configured: isConfigured });
  }, []);

  if (isLoginPage) {
    return <div className="min-h-screen bg-brand-black text-brand-ivory">{children}</div>;
  }

  const menuItems = [
    { labelEn: 'Overview', labelAr: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
    { labelEn: 'Products', labelAr: 'المنتجات', href: '/admin/products', icon: Package },
    { labelEn: 'Orders', labelAr: 'الطلبات', href: '/admin/orders', icon: ShoppingBag },
    { labelEn: 'Inventory', labelAr: 'المخزون', href: '/admin/inventory', icon: Layers },
    { labelEn: 'Egypt Shipping', labelAr: 'شحن المحافظات', href: '/admin/shipping', icon: Truck },
    { labelEn: 'Coupons', labelAr: 'كوبونات الخصم', href: '/admin/coupons', icon: Tag },
    { labelEn: 'Store Settings', labelAr: 'إعدادات المتجر', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory flex font-sans">
      {/* Desktop Sidebar (Left in LTR, Right in RTL) */}
      <aside className="hidden lg:flex w-64 bg-brand-charcoal border-r rtl:border-l rtl:border-r-0 border-brand-border/80 flex-col justify-between p-5 z-20">
        <div>
          {/* Brand Header */}
          <div className="pb-6 border-b border-brand-border/60 mb-6">
            <Link href="/admin" className="flex items-center space-x-2.5 rtl:space-x-reverse">
              <span className="font-sans font-black text-xl tracking-[0.2em] text-brand-ivory">ATHEER</span>
              <span className="text-brand-gold text-lg">/</span>
              <span className="font-arabic font-bold text-xl text-brand-gold">أثير</span>
            </Link>
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-[9px] uppercase tracking-widest text-brand-gold font-mono mt-1">
              <ShieldCheck className="w-3 h-3 text-brand-gold" />
              <span>Admin Management Hub</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 rtl:space-x-reverse px-3.5 py-3 text-xs font-mono tracking-wider transition-all rounded-sm ${
                    isActive
                      ? 'bg-brand-gold text-brand-black font-bold shadow-gold'
                      : 'text-brand-cream/80 hover:text-brand-gold hover:bg-brand-stone/30'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Status & External Links */}
        <div className="pt-6 border-t border-brand-border/60 space-y-3">
          {/* Supabase Status Chip */}
          <button
            onClick={() => setShowDbInfo(!showDbInfo)}
            className={`w-full text-left rtl:text-right p-2.5 border text-[10px] font-mono transition-colors flex items-center justify-between ${
              supabaseStatus.configured
                ? 'border-emerald-600/60 bg-emerald-950/30 text-emerald-300'
                : 'border-amber-600/60 bg-amber-950/30 text-amber-300'
            }`}
          >
            <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <Database className="w-3.5 h-3.5" />
              <span>{supabaseStatus.configured ? 'Supabase: Connected' : 'Supabase: Local Mode'}</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          </button>

          {/* Visit Storefront */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-2.5 text-xs text-brand-cream/70 hover:text-brand-gold font-mono border border-brand-border/40 hover:border-brand-gold/60 transition-colors"
          >
            <span className="flex items-center space-x-2 rtl:space-x-reverse">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'عرض المتجر للعملاء' : 'View Storefront'}</span>
            </span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Admin Bar */}
        <header className="h-16 bg-brand-charcoal border-b border-brand-border/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-brand-ivory hover:text-brand-gold"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-brand-gold hidden sm:inline uppercase">
              ATHEER / أثير • Egypt Admin Console
            </span>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center space-x-1 rtl:space-x-reverse text-xs text-brand-ivory hover:text-brand-gold font-mono px-2.5 py-1 border border-brand-border rounded-sm"
            >
              <Globe className="w-3.5 h-3.5 opacity-70" />
              <span>{language === 'en' ? 'عربي' : 'EN'}</span>
            </button>

            {/* Admin Badge */}
            <span className="hidden sm:inline-block text-[11px] font-mono text-brand-gold bg-brand-black px-2.5 py-1 border border-brand-gold/40">
              admin@atheer.store
            </span>

            {/* Logout Link */}
            <Link
              href="/admin/login"
              className="p-2 text-brand-muted hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Database Status Modal */}
        {showDbInfo && (
          <div className="p-4 bg-brand-black border-b border-brand-border text-xs font-mono animate-slide-down">
            <div className="max-w-4xl mx-auto flex items-start justify-between">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-brand-gold">
                    {supabaseStatus.configured
                      ? 'Production Supabase Database Connected'
                      : 'Notice: Operating in Local Administrative Runtime'}
                  </p>
                  <p className="text-[11px] text-brand-cream/70 leading-relaxed font-sans">
                    {supabaseStatus.configured
                      ? 'Orders, products, inventory movements, and shipping zones are synchronized with your Supabase PostgreSQL cluster.'
                      : 'Supabase project credentials have not yet been configured in `.env.local`. The dashboard is functioning with high-fidelity local memory storage. All migrations are ready in `supabase/migrations/`.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDbInfo(false)}
                className="text-brand-muted hover:text-brand-ivory p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div
            className={`fixed inset-y-0 ${
              isRtl ? 'right-0' : 'left-0'
            } max-w-xs w-full bg-brand-charcoal border-r rtl:border-l rtl:border-r-0 border-brand-border shadow-2xl p-6 flex flex-col justify-between overflow-y-auto`}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-brand-border">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="font-sans font-black text-xl text-brand-ivory">ATHEER</span>
                  <span className="text-brand-gold">/</span>
                  <span className="font-arabic font-bold text-xl text-brand-gold">أثير</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-brand-ivory/80 hover:text-brand-gold"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="py-6 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center space-x-3 rtl:space-x-reverse px-3.5 py-3 text-xs font-mono tracking-wider transition-all rounded-sm ${
                        isActive
                          ? 'bg-brand-gold text-brand-black font-bold'
                          : 'text-brand-cream/80 hover:text-brand-gold'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-brand-border">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-center py-3 text-xs text-brand-gold font-mono border border-brand-gold/60"
              >
                <span>{language === 'ar' ? 'عرض المتجر' : 'View Storefront'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
