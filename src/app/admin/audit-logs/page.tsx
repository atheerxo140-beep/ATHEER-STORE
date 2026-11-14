'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { AuditLog } from '@/types';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Clock,
  User,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await adminFetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      l.action.toLowerCase().includes(q) ||
      l.actorEmail.toLowerCase().includes(q) ||
      l.section.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border/80">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-[11px] font-mono uppercase tracking-widest text-brand-gold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'سجل الرقابة والتتبع الأمني' : 'Audit Logs & Change History'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-brand-ivory">
            {isAr ? 'سجل العمليات الإدارية وتعديلات المتجر' : 'Administrative Activity & Change Log'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-0.5">
            {isAr
              ? 'تتبع كامل وغير قابل للتلاعب لكل العمليات: نشر التعديلات، تحديث الأسعار، صلاحيات الموظفين، وحالات الطلبات.'
              : 'Complete immutable audit trail of publishing events, price changes, and staff operations.'}
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          disabled={loading}
          className="px-4 py-2 bg-brand-charcoal border border-brand-border text-brand-gold hover:border-brand-gold text-xs font-mono rounded-xs flex items-center space-x-1.5 rtl:space-x-reverse self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث السجل' : 'Refresh'}</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-4 flex items-center shadow-xl">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute top-2.5 left-3 rtl:left-auto rtl:right-3 text-brand-cream/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث في السجل بالمسؤول، الإجراء، أو التفاصيل...' : 'Filter by actor, action, or details...'}
            className="w-full bg-brand-stone/40 border border-brand-border pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs font-mono text-brand-ivory rounded-xs focus:border-brand-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right font-sans">
            <thead className="bg-brand-stone/40 border-b border-brand-border/60 text-brand-cream/70 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">{isAr ? 'الوقت والتاريخ' : 'Timestamp'}</th>
                <th className="py-3 px-4">{isAr ? 'المسؤول (Actor)' : 'Actor'}</th>
                <th className="py-3 px-4">{isAr ? 'القسم' : 'Section'}</th>
                <th className="py-3 px-4">{isAr ? 'نوع الإجراء' : 'Action'}</th>
                <th className="py-3 px-4">{isAr ? 'التفاصيل' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-brand-cream/50">
                    {isAr ? 'لا توجد سجلات مطابقة للبحث.' : 'No audit events found.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-stone/20 transition-colors">
                    <td className="py-3.5 px-4 text-brand-cream/60 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString('ar-EG')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-ivory">
                      <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
                        <User className="w-3.5 h-3.5 text-brand-gold/70 flex-shrink-0" />
                        <span className="truncate max-w-xs">{log.actorEmail}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-brand-cream/80">
                      <span className="px-2 py-0.5 bg-brand-stone rounded-xs border border-brand-border text-[10px]">
                        {log.section}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-brand-gold/15 text-brand-gold border border-brand-gold/30 rounded-xs text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-brand-cream/90 font-sans leading-relaxed">
                      {log.details}
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
