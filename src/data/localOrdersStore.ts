export interface StoredOrder {
  id: string;
  orderReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingCountry: string;
  shippingCity: string;
  shippingAddress: string;
  shippingPostalCode?: string;
  shippingZoneId: string;
  shippingZoneNameEn: string;
  shippingZoneNameAr: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  currency: string;
  paymentMethod: 'cash_on_delivery';
  paymentStatus: 'pending_cod';
  orderStatus: 'confirmed' | 'processing' | 'dispatched' | 'delivered';
  notes?: string;
  items: {
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
  }[];
  createdAt: string;
  backendStorage: 'supabase' | 'local_database';
}

// In-memory persistent orders store during runtime
const globalForOrders = global as unknown as { localOrdersStore?: StoredOrder[] };
export const localOrdersStore: StoredOrder[] = globalForOrders.localOrdersStore || [];
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
