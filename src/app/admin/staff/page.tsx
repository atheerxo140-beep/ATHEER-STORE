'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { adminFetch } from '@/lib/adminAuthClient';
import {
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Check,
  X,
  Lock,
  Mail,
  UserCheck,
} from 'lucide-react';

export default function AdminStaffPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('order_manager');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/staff');
      const data = await res.json();
      if (data.success && Array.isArray(data.staff)) {
        setStaff(data.staff);
      }
    } catch (e) {
      console.error('Failed to load staff members', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await adminFetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          permissions: [role],
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setName('');
        setEmail('');
        setFeedback({
          type: 'success',
          message: isAr ? 'تم إضافة عضو فريق العمل وتعيين الصلاحية بنجاح.' : 'Staff member invited successfully.',
        });
        fetchStaff();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to add staff' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string, staffEmail: string) => {
    if (staffEmail === 'atheerxo140@gmail.com' || staffEmail === 'yassinanwar140@gmail.com') {
      alert(isAr ? 'لا يمكن حذف حساب مالك العلامة التجارية الأساسي.' : 'Primary owner account cannot be deleted.');
      return;
    }
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا العضو؟' : 'Are you sure you want to remove this staff member?')) return;

    try {
      const res = await adminFetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchStaff();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'owner':
        return { label: isAr ? 'المالك الأساسي (Owner)' : 'Owner', color: 'bg-amber-950/60 text-brand-gold border-brand-gold/50' };
      case 'admin':
        return { label: isAr ? 'مدير نظام (Admin)' : 'Administrator', color: 'bg-blue-950/60 text-blue-400 border-blue-500/40' };
      case 'order_manager':
        return { label: isAr ? 'مدير الطلبات والتوصيل' : 'Order Manager', color: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' };
      case 'inventory_manager':
        return { label: isAr ? 'مدير المخزون والمقاسات' : 'Inventory Manager', color: 'bg-purple-950/60 text-purple-400 border-purple-500/40' };
      case 'marketing_manager':
        return { label: isAr ? 'مدير التسويق والعروض' : 'Marketing Manager', color: 'bg-rose-950/60 text-rose-400 border-rose-500/40' };
      default:
        return { label: r, color: 'bg-stone-900 text-stone-400 border-stone-700' };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <Users className="w-6 h-6 text-brand-gold" />
            <h1 className="text-xl sm:text-2xl font-serif font-black text-brand-ivory">
              {isAr ? 'فريق العمل وتوزيع الصلاحيات (Role-Based Access)' : 'Staff & Role-Based Permissions'}
            </h1>
          </div>
          <p className="text-xs text-brand-cream/60 mt-1">
            {isAr
              ? 'إدارة حسابات موظفي المتجر (المالك، المدير، مسؤول الطلبات، مسؤول المخزون، والتسويق)'
              : 'Owner, Administrator, Order, Inventory, and Marketing roles'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-2 rtl:space-x-reverse shadow-gold"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? '+ إضافة موظف جديد' : '+ Add Staff Member'}</span>
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

      {/* Staff Table */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs font-mono">
            <thead className="bg-brand-stone/40 text-brand-cream/60 border-b border-brand-border">
              <tr>
                <th className="py-2.5 px-3 text-start">{isAr ? 'الموظف' : 'Staff Member'}</th>
                <th className="py-2.5 px-3 text-start">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</th>
                <th className="py-2.5 px-3 text-center">{isAr ? 'الصلاحية / الدور' : 'Role'}</th>
                <th className="py-2.5 px-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="py-2.5 px-3 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {staff.map((member) => {
                const roleBadge = getRoleLabel(member.role);
                const isPrimaryOwner = member.email === 'atheerxo140@gmail.com' || member.email === 'yassinanwar140@gmail.com';

                return (
                  <tr key={member.id} className="hover:bg-brand-stone/20 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="font-bold text-brand-ivory">{member.name}</span>
                        {isPrimaryOwner && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-brand-gold border border-brand-gold/40 text-[9px] rounded-xs font-bold">
                            👑 Primary Owner
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-brand-cream/80">{member.email}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-emerald-400 font-bold text-[10px]">
                        {member.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {!isPrimaryOwner ? (
                        <button
                          onClick={() => handleDeleteStaff(member.id, member.email)}
                          className="p-1 text-brand-cream/50 hover:text-rose-400"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-brand-cream/40" title="محمي">
                          🔒
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-brand-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddStaff}
            className="bg-brand-charcoal border-2 border-brand-gold/60 rounded-xs p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-in"
          >
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <h3 className="text-sm font-bold text-brand-ivory font-serif">
                {isAr ? 'إضافة موظف جديد وتعيين الدور' : 'Add Staff Member'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-brand-cream/50 hover:text-brand-ivory"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'اسم الموظف' : 'Staff Member Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'مثال: محمد علي' : 'e.g. Mohamed Ali'}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'البريد الإلكتروني للعمل' : 'Staff Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@atheer.store"
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-brand-cream/70 mb-1">
                  {isAr ? 'الدور والصلاحيات' : 'Role & Permissions'}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-brand-stone/40 border border-brand-border/80 text-brand-ivory text-xs px-3 py-2 rounded-xs font-sans"
                >
                  <option value="order_manager">مسؤول إدارة الطلبات والشحن (Order Manager)</option>
                  <option value="inventory_manager">مسؤول المخزون والمنتجات (Inventory Manager)</option>
                  <option value="marketing_manager">مسؤول التسويق والعروض والكوبونات (Marketing)</option>
                  <option value="admin">مدير نظام عام (Administrator)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-brand-border text-xs font-mono text-brand-cream/60 hover:text-brand-ivory rounded-xs"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-brand-gold hover:bg-brand-gold-hover text-brand-black text-xs font-mono font-bold uppercase rounded-xs transition-colors"
              >
                {submitting ? (isAr ? 'جاري الإضافة...' : 'Adding...') : (isAr ? 'إضافة الموظف' : 'Add Staff')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
