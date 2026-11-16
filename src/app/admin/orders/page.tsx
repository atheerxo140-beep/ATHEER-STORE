'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { StoredOrder, OrderStatus, PaymentStatus } from '@/data/localOrdersStore';
import { adminFetch } from '@/lib/adminAuthClient';
import { getAdminToCustomerWhatsAppUrl } from '@/lib/whatsappUtils';
import QRCode from 'qrcode';
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
  MessageCircle,
  Receipt,
  Copy,
  Check,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';

  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceFormat, setInvoiceFormat] = useState<'thermal' | 'standard'>('thermal');
  const [orderQrUrl, setOrderQrUrl] = useState('');
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const isFetchingRef = React.useRef(false);

  // Generate QR code for order tracking
  useEffect(() => {
    if (selectedOrder) {
      const trackingUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/track-order?search=${encodeURIComponent(selectedOrder.orderReference)}`
        : `https://atheer.store/track-order?search=${encodeURIComponent(selectedOrder.orderReference)}`;

      QRCode.toDataURL(trackingUrl, {
        margin: 1,
        width: 140,
        color: { dark: '#000000', light: '#ffffff' }
      })
        .then(setOrderQrUrl)
        .catch(() => {});
    }
  }, [selectedOrder]);

  const copyShortReceipt = (order: StoredOrder) => {
    const itemsList = order.items
      .map(
        (it) =>
          `• ${it.productNameAr || it.productNameEn} (${it.selectedSize} / ${it.selectedColor}) × ${it.quantity} = ${it.totalPrice.toLocaleString()} ج.م`
      )
      .join('\n');

    const text = `🧾 إيصال شحن وطلب - دار أثير | ATHEER\n--------------------------------\nرقم الطلب: ${order.orderReference}\nالتاريخ: ${new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB')}\nطريقة السداد: الدفع نقداً عند الاستلام (COD)\n--------------------------------\n👤 بيانات العميل المستلم:\nالاسم: ${order.customerName}\nالهاتف: ${order.customerPhone}${order.customerEmail ? `\nالبريد: ${order.customerEmail}` : ''}\nالعنوان: ${order.shippingCity} (${order.governorate || 'القاهرة'})\n${order.shippingAddress}${order.notes ? `\nملاحظة: ${order.notes}` : ''}\n--------------------------------\n📦 الأصناف:\n${itemsList}\n--------------------------------\nمجموع الأصناف: ${order.subtotal.toLocaleString()} ج.م\nمصاريف الشحن: ${order.shippingFee === 0 ? 'مجاني' : `${order.shippingFee.toLocaleString()} ج.م`}${order.discountAmount ? `\nالخصم: -${order.discountAmount.toLocaleString()} ج.م` : ''}\n💰 الإجمالي المطلوب تحصيله كاش: ${order.totalAmount.toLocaleString()} ج.م\n--------------------------------\n⭐ يحق للعميل فحص ومعاينة الطرد مع المندوب قبل الاستلام والدفع\nخدمة عملاء أثير: 01015993802`;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2500);
    }
  };

  const fetchOrders = async (silent = false) => {
    if (isFetchingRef.current && silent) return;
    isFetchingRef.current = true;
    if (!silent && orders.length === 0) setLoading(true);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
      if (dateFilter !== 'all') params.set('date', dateFilter);
      if (searchTerm) params.set('search', searchTerm);

      const res = await adminFetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
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
      isFetchingRef.current = false;
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(false);

    // Fast live background auto-sync every 3 seconds (skip if previous request still in flight)
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 3000);

    // BroadcastChannel for instant cross-tab order notifications
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('atheer_orders_sync');
      bc.onmessage = () => {
        fetchOrders(true);
      };
    } catch (e) {
      // Ignore if unsupported
    }

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, [statusFilter, paymentFilter, dateFilter, searchTerm]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await adminFetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        const statusLabel = isAr
          ? (newStatus === 'shipped' ? 'تم الشحن' : newStatus === 'delivered' ? 'وصل للعميل' : newStatus === 'confirmed' ? 'تم التأكيد' : newStatus === 'processing' ? 'قيد التجهيز' : newStatus === 'cancelled' ? 'ملغي' : 'قيد الانتظار')
          : newStatus;
        setFeedbackMsg({
          type: 'success',
          text: isAr ? `تم تحديث حالة الطلب إلى "${statusLabel}" بنجاح` : `Order status updated to "${statusLabel}" successfully`,
        });
        setSelectedOrder((prev) =>
          prev && prev.id === orderId
            ? { ...prev, orderStatus: newStatus, paymentStatus: newStatus === 'delivered' ? 'paid_on_delivery' : prev.paymentStatus }
            : prev
        );
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
      const res = await adminFetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: isAr ? 'تم تحديث حالة تحصيل الدفع عند الاستلام' : 'COD payment status updated',
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
            <span>{isAr ? 'تم التوصيل (وصل للعميل)' : 'Delivered'}</span>
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
            <span>{isAr ? 'تم التحصيل' : 'COD Collected'}</span>
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
              ? 'تتبع طلبات الدفع عند الاستلام، تغيير حالات الشحن، وتوليد فواتير الشحن لشركات التوصيل في مصر'
              : 'Track Egyptian Cash on Delivery (COD) orders, manage status pipelines, and print invoices'}
          </p>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={() => fetchOrders(false)}
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
            <option value="pending">{isAr ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="confirmed">{isAr ? 'تم التأكيد' : 'Confirmed'}</option>
            <option value="processing">{isAr ? 'قيد التجهيز' : 'Processing'}</option>
            <option value="shipped">{isAr ? 'تم الشحن' : 'Shipped'}</option>
            <option value="delivered">{isAr ? 'تم التوصيل' : 'Delivered'}</option>
            <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
          </select>
        </div>

        {/* COD Payment Filter */}
        <div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full bg-brand-stone/40 border border-brand-border/60 text-brand-ivory text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-brand-gold font-mono"
          >
            <option value="all">{isAr ? 'حالة التحصيل (الكل)' : 'All Payment States'}</option>
            <option value="pending_cod">{isAr ? 'في انتظار التحصيل' : 'Pending COD'}</option>
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

      {/* Orders List Container: Desktop Table + Mobile Responsive Cards */}
      <div className="bg-brand-charcoal border border-brand-border/80 rounded-sm overflow-hidden shadow-2xl">
        {/* Mobile View: High-Density Touch Cards (Phones & Small Tablets) */}
        <div className="md:hidden divide-y divide-brand-border/40">
          {loading && orders.length === 0 ? (
            <div className="py-12 text-center text-brand-cream/50 font-mono text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
              {isAr ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-brand-cream/50 font-mono text-xs">
              {isAr ? 'لا توجد طلبات مسجلة مطابقة' : 'No customer orders match the criteria.'}
            </div>
          ) : (
            orders.map((order) => {
              const totalItems = order.items.reduce((acc, it) => acc + it.quantity, 0);
              return (
                <div key={order.id} className="p-4 space-y-3 bg-brand-charcoal hover:bg-brand-stone/10 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="font-mono font-bold text-sm text-brand-gold hover:underline flex items-center space-x-1.5 rtl:space-x-reverse"
                      >
                        <span>{order.orderReference}</span>
                      </button>
                      <span className="text-[10px] text-brand-cream/50 font-mono block mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-right rtl:text-left">
                      <span className="font-mono font-bold text-sm text-brand-ivory block">
                        {order.totalAmount.toLocaleString()} <span className="text-[10px] text-brand-gold">{isAr ? 'ج.م' : 'EGP'}</span>
                      </span>
                      <span className="text-[10px] text-brand-cream/60 block font-mono">
                        {totalItems} {isAr ? 'قطع' : 'pcs'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-brand-ivory block text-xs">{order.customerName}</span>
                      <div className="text-[11px] text-brand-cream/70 flex items-center space-x-1 rtl:space-x-reverse mt-0.5 font-mono">
                        <MapPin className="w-3 h-3 text-brand-gold shrink-0" />
                        <span>{order.shippingCity}</span>
                        <span className="text-brand-border">·</span>
                        <span>{order.customerPhone}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end rtl:items-start gap-1">
                      {getStatusBadge(order.orderStatus)}
                      {getPaymentBadge(order.paymentStatus)}
                    </div>
                  </div>

                  {/* Mobile Quick Action Buttons & 1-Tap Pipeline Switcher */}
                  <div className="space-y-2 pt-2 border-t border-brand-border/40">
                    {/* 1-Tap Quick Pipeline Actions (تم الشحن / وصل للعميل) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 font-mono">
                      <span className="text-[10px] text-brand-cream/60 shrink-0">{isAr ? 'تحديث سريع:' : 'Quick Set:'}</span>
                      {order.orderStatus !== 'shipped' && order.orderStatus !== 'delivered' && (
                        <button
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() => handleUpdateStatus(order.id, 'shipped')}
                          className="flex-1 py-1 px-2 bg-blue-950/70 hover:bg-blue-900 border border-blue-500/60 text-blue-300 text-[11px] font-bold rounded-xs flex items-center justify-center space-x-1 rtl:space-x-reverse transition-all active:scale-95 shadow-sm"
                          title={isAr ? 'تحديد كـ تم الشحن' : 'Mark as Shipped'}
                        >
                          <Truck className="w-3.5 h-3.5 shrink-0" />
                          <span>{isAr ? 'تم الشحن 🚚' : 'Shipped 🚚'}</span>
                        </button>
                      )}
                      {order.orderStatus !== 'delivered' && (
                        <button
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="flex-1 py-1 px-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-[11px] font-bold rounded-xs flex items-center justify-center space-x-1 rtl:space-x-reverse transition-all active:scale-95 shadow-sm"
                          title={isAr ? 'تحديد كـ وصل للعميل' : 'Mark as Delivered'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{isAr ? 'وصل للعميل ✓' : 'Delivered ✓'}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={getAdminToCustomerWhatsAppUrl(order, isAr ? 'ar' : 'en')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-2.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold rounded-xs flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{isAr ? 'واتساب العميل' : 'WhatsApp'}</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 py-2 px-2.5 bg-brand-stone/40 hover:bg-brand-stone border border-brand-border text-brand-ivory text-xs font-mono font-bold rounded-xs flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors"
                      >
                        <Eye className="w-4 h-4 text-brand-gold shrink-0" />
                        <span>{isAr ? 'تفاصيل الطلب' : 'Details'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(order);
                          setInvoiceFormat('thermal');
                          setIsInvoiceModalOpen(true);
                        }}
                        className="p-2 border border-brand-border bg-brand-stone/30 text-brand-cream/80 hover:text-brand-gold rounded-xs transition-colors shrink-0"
                        title={isAr ? 'طباعة إيصال مختصر (80mm)' : 'Print Mini Receipt'}
                      >
                        <Receipt className="w-4 h-4 text-brand-gold" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Wide Spreadsheet Table (Tablets & Desktops) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="border-b border-brand-border/80 bg-brand-stone/30 text-[10px] uppercase font-mono tracking-widest text-brand-cream/60">
                <th className="py-3 px-4">{isAr ? 'رقم الطلب' : 'Order Ref'}</th>
                <th className="py-3 px-4">{isAr ? 'العميل' : 'Customer'}</th>
                <th className="py-3 px-4">{isAr ? 'المحافظة / الوجهة' : 'Location / Zone'}</th>
                <th className="py-3 px-4">{isAr ? 'القطع' : 'Items'}</th>
                <th className="py-3 px-4">{isAr ? 'الإجمالي (ج.م)' : 'Total (EGP)'}</th>
                <th className="py-3 px-4">{isAr ? 'حالة الطلب' : 'Status'}</th>
                <th className="py-3 px-4">{isAr ? 'التحصيل' : 'Payment'}</th>
                <th className="py-3 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs font-mono">
              {loading && orders.length === 0 ? (
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
                        {order.totalAmount.toLocaleString()} <span className="text-[10px] text-brand-gold">{isAr ? 'ج.م' : 'EGP'}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div>{getStatusBadge(order.orderStatus)}</div>
                          <div className="flex items-center gap-1 font-mono">
                            {order.orderStatus !== 'shipped' && order.orderStatus !== 'delivered' && (
                              <button
                                type="button"
                                disabled={isUpdatingStatus}
                                onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                className="px-1.5 py-0.5 bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-blue-300 rounded-xs text-[10px] font-bold transition-all hover:scale-105 active:scale-95"
                                title={isAr ? 'تحديد كـ تم الشحن' : 'Mark as Shipped'}
                              >
                                {isAr ? 'تم الشحن 🚚' : 'Shipped 🚚'}
                              </button>
                            )}
                            {order.orderStatus !== 'delivered' && (
                              <button
                                type="button"
                                disabled={isUpdatingStatus}
                                onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                className="px-1.5 py-0.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-xs text-[10px] font-bold transition-all hover:scale-105 active:scale-95"
                                title={isAr ? 'تحديد كـ وصل للعميل' : 'Mark as Delivered'}
                              >
                                {isAr ? 'وصل للعميل ✓' : 'Delivered ✓'}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">{getPaymentBadge(order.paymentStatus)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                          <a
                            href={getAdminToCustomerWhatsAppUrl(order, isAr ? 'ar' : 'en')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/30 rounded-xs transition-colors"
                            title={isAr ? 'مراسلة العميل وتأكيد الطلب على الواتساب' : 'Message Customer on WhatsApp'}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
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
                              setInvoiceFormat('thermal');
                              setIsInvoiceModalOpen(true);
                            }}
                            className="p-1.5 text-brand-gold hover:text-brand-ivory hover:bg-brand-stone rounded-xs transition-colors"
                            title={isAr ? 'طباعة إيصال مختصر (80mm)' : 'Print Mini Receipt (80mm)'}
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setInvoiceFormat('standard');
                              setIsInvoiceModalOpen(true);
                            }}
                            className="p-1.5 text-brand-cream/70 hover:text-brand-gold hover:bg-brand-stone rounded-xs transition-colors"
                            title={isAr ? 'طباعة فاتورة A4 كاملة' : 'Print Full A4 Invoice'}
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
                    {isAr ? 'مستودع البيانات:' : 'Storage:'} {selectedOrder.backendStorage === 'supabase' ? (isAr ? 'السحابة' : 'Supabase') : (isAr ? 'محلي' : 'Local')}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceFormat('thermal');
                    setIsInvoiceModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1.5 bg-brand-gold/15 border border-brand-gold/50 text-brand-gold hover:bg-brand-gold hover:text-brand-black rounded-xs transition-colors font-bold text-xs"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إيصال مختصر (80mm)' : 'Mini Receipt'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceFormat('standard');
                    setIsInvoiceModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1.5 bg-brand-stone border border-brand-border text-brand-ivory hover:border-brand-gold rounded-xs transition-colors text-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{isAr ? 'فاتورة كاملة' : 'Invoice'}</span>
                </button>
                <button
                  type="button"
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
                  { status: 'pending', label: isAr ? 'قيد الانتظار' : 'Pending' },
                  { status: 'confirmed', label: isAr ? 'تم التأكيد' : 'Confirmed' },
                  { status: 'processing', label: isAr ? 'قيد التجهيز' : 'Processing' },
                  { status: 'shipped', label: isAr ? 'تم الشحن 🚚' : 'Shipped' },
                  { status: 'delivered', label: isAr ? 'وصل للعميل (تم التوصيل) ✓' : 'Delivered' },
                  { status: 'cancelled', label: isAr ? 'ملغي' : 'Cancelled' },
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
                  {isAr ? 'حالة تحصيل الدفع عند الاستلام:' : 'Cash On Delivery Status:'}
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

            {/* WHATSAPP CUSTOMER DISPATCH ACTION */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 to-brand-charcoal border border-emerald-500/50 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-emerald-400">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 fill-emerald-400/20" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">
                    {isAr ? 'مراسلة العميل وتأكيد الطلب على الواتساب' : 'Dispatch WhatsApp Notice to Customer'}
                  </div>
                  <div className="text-[11px] text-brand-cream/70 font-sans mt-0.5">
                    {isAr
                      ? 'فتح محادثة واتساب جاهزة ببيانات الفاتورة الكاملة وتفاصيل الشحن لرقم العميل'
                      : 'Opens WhatsApp chat with pre-written invoice details to customer phone'}
                  </div>
                </div>
              </div>
              <a
                href={getAdminToCustomerWhatsAppUrl(selectedOrder, isAr ? 'ar' : 'en')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xs flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-all flex-shrink-0 shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>{isAr ? 'مراسلة العميل عبر واتساب' : 'Open WhatsApp Chat'}</span>
              </a>
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
                          <span className="text-brand-gold font-bold">{isAr ? 'المقاس:' : 'Size:'} {item.selectedSize}</span>
                          <span>·</span>
                          <span>{isAr ? 'اللون:' : 'Color:'} {item.selectedColor}</span>
                          <span>·</span>
                          <span className="px-1.5 py-0.2 bg-brand-charcoal border border-brand-border/40 text-[9px]">
                            {item.gsm} {isAr ? 'جم/م²' : 'GSM'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right rtl:text-left">
                      <div className="font-bold text-brand-ivory">
                        {item.totalPrice.toLocaleString()} <span className="text-brand-gold text-[10px]">{isAr ? 'ج.م' : 'EGP'}</span>
                      </div>
                      <div className="text-[10px] text-brand-cream/50">
                        {item.quantity} × {item.unitPrice.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
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
                <span>{selectedOrder.subtotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
              </div>
              <div className="flex justify-between text-brand-cream/80">
                <span>
                  {isAr ? 'رسوم الشحن والتوصيل:' : 'Courier Shipping Fee:'} (
                  {isAr ? selectedOrder.shippingZoneNameAr : selectedOrder.shippingZoneNameEn})
                </span>
                <span>
                  {selectedOrder.shippingFee === 0
                    ? isAr ? 'شحن مجاني' : 'FREE'
                    : `${selectedOrder.shippingFee.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`}
                </span>
              </div>
              {selectedOrder.discountAmount ? (
                <div className="flex justify-between text-emerald-400">
                  <span>{isAr ? 'الخصم المطبق:' : 'Coupon Discount:'} ({selectedOrder.couponCode})</span>
                  <span>-{selectedOrder.discountAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-bold text-brand-gold pt-2 border-t border-brand-border/80">
                <span>{isAr ? 'الإجمالي المطلوب عند الاستلام:' : 'Total COD Amount Due:'}</span>
                <span>{selectedOrder.totalAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
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

      {/* PRINTABLE INVOICE / MINI THERMAL RECEIPT SLIP MODAL */}
      {selectedOrder && isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 overflow-y-auto">
          <div
            id="printable-receipt-modal"
            className={`bg-white text-black w-full rounded-sm shadow-2xl space-y-4 my-4 font-mono print:m-0 print:p-0 print:w-full print:shadow-none ${
              invoiceFormat === 'thermal'
                ? 'max-w-sm p-4 sm:p-6 thermal-receipt-paper border-2 border-dashed border-gray-400'
                : 'max-w-2xl p-6 sm:p-8'
            }`}
          >
            {/* Action Bar (hidden when printed) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200 print-hide print:hidden text-xs">
              {/* Format Toggle Tabs */}
              <div className="flex items-center bg-gray-100 p-1 rounded-sm border border-gray-200">
                <button
                  type="button"
                  onClick={() => setInvoiceFormat('thermal')}
                  className={`px-3 py-1.5 rounded-xs font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-all ${
                    invoiceFormat === 'thermal'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إيصال مختصر (80mm)' : 'Mini Receipt (80mm)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceFormat('standard')}
                  className={`px-3 py-1.5 rounded-xs font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-all ${
                    invoiceFormat === 'standard'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isAr ? 'فاتورة A4 كاملة' : 'Full A4 Invoice'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => copyShortReceipt(selectedOrder)}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 font-bold rounded-xs flex items-center space-x-1 rtl:space-x-reverse transition-colors"
                  title={isAr ? 'نسخ بيانات الإيصال للمندوب أو شركات الشحن' : 'Copy receipt text'}
                >
                  {copiedReceipt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-600" />
                      <span>{isAr ? 'نسخ' : 'Copy'}</span>
                    </>
                  )}
                </button>

                <a
                  href={getAdminToCustomerWhatsAppUrl(selectedOrder, isAr ? 'ar' : 'en')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xs flex items-center space-x-1 rtl:space-x-reverse transition-colors"
                  title={isAr ? 'إرسال بيانات الإيصال لواتساب العميل' : 'Send via WhatsApp'}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
                </a>

                <button
                  type="button"
                  onClick={printInvoice}
                  className="px-3 py-1.5 bg-black text-white hover:bg-gray-800 font-bold rounded-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-md transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isAr ? 'طباعة' : 'Print'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="p-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xs"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* FORMAT 1: COMPACT MINI THERMAL RECEIPT SLIP (80mm) */}
            {invoiceFormat === 'thermal' ? (
              <div className="space-y-3 text-black text-xs font-mono leading-tight">
                {/* 1. Header: Logo, Store Name, Subtitle */}
                <div className="text-center space-y-1 pb-2.5 border-b-2 border-dashed border-black">
                  <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center">
                    <img
                      src="/images/atheer-emblem-transparent.png"
                      alt="ATHEER Logo"
                      className="w-full h-full object-contain filter grayscale contrast-200"
                    />
                  </div>
                  <h2 className="text-xl font-black tracking-widest uppercase">ATHEER · أثير</h2>
                  <p className="text-[10px] text-gray-700 font-bold uppercase tracking-wider">
                    {isAr ? 'دار أزياء الشارع المصرية الفاخرة · ٥٠٠ جم' : 'PREMIUM STREETWEAR ATELIER'}
                  </p>
                  <p className="text-[10px] text-gray-600">
                    {isAr ? 'القاهرة، جمهورية مصر العربية · هاتف: 01015993802' : 'Cairo, Egypt · Tel: 01015993802'}
                  </p>
                </div>

                {/* 2. Order Reference & Date */}
                <div className="pb-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
                  <div className="flex justify-between items-center font-bold">
                    <span>{isAr ? 'رقم الطلب:' : 'Order Ref:'}</span>
                    <span className="text-xs bg-black text-white px-2 py-0.5 rounded-xs tracking-wider">
                      {selectedOrder.orderReference}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>{isAr ? 'التاريخ والوقت:' : 'Date:'}</span>
                    <span>
                      {new Date(selectedOrder.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB')}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>{isAr ? 'طريقة السداد:' : 'Payment:'}</span>
                    <span className="font-bold underline">
                      {isAr ? 'الدفع نقداً عند الاستلام (COD)' : 'Cash On Delivery'}
                    </span>
                  </div>
                </div>

                {/* 3. Customer & Address Details (عنوان العميل بالتفصيل) */}
                <div className="pb-2.5 border-b-2 border-dashed border-black space-y-1 text-[11px] bg-gray-50 p-2.5 rounded-xs border border-gray-200">
                  <div className="font-bold text-black border-b border-gray-300 pb-1 flex items-center justify-between">
                    <span>{isAr ? '📍 عنوان وبيانات المستلم:' : '📍 Recipient Address:'}</span>
                    <span className="text-[10px] text-gray-500 font-normal">{isAr ? 'مصر' : 'Egypt'}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-gray-600">{isAr ? 'العميل:' : 'Name:'}</span>
                    <span className="font-bold text-gray-900">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isAr ? 'الهاتف:' : 'Phone:'}</span>
                    <span className="font-bold text-gray-900 tracking-wider" dir="ltr">
                      {selectedOrder.customerPhone}
                    </span>
                  </div>
                  <div className="pt-1">
                    <div className="text-gray-600 text-[10px]">{isAr ? 'العنوان بالتفصيل:' : 'Address:'}</div>
                    <div className="font-bold text-gray-900 leading-snug">
                      {selectedOrder.shippingCity} ({selectedOrder.governorate || (isAr ? 'القاهرة' : 'Cairo')})
                      {selectedOrder.shippingDistrict ? ` · ${selectedOrder.shippingDistrict}` : ''}
                      <div className="font-normal text-[11px] text-gray-800 mt-0.5">
                        {selectedOrder.shippingAddress}
                      </div>
                    </div>
                  </div>
                  {selectedOrder.notes && (
                    <div className="pt-1 text-[10px] text-amber-900 bg-amber-50 p-1 rounded-xs border border-amber-200">
                      <span className="font-bold">{isAr ? 'ملاحظة للمندوب: ' : 'Courier Note: '}</span>
                      {selectedOrder.notes}
                    </div>
                  )}
                </div>

                {/* 4. The Few Items List (الأصناف القليلة المختصرة) */}
                <div className="pb-2.5 border-b-2 border-dashed border-black space-y-1.5">
                  <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider pb-1 border-b border-gray-300 flex justify-between">
                    <span>{isAr ? 'الصنف / المقاس' : 'Item / Size'}</span>
                    <span>{isAr ? 'الكمية × السعر' : 'Qty × Price'}</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    {selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[11px]">
                        <div className="flex-1 pr-2 rtl:pr-0 rtl:pl-2">
                          <div className="font-bold text-gray-900 leading-tight">
                            {isAr ? (it.productNameAr || it.productNameEn) : it.productNameEn}
                          </div>
                          <div className="text-[10px] text-gray-600">
                            {it.selectedSize} · {it.selectedColor}
                          </div>
                        </div>
                        <div className="text-right rtl:text-left shrink-0">
                          <div className="font-bold text-gray-900">
                            {it.totalPrice.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {it.quantity} × {it.unitPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Totals & Grand COD Due Box (المبلغ الإجمالي) */}
                <div className="space-y-1 text-[11px] pt-1 pb-2.5 border-b-2 border-dashed border-black">
                  <div className="flex justify-between text-gray-700">
                    <span>{isAr ? 'مجموع الأصناف:' : 'Subtotal:'}</span>
                    <span>{selectedOrder.subtotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>{isAr ? 'مصاريف الشحن:' : 'Delivery:'}</span>
                    <span>
                      {selectedOrder.shippingFee === 0
                        ? (isAr ? 'شحن مجاني' : 'FREE')
                        : `${selectedOrder.shippingFee.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`}
                    </span>
                  </div>
                  {selectedOrder.discountAmount ? (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>{isAr ? 'الخصم:' : 'Discount:'}</span>
                      <span>-{selectedOrder.discountAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
                    </div>
                  ) : null}

                  {/* Prominent Highlighted Cash Due Box */}
                  <div className="mt-2 p-2 bg-black text-white rounded-xs text-center border-2 border-black">
                    <div className="text-[9px] uppercase font-bold tracking-widest text-gray-300">
                      {isAr ? 'المبلغ الإجمالي المطلوب تحصيله كاش' : 'TOTAL COD DUE'}
                    </div>
                    <div className="text-lg sm:text-xl font-black tracking-wider text-white mt-0.5">
                      {selectedOrder.totalAmount.toLocaleString()} {isAr ? 'ج.م مصري' : 'EGP'}
                    </div>
                  </div>
                </div>

                {/* 6. Footer Notice & QR Code */}
                <div className="text-center pt-2 space-y-2">
                  <p className="text-[10px] text-gray-800 font-bold">
                    {isAr
                      ? '⭐ يحق للعميل معاينة الطرد والتأكد من خامة القطن ٥٠٠ جم مع المندوب قبل الدفع.'
                      : '⭐ Open box inspection guaranteed with courier before payment.'}
                  </p>

                  {orderQrUrl && (
                    <div className="pt-1 flex flex-col items-center justify-center">
                      <img src={orderQrUrl} alt="Order QR" className="w-16 h-16 border border-gray-300 p-1" />
                      <span className="text-[9px] text-gray-500 mt-0.5">
                        {isAr ? 'امسح الرمز لتتبع الشحنة أونلاين' : 'Scan to track online'}
                      </span>
                    </div>
                  )}

                  <div className="text-[9px] text-gray-500 border-t border-dotted border-gray-300 pt-1.5">
                    {isAr ? 'دار أثير · خدمة العملاء: 01015993802' : 'ATHEER Atelier · Support: 01015993802'}
                  </div>
                </div>
              </div>
            ) : (
              /* FORMAT 2: FULL COMMERCIAL A4 INVOICE */
              <div className="space-y-6 text-sm">
                {/* Invoice Header */}
                <div className="flex justify-between items-start pb-6 border-b-2 border-black">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <img
                      src="/images/atheer-emblem-transparent.png"
                      alt="ATHEER"
                      className="w-12 h-12 object-contain filter grayscale contrast-200 mt-1"
                    />
                    <div>
                      <h2 className="text-3xl font-black tracking-widest uppercase">ATHEER · أثير</h2>
                      <p className="text-xs tracking-wider text-gray-600 mt-0.5">
                        {isAr ? 'أثير · أزياء الشارع الراقية للشباب ٥٠٠ جم/م²' : 'ATHEER · 500 GSM PREMIUM STREETWEAR'}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {isAr ? 'القاهرة، جمهورية مصر العربية · هاتف: 01015993802' : 'Cairo, Egypt · Tel: 01015993802'}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {isAr ? 'خدمة العملاء: atheerxo140@gmail.com' : 'Concierge: atheerxo140@gmail.com'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right rtl:text-left font-mono">
                    <div className="text-xl font-bold">{selectedOrder.orderReference}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {isAr ? 'التاريخ:' : 'Date:'} {new Date(selectedOrder.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB')}
                    </div>
                    <div className="mt-2 inline-block px-2.5 py-1 bg-gray-100 text-gray-900 border border-gray-300 text-xs font-bold uppercase">
                      {isAr ? 'الدفع نقداً عند الاستلام' : 'CASH ON DELIVERY (COD)'}
                    </div>
                  </div>
                </div>

                {/* Customer & Courier Destination */}
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 border border-gray-200">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold mb-1">
                      {isAr ? 'بيانات العميل المستلم:' : 'Recipient Customer:'}
                    </div>
                    <div className="font-bold text-gray-900 text-base">{selectedOrder.customerName}</div>
                    <div className="font-mono text-xs text-gray-700 mt-1 font-semibold" dir="ltr">
                      {isAr ? 'الهاتف:' : 'Phone:'} {selectedOrder.customerPhone}
                    </div>
                    {selectedOrder.customerEmail && (
                      <div className="text-xs text-gray-600">{selectedOrder.customerEmail}</div>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold mb-1">
                      {isAr ? 'عنوان التوصيل في مصر:' : 'Delivery Address (Egypt):'}
                    </div>
                    <div className="font-bold text-gray-900 text-sm">
                      {selectedOrder.shippingCity} ({selectedOrder.governorate || (isAr ? 'القاهرة' : 'Cairo')})
                    </div>
                    <div className="text-xs text-gray-700 mt-1 leading-relaxed">
                      {selectedOrder.shippingAddress}
                      {selectedOrder.shippingDistrict ? ` · ${selectedOrder.shippingDistrict}` : ''}
                    </div>
                    {selectedOrder.notes && (
                      <div className="text-[11px] text-gray-600 italic mt-1">
                        {isAr ? 'ملاحظات للمندوب:' : 'Courier Note:'} {selectedOrder.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black text-xs font-mono uppercase text-gray-600">
                      <th className="py-2">{isAr ? 'بيان القطعة' : 'Item Description'}</th>
                      <th className="py-2">{isAr ? 'المقاس / اللون' : 'Size / Color'}</th>
                      <th className="py-2 text-center">{isAr ? 'جم/م²' : 'GSM'}</th>
                      <th className="py-2 text-center">{isAr ? 'الكمية' : 'Qty'}</th>
                      <th className="py-2 text-right rtl:text-left">{isAr ? 'سعر الوحدة (ج.م)' : 'Unit (EGP)'}</th>
                      <th className="py-2 text-right rtl:text-left">{isAr ? 'الإجمالي (ج.م)' : 'Total (EGP)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs">
                    {selectedOrder.items.map((it, idx) => (
                      <tr key={idx} className="py-2">
                        <td className="py-3 font-semibold text-gray-900">
                          {isAr ? (it.productNameAr || it.productNameEn) : it.productNameEn}
                          <div className="text-[11px] text-gray-500 font-normal">{isAr ? it.productNameEn : it.productNameAr}</div>
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
                      <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                      <span>{selectedOrder.subtotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>{isAr ? 'رسوم الشحن:' : 'Shipping Fee:'}</span>
                      <span>
                        {selectedOrder.shippingFee === 0 ? (isAr ? 'مجاني' : 'FREE') : `${selectedOrder.shippingFee.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`}
                      </span>
                    </div>
                    {selectedOrder.discountAmount ? (
                      <div className="flex justify-between text-gray-600">
                        <span>{isAr ? 'الخصم:' : 'Discount:'}</span>
                        <span>-{selectedOrder.discountAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-base font-bold text-black pt-2 border-t border-gray-300">
                      <span>{isAr ? 'الإجمالي المطلوب سداده:' : 'TOTAL COD DUE:'}</span>
                      <span>{selectedOrder.totalAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Courier Notice */}
                <div className="pt-6 border-t border-gray-200 text-[11px] text-gray-500 leading-relaxed text-center font-mono">
                  {isAr
                    ? 'شكراً لاختياركم أثير. يحق لكم فحص ومعاينة الطرد مع المندوب قبل الاستلام وسداد القيمة.'
                    : 'Thank you for choosing ATHEER | أثير. Please inspect garment packaging before accepting COD delivery.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
