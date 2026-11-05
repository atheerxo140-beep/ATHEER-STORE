'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  Layers,
  Search,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  History,
  CheckCircle2,
  XCircle,
  X,
  Package,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  category: string;
  price: number;
  inventory: number;
  isLowStock: boolean;
  sizes: string[];
  colors: string[];
}

interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  adjustment: number;
  newTotal: number;
  reason: 'restock' | 'damage' | 'audit_correction' | 'sale';
  notes?: string;
  timestamp: string;
}

export default function AdminInventoryPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustReason, setAdjustReason] = useState<'restock' | 'damage' | 'audit_correction'>('restock');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/inventory');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenAdjust = (item: InventoryItem, defaultType: 'add' | 'subtract' = 'add') => {
    setActiveItem(item);
    setAdjustType(defaultType);
    setAdjustAmount(defaultType === 'add' ? 25 : 5);
    setAdjustReason(defaultType === 'add' ? 'restock' : 'damage');
    setAdjustNotes('');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    const delta = adjustType === 'add' ? Math.abs(adjustAmount) : -Math.abs(adjustAmount);
    if (activeItem.inventory + delta < 0) {
      setFeedbackMsg({
        type: 'error',
        text: isAr
          ? `لا يمكن خفض المخزون لأقل من صفر. المخزون الحالي: ${activeItem.inventory}`
          : `Stock cannot fall below zero. Current stock: ${activeItem.inventory}`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminFetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: activeItem.id,
          adjustment: delta,
          reason: adjustReason,
          notes: adjustNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr
            ? `تم تعديل مخزون "${activeItem.nameAr}" بنجاح (${data.newInventory} قطعة).`
            : `Inventory updated for "${activeItem.nameEn}" (${data.newInventory} in stock).`,
        });
        setIsAdjustModalOpen(false);
        fetchInventory();
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to update stock.' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalUnits = items.reduce((acc, i) => acc + (i.inventory || 0), 0);
  const totalValue = items.reduce((acc, i) => acc + (i.inventory || 0) * i.price, 0);
  const lowStockCount = items.filter((i) => i.isLowStock).length;

  const filteredItems = items.filter((i) => {
    const matchesSearch =
      i.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.nameAr.includes(searchTerm) ||
      i.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !filterLowStockOnly || i.isLowStock;
    return matchesSearch && matchesLowStock;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-gold uppercase tracking-widest mb-1">
            <Layers className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'إدارة المخزون والتوريد' : 'Inventory & Stock Control'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-ivory font-serif">
            {isAr ? 'مستودع أزياء الشارع' : 'Streetwear Inventory'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-1">
            {isAr
              ? 'تتبع كميات الهوديز والسويت شيرتات، حظر المخزون السالب، وتسجيل حركات التوريد والتعديل'
              : 'Real-time stock quantities, negative inventory prevention, and audit movements'}
          </p>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={fetchInventory}
            className="p-2.5 bg-brand-charcoal border border-brand-border text-brand-cream/80 hover:text-brand-gold hover:border-brand-gold/40 transition-colors rounded-sm"
            title={isAr ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-brand-charcoal border border-brand-border/80 p-5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-widest text-brand-cream/50 mb-1">
            {isAr ? 'إجمالي القطع في المستودع' : 'Total Garments In Stock'}
          </div>
          <div className="text-2xl font-black font-serif text-brand-ivory">{totalUnits}</div>
          <p className="text-[11px] font-mono text-brand-gold mt-1">
            Across {items.length} active streetwear drops
          </p>
        </div>

        <div className="bg-brand-charcoal border border-brand-border/80 p-5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-widest text-brand-cream/50 mb-1">
            {isAr ? 'القيمة الإجمالية للمخزون (EGP)' : 'Total Inventory Valuation'}
          </div>
          <div className="text-2xl font-black font-serif text-brand-gold">
            {totalValue.toLocaleString()} <span className="text-xs font-mono">EGP</span>
          </div>
          <p className="text-[11px] font-mono text-brand-cream/60 mt-1">Calculated at current store prices</p>
        </div>

        <div className="bg-brand-charcoal border border-brand-border/80 p-5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-widest text-brand-cream/50 mb-1">
            {isAr ? 'تنبيهات انخفاض المخزون' : 'Low Stock Alerts'}
          </div>
          <div
            className={`text-2xl font-black font-serif ${
              lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {lowStockCount} {isAr ? 'قطع' : 'garments'}
          </div>
          <p className="text-[11px] font-mono text-brand-cream/60 mt-1">
            {lowStockCount > 0 ? 'Action needed: re-stock suggested' : 'Healthy inventory levels'}
          </p>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-sm border flex items-center justify-between text-xs font-mono ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-400'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-brand-cream/50 hover:text-brand-ivory">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls: Search and Low Stock Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isAr ? 'بحث بالقطعة أو الكود...' : 'Search by garment or ID...'}
            className="w-full bg-brand-charcoal border border-brand-border/60 text-brand-ivory text-xs px-9 py-2 rounded-sm focus:outline-none focus:border-brand-gold font-mono"
          />
        </div>

        <button
          onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
          className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 border rounded-sm text-xs font-mono transition-colors ${
            filterLowStockOnly
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/60 font-bold'
              : 'bg-brand-charcoal text-brand-cream/80 border-brand-border/60 hover:border-brand-gold/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{isAr ? 'عرض القطع منخفضة المخزون فقط (< 15)' : 'Show Low Stock Only (< 15)'}</span>
        </button>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="border-b border-brand-border/80 bg-brand-stone/30 text-[10px] uppercase font-mono tracking-widest text-brand-cream/60">
                <th className="py-3 px-4">{isAr ? 'القطعة' : 'Garment Name'}</th>
                <th className="py-3 px-4">{isAr ? 'التصنيف' : 'Category'}</th>
                <th className="py-3 px-4">{isAr ? 'المقاسات المتاحة' : 'Sizes'}</th>
                <th className="py-3 px-4">{isAr ? 'سعر الوحدة' : 'Unit Price'}</th>
                <th className="py-3 px-4">{isAr ? 'المخزون الحالي' : 'Stock Units'}</th>
                <th className="py-3 px-4">{isAr ? 'قيمة المخزون' : 'Stock Value'}</th>
                <th className="py-3 px-4 text-center">{isAr ? 'تعديل المخزون' : 'Adjust Stock'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-cream/50">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
                    {isAr ? 'جاري تحميل المخزون...' : 'Loading stock records...'}
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-cream/50">
                    {isAr ? 'لا توجد قطع مطابقة للبحث' : 'No inventory items match search criteria.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-stone/20 transition-colors">
                    {/* Garment Title */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-brand-ivory font-serif text-sm">
                        {isAr ? item.nameAr : item.nameEn}
                      </div>
                      <div className="text-[10px] text-brand-gold uppercase tracking-wider mt-0.5">
                        {item.id}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-brand-cream/80 capitalize">
                      {item.category === 'hoodies' ? '500 GSM Hoodie' : item.category}
                    </td>

                    {/* Sizes */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.sizes.map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 bg-brand-stone text-brand-ivory border border-brand-border/60 rounded-xs text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-brand-ivory">
                      {item.price.toLocaleString()} <span className="text-[10px] text-brand-gold">EGP</span>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3.5 px-4">
                      {item.isLowStock ? (
                        <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-amber-400 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{item.inventory} units (Low)</span>
                        </div>
                      ) : (
                        <div className="text-emerald-400 font-bold">
                          {item.inventory} units
                        </div>
                      )}
                    </td>

                    {/* Stock Value */}
                    <td className="py-3.5 px-4 text-brand-ivory font-semibold">
                      {((item.inventory || 0) * item.price).toLocaleString()} EGP
                    </td>

                    {/* Quick Adjust Buttons */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleOpenAdjust(item, 'add')}
                          className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 rounded-xs flex items-center space-x-1 rtl:space-x-reverse transition-colors"
                          title={isAr ? 'إضافة توريد' : 'Restock'}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isAr ? 'توريد' : 'Restock'}</span>
                        </button>
                        <button
                          onClick={() => handleOpenAdjust(item, 'subtract')}
                          className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-400 rounded-xs flex items-center space-x-1 rtl:space-x-reverse transition-colors"
                          title={isAr ? 'خصم / هالك' : 'Reduce'}
                        >
                          <Minus className="w-3 h-3" />
                          <span>{isAr ? 'خصم' : 'Reduce'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-charcoal border border-brand-border w-full max-w-md rounded-sm p-6 shadow-2xl space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/80">
              <div>
                <span className="text-[10px] text-brand-gold uppercase tracking-widest font-bold">
                  {isAr ? 'تعديل كمية المستودع' : 'Stock Adjustment'}
                </span>
                <h3 className="text-base font-black text-brand-ivory font-serif mt-0.5">
                  {isAr ? activeItem.nameAr : activeItem.nameEn}
                </h3>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-brand-cream/60 hover:text-brand-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              {/* Current Stock Banner */}
              <div className="bg-brand-stone/40 p-3 border border-brand-border/60 rounded-xs flex items-center justify-between">
                <span className="text-brand-cream/70">{isAr ? 'المخزون الحالي:' : 'Current Stock:'}</span>
                <span className="font-bold text-brand-gold text-sm">{activeItem.inventory} units</span>
              </div>

              {/* Action Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustType('add');
                    setAdjustReason('restock');
                  }}
                  className={`py-2 px-3 border rounded-xs font-bold transition-colors ${
                    adjustType === 'add'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                      : 'bg-brand-stone/20 border-brand-border text-brand-cream/60'
                  }`}
                >
                  + {isAr ? 'إضافة إلى المخزون' : 'Add Stock (Restock)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdjustType('subtract');
                    setAdjustReason('damage');
                  }}
                  className={`py-2 px-3 border rounded-xs font-bold transition-colors ${
                    adjustType === 'subtract'
                      ? 'bg-rose-950/80 border-rose-500 text-rose-400'
                      : 'bg-brand-stone/20 border-brand-border text-brand-cream/60'
                  }`}
                >
                  - {isAr ? 'خصم من المخزون' : 'Reduce Stock'}
                </button>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-brand-cream/80 mb-1">
                  {isAr ? 'الكمية المراد تعديلها *' : 'Quantity Units *'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-brand-cream/80 mb-1">
                  {isAr ? 'سبب التعديل *' : 'Movement Reason *'}
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as any)}
                  className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                >
                  <option value="restock">New Stock Inflow (توريد بضاعة جديدة)</option>
                  <option value="damage">Damaged Garment / Defect (هالك أو عيب تصنيع)</option>
                  <option value="audit_correction">Physical Audit Correction (جرد مخزني دوري)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-brand-cream/80 mb-1">
                  {isAr ? 'ملاحظات إضافية' : 'Audit Notes'}
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Batch #40 Cairo Atelier arrival"
                  className="w-full bg-brand-stone/40 border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                />
              </div>

              {/* Calculated Result Preview */}
              <div className="pt-2 text-[11px] text-brand-cream/60 flex justify-between">
                <span>{isAr ? 'الرصيد الجديد بعد التعديل:' : 'New Resulting Stock:'}</span>
                <span className="font-bold text-brand-ivory">
                  {activeItem.inventory + (adjustType === 'add' ? adjustAmount : -adjustAmount)} units
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-3 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 border border-brand-border text-brand-cream/80 hover:text-brand-ivory rounded-xs"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-gold text-brand-black font-bold uppercase tracking-wider rounded-xs hover:bg-brand-gold-light"
                >
                  {isAr ? 'تأكيد وحفظ الحركة' : 'Confirm Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Audit History */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-5 space-y-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <History className="w-4 h-4 text-brand-gold" />
          <h3 className="font-serif font-black text-base text-brand-ivory">
            {isAr ? 'سجل حركات وتوريدات المخزون الأخيرة' : 'Recent Inventory Movement Logs'}
          </h3>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-brand-cream/50 font-mono py-4">
            {isAr ? 'لا توجد حركات مخزنية مسجلة حتى الآن' : 'No inventory movements recorded yet.'}
          </p>
        ) : (
          <div className="divide-y divide-brand-border/40 font-mono text-xs">
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-brand-ivory">{log.productName}</span>
                  <span className="text-brand-cream/50 text-[10px] mx-2">·</span>
                  <span className="text-[10px] uppercase text-brand-gold">{log.reason}</span>
                  {log.notes && (
                    <span className="text-[10px] text-brand-cream/60 italic ml-2">({log.notes})</span>
                  )}
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <span
                    className={`font-bold ${
                      log.adjustment > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {log.adjustment > 0 ? `+${log.adjustment}` : log.adjustment} units
                  </span>
                  <span className="text-[10px] text-brand-cream/40">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
