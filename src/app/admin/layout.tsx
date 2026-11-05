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
  Image as ImageIcon,
} from 'lucide-react';
import { ensureValidAdminSession, clearAdminToken, initAdminAuthSync } from '@/lib/adminAuthClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, isRtl } = useLanguage();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDbInfo, setShowDbInfo] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ configured: boolean }>({ configured: false });
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);

  // If on /admin/login, don't show the dashboard shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Check if Supabase keys exist in public environment
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isConfigured = Boolean(
      url &&
      publishableKey &&
      !url.includes('your-project-id') &&
      !url.includes('<') &&
      !publishableKey.includes('...') &&
      !publishableKey.includes('<')
    );
    setSupabaseStatus({ configured: isConfigured });

    if (isLoginPage) {
      setIsVerifyingAuth(false);
      return;
    }

    let isMounted = true;
    const verifyAuth = async () => {
      const validToken = await ensureValidAdminSession();
      if (!isMounted) return;

      if (!validToken) {
        // Unauthenticated or expired session: redirect to login
        router.push('/admin/login?reason=expired');
      } else {
        setIsVerifyingAuth(false);
      }
    };

    verifyAuth();

    const unsubscribe = initAdminAuthSync(() => {
      if (isMounted) {
        router.push('/admin/login?reason=expired');
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    clearAdminToken();

    // If Supabase is connected, sign out from Supabase client
    try {
      const { getSupabaseClient } = await import('@/lib/supabaseClient');
      const client = getSupabaseClient();
      if (client) {
        await client.auth.signOut();
      }
    } catch (e) {
      // Ignore
    }

    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <div className="min-h-screen bg-brand-black text-brand-ivory">{children}</div>;
  }

  if (isVerifyingAuth) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center font-mono text-xs text-brand-gold">
        <ShieldCheck className="w-5 h-5 animate-pulse mr-2 rtl:ml-2" />
        <span>Verifying Administrator Access...</span>
      </div>
    );
  }

  const menuItems = [
    { labelEn: 'Overview', labelAr: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
    { labelEn: 'Products', labelAr: 'المنتجات', href: '/admin/products', icon: Package },
    { labelEn: 'Orders', labelAr: 'الطلبات', href: '/admin/orders', icon: ShoppingBag },
    { labelEn: 'Inventory', labelAr: 'المخزون', href: '/admin/inventory', icon: Layers },
    { labelEn: 'Egypt Shipping', labelAr: 'شحن المحافظات', href: '/admin/shipping', icon: Truck },
    { labelEn: 'Coupons', labelAr: 'كوبونات الخصم', href: '/admin/coupons', icon: Tag },
    { labelEn: 'Storefront CMS', labelAr: 'التحكم باللوحة الرئيسية (الواجهة)', href: '/admin/content', icon: ImageIcon },
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
              <span>{supabaseStatus.configured ? 'Supabase: Connected' : 'Supabase: Not Configured'}</span>
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

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-2.5 text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/20 font-mono border border-rose-900/30 transition-colors"
          >
            <span className="flex items-center space-x-2 rtl:space-x-reverse">
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </span>
          </button>
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

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-brand-cream/60 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Database Status Modal */}
        {showDbInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-brand-charcoal border border-brand-border w-full max-w-md p-6 rounded-sm shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/80 pb-3">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-gold font-mono text-xs uppercase font-bold">
                  <Database className="w-4 h-4" />
                  <span>Database & Authentication Status</span>
                </div>
                <button onClick={() => setShowDbInfo(false)} className="text-brand-cream/50 hover:text-brand-ivory">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs leading-relaxed">
                <div className="p-3 bg-brand-stone/30 border border-brand-border rounded-xs">
                  <span className="text-brand-cream/60 block text-[10px] uppercase">Supabase Cloud Connection:</span>
                  <span className="font-bold text-brand-ivory">
                    {supabaseStatus.configured ? 'Active (Cloud Database)' : 'Not Connected (Missing Credentials)'}
                  </span>
                </div>

                <p className="text-brand-cream/70 text-[11px]">
                  {supabaseStatus.configured
                    ? 'All products, inventory logs, and customer orders persist directly in your Supabase PostgreSQL cluster.'
                    : 'The application is running with in-memory development runtime stores. To achieve production persistence, supply NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your .env.local file.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowDbInfo(false)}
                  className="px-4 py-2 bg-brand-stone border border-brand-border text-brand-ivory text-xs font-mono rounded-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 bg-brand-charcoal border-r border-brand-border p-5 flex flex-col justify-between z-10 font-sans">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-brand-border/60 mb-6">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="font-bold text-lg text-brand-ivory">ATHEER</span>
                  <span className="text-brand-gold">/</span>
                  <span className="font-arabic font-bold text-lg text-brand-gold">أثير</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-brand-cream/60 hover:text-brand-ivory"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
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
                      className={`flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 text-xs font-mono rounded-sm ${
                        isActive
                          ? 'bg-brand-gold text-brand-black font-bold'
                          : 'text-brand-cream/80 hover:bg-brand-stone/40'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-brand-border/60 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse py-2 border border-rose-900/40 text-rose-400 text-xs font-mono"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
