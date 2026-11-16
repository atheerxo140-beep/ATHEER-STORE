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
  Plus,
  Trash2,
  Edit3,
  History,
  Crown,
  Filter,
  CheckCircle2,
  ChevronDown,
  Coins,
  Ticket,
} from 'lucide-react';

interface LoyaltyVoucher {
  code: string;
  discountAmount: number;
  isUsed: boolean;
  expiresAt: string;
}

interface LoyaltyHistoryEntry {
  id: string;
  type: 'earn' | 'redeem' | 'reverse' | 'manual_adjustment';
  stamps: number;
  orderRef?: string;
  date: string;
  notes?: string;
}

interface LoyaltyAccount {
  id: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  stampsCount: number;
  totalStampsEarned: number;
  stampsRedeemed: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Black_Edition';
  activeVouchers: LoyaltyVoucher[];
  history: LoyaltyHistoryEntry[];
}

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

  const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [adjustModalAccount, setAdjustModalAccount] = useState<LoyaltyAccount | null>(null);
  const [voucherModalAccount, setVoucherModalAccount] = useState<LoyaltyAccount | null>(null);
  const [historyModalAccount, setHistoryModalAccount] = useState<LoyaltyAccount | null>(null);
  const [deleteModalAccount, setDeleteModalAccount] = useState<LoyaltyAccount | null>(null);

  // Modal form states
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newInitialStamps, setNewInitialStamps] = useState(0);
  const [newTier, setNewTier] = useState<'Bronze' | 'Silver' | 'Gold' | 'Black_Edition'>('Bronze');
  const [newWelcomeAmount, setNewWelcomeAmount] = useState(0);

  const [adjustCount, setAdjustCount] = useState<number>(1);
  const [adjustNotes, setAdjustNotes] = useState('');

  const [voucherAmount, setVoucherAmount] = useState<number>(200);
  const [customVoucherCode, setCustomVoucherCode] = useState('');
  const [voucherExpiryDays, setVoucherExpiryDays] = useState<number>(90);

  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchLoyalty = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/loyalty?_t=${Date.now()}`, {
        cache: 'no-store',
      });
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

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // 1. Save Program Configuration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await adminFetch('/api/admin/loyalty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', isAr ? 'تم حفظ إعدادات وقواعد برنامج الولاء بنجاح' : 'Loyalty rules updated successfully');
        setShowConfigDrawer(false);
      } else {
        showToast('error', data.error || 'Failed to save');
      }
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  // 2. Quick +1 Stamp Shortcut
  const handleQuickAddStamp = async (account: LoyaltyAccount) => {
    // Optimistic UI update
    setAccounts((prev) =>
      prev.map((a) => (a.id === account.id ? { ...a, stampsCount: a.stampsCount + 1, totalStampsEarned: a.totalStampsEarned + 1 } : a))
    );

    try {
      const res = await adminFetch('/api/admin/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust_stamps',
          accountId: account.id,
          adjustment: 1,
          notes: isAr ? 'إضافة ختم سريع (+1) من الإدارة' : 'Quick +1 stamp awarded by admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', isAr ? `تم إضافة ختم للعميل "${account.customerName || account.customerEmail}" بنجاح!` : 'Stamp added successfully!');
        fetchLoyalty();
      } else {
        fetchLoyalty();
        showToast('error', data.error || 'Failed to add stamp');
      }
    } catch (e: any) {
      fetchLoyalty();
      showToast('error', e.message);
    }
  };

  // 3. Custom Stamps Adjustment (+ or -)
  const handleAdjustStampsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalAccount) return;
    setSubmittingAction(true);

    try {
      const res = await adminFetch('/api/admin/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust_stamps',
          accountId: adjustModalAccount.id,
          adjustment: Number(adjustCount),
          notes: adjustNotes || (isAr ? 'تعديل يدوي من إدارة المتجر' : 'Manual adjustment by admin'),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', isAr ? 'تم تعديل رصيد الأختام بنجاح' : 'Stamps adjusted successfully');
        setAdjustModalAccount(null);
        setAdjustCount(1);
        setAdjustNotes('');
        fetchLoyalty();
      } else {
        showToast('error', data.error || 'Failed');
      }
    } catch (e: any) {
      showToast('error', e.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // 4. Grant Custom Voucher
  const handleGrantVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherModalAccount) return;
    setSubmittingAction(true);

    try {
      const res = await adminFetch('/api/admin/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grant_voucher',
          accountId: voucherModalAccount.id,
          discountAmount: Number(voucherAmount),
          customCode: customVoucherCode.trim() || undefined,
          expiryDays: Number(voucherExpiryDays),
          notes: isAr ? `قسيمة مكافأة بقيمة ${voucherAmount} ج.م صادرة يدوياً` : `Manual voucher of ${voucherAmount} EGP`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', isAr ? `تم إصدار القسيمة بنجاح (كود: ${data.voucher?.code})` : 'Voucher issued successfully');
        setVoucherModalAccount(null);
        setVoucherAmount(200);
        setCustomVoucherCode('');
        fetchLoyalty();
      } else {
        showToast('error', data.error || 'Failed to grant voucher');
      }
    } catch (e: any) {
      showToast('error', e.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // 5. Update Tier
  const handleUpdateTier = async (account: LoyaltyAccount, tier: 'Bronze' | 'Silver' | 'Gold' | 'Black_Edition') => {
    try {
      const res = await adminFetch('/api/admin/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_tier',
          accountId: account.id,
          tier,
          notes: isAr ? `ترقية الفئة يدوياً إلى ${tier}` : `Tier upgraded to ${tier}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', isAr ? `تم تعديل فئة العميل إلى ${tier} بنجاح` : `Tier updated to ${tier}`);
        fetchLoyalty();
      } else {
        showToast('error', data.error || 'Failed to update tier');
      }
    } catch (e: any) {
      showToast('error', e.message);
    }
  };

  // 6. Create New Loyalty Account
  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAction(true);

    try {
      const res = await adminFetch('/api/admin/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_account',
          customerEmail: newEmail.trim(),
          customerName: newName.trim() || undefined,
          customerPhone: newPhone.trim() || undefined,
          initialStamps: Number(newInitialStamps),
          tier: newTier,
          welcomeVoucherAmount: Number(newWelcomeAmount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', isAr ? 'تم إصدار كارت الولاء الجديد للعميل بنجاح' : 'New loyalty pass created successfully');
        setShowNewCardModal(false);
        setNewEmail('');
        setNewName('');
        setNewPhone('');
        setNewInitialStamps(0);
        setNewTier('Bronze');
        setNewWelcomeAmount(0);
        fetchLoyalty();
      } else {
        showToast('error', data.error || 'Failed to create loyalty account');
      }
    } catch (e: any) {
      showToast('error', e.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // 7. Delete Loyalty Account
  const handleDeleteAccountConfirm = async () => {
    if (!deleteModalAccount) return;
    setSubmittingAction(true);

    try {
      const res = await adminFetch(`/api/admin/loyalty?id=${encodeURIComponent(deleteModalAccount.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', isAr ? 'تم حذف كارت الولاء نهائياً' : 'Loyalty pass deleted');
        setDeleteModalAccount(null);
        fetchLoyalty();
      } else {
        showToast('error', data.error || 'Failed to delete');
      }
    } catch (e: any) {
      showToast('error', e.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((a) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      a.customerEmail?.toLowerCase().includes(q) ||
      a.customerName?.toLowerCase().includes(q) ||
      (a.customerPhone && a.customerPhone.includes(q));

    const matchTier = tierFilter === 'all' || a.tier === tierFilter;
    return matchSearch && matchTier;
  });

  // Calculate live summary metrics
  const totalCards = accounts.length;
  const totalLifetimeStamps = accounts.reduce((acc, curr) => acc + (curr.totalStampsEarned || 0), 0);
  const totalActiveVouchers = accounts.reduce(
    (acc, curr) => acc + (curr.activeVouchers?.filter((v) => !v.isUsed).length || 0),
    0
  );
  const vipCount = accounts.filter((a) => a.tier === 'Black_Edition' || a.tier === 'Gold').length;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Black_Edition':
        return (
          <span className="px-2.5 py-1 rounded-full bg-brand-black border border-brand-gold text-brand-gold font-bold text-[10px] inline-flex items-center space-x-1 rtl:space-x-reverse shadow-gold">
            <Crown className="w-3 h-3 text-brand-gold" />
            <span>{isAr ? 'بلاك إديشن VIP' : 'Black Edition VIP'}</span>
          </span>
        );
      case 'Gold':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/50 text-amber-300 font-bold text-[10px] inline-flex items-center space-x-1 rtl:space-x-reverse">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>{isAr ? 'الفئة الذهبية' : 'Gold Tier'}</span>
          </span>
        );
      case 'Silver':
        return (
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-400/50 text-slate-300 text-[10px] font-bold">
            {isAr ? 'الفئة الفضية' : 'Silver Tier'}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-950/30 border border-amber-800/40 text-amber-500 text-[10px]">
            {isAr ? 'الفئة البرونزية' : 'Bronze Tier'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 font-sans">
      {/* 1. Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <Award className="w-7 h-7 text-brand-gold" />
            <h1 className="text-xl sm:text-3xl font-serif font-black text-brand-ivory">
              {isAr ? 'التحكم الإداري الكامل في كروت الولاء والمكافآت' : 'Loyalty Cards & Rewards Control Center'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-brand-cream/60 mt-1">
            {isAr
              ? 'تحكم بنسبة 200% في كروت العملاء: تعديل الأختام، إصدار قسائم نقدية فورية، ترقية الفئات، وسجل العمليات'
              : 'Full 200% control: adjust customer stamps, issue custom cash vouchers, manage tiers, and view history'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className="px-4 py-2.5 bg-brand-stone/50 hover:bg-brand-stone border border-brand-border text-brand-ivory text-xs font-mono font-bold rounded-xs transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'قواعد وشروط البرنامج' : 'Program Rules'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showConfigDrawer ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => setShowNewCardModal(true)}
            className="px-5 py-2.5 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-2 rtl:space-x-reverse shadow-gold"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? '+ إصدار كارت ولاء لعميل' : '+ New Loyalty Pass'}</span>
          </button>
        </div>
      </div>

      {/* Instant Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xs border text-xs sm:text-sm font-mono flex items-center justify-between animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Live Metrics KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
        <div className="p-4 bg-brand-charcoal border border-brand-border/80 rounded-xs space-y-1">
          <div className="flex items-center justify-between text-brand-cream/50 text-[11px]">
            <span>{isAr ? 'كروت الولاء الصادرة' : 'Active Passes'}</span>
            <Users className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-brand-ivory">{totalCards}</div>
          <span className="text-[10px] text-emerald-400 block">{isAr ? 'كروت نشطة في النظام' : 'Registered passes'}</span>
        </div>

        <div className="p-4 bg-brand-charcoal border border-brand-border/80 rounded-xs space-y-1">
          <div className="flex items-center justify-between text-brand-cream/50 text-[11px]">
            <span>{isAr ? 'إجمالي الأختام الممنوحة' : 'Lifetime Stamps'}</span>
            <Coins className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-brand-gold">{totalLifetimeStamps}</div>
          <span className="text-[10px] text-brand-cream/50 block">{isAr ? 'أختام مسجلة للعملاء' : 'Total stamps awarded'}</span>
        </div>

        <div className="p-4 bg-brand-charcoal border border-brand-border/80 rounded-xs space-y-1">
          <div className="flex items-center justify-between text-brand-cream/50 text-[11px]">
            <span>{isAr ? 'قسائم المكافآت المتاحة' : 'Active Vouchers'}</span>
            <Ticket className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{totalActiveVouchers}</div>
          <span className="text-[10px] text-brand-cream/50 block">{isAr ? 'قسيمة خصم جاهزة للاستخدام' : 'Unredeemed vouchers'}</span>
        </div>

        <div className="p-4 bg-brand-charcoal border border-brand-border/80 rounded-xs space-y-1">
          <div className="flex items-center justify-between text-brand-cream/50 text-[11px]">
            <span>{isAr ? 'عملاء النخبة VIP' : 'VIP Members'}</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">{vipCount}</div>
          <span className="text-[10px] text-amber-400/80 block">{isAr ? 'فئة الذهب والبلاك إديشن' : 'Gold & Black Edition'}</span>
        </div>
      </div>

      {/* 3. Collapsible Program Rules Configuration Drawer */}
      {showConfigDrawer && (
        <form
          onSubmit={handleSaveConfig}
          className="bg-brand-charcoal border-2 border-brand-gold/60 rounded-xs p-5 sm:p-6 space-y-5 animate-scale-in shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-bold text-brand-ivory font-serif">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>{isAr ? 'شروط وقواعد كسب الأختام والمكافآت التلقائية' : 'Loyalty Reward Rules & Conditions'}</span>
            </div>

            <label className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={config.isActive}
                onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                className="rounded-xs text-brand-gold focus:ring-0"
              />
              <span className={config.isActive ? 'text-emerald-400 font-bold' : 'text-brand-cream/50'}>
                {config.isActive ? (isAr ? '✓ البرنامج مفعل بالكامل' : '✓ Program Active') : (isAr ? '✕ معطل' : '✕ Inactive')}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <label className="block text-brand-cream/70 mb-1">
                {isAr ? 'عدد الأختام المطلوبة لاكتمال الكارت' : 'Stamps Required Per Pass'}
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={config.stampsRequired}
                onChange={(e) => setConfig({ ...config, stampsRequired: parseInt(e.target.value) || 5 })}
                className="w-full bg-brand-stone/40 border border-brand-border text-brand-gold px-3 py-2 rounded-xs font-bold"
              />
              <span className="text-[10px] text-brand-cream/40 mt-1 block">
                {isAr ? 'الافتراضي: 5 أختام' : 'Default: 5 stamps'}
              </span>
            </div>

            <div>
              <label className="block text-brand-cream/70 mb-1">
                {isAr ? 'الحد الأدنى لقيمة الأوردر لمنح ختم (ج.م)' : 'Min Order Spend Per Stamp (EGP)'}
              </label>
              <input
                type="number"
                min={100}
                step={50}
                value={config.minSpendPerStamp}
                onChange={(e) => setConfig({ ...config, minSpendPerStamp: parseFloat(e.target.value) || 800 })}
                className="w-full bg-brand-stone/40 border border-brand-border text-brand-ivory px-3 py-2 rounded-xs"
              />
              <span className="text-[10px] text-brand-cream/40 mt-1 block">
                {isAr ? 'مثال: 800 ج.م' : 'Orders above this qualify'}
              </span>
            </div>

            <div>
              <label className="block text-brand-cream/70 mb-1">
                {isAr ? 'قيمة قسيمة الخصم النقدية التلقائية (ج.م)' : 'Auto Reward Discount (EGP)'}
              </label>
              <input
                type="number"
                min={50}
                step={50}
                value={config.rewardDiscountEgp}
                onChange={(e) => setConfig({ ...config, rewardDiscountEgp: parseFloat(e.target.value) || 250 })}
                className="w-full bg-brand-stone/40 border border-brand-border text-brand-gold px-3 py-2 rounded-xs font-bold"
              />
              <span className="text-[10px] text-brand-cream/40 mt-1 block">
                {isAr ? 'تصدر تلقائياً عند اكتمال الكارت' : 'Issued when card completed'}
              </span>
            </div>

            <div>
              <label className="block text-brand-cream/70 mb-1">
                {isAr ? 'اسم برنامج الولاء المعروض' : 'Display Program Name'}
              </label>
              <input
                type="text"
                value={config.programName}
                onChange={(e) => setConfig({ ...config, programName: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border text-brand-ivory px-3 py-2 rounded-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-brand-cream/70 mb-1">
                {isAr ? 'وصف المكافأة للعميل (عربي)' : 'Reward Description (Arabic)'}
              </label>
              <input
                type="text"
                value={config.rewardDescriptionAr}
                onChange={(e) => setConfig({ ...config, rewardDescriptionAr: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border text-brand-ivory px-3 py-2 rounded-xs font-sans"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-brand-cream/70 mb-1">
                {isAr ? 'وصف المكافأة للعميل (إنجليزي)' : 'Reward Description (English)'}
              </label>
              <input
                type="text"
                value={config.rewardDescriptionEn}
                onChange={(e) => setConfig({ ...config, rewardDescriptionEn: e.target.value })}
                className="w-full bg-brand-stone/40 border border-brand-border text-brand-ivory px-3 py-2 rounded-xs font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-2 border-t border-brand-border/40">
            <button
              type="button"
              onClick={() => setShowConfigDrawer(false)}
              className="px-4 py-2 border border-brand-border text-xs font-mono text-brand-cream/70 hover:text-brand-ivory rounded-xs"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={savingConfig}
              className="px-6 py-2 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase rounded-xs transition-colors flex items-center space-x-2 rtl:space-x-reverse"
            >
              {savingConfig ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savingConfig ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ إعدادات البرنامج' : 'Save Rules')}</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Search & Filter Bar */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-brand-border/60 pb-4">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <Users className="w-5 h-5 text-brand-gold" />
            <h3 className="text-base sm:text-lg font-bold text-brand-ivory font-serif">
              {isAr ? 'كروت ولاء وأختام العملاء المسجلين' : 'Customer Digital Stamp Passes'}
            </h3>
            <span className="text-xs font-mono bg-brand-black px-2 py-0.5 rounded-xs border border-brand-border text-brand-gold font-bold">
              {filteredAccounts.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAr ? 'بحث بالاسم، البريد، أو الهاتف...' : 'Search name, email, or phone...'}
                className="bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-9 py-2 rounded-xs font-mono w-full sm:w-64 placeholder:text-brand-cream/40"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute top-1/2 -translate-y-1/2 right-2.5 rtl:right-auto rtl:left-2.5 text-brand-cream/40 hover:text-brand-ivory"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-mono"
            >
              <option value="all">{isAr ? 'كافة الفئات' : 'All Tiers'}</option>
              <option value="Bronze">{isAr ? 'الفئة البرونزية' : 'Bronze'}</option>
              <option value="Silver">{isAr ? 'الفئة الفضية' : 'Silver'}</option>
              <option value="Gold">{isAr ? 'الفئة الذهبية' : 'Gold'}</option>
              <option value="Black_Edition">{isAr ? 'بلاك إديشن VIP' : 'Black Edition VIP'}</option>
            </select>
          </div>
        </div>

        {/* 5. Customer Loyalty Cards Display (Responsive Cards for Mobile + Spreadsheet Table for Desktop) */}
        {filteredAccounts.length === 0 ? (
          <p className="text-center py-10 text-xs sm:text-sm font-mono text-brand-cream/50">
            {isAr ? 'لا توجد كروت ولاء مطابقة لبحثك' : 'No loyalty passes found matching criteria.'}
          </p>
        ) : (
          <>
            {/* Mobile View: High-Density Loyalty Touch Cards */}
            <div className="md:hidden space-y-3 font-mono">
              {filteredAccounts.map((acc) => (
                <div key={acc.id} className="p-4 bg-brand-stone/30 border border-brand-border/80 rounded-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-brand-ivory block font-serif">
                        {acc.customerName || acc.customerEmail.split('@')[0]}
                      </span>
                      <span className="text-[11px] text-brand-cream/60 block">{acc.customerEmail}</span>
                      {acc.customerPhone && (
                        <span className="text-[10px] text-brand-gold/80 block">{acc.customerPhone}</span>
                      )}
                    </div>
                    <div>{getTierBadge(acc.tier)}</div>
                  </div>

                  {/* Stamps Progress Bar */}
                  <div className="p-2.5 bg-brand-black/60 border border-brand-border/60 rounded-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-brand-cream/50 block">{isAr ? 'الأختام الحالية' : 'Current Stamps'}</span>
                      <span className="text-base font-bold text-brand-gold">
                        {acc.stampsCount} / {config.stampsRequired}
                      </span>
                    </div>

                    <div className="text-end">
                      <span className="text-[10px] text-brand-cream/50 block">{isAr ? 'إجمالي المكتسب' : 'Lifetime'}</span>
                      <span className="text-xs text-brand-ivory font-bold">{acc.totalStampsEarned} {isAr ? 'ختم' : 'stamps'}</span>
                    </div>
                  </div>

                  {/* Active Vouchers Pill */}
                  {acc.activeVouchers?.filter((v) => !v.isUsed).length > 0 && (
                    <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xs text-[11px] text-emerald-300 flex items-center justify-between">
                      <span className="font-bold flex items-center space-x-1 rtl:space-x-reverse">
                        <Gift className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isAr ? 'قسائم متاحة:' : 'Active:'}</span>
                      </span>
                      <span className="font-mono font-bold">
                        {acc.activeVouchers.filter((v) => !v.isUsed).map((v) => `${v.code} (${v.discountAmount} ج.م)`).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Mobile Quick Admin Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-border/40 text-xs font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => handleQuickAddStamp(acc)}
                      className="py-2 px-2 bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/40 text-brand-gold rounded-xs flex items-center justify-center space-x-1 rtl:space-x-reverse"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAr ? '+1 ختم سريع' : '+1 Quick Stamp'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAdjustModalAccount(acc);
                        setAdjustCount(1);
                      }}
                      className="py-2 px-2 bg-brand-stone/60 hover:bg-brand-stone border border-brand-border text-brand-ivory rounded-xs flex items-center justify-center space-x-1 rtl:space-x-reverse"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-brand-gold" />
                      <span>{isAr ? 'تعديل الأختام' : 'Adjust'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setVoucherModalAccount(acc);
                        setVoucherAmount(config.rewardDiscountEgp || 250);
                      }}
                      className="py-2 px-2 bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xs flex items-center justify-center space-x-1 rtl:space-x-reverse"
                    >
                      <Gift className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'منح قسيمة' : 'Grant Voucher'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHistoryModalAccount(acc)}
                      className="py-2 px-2 bg-brand-stone/60 hover:bg-brand-stone border border-brand-border text-brand-cream/80 rounded-xs flex items-center justify-center space-x-1 rtl:space-x-reverse"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{isAr ? 'سجل العمليات' : 'History'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Wide Spreadsheet Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-start text-xs font-mono">
                <thead className="bg-brand-stone/40 text-brand-cream/60 border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-3 text-start">{isAr ? 'العميل' : 'Customer'}</th>
                    <th className="py-3 px-3 text-start">{isAr ? 'فئة العضوية' : 'Tier'}</th>
                    <th className="py-3 px-3 text-center">{isAr ? 'الأختام الحالية' : 'Current Stamps'}</th>
                    <th className="py-3 px-3 text-center">{isAr ? 'إجمالي المكتسب' : 'Lifetime'}</th>
                    <th className="py-3 px-3 text-start">{isAr ? 'القسائم النشطة' : 'Active Vouchers'}</th>
                    <th className="py-3 px-3 text-center">{isAr ? 'إجراءات التحكم الإداري (200%)' : 'Admin Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-brand-stone/20 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-brand-ivory block font-serif text-sm">
                          {acc.customerName || acc.customerEmail.split('@')[0]}
                        </span>
                        <span className="text-[11px] text-brand-cream/60 block">{acc.customerEmail}</span>
                        {acc.customerPhone && (
                          <span className="text-[10px] text-brand-gold block font-mono">{acc.customerPhone}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                          {getTierBadge(acc.tier)}
                          <select
                            value={acc.tier}
                            onChange={(e) => handleUpdateTier(acc, e.target.value as any)}
                            className="bg-transparent text-[10px] text-brand-cream/50 hover:text-brand-gold border-0 cursor-pointer p-0 font-mono"
                            title={isAr ? 'اضغط لتغيير الفئة' : 'Change tier'}
                          >
                            <option value="Bronze" className="bg-brand-black text-brand-ivory">Bronze</option>
                            <option value="Silver" className="bg-brand-black text-brand-ivory">Silver</option>
                            <option value="Gold" className="bg-brand-black text-brand-ivory">Gold</option>
                            <option value="Black_Edition" className="bg-brand-black text-brand-ivory">Black Edition</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="font-black text-brand-gold text-base">
                          {acc.stampsCount}
                        </span>
                        <span className="text-[10px] text-brand-cream/40"> / {config.stampsRequired}</span>
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-brand-ivory">
                        {acc.totalStampsEarned}
                      </td>

                      <td className="py-3.5 px-3 text-start">
                        {acc.activeVouchers?.filter((v) => !v.isUsed).length > 0 ? (
                          <div className="space-y-1">
                            {acc.activeVouchers
                              .filter((v) => !v.isUsed)
                              .map((v, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-2 py-0.5 rounded-xs bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold"
                                >
                                  {v.code} ({v.discountAmount} ج.م)
                                </span>
                              ))}
                          </div>
                        ) : (
                          <span className="text-brand-cream/30">—</span>
                        )}
                      </td>

                      {/* Direct Control Buttons */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Quick +1 Stamp */}
                          <button
                            type="button"
                            onClick={() => handleQuickAddStamp(acc)}
                            className="px-2.5 py-1 bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/50 text-brand-gold rounded-xs text-[10px] font-bold flex items-center space-x-1 rtl:space-x-reverse transition-transform active:scale-95"
                            title={isAr ? 'إضافة ختم فوري +1' : '+1 Quick Stamp'}
                          >
                            <Plus className="w-3 h-3" />
                            <span>+1</span>
                          </button>

                          {/* Adjust Stamps Modal */}
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustModalAccount(acc);
                              setAdjustCount(1);
                            }}
                            className="px-2 py-1 bg-brand-stone/50 hover:bg-brand-stone border border-brand-border text-brand-ivory rounded-xs text-[10px] flex items-center space-x-1 rtl:space-x-reverse"
                            title={isAr ? 'تعديل أو خصم الأختام' : 'Adjust Stamps'}
                          >
                            <Edit3 className="w-3 h-3 text-brand-gold" />
                            <span>{isAr ? 'أختام' : 'Stamps'}</span>
                          </button>

                          {/* Grant Voucher Modal */}
                          <button
                            type="button"
                            onClick={() => {
                              setVoucherModalAccount(acc);
                              setVoucherAmount(config.rewardDiscountEgp || 250);
                            }}
                            className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xs text-[10px] font-bold flex items-center space-x-1 rtl:space-x-reverse"
                            title={isAr ? 'منح قسيمة مكافأة فورية' : 'Grant Voucher'}
                          >
                            <Gift className="w-3 h-3 text-emerald-400" />
                            <span>{isAr ? 'قسيمة' : 'Voucher'}</span>
                          </button>

                          {/* History Modal */}
                          <button
                            type="button"
                            onClick={() => setHistoryModalAccount(acc)}
                            className="p-1 text-brand-cream/60 hover:text-brand-ivory transition-colors"
                            title={isAr ? 'عرض سجل العمليات والأختام' : 'View History'}
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Card Modal */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalAccount(acc)}
                            className="p-1 text-brand-cream/40 hover:text-rose-400 transition-colors"
                            title={isAr ? 'حذف كارت العميل' : 'Delete Pass'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MODAL 1: Adjust Stamps (+ or -) */}
      {adjustModalAccount && (
        <div className="fixed inset-0 z-50 bg-brand-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAdjustStampsSubmit}
            className="bg-brand-charcoal border-2 border-brand-gold/60 rounded-xs p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-in font-mono"
          >
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-gold font-bold text-sm">
                <Edit3 className="w-4 h-4" />
                <span>{isAr ? 'تعديل أختام كارت الولاء' : 'Adjust Customer Stamps'}</span>
              </div>
              <button type="button" onClick={() => setAdjustModalAccount(null)} className="text-brand-cream/50 hover:text-brand-ivory">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-brand-stone/40 border border-brand-border/60 rounded-xs text-xs space-y-1">
              <span className="text-brand-cream/60 block">{isAr ? 'العميل:' : 'Customer:'}</span>
              <span className="font-bold text-brand-ivory block">{adjustModalAccount.customerName || adjustModalAccount.customerEmail}</span>
              <span className="text-brand-gold text-[11px] block">
                {isAr ? 'الرصيد الحالي:' : 'Current balance:'} {adjustModalAccount.stampsCount} {isAr ? 'ختم' : 'stamps'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-brand-cream/70 mb-1">
                  {isAr ? 'عدد الأختام المراد إضافتها أو خصمها (+ أو -):' : 'Stamps Adjustment (+ or -):'}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustCount((prev) => prev - 1)}
                    className="px-3 py-2 bg-brand-stone border border-brand-border text-brand-ivory font-bold rounded-xs"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    required
                    value={adjustCount}
                    onChange={(e) => setAdjustCount(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-brand-stone/40 border border-brand-border text-center text-brand-gold text-base font-bold py-2 rounded-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustCount((prev) => prev + 1)}
                    className="px-3 py-2 bg-brand-stone border border-brand-border text-brand-ivory font-bold rounded-xs"
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-2 pt-2 text-[10px]">
                  <button type="button" onClick={() => setAdjustCount(1)} className="px-2 py-1 bg-brand-stone/40 border border-brand-border rounded-xs text-brand-gold">+1</button>
                  <button type="button" onClick={() => setAdjustCount(2)} className="px-2 py-1 bg-brand-stone/40 border border-brand-border rounded-xs text-brand-gold">+2</button>
                  <button type="button" onClick={() => setAdjustCount(5)} className="px-2 py-1 bg-brand-stone/40 border border-brand-border rounded-xs text-brand-gold">+5 (كارت كامل)</button>
                  <button type="button" onClick={() => setAdjustCount(-1)} className="px-2 py-1 bg-brand-stone/40 border border-brand-border rounded-xs text-rose-400">-1</button>
                </div>
              </div>

              <div>
                <label className="block text-brand-cream/70 mb-1">
                  {isAr ? 'سبب التعديل / ملاحظات إدارية:' : 'Reason / Admin Note:'}
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder={isAr ? 'مثال: تعويض عميل، مكافأة خاصة، إكمال طلب...' : 'e.g. VIP bonus, order compensation...'}
                  className="w-full bg-brand-stone/40 border border-brand-border text-brand-ivory p-2 rounded-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-2 border-t border-brand-border/40">
              <button
                type="button"
                onClick={() => setAdjustModalAccount(null)}
                className="px-4 py-2 border border-brand-border text-xs text-brand-cream/70 hover:text-brand-ivory rounded-xs"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-5 py-2 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-bold rounded-xs transition-colors"
              >
                {submittingAction ? (isAr ? 'جاري التنفيذ...' : 'Saving...') : (isAr ? 'تأكيد التعديل' : 'Apply Adjustment')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Grant Reward Voucher */}
      {voucherModalAccount && (
        <div className="fixed inset-0 z-50 bg-brand-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleGrantVoucherSubmit}
            className="bg-brand-charcoal border-2 border-emerald-500/60 rounded-xs p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-in font-mono"
          >
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-400 font-bold text-sm">
                <Gift className="w-4 h-4" />
                <span>{isAr ? 'منح قسيمة مكافأة نقدية فورية للعميل' : 'Grant Cash Reward Voucher'}</span>
              </div>
              <button type="button" onClick={() => setVoucherModalAccount(null)} className="text-brand-cream/50 hover:text-brand-ivory">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-brand-stone/40 border border-brand-border/60 rounded-xs text-xs space-y-1">
              <span className="text-brand-cream/60 block">{isAr ? 'العميل المستفيد:' : 'Beneficiary:'}</span>
              <span className="font-bold text-brand-ivory block">{voucherModalAccount.customerName || voucherModalAccount.customerEmail}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-brand-cream/70 mb-1">
                  {isAr ? 'قيمة الخصم النقدي (ج.م):' : 'Discount Amount (EGP):'}
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[100, 200, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setVoucherAmount(amt)}
                      className={`py-1.5 border rounded-xs font-bold text-xs ${
                        voucherAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-brand-stone/40 text-brand-ivory border-brand-border hover:bg-brand-stone'
                      }`}
                    >
                      {amt} ج.م
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={voucherAmount}
                  onChange={(e) => setVoucherAmount(parseFloat(e.target.value) || 100)}
                  className="w-full bg-brand-stone/40 border border-brand-border text-emerald-400 font-bold text-base p-2 rounded-xs"
                />
              </div>

              <div>
                <label className="block text-brand-cream/70 mb-1">
                  {isAr ? 'كود القسيمة (اتركه فارغاً لتوليد كود تلقائي):' : 'Voucher Code (Leave empty for auto):'}
                </label>
                <input
                  type="text"
                  value={customVoucherCode}
                  onChange={(e) => setCustomVoucherCode(e.target.value.toUpperCase())}
                  placeholder="ATH-VIP-XXXX"
                  className="w-full bg-brand-stone/40 border border-brand-border text-brand-gold p-2 rounded-xs uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block text-brand-cream/70 mb-1">
                  {isAr ? 'صلاحية القسيمة (بالأيام):' : 'Validity (Days):'}
                </label>
                <input
                  type="number"
                  min={7}
                  max={365}
                  value={voucherExpiryDays}
                  onChange={(e) => setVoucherExpiryDays(parseInt(e.target.value) || 90)}
                  className="w-full bg-brand-stone/40 border border-brand-border text-brand-ivory p-2 rounded-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-2 border-t border-brand-border/40">
              <button
                type="button"
                onClick={() => setVoucherModalAccount(null)}
                className="px-4 py-2 border border-brand-border text-xs text-brand-cream/70 hover:text-brand-ivory rounded-xs"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xs transition-colors shadow-lg"
              >
                {submittingAction ? (isAr ? 'جاري الإصدار...' : 'Issuing...') : (isAr ? 'إصدار القسيمة للعميل' : 'Issue Voucher')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Issue New Loyalty Pass Manually */}
      {showNewCardModal && (
        <div className="fixed inset-0 z-50 bg-brand-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAccountSubmit}
            className="bg-brand-charcoal border-2 border-brand-gold/60 rounded-xs p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-in font-mono"
          >
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-gold font-bold text-sm">
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إصدار كارت ولاء جديد لعميل' : 'Issue New Customer Loyalty Pass'}</span>
              </div>
              <button type="button" onClick={() => setShowNewCardModal(false)} className="text-brand-cream/50 hover:text-brand-ivory">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-brand-cream/70 mb-1">
                  {isAr ? 'البريد الإلكتروني للعميل *:' : 'Customer Email *:'}
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full bg-brand-stone/40 border border-brand-border text-brand-ivory p-2 rounded-xs"
                />
              </div>

              <div>
                <label className="block text-brand-cream/70 mb-1">
                  {isAr ? 'اسم العميل:' : 'Customer Name:'}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={isAr ? 'محمد أحمد' : 'Full Name'}
                  className="w-full bg-brand-stone/40 border border-brand-border text-brand-ivory p-2 rounded-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-brand-cream/70 mb-1">
                  {isAr ? 'رقم الهاتف:' : 'Phone Number:'}
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  className="w-full bg-brand-stone/40 border border-brand-border text-brand-ivory p-2 rounded-xs"
                />
              </div>

              <div>
                <label className="block text-brand-cream/70 mb-1">
                  {isAr ? 'فئة العضوية البدائية:' : 'Initial Tier:'}
                </label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as any)}
                  className="w-full bg-brand-stone/40 border border-brand-border text-brand-gold p-2 rounded-xs font-bold"
                >
                  <option value="Bronze">Bronze (برونزية)</option>
                  <option value="Silver">Silver (فضية)</option>
                  <option value="Gold">Gold (ذهبية)</option>
                  <option value="Black_Edition">Black Edition VIP (نخبة)</option>
                </select>
              </div>

              <div>
                <label className="block text-brand-cream/70 mb-1">
                  {isAr ? 'عدد الأختام البدائية:' : 'Initial Stamps:'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={newInitialStamps}
                  onChange={(e) => setNewInitialStamps(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-brand-stone/40 border border-brand-border text-brand-gold font-bold p-2 rounded-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-brand-cream/70 mb-1">
                  {isAr ? 'قيمة القسيمة الترحيبية الممنوحة (ج.م):' : 'Welcome Voucher Value (EGP):'}
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={newWelcomeAmount}
                  onChange={(e) => setNewWelcomeAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-brand-stone/40 border border-brand-border text-emerald-400 font-bold p-2 rounded-xs"
                />
                <span className="text-[10px] text-brand-cream/40 block mt-1">
                  {isAr ? 'اتركها 0 إن كنت لا ترغب بمنح قسيمة فورية للعميل' : 'Leave 0 for no instant welcome voucher'}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-2 border-t border-brand-border/40">
              <button
                type="button"
                onClick={() => setShowNewCardModal(false)}
                className="px-4 py-2 border border-brand-border text-xs text-brand-cream/70 hover:text-brand-ivory rounded-xs"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-6 py-2 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-bold rounded-xs transition-colors shadow-gold"
              >
                {submittingAction ? (isAr ? 'جاري الإصدار...' : 'Creating...') : (isAr ? 'إصدار الكارت الآن' : 'Create Pass')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: Customer History Log */}
      {historyModalAccount && (
        <div className="fixed inset-0 z-50 bg-brand-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-charcoal border-2 border-brand-border rounded-xs p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-in font-mono max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-brand-ivory font-bold text-sm">
                <History className="w-4 h-4 text-brand-gold" />
                <span>{isAr ? 'سجل عمليات وأختام العميل' : 'Customer Stamp Transaction History'}</span>
              </div>
              <button type="button" onClick={() => setHistoryModalAccount(null)} className="text-brand-cream/50 hover:text-brand-ivory">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-brand-stone/40 border border-brand-border/60 rounded-xs text-xs">
              <span className="font-bold text-brand-ivory block">{historyModalAccount.customerName || historyModalAccount.customerEmail}</span>
              <span className="text-[11px] text-brand-cream/60 block">{historyModalAccount.customerEmail}</span>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs text-brand-gold font-bold uppercase tracking-wider">
                {isAr ? 'العمليات المسجلة:' : 'Recorded Transactions:'}
              </h5>

              {!historyModalAccount.history || historyModalAccount.history.length === 0 ? (
                <p className="text-xs text-brand-cream/50 text-center py-4">{isAr ? 'لا توجد حركات سابقة' : 'No history.'}</p>
              ) : (
                <div className="divide-y divide-brand-border/40 max-h-60 overflow-y-auto text-xs">
                  {historyModalAccount.history.map((h, i) => (
                    <div key={i} className="py-2.5 flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-brand-ivory block">{h.notes || h.type}</span>
                        <span className="text-[10px] text-brand-cream/50">
                          {new Date(h.date).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                        </span>
                      </div>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-xs text-[10px] shrink-0 ${
                          h.stamps > 0 ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' : 'bg-brand-stone text-brand-cream/70'
                        }`}
                      >
                        {h.stamps > 0 ? `+${h.stamps}` : h.stamps} {isAr ? 'ختم' : 'stamps'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-brand-border/40">
              <button
                type="button"
                onClick={() => setHistoryModalAccount(null)}
                className="px-4 py-2 bg-brand-stone hover:bg-brand-stone/80 text-brand-ivory text-xs rounded-xs"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Delete Card Confirmation */}
      {deleteModalAccount && (
        <div className="fixed inset-0 z-50 bg-brand-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-charcoal border-2 border-rose-500/60 rounded-xs p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-in font-mono text-center sm:text-right rtl:sm:text-right">
            <div className="flex items-center space-x-3 rtl:space-x-reverse text-rose-400">
              <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/30">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-ivory font-serif">
                  {isAr ? 'تأكيد حذف كارت الولاء' : 'Confirm Pass Deletion'}
                </h3>
                <p className="text-xs text-brand-cream/70 font-sans mt-0.5">
                  {isAr ? 'سيتم حذف الكارت ورصيد أختامه وقسائمه نهائياً' : 'This will permanently remove the pass and vouchers'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-brand-stone/40 border border-brand-border/60 rounded-xs text-xs text-brand-ivory">
              {deleteModalAccount.customerName || deleteModalAccount.customerEmail} ({deleteModalAccount.stampsCount} {isAr ? 'أختام' : 'stamps'})
            </div>

            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-2 border-t border-brand-border/40">
              <button
                type="button"
                disabled={submittingAction}
                onClick={() => setDeleteModalAccount(null)}
                className="px-4 py-2 border border-brand-border text-brand-cream/80 hover:text-brand-ivory text-xs rounded-xs"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleDeleteAccountConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-xs transition-colors flex items-center space-x-1.5 rtl:space-x-reverse"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{submittingAction ? (isAr ? 'جارٍ الحذف...' : 'Deleting...') : (isAr ? 'نعم، احذف الكارت' : 'Yes, Delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
