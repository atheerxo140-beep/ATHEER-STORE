import { Coupon } from '@/types';

export const defaultCoupons: Coupon[] = [
  {
    id: 'coup-01',
    code: 'ATHEER10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    usageLimit: 500,
    timesUsed: 42,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coup-02',
    code: 'YOUTH15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 1500,
    usageLimit: 200,
    timesUsed: 19,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coup-03',
    code: 'WELCOME100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 1200,
    usageLimit: 1000,
    timesUsed: 67,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const globalForCoupons = global as unknown as { currentCoupons?: Coupon[] };
export const currentCoupons: Coupon[] = globalForCoupons.currentCoupons || [...defaultCoupons];
if (process.env.NODE_ENV !== 'production') {
  globalForCoupons.currentCoupons = currentCoupons;
}

export const getAllCoupons = (): Coupon[] => {
  return currentCoupons;
};

export const getCouponByCode = (code: string): Coupon | undefined => {
  return currentCoupons.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
  );
};

export const createCoupon = (coupon: Omit<Coupon, 'id' | 'timesUsed' | 'createdAt'>): Coupon => {
  const newCoupon: Coupon = {
    ...coupon,
    id: `coup_${Date.now()}`,
    code: coupon.code.trim().toUpperCase(),
    timesUsed: 0,
    createdAt: new Date().toISOString(),
  };
  currentCoupons.unshift(newCoupon);
  return newCoupon;
};

export const toggleCouponActive = (id: string): Coupon | null => {
  const c = currentCoupons.find((coup) => coup.id === id);
  if (!c) return null;
  c.isActive = !c.isActive;
  return c;
};

export const deleteCoupon = (id: string): boolean => {
  const index = currentCoupons.findIndex((coup) => coup.id === id);
  if (index === -1) return false;
  currentCoupons.splice(index, 1);
  return true;
};
