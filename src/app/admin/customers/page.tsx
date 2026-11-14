'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  Users,
  Search,
  MessageCircle,
  ShoppingBag,
  Award,
  MapPin,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const { language, formatPrice, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminFetch('/api/admin/customers');
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        setCustomers(data.customers);
      }
    } catch (e) {
      console.error('Failed to load customers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q));

    const matchesTier = selectedTier === 'all' || c.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Black_Edition':
        return 'bg-brand-black text-brand-gold border-brand-gold';
      case 'Gold':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Silver':
        return 'bg-slate-400/20 text-slate-200 border-slate-400/40';
      default:
        return 'bg-brand-stone text-brand-cream/70 border-brand-border';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border/80">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-[11px] font-mono uppercase tracking-widest text-brand-gold mb-1">
            <Users className="w-4 h-4" />
            <span>{isAr ? 'إدارة علاقات العملاء (CRM)' : 'Customer Directory & Accounts'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-brand-ivory">
            {isAr ? 'قاعدة بيانات عملاء أثير في مصر' : 'Customers & Registered Profiles'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-0.5">
            {isAr
              ? 'متابعة حسابات العملاء، أرقام الهواتف، إجمالي المشتريات بالجنيه المصري، أختام الولاء، والتواصل السريع عبر واتساب.'
              : 'Monitor customer spending, loyalty stamps, Egyptian phone contacts, and order histories.'}
          </p>
        </div>

        <button
          type="button"
          onClick={loadCustomers}
          disabled={loading}
          className="px-4 py-2 bg-brand-charcoal border border-brand-border text-brand-gold hover:border-brand-gold text-xs font-mono rounded-xs flex items-center space-x-1.5 rtl:space-x-reverse self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث البيانات' : 'Refresh'}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xl">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute top-2.5 left-3 rtl:left-auto rtl:right-3 text-brand-cream/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم، رقم المحمول، أو الإيميل...' : 'Search by name, phone or email...'}
            className="w-full bg-brand-stone/40 border border-brand-border pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs font-mono text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 rtl:space-x-reverse self-end sm:self-auto text-xs font-mono">
          <span className="text-brand-cream/60">{isAr ? 'الفئة:' : 'Tier:'}</span>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-brand-stone/60 border border-brand-border px-2.5 py-1.5 text-brand-ivory text-xs rounded-xs font-mono"
          >
            <option value="all">{isAr ? 'جميع العملاء' : 'All Tiers'}</option>
            <option value="Bronze">Bronze (برونزي)</option>
            <option value="Silver">Silver (فضي)</option>
            <option value="Gold">Gold (ذهبي)</option>
            <option value="Black_Edition">Black Edition (النخبة)</option>
            <option value="Guest">Guest (طلبات ضيوف)</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-brand-border/60 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-brand-ivory">
            {isAr ? `إجمالي العملاء المعروضين: ${filteredCustomers.length}` : `Displaying: ${filteredCustomers.length} Customers`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right font-sans">
            <thead className="bg-brand-stone/40 border-b border-brand-border/60 text-brand-cream/70 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">{isAr ? 'العميل' : 'Customer'}</th>
                <th className="py-3 px-4">{isAr ? 'بيانات الاتصال' : 'Contact'}</th>
                <th className="py-3 px-4">{isAr ? 'الفئة والولاء' : 'Tier & Stamps'}</th>
                <th className="py-3 px-4">{isAr ? 'إجمالي الطلبات' : 'Orders'}</th>
                <th className="py-3 px-4">{isAr ? 'إجمالي المشتريات' : 'Total Spent'}</th>
                <th className="py-3 px-4 text-center">{isAr ? 'تواصل واتساب' : 'WhatsApp'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 font-mono">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-cream/50">
                    {isAr ? 'لم يتم العثور على عملاء مطابقين للبحث.' : 'No matching customers found.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const cleanPhone = cust.phone ? cust.phone.replace(/\D/g, '') : '';
                  const waNumber = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;

                  return (
                    <tr key={cust.id} className="hover:bg-brand-stone/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-brand-ivory">
                        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                          <div className="w-8 h-8 rounded-full bg-brand-stone border border-brand-gold/40 flex items-center justify-center font-bold text-brand-gold text-xs">
                            {cust.fullName ? cust.fullName.charAt(0) : 'ع'}
                          </div>
                          <div>
                            <p className="font-bold">{cust.fullName}</p>
                            <p className="text-[10px] text-brand-cream/50 font-normal">
                              {cust.isRegistered ? (isAr ? 'حساب مسجل' : 'Registered') : (isAr ? 'طلب زائر' : 'Guest')}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        <p className="text-brand-ivory flex items-center space-x-1.5 rtl:space-x-reverse font-mono">
                          <Phone className="w-3 h-3 text-brand-gold/70" />
                          <span>{cust.phone || '—'}</span>
                        </p>
                        <p className="text-brand-cream/50 text-[10px] truncate max-w-xs font-mono">
                          {cust.email}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTierBadge(
                              cust.tier
                            )}`}
                          >
                            {cust.tier}
                          </span>
                          {cust.stamps > 0 && (
                            <p className="text-[10px] text-brand-gold font-mono flex items-center space-x-1 rtl:space-x-reverse">
                              <Award className="w-3 h-3" />
                              <span>{cust.stamps}/5 أختام</span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-brand-ivory">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <ShoppingBag className="w-3.5 h-3.5 text-brand-cream/50" />
                          <span>{cust.totalOrders} {isAr ? 'طلب' : 'orders'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-brand-gold">
                        {formatPrice(cust.totalSpend || 0)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {cleanPhone ? (
                          <a
                            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                              `مرحباً ${cust.fullName}، يسعدنا تواصلكم من دار أثير (ATHEER) للستريتوير بخصوص طلبيتكم.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white rounded-xs transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>واتساب</span>
                          </a>
                        ) : (
                          <span className="text-brand-cream/30">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
