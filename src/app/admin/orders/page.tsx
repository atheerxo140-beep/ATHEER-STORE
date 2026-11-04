'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { StoredOrder, OrderStatus, PaymentStatus } from '@/data/localOrdersStore';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  X,
  ShieldCheck,
  CreditCard,
  FileText,
  User,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
      if (dateFilter !== 'all') params.set('date', dateFilter);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        // If an order is currently selected in modal, keep it updated
        if (selectedOrder) {
          const fresh = data.orders.find((o: StoredOrder) => o.id === selectedOrder.id);
          if (fresh) setSelectedOrder(fresh);
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, dateFilter, searchTerm]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr ? `تم تحديث حالة الطلب إلى "${newStatus}"` : `Order status updated to "${newStatus}"`,
        });
        fetchOrders();
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to update order status' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr ? 'تم تحديث حالة تحصيل الدفع عند الاستلام (COD)' : 'COD payment status updated',
        });
        fetchOrders();
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to update payment status' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 bg-amber-950/40 text-amber-400 border border-amber-500/40 rounded-xs text-[10px] font-mono uppercase font-bold">
            <Clock className="w-3 h-3" />
            <span>{isAr ? 'قيد الانتظار' : 'Pending'}</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 bg-sky-950/40 text-sky-400 border border-sky-500/40 rounded-xs text-[10px] font-mono uppercase font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isAr ? 'تم التأكيد' : 'Confirmed'}</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 bg-purple-950/40 text-purple-400 border border-purple-500/40 rounded-xs text-[10px] font-mono uppercase font-bold">
            <Package className="w-3 h-3" />
            <span>{isAr ? 'قيد التجهيز' : 'Processing'}</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 bg-blue-950/40 text-blue-400 border border-blue-500/40 rounded-xs text-[10px] font-mono uppercase font-bold">
            <Truck className="w-3 h-3" />
            <span>{isAr ? 'تم الشحن' : 'Shipped'}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 rounded-xs text-[10px] font-mono uppercase font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isAr ? 'تم التوصيل' : 'Delivered'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 bg-rose-950/40 text-rose-400 border border-rose-500/40 rounded-xs text-[10px] font-mono uppercase font-bold">
            <XCircle className="w-3 h-3" />
            <span>{isAr ? 'ملغي' : 'Cancelled'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid_on_delivery':
        return (
          <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 rounded-xs text-[10px] font-mono font-bold">
            <CreditCard className="w-3 h-3" />
            <span>{isAr ? 'تم تحصيل COD' : 'COD Collected'}</span>
          </span>
        );
      case 'pending_cod':
        return (
          <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2 py-0.5 bg-amber-950/40 text-amber-300 border border-amber-500/40 rounded-xs text-[10px] font-mono font-bold">
            <Clock className="w-3 h-3" />
            <span>{isAr ? 'في انتظار التحصيل' : 'Pending COD'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2 py-0.5 bg-rose-950/40 text-rose-300 border border-rose-500/40 rounded-xs text-[10px] font-mono font-bold">
            <XCircle className="w-3 h-3" />
            <span>{isAr ? 'تحصيل ملغي' : 'COD Cancelled'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono text-brand-gold uppercase tracking-widest mb-1">
            <ShoppingBag className="w-4 h-4 text-brand-gold" />
            <span>{isAr ? 'نظام إدارة المبيعات' : 'Order Operations Hub'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-ivory font-serif">
            {isAr ? 'إدارة طلبات العملاء' : 'Customer Orders'}
          </h1>
          <p className="text-xs text-brand-cream/60 mt-1">
            {isAr
              ? 'تتبع طلبات الدفع عند الاستلام (COD)، تغيير حالات الشحن، وتوليد فواتير الشحن لشركات التوصيل في مصر'
              : 'Track Egyptian Cash on Delivery (COD) orders, manage status pipelines, and print invoices'}
          </p>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-brand-charcoal border border-brand-border text-brand-cream/80 hover:text-brand-gold hover:border-brand-gold/40 transition-colors rounded-sm"
            title={isAr ? 'تحديث الطلبات' : 'Refresh'}
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

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-brand-charcoal p-4 border border-brand-border/70 rounded-sm">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-brand-cream/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isAr ? 'بحث برقم الطلب، الاسم، أو الهاتف...' : 'Ref, name, phone, city...'}
            className="w-full bg-brand-stone/40 border border-brand-border/60 text-brand-ivory text-xs px-9 py-2 rounded-sm focus:outline-none focus:border-brand-gold font-mono"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-brand-cream/40 hover:text-brand-ivory"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Order Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-brand-stone/40 border border-brand-border/60 text-brand-ivory text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-brand-gold font-mono"
          >
            <option value="all">{isAr ? 'جميع الحالات' : 'All Order Statuses'}</option>
            <option value="pending">{isAr ? 'قيد الانتظار (Pending)' : 'Pending'}</option>
            <option value="confirmed">{isAr ? 'تم التأكيد (Confirmed)' : 'Confirmed'}</option>
            <option value="processing">{isAr ? 'قيد التجهيز (Processing)' : 'Processing'}</option>
            <option value="shipped">{isAr ? 'تم الشحن (Shipped)' : 'Shipped'}</option>
            <option value="delivered">{isAr ? 'تم التوصيل (Delivered)' : 'Delivered'}</option>
            <option value="cancelled">{isAr ? 'ملغي (Cancelled)' : 'Cancelled'}</option>
          </select>
        </div>

        {/* COD Payment Filter */}
        <div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full bg-brand-stone/40 border border-brand-border/60 text-brand-ivory text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-brand-gold font-mono"
          >
            <option value="all">{isAr ? 'حالة تحصيل COD (الكل)' : 'All Payment States'}</option>
            <option value="pending_cod">{isAr ? 'في انتظار تحصيل COD' : 'Pending COD'}</option>
            <option value="paid_on_delivery">{isAr ? 'تم التحصيل نقداً' : 'Paid on Delivery'}</option>
            <option value="cancelled">{isAr ? 'تحصيل ملغي' : 'Payment Cancelled'}</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-brand-stone/40 border border-brand-border/60 text-brand-ivory text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-brand-gold font-mono"
          >
            <option value="all">{isAr ? 'جميع الفترات' : 'All Dates'}</option>
            <option value="today">{isAr ? 'طلبات اليوم' : 'Today Only'}</option>
            <option value="week">{isAr ? 'آخر ٧ أيام' : 'Past 7 Days'}</option>
            <option value="month">{isAr ? 'آخر ٣٠ يوماً' : 'Past 30 Days'}</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="border-b border-brand-border/80 bg-brand-stone/30 text-[10px] uppercase font-mono tracking-widest text-brand-cream/60">
                <th className="py-3 px-4">{isAr ? 'رقم الطلب' : 'Order Ref'}</th>
                <th className="py-3 px-4">{isAr ? 'العميل' : 'Customer'}</th>
                <th className="py-3 px-4">{isAr ? 'المحافظة / الوجهة' : 'Location / Zone'}</th>
                <th className="py-3 px-4">{isAr ? 'القطع' : 'Items'}</th>
                <th className="py-3 px-4">{isAr ? 'الإجمالي (EGP)' : 'Total (EGP)'}</th>
                <th className="py-3 px-4">{isAr ? 'حالة الطلب' : 'Status'}</th>
                <th className="py-3 px-4">{isAr ? 'تحصيل COD' : 'COD Payment'}</th>
                <th className="py-3 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-cream/50">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
                    {isAr ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-cream/50">
                    {isAr ? 'لا توجد طلبات مسجلة مطابقة' : 'No customer orders match the criteria.'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const totalItems = order.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr key={order.id} className="hover:bg-brand-stone/20 transition-colors">
                      {/* Ref */}
                      <td className="py-3.5 px-4 font-bold text-brand-gold">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="hover:underline text-brand-gold flex items-center space-x-1.5 rtl:space-x-reverse"
                        >
                          <span>{order.orderReference}</span>
                        </button>
                        <div className="text-[10px] text-brand-cream/40 font-normal mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-brand-ivory">{order.customerName}</div>
                        <div className="text-[11px] text-brand-cream/60 flex items-center space-x-1 rtl:space-x-reverse mt-0.5">
                          <Phone className="w-3 h-3 text-brand-gold/70" />
                          <span>{order.customerPhone}</span>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-brand-ivory flex items-center space-x-1 rtl:space-x-reverse font-semibold">
                          <MapPin className="w-3 h-3 text-brand-gold" />
                          <span>{order.shippingCity}</span>
                        </div>
                        <div className="text-[10px] text-brand-cream/50">
                          {isAr ? order.shippingZoneNameAr : order.shippingZoneNameEn}
                        </div>
                      </td>

                      {/* Items Count */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-brand-ivory">{totalItems}</span>{' '}
                        <span className="text-[10px] text-brand-cream/60">{isAr ? 'قطع' : 'pcs'}</span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-bold text-brand-ivory">
                        {order.totalAmount.toLocaleString()} <span className="text-[10px] text-brand-gold">EGP</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(order.orderStatus)}</td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">{getPaymentBadge(order.paymentStatus)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-brand-cream/70 hover:text-brand-gold hover:bg-brand-stone rounded-xs transition-colors"
                            title={isAr ? 'عرض التفاصيل' : 'View Details'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsInvoiceModalOpen(true);
                            }}
                            className="p-1.5 text-brand-cream/70 hover:text-brand-gold hover:bg-brand-stone rounded-xs transition-colors"
                            title={isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && !isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-brand-charcoal border border-brand-border w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl p-6 my-8 space-y-6 font-mono text-xs">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-brand-border/80">
              <div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-lg font-black text-brand-gold font-serif">
                    {selectedOrder.orderReference}
                  </span>
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
                <div className="text-[10px] text-brand-cream/50 mt-1 flex items-center space-x-2 rtl:space-x-reverse">
                  <Calendar className="w-3 h-3 text-brand-gold" />
                  <span>
                    {new Date(selectedOrder.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                  </span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">
                    Storage: {selectedOrder.backendStorage}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 bg-brand-stone border border-brand-border text-brand-ivory hover:border-brand-gold rounded-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{isAr ? 'فاتورة' : 'Invoice'}</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-brand-cream/60 hover:text-brand-ivory"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Status Updater */}
            <div className="bg-brand-stone/30 p-4 border border-brand-border/60 rounded-sm space-y-3">
              <div className="text-[11px] font-bold text-brand-gold uppercase tracking-wider">
                {isAr ? 'تحديث مرحلة الطلب في خط التجهيز:' : 'Update Order Pipeline State:'}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { status: 'pending', label: 'Pending' },
                  { status: 'confirmed', label: 'Confirmed' },
                  { status: 'processing', label: 'Processing' },
                  { status: 'shipped', label: 'Shipped' },
                  { status: 'delivered', label: 'Delivered' },
                  { status: 'cancelled', label: 'Cancelled' },
                ].map((s) => {
                  const isCurrent = selectedOrder.orderStatus === s.status;
                  return (
                    <button
                      key={s.status}
                      disabled={isUpdatingStatus || isCurrent}
                      onClick={() => handleUpdateStatus(selectedOrder.id, s.status as OrderStatus)}
                      className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs border transition-colors ${
                        isCurrent
                          ? 'bg-brand-gold text-brand-black border-brand-gold font-bold shadow-gold cursor-default'
                          : 'bg-brand-charcoal text-brand-cream/80 border-brand-border/80 hover:border-brand-gold/60'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {/* COD Toggle */}
              <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between">
                <span className="text-brand-cream/70">
                  {isAr ? 'حالة تحصيل الدفع عند الاستلام (COD):' : 'Cash On Delivery Status:'}
                </span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    disabled={isUpdatingStatus}
                    onClick={() =>
                      handleUpdatePaymentStatus(
                        selectedOrder.id,
                        selectedOrder.paymentStatus === 'paid_on_delivery'
                          ? 'pending_cod'
                          : 'paid_on_delivery'
                      )
                    }
                    className={`px-3 py-1 text-xs border rounded-xs font-bold transition-colors ${
                      selectedOrder.paymentStatus === 'paid_on_delivery'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50'
                        : 'bg-amber-950/60 text-amber-400 border-amber-500/50'
                    }`}
                  >
                    {selectedOrder.paymentStatus === 'paid_on_delivery'
                      ? isAr ? 'تم التحصيل نقداً ✓' : 'Collected ✓'
                      : isAr ? 'في انتظار التحصيل ⏱' : 'Pending Collection ⏱'}
                  </button>
                </div>
              </div>
            </div>

            {/* Customer & Egyptian Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-stone/20 p-4 border border-brand-border/40 rounded-sm">
              <div className="space-y-1.5">
                <div className="text-[10px] text-brand-gold uppercase tracking-wider font-bold">
                  {isAr ? 'بيانات العميل' : 'Customer Profile'}
                </div>
                <div className="text-sm font-bold text-brand-ivory font-serif">
                  {selectedOrder.customerName}
                </div>
                <div className="text-xs text-brand-cream/80 flex items-center space-x-1.5 rtl:space-x-reverse">
                  <Phone className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{selectedOrder.customerPhone}</span>
                </div>
                {selectedOrder.customerEmail && (
                  <div className="text-xs text-brand-cream/60">{selectedOrder.customerEmail}</div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] text-brand-gold uppercase tracking-wider font-bold">
                  {isAr ? 'عنوان التوصيل في مصر' : 'Delivery Destination (Egypt)'}
                </div>
                <div className="text-xs text-brand-ivory font-semibold">
                  {selectedOrder.governorate ? `${selectedOrder.governorate} Governorate · ` : ''}
                  {selectedOrder.shippingCity}
                </div>
                <div className="text-xs text-brand-cream/70 leading-relaxed">
                  {selectedOrder.shippingAddress}
                  {selectedOrder.shippingDistrict ? ` (${selectedOrder.shippingDistrict})` : ''}
                </div>
                {selectedOrder.notes && (
                  <div className="text-[11px] text-amber-300/80 bg-amber-950/30 p-2 border border-amber-500/20 rounded-xs mt-1">
                    <span className="font-bold">{isAr ? 'ملاحظات العميل: ' : 'Delivery Notes: '}</span>
                    {selectedOrder.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Items Purchased */}
            <div>
              <div className="text-[11px] font-bold text-brand-gold uppercase tracking-wider mb-2">
                {isAr ? 'القطع المطلوبة' : 'Ordered Streetwear Items'}
              </div>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-brand-stone/30 border border-brand-border/60 rounded-sm"
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-12 h-14 bg-brand-charcoal relative flex-shrink-0 border border-brand-border/40 overflow-hidden rounded-xs">
                        <Image
                          src={item.image}
                          alt={item.productNameEn}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-brand-ivory font-serif text-sm">
                          {isAr ? item.productNameAr : item.productNameEn}
                        </div>
                        <div className="text-[10px] text-brand-cream/60 flex items-center space-x-2 rtl:space-x-reverse mt-0.5">
                          <span className="text-brand-gold font-bold">Size: {item.selectedSize}</span>
                          <span>·</span>
                          <span>Color: {item.selectedColor}</span>
                          <span>·</span>
                          <span className="px-1.5 py-0.2 bg-brand-charcoal border border-brand-border/40 text-[9px]">
                            {item.gsm} GSM
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right rtl:text-left">
                      <div className="font-bold text-brand-ivory">
                        {item.totalPrice.toLocaleString()} <span className="text-brand-gold text-[10px]">EGP</span>
                      </div>
                      <div className="text-[10px] text-brand-cream/50">
                        {item.quantity} × {item.unitPrice.toLocaleString()} EGP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="bg-brand-stone/40 p-4 border border-brand-border/60 rounded-sm space-y-2">
              <div className="flex justify-between text-brand-cream/80">
                <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span>{selectedOrder.subtotal.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between text-brand-cream/80">
                <span>
                  {isAr ? 'رسوم الشحن والتوصيل:' : 'Courier Shipping Fee:'} (
                  {isAr ? selectedOrder.shippingZoneNameAr : selectedOrder.shippingZoneNameEn})
                </span>
                <span>
                  {selectedOrder.shippingFee === 0
                    ? isAr ? 'شحن مجاني' : 'FREE'
                    : `${selectedOrder.shippingFee.toLocaleString()} EGP`}
                </span>
              </div>
              {selectedOrder.discountAmount ? (
                <div className="flex justify-between text-emerald-400">
                  <span>{isAr ? 'الخصم المطبق:' : 'Coupon Discount:'} ({selectedOrder.couponCode})</span>
                  <span>-{selectedOrder.discountAmount.toLocaleString()} EGP</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-bold text-brand-gold pt-2 border-t border-brand-border/80">
                <span>{isAr ? 'الإجمالي المطلوب عند الاستلام (COD):' : 'Total COD Amount Due:'}</span>
                <span>{selectedOrder.totalAmount.toLocaleString()} EGP</span>
              </div>
            </div>

            {/* Footer Close */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-brand-stone border border-brand-border text-brand-ivory hover:border-brand-gold rounded-sm"
              >
                {isAr ? 'إغلاق النافذة' : 'Close Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE SLIP MODAL */}
      {selectedOrder && isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-y-auto">
          <div className="bg-white text-black w-full max-w-2xl rounded-sm p-8 shadow-2xl space-y-6 my-6 print:m-0 print:p-0 print:w-full print:shadow-none">
            {/* Action Bar (hidden when printed) */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 print:hidden font-mono text-xs">
              <span className="font-bold text-gray-700">ATHEER Commercial COD Invoice Slip</span>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={printInvoice}
                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 font-bold uppercase rounded-sm flex items-center space-x-1.5 rtl:space-x-reverse"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isAr ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
                </button>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-sm"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="space-y-6 text-sm">
              {/* Invoice Header */}
              <div className="flex justify-between items-start pb-6 border-b-2 border-black">
                <div>
                  <h2 className="text-3xl font-black tracking-widest uppercase">ATHEER</h2>
                  <p className="text-xs tracking-wider text-gray-600 mt-0.5">
                    أثير · PREMIUM YOUTH STREETWEAR
                  </p>
                  <p className="text-[11px] text-gray-500 mt-2">
                    Cairo, Egypt · CR: 104928-EG · VAT Tax Reg: 729-194-820
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Concierge WhatsApp: +20 10 0000 0000
                  </p>
                </div>
                <div className="text-right rtl:text-left font-mono">
                  <div className="text-xl font-bold">{selectedOrder.orderReference}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Date: {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB')}
                  </div>
                  <div className="mt-2 inline-block px-2.5 py-1 bg-gray-100 text-gray-900 border border-gray-300 text-xs font-bold uppercase">
                    CASH ON DELIVERY (COD)
                  </div>
                </div>
              </div>

              {/* Customer & Courier Destination */}
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 border border-gray-200">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold mb-1">
                    Recipient Customer:
                  </div>
                  <div className="font-bold text-gray-900 text-base">{selectedOrder.customerName}</div>
                  <div className="font-mono text-xs text-gray-700 mt-1 font-semibold">
                    Phone: {selectedOrder.customerPhone}
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className="text-xs text-gray-600">{selectedOrder.customerEmail}</div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold mb-1">
                    Delivery Address (Egypt):
                  </div>
                  <div className="font-bold text-gray-900 text-sm">
                    {selectedOrder.shippingCity} ({selectedOrder.governorate || 'Cairo'} Governorate)
                  </div>
                  <div className="text-xs text-gray-700 mt-1 leading-relaxed">
                    {selectedOrder.shippingAddress}
                    {selectedOrder.shippingDistrict ? ` · ${selectedOrder.shippingDistrict}` : ''}
                  </div>
                  {selectedOrder.notes && (
                    <div className="text-[11px] text-gray-600 italic mt-1">
                      Note: {selectedOrder.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="border-b-2 border-black text-xs font-mono uppercase text-gray-600">
                    <th className="py-2">Item Description</th>
                    <th className="py-2">Size / Color</th>
                    <th className="py-2 text-center">GSM</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right rtl:text-left">Unit (EGP)</th>
                    <th className="py-2 text-right rtl:text-left">Total (EGP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {selectedOrder.items.map((it, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-3 font-semibold text-gray-900">
                        {it.productNameEn}
                        <div className="text-[11px] text-gray-500 font-normal">{it.productNameAr}</div>
                      </td>
                      <td className="py-3 font-mono">{it.selectedSize} / {it.selectedColor}</td>
                      <td className="py-3 font-mono text-center">{it.gsm}</td>
                      <td className="py-3 font-mono text-center font-bold">{it.quantity}</td>
                      <td className="py-3 font-mono text-right rtl:text-left">{it.unitPrice.toLocaleString()}</td>
                      <td className="py-3 font-mono text-right rtl:text-left font-bold">{it.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="flex justify-end pt-4 border-t-2 border-black">
                <div className="w-64 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{selectedOrder.subtotal.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Fee:</span>
                    <span>
                      {selectedOrder.shippingFee === 0 ? 'FREE' : `${selectedOrder.shippingFee.toLocaleString()} EGP`}
                    </span>
                  </div>
                  {selectedOrder.discountAmount ? (
                    <div className="flex justify-between text-gray-600">
                      <span>Discount:</span>
                      <span>-{selectedOrder.discountAmount.toLocaleString()} EGP</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-base font-bold text-black pt-2 border-t border-gray-300">
                    <span>TOTAL COD DUE:</span>
                    <span>{selectedOrder.totalAmount.toLocaleString()} EGP</span>
                  </div>
                </div>
              </div>

              {/* Delivery Courier Notice */}
              <div className="pt-6 border-t border-gray-200 text-[11px] text-gray-500 leading-relaxed text-center font-mono">
                Thank you for choosing ATHEER | أثير. Please inspect garment packaging before accepting COD delivery.
                For inquiries or exchanges, reach our Cairo concierge on WhatsApp: +20 10 0000 0000.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
