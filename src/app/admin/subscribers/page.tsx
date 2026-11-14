'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { adminFetch } from '@/lib/adminAuthClient';
import { Mail, Search, Download, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminSubscribersPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/subscribers');
      const data = await res.json();
      if (data.success && Array.isArray(data.subscribers)) {
        setSubscribers(data.subscribers);
      }
    } catch (e) {
      console.error('Failed to load subscribers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleExportCsv = () => {
    if (subscribers.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Email,Locale,SubscribedAt']
        .concat(subscribers.map((s) => `${s.email},${s.locale || 'ar'},${s.subscribedAt}`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `atheer_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter((s) => s.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <Mail className="w-6 h-6 text-brand-gold" />
            <h1 className="text-xl sm:text-2xl font-serif font-black text-brand-ivory">
              {isAr ? 'المشتركون في النشرة البريدية والإطلاقات' : 'Newsletter Subscribers'}
            </h1>
          </div>
          <p className="text-xs text-brand-cream/60 mt-1">
            {isAr
              ? 'قائمة العملاء المشتركين لتلقي إشعارات دروبات الشتاء وتنبيهات إصدارات التي شيرت القادمة'
              : 'Customer emails subscribed for exclusive drops and release announcements'}
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={subscribers.length === 0}
          className="px-5 py-2.5 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-2 rtl:space-x-reverse shadow-gold disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isAr ? 'تصدير القائمة (CSV)' : 'Export CSV'}</span>
        </button>
      </div>

      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
          <span className="text-xs font-mono text-brand-gold font-bold">
            {isAr ? `إجمالي المشتركين: ${subscribers.length}` : `Total Subscribers: ${subscribers.length}`}
          </span>

          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث بالبريد...' : 'Search email...'}
              className="bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-9 py-1.5 rounded-xs font-mono w-64"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center py-8 text-xs font-mono text-brand-cream/50">
            {isAr ? 'لا يوجد مشتركون مطابقون' : 'No subscribers match.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs font-mono">
              <thead className="bg-brand-stone/40 text-brand-cream/60 border-b border-brand-border">
                <tr>
                  <th className="py-2.5 px-3 text-start">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'اللغة' : 'Locale'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'تاريخ الاشتراك' : 'Subscription Date'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-brand-stone/20 transition-colors">
                    <td className="py-3 px-3 font-bold text-brand-ivory">{s.email}</td>
                    <td className="py-3 px-3 text-center uppercase text-[10px] text-brand-cream/60">
                      {s.locale || 'ar'}
                    </td>
                    <td className="py-3 px-3 text-center text-brand-cream/60">
                      {new Date(s.subscribedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-emerald-400 font-bold text-[10px]">
                        {isAr ? 'نشط' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
