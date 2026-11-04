'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { StoredOrder } from '@/data/localOrdersStore';
import { Product } from '@/types';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  Check,
  XCircle,
  AlertTriangle,
  Flame,
  ArrowRight,
  ArrowLeft,
  Package,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { language, formatPrice, isRtl } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/admin/orders'),
          fetch('/api/admin/products'),
        ]);

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        if (ordersData.success) {
          setOrders(ordersData.orders || []);
        }
        if (productsData.success) {
          setProducts(productsData.products || []);
        }
      } catch (err) {
        console.error('Failed to load admin overview data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute Analytics
  const totalOrdersCount = orders.length;
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.createdAt?.slice(0, 10) === todayDateStr);

  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending');
  const confirmedOrders = orders.filter((o) => o.orderStatus === 'confirmed');
  const shippedOrders = orders.filter((o) => o.orderStatus === 'shipped');
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered');
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'cancelled');

  const totalSalesEgp = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const lowStockProducts = products.filter((p) => (p.inventory ?? 50) < 15);
  const bestSellers = products.filter((p) => p.isBestseller || p.isNewArrival).slice(0, 5);
  const recentOrders = orders.slice(0, 6);

  const statsCards = [
    {
      titleEn: 'Total Sales (EGP)',
      titleAr: 'إجمالي المبيعات (ج.م)',
      value: formatPrice(totalSalesEgp),
      icon: TrendingUp,
      color: 'text-brand-gold',
      borderColor: 'border-brand-gold/60',
    },
    {
      titleEn: 'Total Orders',
      titleAr: 'إجمالي الطلبات',
      value: totalOrdersCount.toString(),
      icon: ShoppingBag,
      color: 'text-brand-ivory',
      borderColor: 'border-brand-border',
    },
    {
      titleEn: "Today's Orders",
      titleAr: 'طلبات اليوم',
      value: todayOrders.length.toString(),
      icon: Clock,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
    },
    {
      titleEn: 'Pending COD Orders',
      titleAr: 'طلبات قيد الدفع عند الاستلام',
      value: pendingOrders.length.toString(),
      icon: Clock,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/40',
    },
    {
      titleEn: 'Shipped / In Transit',
      titleAr: 'تم الشحن مع المندوب',
      value: shippedOrders.length.toString(),
      icon: Truck,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/40',
    },
    {
      titleEn: 'Delivered Successfully',
      titleAr: 'تم التوصيل بنجاح',
      value: deliveredOrders.length.toString(),
      icon: CheckCircle2,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
    },
    {
      titleEn: 'Cancelled Orders',
      titleAr: 'الطلبات الملغاة',
      value: cancelledOrders.length.toString(),
      icon: XCircle,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/40',
    },
    {
      titleEn: 'Low Stock Alerts',
      titleAr: 'تنبيهات انخفاض المخزون',
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/40',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-brand-border/60">
        <div>
          <h1 className="font-sans font-black text-2xl sm:text-3xl uppercase tracking-tight">
            {language === 'ar' ? 'لوحة التحكم والعمليات — مصر' : 'Dashboard Overview — Egypt Market'}
          </h1>
          <p className="text-xs text-brand-cream/70 font-mono mt-1">
            {language === 'ar'
              ? 'متابعة حية للمبيعات، الطلبات، المخزون، وحالات شحن المحافظات بالجنيه المصري EGP.'
              : 'Real-time sales, order tracking, inventory management, and governorate deliveries.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-brand-gold text-brand-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-brand-gold-hover transition-colors shadow-gold"
          >
            {language === 'ar' ? 'إدارة الطلبات' : 'Manage Orders'}
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-brand-gold/60 text-brand-gold text-xs font-mono font-bold uppercase tracking-wider hover:bg-brand-gold hover:text-brand-black transition-colors"
          >
            {language === 'ar' ? 'إضافة منتج' : '+ New Product'}
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 bg-brand-charcoal border ${card.borderColor} flex items-center justify-between shadow-luxury-dark`}
            >
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-brand-cream/70">
                  {language === 'ar' ? card.titleAr : card.titleEn}
                </p>
                <p className={`font-mono text-2xl sm:text-3xl font-bold mt-2 ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-black border border-brand-border flex items-center justify-center">
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Orders & Best Sellers / Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Customer Orders (7 cols) */}
        <div className="lg:col-span-7 bg-brand-charcoal border border-brand-border p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <h2 className="font-sans font-bold text-base uppercase tracking-wider flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-brand-gold" />
              <span>{language === 'ar' ? 'أحدث طلبات العملاء' : 'Recent Customer Orders'}</span>
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-mono text-brand-gold hover:underline flex items-center"
            >
              <span>{language === 'ar' ? 'عرض الكل' : 'View All'}</span>
              <ArrowIcon className="w-3.5 h-3.5 ml-1 rtl:mr-1 rtl:ml-0" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-xs font-mono text-brand-cream/60">
              {language === 'ar' ? 'لا توجد طلبات مسجلة حتى الآن.' : 'No customer orders recorded yet.'}
            </div>
          ) : (
            <div className="divide-y divide-brand-border/40">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="py-3.5 flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="font-bold text-brand-gold">{ord.orderReference}</span>
                      <span className="text-brand-cream/60">•</span>
                      <span className="font-sans font-medium text-brand-ivory">{ord.customerName}</span>
                    </div>
                    <p className="text-[11px] text-brand-cream/60 mt-0.5">
                      {ord.shippingCity} ({ord.customerPhone})
                    </p>
                  </div>

                  <div className="text-right rtl:text-left">
                    <span className="font-bold text-brand-gold block">{formatPrice(ord.totalAmount)}</span>
                    <span
                      className={`text-[9px] uppercase px-2 py-0.5 border font-semibold inline-block mt-0.5 ${
                        ord.orderStatus === 'delivered'
                          ? 'border-emerald-500/60 text-emerald-400 bg-emerald-950/20'
                          : ord.orderStatus === 'cancelled'
                          ? 'border-rose-500/60 text-rose-400 bg-rose-950/20'
                          : 'border-brand-gold/60 text-brand-gold bg-brand-gold/10'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Best Selling Streetwear & Low Stock (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Best Sellers */}
          <div className="bg-brand-charcoal border border-brand-border p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h2 className="font-sans font-bold text-base uppercase tracking-wider flex items-center">
                <Flame className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-brand-gold" />
                <span>{language === 'ar' ? 'القطع الأكثر طلباً' : 'Flagship Collection'}</span>
              </h2>
              <Link href="/admin/products" className="text-xs font-mono text-brand-gold hover:underline">
                {language === 'ar' ? 'الكتالوج' : 'Catalog'}
              </Link>
            </div>

            <div className="divide-y divide-brand-border/40">
              {bestSellers.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-sans font-bold text-brand-ivory">
                      {language === 'ar' ? item.nameAr : item.nameEn}
                    </p>
                    <p className="text-[10px] text-brand-cream/60 font-mono">
                      {item.gsm} GSM • {item.category}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-brand-gold">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Warning Card */}
          {lowStockProducts.length > 0 && (
            <div className="bg-rose-950/20 border border-rose-800/60 p-5 space-y-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-rose-400 text-xs font-mono font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {language === 'ar' ? 'تنبيه: منتجات قاربت على النفاد' : 'Action Required: Low Stock'}
                </span>
              </div>
              <p className="text-xs text-rose-200/80 font-sans leading-relaxed">
                {language === 'ar'
                  ? `يوجد ${lowStockProducts.length} قطع مخزونها أقل من ١٥ قطعة. يرجى مراجعة صفحة المخزون لجدولة التوريد.`
                  : `${lowStockProducts.length} pieces are below 15 units in stock. Check inventory management.`}
              </p>
              <Link
                href="/admin/inventory"
                className="inline-block text-xs font-mono text-brand-gold hover:underline font-bold"
              >
                {language === 'ar' ? 'تعديل المخزون والتوريد ←' : 'Manage Inventory Levels →'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
