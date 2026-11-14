import { Coupon } from '@/types';
import fs from 'fs';
import path from 'path';

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

const COUPONS_JSON_PATH =
  typeof process !== 'undefined' && typeof process.cwd === 'function' && path?.join
    ? path.join(process.cwd(), 'src', 'data', 'coupons_store.json')
    : '';

function loadCouponsFromDisk(): Coupon[] {
  if (typeof window !== 'undefined' || !fs || !fs.existsSync || !COUPONS_JSON_PATH) {
    return [...defaultCoupons];
  }
  try {
    if (fs.existsSync(COUPONS_JSON_PATH)) {
      const data = fs.readFileSync(COUPONS_JSON_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[CouponsStore] Error reading coupons_store.json:', err);
  }
  return [...defaultCoupons];
}

function persistCouponsToDisk(coupons: Coupon[]): void {
  if (typeof window !== 'undefined' || !fs || !fs.writeFileSync || !COUPONS_JSON_PATH) {
    return;
  }
  try {
    fs.writeFileSync(COUPONS_JSON_PATH, JSON.stringify(coupons, null, 2), 'utf8');
  } catch (err) {
    console.warn('[CouponsStore] Notice: Could not write coupons to disk');
  }
}

const globalForCoupons = global as unknown as { currentCoupons?: Coupon[] };
export const currentCoupons: Coupon[] = globalForCoupons.currentCoupons || loadCouponsFromDisk();
globalForCoupons.currentCoupons = currentCoupons;

try {
  if (typeof window === 'undefined' && fs?.existsSync && COUPONS_JSON_PATH && !fs.existsSync(COUPONS_JSON_PATH)) {
    persistCouponsToDisk(currentCoupons);
  }
} catch (e) {}

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
  persistCouponsToDisk(currentCoupons);
  return newCoupon;
};

export const toggleCouponActive = (id: string): Coupon | null => {
  const c = currentCoupons.find((coup) => coup.id === id);
  if (!c) return null;
  c.isActive = !c.isActive;
  persistCouponsToDisk(currentCoupons);
  return c;
};

export const deleteCoupon = (id: string): boolean => {
  const index = currentCoupons.findIndex((coup) => coup.id === id);
  if (index === -1) return false;
  currentCoupons.splice(index, 1);
  persistCouponsToDisk(currentCoupons);
  return true;
};
