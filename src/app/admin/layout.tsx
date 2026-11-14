'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Bell,
  MessageCircle,
  Check,
  Award,
  Users,
  Percent,
  Mail,
} from 'lucide-react';
import { ensureValidAdminSession, clearAdminToken, initAdminAuthSync } from '@/lib/adminAuthClient';

function playOrderChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };

    // Cheerful upward chime (C5 -> E5 -> G5)
    playTone(523.25, now, 0.18);
    playTone(659.25, now + 0.12, 0.18);
    playTone(783.99, now + 0.24, 0.38);
  } catch (e) {
    // Audio restricted or uninitialized before user interaction
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, isRtl } = useLanguage();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDbInfo, setShowDbInfo] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ configured: boolean }>({ configured: false });
  const [adminEmail, setAdminEmail] = useState<string>('yassinanwar140@gmail.com');

  // Real-time Notification State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [activeAlertToast, setActiveAlertToast] = useState<any | null>(null);
  const prevUnreadRef = useRef<number>(0);

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
        // Fetch current active admin email
        import('@/lib/adminAuthClient').then(({ adminFetch }) => {
          adminFetch('/api/admin/credentials')
            .then((res) => res.json())
            .then((data) => {
              if (isMounted && data.success && data.email) {
                setAdminEmail(data.email);
              }
            })
            .catch(() => {});
        });
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

  // Polling for incoming order notifications
  useEffect(() => {
    if (isLoginPage) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const { adminFetch } = await import('@/lib/adminAuthClient');
        const res = await adminFetch('/api/admin/notifications', {}, { redirectOnUnauthorized: false });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setNotifications(data.notifications || []);
            const newUnread = Number(data.unreadCount || 0);

            // If a new unread order arrived since last poll
            if (prevUnreadRef.current !== undefined && newUnread > prevUnreadRef.current) {
              const latest = (data.notifications || [])[0];
              if (latest && !latest.read) {
                setActiveAlertToast(latest);
                playOrderChime();
              }
            }
            prevUnreadRef.current = newUnread;
            setUnreadCount(newUnread);
          }
        }
      } catch (e) {
        // Silently handle polling errors
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 6000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isLoginPage]);

  const handleMarkAllRead = async () => {
    try {
      const { adminFetch } = await import('@/lib/adminAuthClient');
      await adminFetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all' }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      prevUnreadRef.current = 0;
    } catch (e) {
      // Ignore
    }
  };

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

  const menuItems = [
    { labelEn: 'Overview', labelAr: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
    { labelEn: 'Products', labelAr: 'المنتجات', href: '/admin/products', icon: Package },
    { labelEn: 'Orders', labelAr: 'الطلبات', href: '/admin/orders', icon: ShoppingBag },
    { labelEn: 'Inventory', labelAr: 'المخزون', href: '/admin/inventory', icon: Layers },
    { labelEn: 'Egypt Shipping', labelAr: 'شحن المحافظات', href: '/admin/shipping', icon: Truck },
    { labelEn: 'Coupons', labelAr: 'كوبونات الخصم', href: '/admin/coupons', icon: Tag },
    { labelEn: 'Loyalty Rewards', labelAr: 'برنامج الأختام والمكافآت', href: '/admin/loyalty', icon: Award },
    { labelEn: 'Bundle Promotions', labelAr: 'عروض الباندل والخصومات', href: '/admin/promotions', icon: Percent },
    { labelEn: 'Staff & Roles', labelAr: 'فريق العمل والصلاحيات', href: '/admin/staff', icon: Users },
    { labelEn: 'Subscribers', labelAr: 'المشتركين بالنشرة', href: '/admin/subscribers', icon: Mail },
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
                  className={`flex items-center justify-between px-3.5 py-3 text-xs font-mono tracking-wider transition-all rounded-sm ${
                    isActive
                      ? 'bg-brand-gold text-brand-black font-bold shadow-gold'
                      : 'text-brand-cream/80 hover:text-brand-gold hover:bg-brand-stone/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                  </div>

                  {item.href === '/admin/orders' && unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-bold animate-pulse font-mono shadow-sm">
                      +{unreadCount}
                    </span>
                  )}
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

          {/* View Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-2.5 text-[10px] font-mono text-brand-cream/70 hover:text-brand-gold hover:bg-brand-stone/30 transition-colors border border-brand-border/40 rounded-xs"
          >
            <span>{language === 'ar' ? 'عرض المتجر للعملاء' : 'View Public Store'}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse p-2 text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 rounded-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
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

          <div className="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse">
            {/* Real-time Order Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className={`relative p-2 rounded-sm border transition-colors ${
                  unreadCount > 0
                    ? 'border-emerald-500/80 bg-emerald-950/50 text-emerald-400 animate-pulse'
                    : 'border-brand-border bg-brand-stone/30 text-brand-cream/70 hover:text-brand-gold hover:border-brand-gold/50'
                }`}
                title={language === 'ar' ? 'إشعارات الطلبات الواردة' : 'Incoming Order Alerts'}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-mono font-bold flex items-center justify-center shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 bg-brand-charcoal border border-brand-border/90 rounded-sm shadow-2xl z-50 overflow-hidden font-mono text-xs animate-slide-down">
                  <div className="p-3 bg-brand-black border-b border-brand-border/60 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse font-bold text-brand-gold">
                      <Bell className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'إشعارات الطلبات' : 'Order Alerts'}</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-500/40 rounded-xs">
                          {unreadCount} {language === 'ar' ? 'جديد' : 'new'}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-brand-cream/60 hover:text-brand-gold transition-colors"
                      >
                        {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-brand-border/40">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-brand-cream/40 text-[11px]">
                        {language === 'ar' ? 'لا توجد إشعارات حالياً' : 'No incoming notifications'}
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 transition-colors ${
                            notif.read ? 'bg-brand-charcoal/50 opacity-70' : 'bg-emerald-950/20 border-l-2 rtl:border-l-0 rtl:border-r-2 border-emerald-500'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-brand-ivory text-[11px]">{notif.title}</div>
                              <div className="text-[10px] text-brand-cream/70 font-sans mt-0.5 line-clamp-2">
                                {notif.message}
                              </div>
                              <div className="text-[9px] text-brand-gold/60 mt-1 font-mono">
                                {new Date(notif.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 rtl:space-x-reverse flex-shrink-0">
                              <Link
                                href="/admin/orders"
                                onClick={() => setShowNotificationsDropdown(false)}
                                className="p-1 hover:text-brand-gold text-brand-cream/60 transition-colors"
                                title={language === 'ar' ? 'عرض الطلب' : 'View Order'}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              {notif.customerPhone && (
                                <a
                                  href={`https://wa.me/${notif.customerPhone.startsWith('0') ? '2' + notif.customerPhone : notif.customerPhone}?text=${encodeURIComponent(
                                    `أهلاً بك يا ${notif.customerName || 'عميلنا العزيز'} 👋 بخصوص طلبك ${notif.orderReference || ''} في دار أثير!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                                  title={language === 'ar' ? 'مراسلة العميل على واتساب' : 'WhatsApp'}
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
              {adminEmail}
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

        {/* Floating Active Order Alert Toast with sound trigger */}
        {activeAlertToast && (
          <div className="fixed top-20 right-4 rtl:right-auto rtl:left-4 z-50 max-w-sm w-full bg-gradient-to-r from-emerald-950 via-brand-charcoal to-brand-charcoal border-2 border-emerald-500 rounded-sm shadow-2xl p-4 animate-bounce-subtle font-mono text-xs">
            <div className="flex items-start justify-between pb-2 border-b border-brand-border/60">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-400 font-bold">
                <Bell className="w-4 h-4 animate-pulse" />
                <span>{language === 'ar' ? '🔔 طلب جديد وصل الآن!' : '🔔 New Order Received!'}</span>
              </div>
              <button onClick={() => setActiveAlertToast(null)} className="text-brand-cream/50 hover:text-brand-ivory">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-brand-ivory text-[11px] font-sans leading-relaxed">
              {activeAlertToast.message}
            </div>
            <div className="mt-3 flex items-center justify-end space-x-2 rtl:space-x-reverse">
              <Link
                href="/admin/orders"
                onClick={() => setActiveAlertToast(null)}
                className="px-3 py-1.5 bg-brand-gold text-black font-bold uppercase rounded-xs text-[10px] hover:bg-brand-gold-hover transition-colors shadow-sm"
              >
                {language === 'ar' ? 'عرض الطلبات' : 'View Orders'}
              </Link>
            </div>
          </div>
        )}

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
                  className="px-4 py-2 bg-brand-gold text-brand-black text-xs font-bold uppercase rounded-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
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
                      className={`flex items-center justify-between px-3 py-2.5 text-xs font-mono rounded-sm ${
                        isActive
                          ? 'bg-brand-gold text-brand-black font-bold'
                          : 'text-brand-cream/80 hover:bg-brand-stone/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Icon className="w-4 h-4" />
                        <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                      </div>
                      {item.href === '/admin/orders' && unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-bold">
                          +{unreadCount}
                        </span>
                      )}
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
                <span>{language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
