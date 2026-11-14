import fs from 'fs';
import path from 'path';

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
  paymentMethod: string;
  paymentReference?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  items: StoredOrderItem[];
  createdAt: string;
  updatedAt?: string;
  backendStorage: 'supabase' | 'local_database';
}

const ORDERS_JSON_PATH = path.join(process.cwd(), 'src', 'data', 'orders_store.json');

function loadOrdersFromDisk(): StoredOrder[] {
  try {
    if (fs.existsSync(ORDERS_JSON_PATH)) {
      const data = fs.readFileSync(ORDERS_JSON_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[OrdersStore] Error loading orders from disk:', err);
  }
  return [];
}

function persistOrdersToDisk(orders: StoredOrder[]): void {
  try {
    fs.writeFileSync(ORDERS_JSON_PATH, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.warn('[OrdersStore] Notice: Could not write orders to disk (read-only environment)');
  }
}

// Global runtime instance across both development and production
const globalForOrders = global as unknown as { localOrdersStore?: StoredOrder[] };

export const localOrdersStore: StoredOrder[] =
  globalForOrders.localOrdersStore && Array.isArray(globalForOrders.localOrdersStore)
    ? globalForOrders.localOrdersStore
    : loadOrdersFromDisk();

globalForOrders.localOrdersStore = localOrdersStore;

export const saveLocalOrder = (order: StoredOrder): StoredOrder => {
  // If order with same ID or reference already exists, update it in place
  const existingIdx = localOrdersStore.findIndex(
    (o) => o.id === order.id || o.orderReference.toLowerCase() === order.orderReference.toLowerCase()
  );

  if (existingIdx >= 0) {
    localOrdersStore[existingIdx] = order;
  } else {
    localOrdersStore.unshift(order);
  }

  persistOrdersToDisk(localOrdersStore);
  return order;
};

export const getLocalOrderByIdOrRef = (idOrRef: string): StoredOrder | undefined => {
  return localOrdersStore.find(
    (o) => o.id === idOrRef || o.orderReference.toLowerCase() === idOrRef.toLowerCase()
  );
};

export const getAllLocalOrders = (): StoredOrder[] => {
  // If in-memory is empty, reload from disk just in case
  if (localOrdersStore.length === 0) {
    const fromDisk = loadOrdersFromDisk();
    if (fromDisk.length > 0) {
      localOrdersStore.push(...fromDisk);
    }
  }
  return localOrdersStore;
};

// Safe status transition validator
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const isValidStatusTransition = (from: OrderStatus, to: OrderStatus): boolean => {
  if (from === to) return true;
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
};
