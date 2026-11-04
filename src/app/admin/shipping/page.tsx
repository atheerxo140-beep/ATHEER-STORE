'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShippingZone } from '@/types';
import { GovernorateInfo } from '@/data/shippingZones';
import {
  Truck,
  MapPin,
  Edit2,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';

export default function AdminShippingPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [governorates, setGovernorates] = useState<GovernorateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ShippingZone>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchShippingZones = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shipping');
      const data = await res.json();
      if (data.success) {
        setZones(data.zones);
        setGovernorates(data.governorates || []);
      }
    } catch (err) {
      console.error('Failed to load shipping zones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingZones();
  }, []);

  const handleStartEdit = (zone: ShippingZone) => {
    setEditingZoneId(zone.id);
    setEditFormData({
      baseFee: zone.baseFee,
      freeShippingThreshold: zone.freeShippingThreshold,
      estimatedDaysEn: zone.estimatedDaysEn,
      estimatedDaysAr: zone.estimatedDaysAr,
      isActive: zone.isActive,
    });
  };

  const handleCancelEdit = () => {
    setEditingZoneId(null);
    setEditFormData({});
  };

  const handleSaveZone = async (zoneId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneId,
          ...editFormData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr ? 'تم تحديث أسعار وشروط الشحن بنجاح' : 'Shipping zone updated successfully',
        });
        setEditingZoneId(null);
        fetchShippingZones();
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to update zone' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (zone: ShippingZone) => {
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneId: zone.id,
          isActive: !zone.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchShippingZones();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-gold uppercase tracking-widest mb-1">
            <Truck className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'شحن المحافظات المصرية' : 'Egypt Logistics & Delivery Zones'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-ivory font-serif">
            {isAr ? 'إدارة مناطق الشحن والتوصيل' : 'Shipping Zones Configuration'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-1">
            {isAr
              ? 'تكوين رسوم التوصيل بالجنيه المصري لـ ٢٧ محافظة، حد الشحن المجاني، ومواعيد التسليم التقديرية'
              : 'Configure real courier delivery fees in EGP across all 27 Egyptian Governorates'}
          </p>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={fetchShippingZones}
            className="p-2.5 bg-brand-charcoal border border-brand-border text-brand-cream/80 hover:text-brand-gold hover:border-brand-gold/40 transition-colors rounded-sm"
            title={isAr ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
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

      {/* Rules Notice */}
      <div className="bg-brand-stone/30 border border-brand-gold/30 p-4 rounded-sm flex items-start space-x-3 rtl:space-x-reverse">
        <ShieldCheck className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-brand-cream/80 leading-relaxed">
          <span className="text-brand-gold font-bold">
            {isAr ? 'حساب رسوم الشحن على الخادم: ' : 'Server-Authoritative Shipping: '}
          </span>
          {isAr
            ? 'يتم حساب كافة مصاريف الشحن والتوصيل حصرياً داخل السيرفر لمنع أي تلاعب بالأسعار من المتصفح. الدفع متاح عبر الدفع عند الاستلام (Cash on Delivery) لجميع المحافظات النشطة أدناه.'
            : 'All shipping fees and free-shipping eligibility are verified server-side during checkout. Courier fees never rely on client-supplied values.'}
        </div>
      </div>

      {/* Zones List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-brand-charcoal border border-brand-border/80 p-12 text-center text-brand-cream/50 font-mono text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
            {isAr ? 'جاري تحميل مناطق الشحن...' : 'Loading shipping zones...'}
          </div>
        ) : (
          zones.map((zone) => {
            const isEditing = editingZoneId === zone.id;
            const coveredGovs = governorates.filter((g) => g.zoneId === zone.id);

            return (
              <div
                key={zone.id}
                className={`bg-brand-charcoal border transition-all rounded-sm p-6 space-y-4 ${
                  zone.isActive ? 'border-brand-border/80' : 'border-brand-border/40 opacity-60'
                }`}
              >
                {/* Zone Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-border/60">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <h3 className="font-serif font-black text-lg text-brand-ivory">
                        {isAr ? zone.nameAr : zone.nameEn}
                      </h3>
                      {zone.isActive ? (
                        <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono rounded-xs font-bold">
                          {isAr ? 'نشط' : 'Active Zone'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-950/60 text-rose-400 border border-rose-500/40 text-[9px] font-mono rounded-xs font-bold">
                          {isAr ? 'معطل' : 'Disabled'}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">
                      Zone ID: {zone.id}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={() => handleToggleActive(zone)}
                      className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs border transition-colors ${
                        zone.isActive
                          ? 'border-brand-border text-brand-cream/70 hover:text-rose-400 hover:border-rose-500/40'
                          : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40'
                      }`}
                    >
                      {zone.isActive
                        ? isAr ? 'تعطيل المنطقة' : 'Disable'
                        : isAr ? 'تفعيل المنطقة' : 'Enable'}
                    </button>
                    {!isEditing && (
                      <button
                        onClick={() => handleStartEdit(zone)}
                        className="px-3 py-1.5 bg-brand-stone border border-brand-border text-brand-gold hover:border-brand-gold rounded-xs text-xs font-mono flex items-center space-x-1 rtl:space-x-reverse"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{isAr ? 'تعديل الرسوم' : 'Edit Rates'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit Form OR View Details */}
                {isEditing ? (
                  <div className="bg-brand-stone/40 p-4 border border-brand-gold/40 rounded-sm space-y-4 font-mono text-xs">
                    <div className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">
                      {isAr ? 'تعديل أسعار الشحن ومواعيد التسليم' : 'Modify Courier Fees & Estimates'}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-brand-cream/80 mb-1">
                          {isAr ? 'سعر الشحن الأساسي (EGP) *' : 'Base Fee (EGP) *'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={editFormData.baseFee ?? zone.baseFee}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, baseFee: Number(e.target.value) })
                          }
                          className="w-full bg-brand-charcoal border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-brand-cream/80 mb-1">
                          {isAr ? 'حد الشحن المجاني (EGP) *' : 'Free Shipping Min (EGP) *'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={editFormData.freeShippingThreshold ?? zone.freeShippingThreshold}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              freeShippingThreshold: Number(e.target.value),
                            })
                          }
                          className="w-full bg-brand-charcoal border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-brand-cream/80 mb-1">
                          {isAr ? 'مدة التوصيل التقديرية (إنجليزي)' : 'Estimated Days (English)'}
                        </label>
                        <input
                          type="text"
                          value={editFormData.estimatedDaysEn ?? zone.estimatedDaysEn}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, estimatedDaysEn: e.target.value })
                          }
                          className="w-full bg-brand-charcoal border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-brand-cream/80 mb-1">
                          {isAr ? 'مدة التوصيل التقديرية (عربي)' : 'Estimated Days (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={editFormData.estimatedDaysAr ?? zone.estimatedDaysAr}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, estimatedDaysAr: e.target.value })
                          }
                          className="w-full bg-brand-charcoal border border-brand-border px-3 py-2 text-brand-ivory rounded-sm focus:border-brand-gold focus:outline-none text-right"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3.5 py-1.5 border border-brand-border text-brand-cream/80 hover:text-brand-ivory rounded-xs"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        disabled={saving}
                        onClick={() => handleSaveZone(zone.id)}
                        className="px-5 py-1.5 bg-brand-gold text-brand-black font-bold uppercase rounded-xs hover:bg-brand-gold-light shadow-gold"
                      >
                        {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الأسعار' : 'Save Rates')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                    <div className="bg-brand-stone/30 p-3 rounded-xs border border-brand-border/40">
                      <div className="text-[10px] text-brand-cream/50 uppercase">
                        {isAr ? 'سعر الشحن' : 'Base Fee'}
                      </div>
                      <div className="text-base font-bold text-brand-gold mt-0.5">
                        {zone.baseFee} EGP
                      </div>
                    </div>

                    <div className="bg-brand-stone/30 p-3 rounded-xs border border-brand-border/40">
                      <div className="text-[10px] text-brand-cream/50 uppercase">
                        {isAr ? 'شحن مجاني عند طلب أكثر من' : 'Free Shipping Over'}
                      </div>
                      <div className="text-base font-bold text-brand-ivory mt-0.5">
                        {zone.freeShippingThreshold} EGP
                      </div>
                    </div>

                    <div className="bg-brand-stone/30 p-3 rounded-xs border border-brand-border/40">
                      <div className="text-[10px] text-brand-cream/50 uppercase">
                        {isAr ? 'مدة التوصيل' : 'Delivery Speed'}
                      </div>
                      <div className="text-xs font-semibold text-brand-ivory mt-0.5">
                        {isAr ? zone.estimatedDaysAr : zone.estimatedDaysEn}
                      </div>
                    </div>

                    <div className="bg-brand-stone/30 p-3 rounded-xs border border-brand-border/40">
                      <div className="text-[10px] text-brand-cream/50 uppercase">
                        {isAr ? 'الدفع عند الاستلام' : 'Payment Method'}
                      </div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">
                        COD Available ✓
                      </div>
                    </div>
                  </div>
                )}

                {/* Covered Governorates Tags */}
                <div>
                  <div className="text-[10px] font-mono text-brand-cream/60 uppercase tracking-wider mb-2">
                    {isAr
                      ? `المحافظات المشمولة في هذا النطاق (${coveredGovs.length} محافظات):`
                      : `Covered Governorates (${coveredGovs.length} total):`}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {coveredGovs.map((gov) => (
                      <span
                        key={gov.id}
                        className="px-2 py-0.5 bg-brand-stone text-brand-cream/80 border border-brand-border/60 text-[10px] font-mono rounded-xs flex items-center space-x-1 rtl:space-x-reverse"
                      >
                        <MapPin className="w-2.5 h-2.5 text-brand-gold/70" />
                        <span>{isAr ? gov.nameAr : gov.nameEn}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
