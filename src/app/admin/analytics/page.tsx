'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Truck,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  Award,
  Flame,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { language, formatPrice, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<'today' | '7days' | '30days' | 'all'>('all');
  const [data, setData] = useState<any>({
    metrics: {
      totalOrders: 0,
      grossRevenue: 0,
      netRevenue: 0,
      deliveredRevenue: 0,
      averageOrderValue: 0,
    },
    statusCounts: {},
    governoratesBreakdown: [],
    topProducts: [],
  });

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminFetch(`/api/admin/analytics?range=${range}`);
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Orders', data.metrics?.totalOrders || 0],
      ['Gross Revenue (EGP)', data.metrics?.grossRevenue || 0],
      ['Net Revenue (EGP)', data.metrics?.netRevenue || 0],
      ['Average Order Value (EGP)', data.metrics?.averageOrderValue || 0],
      [],
      ['Governorate', 'Orders Count', 'Revenue (EGP)'],
      ...(data.governoratesBreakdown || []).map((g: any) => [g.name, g.count, g.revenue]),
      [],
      ['Top Garment', 'Pieces Sold', 'Total Revenue (EGP)'],
      ...(data.topProducts || []).map((p: any) => [p.nameAr || p.nameEn, p.quantity, p.revenue]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `atheer_sales_report_${range}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border/80">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-[11px] font-mono uppercase tracking-widest text-brand-gold mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>{isAr ? 'تقارير المبيعات والإيرادات' : 'Sales Analytics & Revenue Reports'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-brand-ivory">
            {isAr ? 'مؤشرات الأداء المالي والمبيعات بالجنيه المصري' : 'EGP Revenue & Performance Dashboard'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-0.5">
            {isAr
              ? 'متابعة صافي المبيعات، متوسط قيمة السلة، توزيع الطلبات على محافظات مصر، والقطع الأكثر مبيعاً.'
              : 'Real-time sales tracking, governorate distribution, and bestselling garments.'}
          </p>
        </div>

        {/* Timeframe Filter & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-brand-stone/60 border border-brand-border rounded-xs p-0.5 flex text-xs font-mono">
            {[
              { id: 'today', labelAr: 'اليوم', labelEn: 'Today' },
              { id: '7days', labelAr: '٧ أيام', labelEn: '7 Days' },
              { id: '30days', labelAr: '٣٠ يوماً', labelEn: '30 Days' },
              { id: 'all', labelAr: 'الكل', labelEn: 'All Time' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRange(t.id as any)}
                className={`px-3 py-1.5 rounded-xs transition-colors ${
                  range === t.id ? 'bg-brand-gold text-brand-black font-bold' : 'text-brand-cream/70 hover:text-brand-ivory'
                }`}
              >
                {isAr ? t.labelAr : t.labelEn}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-brand-charcoal border border-brand-border text-brand-ivory hover:border-brand-gold text-xs font-mono rounded-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-brand-gold" />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-brand-charcoal border border-brand-border text-brand-cream/80 hover:border-brand-gold text-xs font-mono rounded-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isAr ? 'طباعة' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-brand-cream/60 text-xs font-mono">
            <span>{isAr ? 'إجمالي المبيعات' : 'Gross Revenue'}</span>
            <DollarSign className="w-4 h-4 text-brand-gold" />
          </div>
          <p className="text-2xl font-black font-serif text-brand-gold">
            {formatPrice(data.metrics?.grossRevenue || 0)}
          </p>
          <p className="text-[10px] text-brand-cream/50 font-mono">
            {isAr ? 'شاملاً كافة الطلبات المسجلة' : 'Total gross order value'}
          </p>
        </div>

        {/* Net Delivered / In Transit */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-brand-cream/60 text-xs font-mono">
            <span>{isAr ? 'صافي المبيعات الفعلي' : 'Net Active Revenue'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-serif text-brand-ivory">
            {formatPrice(data.metrics?.netRevenue || 0)}
          </p>
          <p className="text-[10px] text-emerald-400 font-mono">
            {isAr ? 'باستثناء الطلبات الملغاة' : 'Excluding cancelled orders'}
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-brand-cream/60 text-xs font-mono">
            <span>{isAr ? 'عدد الطلبات المسجلة' : 'Total Orders'}</span>
            <ShoppingBag className="w-4 h-4 text-brand-cream" />
          </div>
          <p className="text-2xl font-black font-serif text-brand-ivory">
            {data.metrics?.totalOrders || 0}
          </p>
          <p className="text-[10px] text-brand-cream/50 font-mono">
            {isAr ? 'خلال الفترة المحددة' : 'In selected timeframe'}
          </p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-brand-cream/60 text-xs font-mono">
            <span>{isAr ? 'متوسط قيمة الطلب' : 'Average Order Value (AOV)'}</span>
            <Award className="w-4 h-4 text-brand-gold" />
          </div>
          <p className="text-2xl font-black font-serif text-brand-gold">
            {formatPrice(data.metrics?.averageOrderValue || 0)}
          </p>
          <p className="text-[10px] text-brand-cream/50 font-mono">
            {isAr ? 'معدل سلة العميل المصري' : 'Average basket size'}
          </p>
        </div>
      </div>

      {/* Middle Grid: Governorate Breakdown & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Egyptian Governorates Distribution (Span 7) */}
        <div className="lg:col-span-7 bg-brand-charcoal border border-brand-border/80 rounded-sm p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <MapPin className="w-4 h-4 text-brand-gold" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ivory">
                {isAr ? 'توزيع المبيعات على محافظات جمهورية مصر العربية' : 'Sales by Egyptian Governorate'}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-brand-cream/60">
              {data.governoratesBreakdown?.length || 0} {isAr ? 'محافظة' : 'Govs'}
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {data.governoratesBreakdown?.length === 0 ? (
              <p className="text-xs font-mono text-brand-cream/50 py-8 text-center">
                {isAr ? 'لا توجد بيانات شحن لهذه الفترة.' : 'No data in this period.'}
              </p>
            ) : (
              data.governoratesBreakdown.map((gov: any, idx: number) => {
                const maxRevenue = data.governoratesBreakdown[0]?.revenue || 1;
                const percent = Math.min(100, Math.round((gov.revenue / maxRevenue) * 100));

                return (
                  <div key={idx} className="space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-brand-ivory font-bold">{gov.name}</span>
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="text-brand-cream/60">{gov.count} {isAr ? 'طلب' : 'orders'}</span>
                        <span className="text-brand-gold font-bold">{formatPrice(gov.revenue)}</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-brand-stone rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-gold rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Order Status Distribution (Span 5) */}
        <div className="lg:col-span-5 bg-brand-charcoal border border-brand-border/80 rounded-sm p-5 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 rtl:space-x-reverse pb-3 border-b border-brand-border/60">
            <Truck className="w-4 h-4 text-brand-gold" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ivory">
              {isAr ? 'حالات الطلبات والتوصيل' : 'Order Status Breakdown'}
            </h3>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {[
              { key: 'delivered', labelAr: 'تم التسليم بنجاح', labelEn: 'Delivered', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
              { key: 'shipped', labelAr: 'مع مندوب الشحن', labelEn: 'With Courier', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
              { key: 'processing', labelAr: 'قيد التجهيز والتطريز', labelEn: 'Processing', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
              { key: 'confirmed', labelAr: 'مؤكد', labelEn: 'Confirmed', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
              { key: 'pending', labelAr: 'قيد المراجعة', labelEn: 'Pending Review', color: 'text-brand-cream/80 bg-brand-stone border-brand-border' },
              { key: 'cancelled', labelAr: 'ملغي / مرتجع', labelEn: 'Cancelled / Returned', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
            ].map((st) => (
              <div
                key={st.key}
                className="flex items-center justify-between p-2.5 bg-brand-black/40 border border-brand-border/60 rounded-xs"
              >
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.color}`}>
                  {isAr ? st.labelAr : st.labelEn}
                </span>
                <span className="font-bold text-brand-ivory">
                  {data.statusCounts?.[st.key] || 0} {isAr ? 'طلب' : 'orders'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Top-Selling Streetwear Garments */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Flame className="w-4 h-4 text-brand-gold" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ivory">
              {isAr ? 'القطع الأكثر مبيعاً وإقبالاً (Best Sellers)' : 'Bestselling Garments'}
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right font-sans">
            <thead className="bg-brand-stone/40 border-b border-brand-border/60 text-brand-cream/70 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">{isAr ? 'اسم القطعة ومواصفاتها' : 'Garment'}</th>
                <th className="py-2.5 px-4">{isAr ? 'القطع المباعة' : 'Units Sold'}</th>
                <th className="py-2.5 px-4">{isAr ? 'إجمالي الإيراد' : 'Total Revenue'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 font-mono">
              {data.topProducts?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-brand-cream/50">
                    {isAr ? 'لا توجد مبيعات مسجلة في هذا النطاق.' : 'No sales recorded yet.'}
                  </td>
                </tr>
              ) : (
                data.topProducts.map((prod: any, idx: number) => (
                  <tr key={idx} className="hover:bg-brand-stone/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-gold">#{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-brand-ivory">
                      <p>{isAr ? prod.nameAr : prod.nameEn}</p>
                      <p className="text-[10px] text-brand-cream/50 font-normal">{isAr ? prod.nameEn : prod.nameAr}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-cream">
                      {prod.quantity} {isAr ? 'قطعة' : 'pieces'}
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-gold">
                      {formatPrice(prod.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
