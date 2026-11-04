export interface StoredOrderItem {
  productId: string;
  productNameEn: string;
  productNameAr: string;
  selectedSize: string;
  selectedColor: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  image: string;
  gsm: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending_cod' | 'paid_on_delivery' | 'pending_verification' | 'paid' | 'cancelled';

export interface StoredOrder {
  id: string;
  orderReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingCountry: string;
  governorate?: string;
  shippingCity: string;
  shippingDistrict?: string;
  shippingAddress: string;
  shippingPostalCode?: string;
  shippingZoneId: string;
  shippingZoneNameEn: string;
  shippingZoneNameAr: string;
  subtotal: number;
  shippingFee: number;
  discountAmount?: number;
  couponCode?: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string; // 'cash_on_delivery', 'instapay', 'vodafone_cash', 'credit_card', 'bank_transfer', etc.
  paymentReference?: string; // e.g. InstaPay transfer ref / wallet transaction ID
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  items: StoredOrderItem[];
  createdAt: string;
  updatedAt?: string;
  backendStorage: 'supabase' | 'local_database';
}

// In-memory runtime orders store
// In production, this starts STRICTLY EMPTY. No fake or seeded customer data allowed in production!
const globalForOrders = global as unknown as { localOrdersStore?: StoredOrder[] };

export const localOrdersStore: StoredOrder[] =
  globalForOrders.localOrdersStore && Array.isArray(globalForOrders.localOrdersStore)
    ? globalForOrders.localOrdersStore
    : [];

if (process.env.NODE_ENV !== 'production') {
  globalForOrders.localOrdersStore = localOrdersStore;
}

export const saveLocalOrder = (order: StoredOrder): StoredOrder => {
  localOrdersStore.unshift(order);
  return order;
};

export const getLocalOrderByIdOrRef = (idOrRef: string): StoredOrder | undefined => {
  return localOrdersStore.find(
    (o) => o.id === idOrRef || o.orderReference.toLowerCase() === idOrRef.toLowerCase()
  );
};

export const getAllLocalOrders = (): StoredOrder[] => {
  return localOrdersStore;
};

// Safe status transition validator
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [], // Terminal status
  cancelled: [], // Terminal status
};

export const isValidStatusTransition = (from: OrderStatus, to: OrderStatus): boolean => {
  if (from === to) return true;
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
};
