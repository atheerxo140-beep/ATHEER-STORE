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
export type PaymentStatus = 'pending_cod' | 'paid_on_delivery' | 'cancelled';

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
  paymentMethod: 'cash_on_delivery';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  items: StoredOrderItem[];
  createdAt: string;
  updatedAt?: string;
  backendStorage: 'supabase' | 'local_database';
}

const initialSeedOrders: StoredOrder[] = [
  {
    id: 'ord-eg-001',
    orderReference: 'ATH-EG-7821',
    customerName: 'Omar El-Sayed (عمر السيد)',
    customerPhone: '01098765432',
    customerEmail: 'omar.elsayed@gmail.com',
    shippingCountry: 'Egypt',
    governorate: 'Cairo',
    shippingCity: 'New Cairo (Fifth Settlement)',
    shippingDistrict: 'South Choueifat Area',
    shippingAddress: 'Villa 42, Street 18, Near Choueifat School',
    shippingZoneId: 'cairo-giza',
    shippingZoneNameEn: 'Greater Cairo & Giza',
    shippingZoneNameAr: 'القاهرة الكبرى والجيزة',
    subtotal: 1450,
    shippingFee: 60,
    totalAmount: 1510,
    currency: 'EGP',
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_cod',
    orderStatus: 'confirmed',
    notes: 'Please call 15 minutes before arrival.',
    items: [
      {
        productId: 'ath-hd-01',
        productNameEn: 'The Heavyweight 500 GSM Boxy Hoodie',
        productNameAr: 'هودي أثير بوكسي الثقيل 500 GSM',
        selectedSize: 'L',
        selectedColor: 'Onyx Black',
        unitPrice: 1450,
        quantity: 1,
        totalPrice: 1450,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
        gsm: 500,
      },
    ],
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 mins ago
    backendStorage: 'local_database',
  },
  {
    id: 'ord-eg-002',
    orderReference: 'ATH-EG-7820',
    customerName: 'Salma Mansour (سلمى منصور)',
    customerPhone: '01123456789',
    customerEmail: 'salma.m@outlook.com',
    shippingCountry: 'Egypt',
    governorate: 'Alexandria',
    shippingCity: 'Alexandria (Smouha)',
    shippingDistrict: 'Smouha',
    shippingAddress: 'Bldg 15, Fawzi Moaz St, 4th Floor Apt 8',
    shippingZoneId: 'alex-delta',
    shippingZoneNameEn: 'Alexandria & Delta Governorates',
    shippingZoneNameAr: 'الإسكندرية ومحافظات الدلتا',
    subtotal: 2600,
    shippingFee: 0, // Free shipping above 2000 EGP threshold
    totalAmount: 2600,
    currency: 'EGP',
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_cod',
    orderStatus: 'processing',
    notes: 'Fragile delivery requested.',
    items: [
      {
        productId: 'ath-sw-01',
        productNameEn: 'Atelier Crewneck Sweatshirt in Slate',
        productNameAr: 'سويت شيرت كرو نيك الفاخر بالرمادي الداكن',
        selectedSize: 'M',
        selectedColor: 'Slate Grey',
        unitPrice: 1150,
        quantity: 1,
        totalPrice: 1150,
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
        gsm: 450,
      },
      {
        productId: 'ath-hd-02',
        productNameEn: 'The Bone Ivory Oversized Hoodie',
        productNameAr: 'هودي العاجي أوفرسايز المطرز',
        selectedSize: 'M',
        selectedColor: 'Bone Ivory',
        unitPrice: 1450,
        quantity: 1,
        totalPrice: 1450,
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop',
        gsm: 480,
      },
    ],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    backendStorage: 'local_database',
  },
  {
    id: 'ord-eg-003',
    orderReference: 'ATH-EG-7819',
    customerName: 'Kareem Nour (كريم نور)',
    customerPhone: '01234567890',
    customerEmail: 'kareem.nour@icloud.com',
    shippingCountry: 'Egypt',
    governorate: 'Giza',
    shippingCity: 'Sheikh Zayed',
    shippingDistrict: 'Beverly Hills Compound',
    shippingAddress: 'Zone 4, Building 12, Apt 3',
    shippingZoneId: 'cairo-giza',
    shippingZoneNameEn: 'Greater Cairo & Giza',
    shippingZoneNameAr: 'القاهرة الكبرى والجيزة',
    subtotal: 1550,
    shippingFee: 60,
    totalAmount: 1610,
    currency: 'EGP',
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_cod',
    orderStatus: 'shipped',
    notes: 'Security gate entrance code 4490.',
    items: [
      {
        productId: 'ath-hd-03',
        productNameEn: 'Vintage Washed Charcoal Hoodie',
        productNameAr: 'هودي الفحم المغسول فينتاج 500 GSM',
        selectedSize: 'XL',
        selectedColor: 'Washed Charcoal',
        unitPrice: 1550,
        quantity: 1,
        totalPrice: 1550,
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop',
        gsm: 500,
      },
    ],
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), // 14 hours ago
    backendStorage: 'local_database',
  },
  {
    id: 'ord-eg-004',
    orderReference: 'ATH-EG-7818',
    customerName: 'Youssef Tarek (يوسف طارق)',
    customerPhone: '01555512345',
    customerEmail: 'youssef.tarek@gmail.com',
    shippingCountry: 'Egypt',
    governorate: 'Cairo',
    shippingCity: 'Heliopolis (Masr El Gedida)',
    shippingDistrict: 'El Korba',
    shippingAddress: '24 Baghdad Street, 2nd Floor, Apt 4',
    shippingZoneId: 'cairo-giza',
    shippingZoneNameEn: 'Greater Cairo & Giza',
    shippingZoneNameAr: 'القاهرة الكبرى والجيزة',
    subtotal: 1350,
    shippingFee: 60,
    totalAmount: 1410,
    currency: 'EGP',
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'paid_on_delivery',
    orderStatus: 'delivered',
    items: [
      {
        productId: 'ath-hd-04',
        productNameEn: 'Dune Sand Minimalist Street Hoodie',
        productNameAr: 'هودي رمال الصحراء المينيمالي',
        selectedSize: 'L',
        selectedColor: 'Dune Sand',
        unitPrice: 1350,
        quantity: 1,
        totalPrice: 1350,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
        gsm: 460,
      },
    ],
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(), // 28 hours ago
    backendStorage: 'local_database',
  },
];

// In-memory persistent orders store during runtime
const globalForOrders = global as unknown as { localOrdersStore?: StoredOrder[] };
export const localOrdersStore: StoredOrder[] =
  globalForOrders.localOrdersStore && globalForOrders.localOrdersStore.length > 0
    ? globalForOrders.localOrdersStore
    : [...initialSeedOrders];

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
