'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  Award,
  Save,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Check,
  Users,
  Search,
  Gift,
  X,
  AlertCircle,
} from 'lucide-react';

export default function AdminLoyaltyPage() {
  const { language, isRtl, formatPrice } = useLanguage();
  const isAr = language === 'ar';

  const [config, setConfig] = useState({
    programName: 'ATHEER REWARDS',
    rewardType: 'digital_stamps',
    stampsRequired: 5,
    minSpendPerStamp: 800,
    rewardDescriptionAr: 'قسيمة خصم نقدية 250 ج.م على طلبك القادم عند إكمال 5 أختام',
    rewardDescriptionEn: '250 EGP Cash Reward Voucher upon completing 5 digital stamps',
    rewardDiscountEgp: 250,
    isActive: true,
  });

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLoyalty = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/loyalty');
      const data = await res.json();
      if (data.success) {
        if (data.config) setConfig(data.config);
        if (Array.isArray(data.accounts)) setAccounts(data.accounts);
      }
    } catch (e) {
      console.error('Failed to load loyalty settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyalty();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await adminFetch('/api/admin/loyalty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: isAr ? 'تم حفظ إعدادات برنامج الولاء والأختام بنجاح.' : 'Loyalty settings updated successfully.',
        });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to save' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <Award className="w-6 h-6 text-brand-gold" />
            <h1 className="text-xl sm:text-2xl font-serif font-black text-brand-ivory">
              {isAr ? 'برنامج المكافآت والأختام الرقمية (ATHEER REWARDS)' : 'Digital Loyalty Pass Engine'}
            </h1>
          </div>
          <p className="text-xs text-brand-cream/60 mt-1">
            {isAr
              ? 'التحكم الكامل في شروط منح الأختام للعملاء، عدد الأختام المطلوبة، وقيمة القسائم النقدية التلقائية'
              : 'Configure stamp thresholds, cash rewards, and monitor customer stamp passes'}
          </p>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="px-6 py-2.5 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-2 rtl:space-x-reverse shadow-gold disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ إعدادات البرنامج' : 'Save Rules')}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xs border text-xs font-mono flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Program Configuration Form */}
      <form onSubmit={handleSaveConfig} className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-bold text-brand-ivory">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'شروط وقواعد كسب الأختام والمكافآت' : 'Reward Engine Parameters'}</span>
          </div>

          <label className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono cursor-pointer">
            <input
              type="checkbox"
              checked={config.isActive}
              onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
              className="rounded-xs text-brand-gold focus:ring-0"
            />
            <span className={config.isActive ? 'text-emerald-400 font-bold' : 'text-brand-cream/50'}>
              {config.isActive ? (isAr ? 'البرنامج مفعل رسمياً' : 'Program Active') : (isAr ? 'البرنامج معطل' : 'Program Inactive')}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono text-brand-cream/70 mb-1">
              {isAr ? 'عدد الأختام المطلوبة لاكتمال الكرت' : 'Stamps Required For Pass'}
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={config.stampsRequired}
              onChange={(e) => setConfig({ ...config, stampsRequired: parseInt(e.target.value) || 5 })}
              className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-gold text-xs px-3 py-2 rounded-xs font-mono font-bold"
            />
            <span className="text-[10px] text-brand-cream/50 font-mono mt-1 block">
              {isAr ? 'الافتراضي: 5 أختام' : 'Default: 5 stamps'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono text-brand-cream/70 mb-1">
              {isAr ? 'الحد الأدنى لقيمة الأوردر لاحتساب ختم (ج.م)' : 'Min Order Spend Per Stamp (EGP)'}
            </label>
            <input
              type="number"
              min={100}
              step={50}
              value={config.minSpendPerStamp}
              onChange={(e) => setConfig({ ...config, minSpendPerStamp: parseFloat(e.target.value) || 800 })}
              className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-mono"
            />
            <span className="text-[10px] text-brand-cream/50 font-mono mt-1 block">
              {isAr ? 'أي طلب بهذا المبلغ يمنح ختم تلقائي' : 'Orders above this qualify'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono text-brand-cream/70 mb-1">
              {isAr ? 'قيمة قسيمة الخصم النقدية (ج.م)' : 'Reward Cash Discount (EGP)'}
            </label>
            <input
              type="number"
              min={50}
              step={50}
              value={config.rewardDiscountEgp}
              onChange={(e) => setConfig({ ...config, rewardDiscountEgp: parseFloat(e.target.value) || 250 })}
              className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-gold text-xs px-3 py-2 rounded-xs font-mono font-bold"
            />
            <span className="text-[10px] text-brand-cream/50 font-mono mt-1 block">
              {isAr ? 'تصدر كود تلقائي ATH-VIP-xxxx' : 'Auto-issued voucher code'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono text-brand-cream/70 mb-1">
              {isAr ? 'اسم البرنامج المعروض' : 'Display Program Name'}
            </label>
            <input
              type="text"
              value={config.programName}
              onChange={(e) => setConfig({ ...config, programName: e.target.value })}
              className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-brand-cream/70 mb-1">
              {isAr ? 'وصف المكافأة المعروض للعميل (عربي)' : 'Reward Description (Arabic)'}
            </label>
            <input
              type="text"
              value={config.rewardDescriptionAr}
              onChange={(e) => setConfig({ ...config, rewardDescriptionAr: e.target.value })}
              className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-sans"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-brand-cream/70 mb-1">
              {isAr ? 'وصف المكافأة المعروض للعميل (إنجليزي)' : 'Reward Description (English)'}
            </label>
            <input
              type="text"
              value={config.rewardDescriptionEn}
              onChange={(e) => setConfig({ ...config, rewardDescriptionEn: e.target.value })}
              className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-sans"
            />
          </div>
        </div>
      </form>

      {/* Customer Loyalty Passes List */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Users className="w-5 h-5 text-brand-gold" />
            <h3 className="text-base font-bold text-brand-ivory font-serif">
              {isAr ? 'بطاقات أختام العملاء المسجلين' : 'Customer Digital Stamp Passes'}
            </h3>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث بالبريد أو الاسم...' : 'Search customer...'}
              className="bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-9 py-1.5 rounded-xs font-mono w-64"
            />
          </div>
        </div>

        {filteredAccounts.length === 0 ? (
          <p className="text-center py-8 text-xs font-mono text-brand-cream/50">
            {isAr ? 'لا توجد بطاقات أختام مطابقة' : 'No loyalty passes found.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs font-mono">
              <thead className="bg-brand-stone/40 text-brand-cream/60 border-b border-brand-border">
                <tr>
                  <th className="py-2.5 px-3 text-start">{isAr ? 'العميل' : 'Customer'}</th>
                  <th className="py-2.5 px-3 text-start">{isAr ? 'الفئة' : 'Tier'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'الأختام الحالية' : 'Current Stamps'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'إجمالي الأختام المكتسبة' : 'Lifetime Stamps'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'القسائم النشطة' : 'Active Vouchers'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-brand-stone/20 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-brand-ivory block">{acc.customerName || acc.customerEmail}</span>
                      <span className="text-[10px] text-brand-cream/50">{acc.customerEmail}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30 text-[10px] font-bold">
                        {acc.tier || 'Bronze'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-brand-gold text-sm">
                      {acc.stampsCount} / {config.stampsRequired}
                    </td>
                    <td className="py-3 px-3 text-center text-brand-cream/70">
                      {acc.totalStampsEarned}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {acc.activeVouchers?.filter((v: any) => !v.isUsed).length > 0 ? (
                        <span className="text-emerald-400 font-bold">
                          {acc.activeVouchers.filter((v: any) => !v.isUsed).map((v: any) => v.code).join(', ')}
                        </span>
                      ) : (
                        <span className="text-brand-cream/40">—</span>
                      )}
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
