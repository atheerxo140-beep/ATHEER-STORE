import { Coupon } from '@/types';
import fs from 'fs';
import path from 'path';
import { getStoreFilePath } from '@/lib/storePath';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';

export const defaultCoupons: Coupon[] = [
  {
    id: 'coup-01',
    code: 'ATHEER10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    usageLimit: 500,
    timesUsed: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coup-02',
    code: 'FAMILY15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 1400,
    usageLimit: 500,
    timesUsed: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coup-03',
    code: 'WELCOME100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 1000,
    usageLimit: 1000,
    timesUsed: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coup-04',
    code: 'YOUTH15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 1500,
    usageLimit: 200,
    timesUsed: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

function getCouponsJsonPath(): string {
  if (typeof window !== 'undefined') return '';
  try {
    return getStoreFilePath('coupons_store.json');
  } catch (e) {
    return path.join(process.cwd(), 'src', 'data', 'coupons_store.json');
  }
}

function loadCouponsFromDisk(): Coupon[] {
  const filePath = getCouponsJsonPath();
  if (typeof window !== 'undefined' || !fs || !fs.existsSync || !filePath) {
    return [];
  }
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      // Honor empty array [] cleanly so deleting all coupons persists
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[CouponsStore] Error reading coupons_store.json:', err);
  }
  return [];
}

function persistCouponsToDisk(coupons: Coupon[]): void {
  const filePath = getCouponsJsonPath();
  if (typeof window !== 'undefined' || !fs || !fs.writeFileSync || !filePath) {
    return;
  }
  try {
    fs.writeFileSync(filePath, JSON.stringify(coupons, null, 2), 'utf8');
  } catch (err) {
    console.warn('[CouponsStore] Notice: Could not write coupons to disk');
  }
}

// Background sync to Supabase PostgreSQL table 'coupons'
async function syncCouponToSupabase(coupon: Coupon, action: 'upsert' | 'delete') {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseServer();
  if (!supabase) return;

  try {
    if (action === 'delete') {
      await supabase.from('coupons').delete().eq('code', coupon.code);
    } else {
      await supabase.from('coupons').upsert(
        {
          code: coupon.code,
          discount_type: coupon.discountType,
          discount_value: coupon.discountValue,
          min_order_amount: coupon.minOrderAmount || 0,
          usage_limit: coupon.usageLimit || null,
          times_used: coupon.timesUsed || 0,
          is_active: coupon.isActive,
        },
        { onConflict: 'code' }
      );
    }
  } catch (err) {
    console.error('[CouponsStore] Supabase sync error:', err);
  }
}

const globalForCoupons = global as unknown as { currentCoupons?: Coupon[] };
export const currentCoupons: Coupon[] = globalForCoupons.currentCoupons || loadCouponsFromDisk();
globalForCoupons.currentCoupons = currentCoupons;

// Ensure initial JSON file exists if not present
try {
  const p = getCouponsJsonPath();
  if (typeof window === 'undefined' && fs?.existsSync && p && !fs.existsSync(p)) {
    persistCouponsToDisk(currentCoupons);
  }
} catch (e) {}

export const getAllCoupons = (): Coupon[] => {
  return currentCoupons;
};

export const getCouponByCode = (code: string): Coupon | undefined => {
  if (!code) return undefined;
  const clean = code.trim().toUpperCase();
  return currentCoupons.find((c) => c.code === clean && c.isActive);
};

export const createCoupon = (coupon: Omit<Coupon, 'id' | 'timesUsed' | 'createdAt'>): Coupon => {
  const newCoupon: Coupon = {
    ...coupon,
    id: `coup_${Date.now()}`,
    code: coupon.code.trim().toUpperCase(),
    timesUsed: 0,
    isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    createdAt: new Date().toISOString(),
  };
  currentCoupons.unshift(newCoupon);
  persistCouponsToDisk(currentCoupons);
  syncCouponToSupabase(newCoupon, 'upsert');
  return newCoupon;
};

export const toggleCouponActive = (idOrCode: string): Coupon | null => {
  const clean = idOrCode.trim();
  const c = currentCoupons.find(
    (coup) => coup.id === clean || coup.code.toUpperCase() === clean.toUpperCase()
  );
  if (!c) return null;
  c.isActive = !c.isActive;
  persistCouponsToDisk(currentCoupons);
  syncCouponToSupabase(c, 'upsert');

  try {
    const { syncPromoCodeStatus } = require('@/lib/promotionService');
    syncPromoCodeStatus(c.code, c.isActive);
  } catch (e) {}

  return c;
};

export const deleteCoupon = (idOrCode: string): boolean => {
  const clean = idOrCode.trim();
  const index = currentCoupons.findIndex(
    (coup) => coup.id === clean || coup.code.toUpperCase() === clean.toUpperCase()
  );
  if (index === -1) return false;
  const [removed] = currentCoupons.splice(index, 1);
  persistCouponsToDisk(currentCoupons);
  if (removed) {
    syncCouponToSupabase(removed, 'delete');
    try {
      const { syncPromoCodeStatus } = require('@/lib/promotionService');
      syncPromoCodeStatus(removed.code, false, true);
    } catch (e) {}
  }
  return true;
};

export const clearAllCoupons = (): void => {
  currentCoupons.length = 0;
  persistCouponsToDisk(currentCoupons);
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      Promise.resolve(supabase.from('coupons').delete().neq('code', '__NON_EXISTENT__'))
        .then(() => {})
        .catch(() => {});
    }
  }
};

export const toggleAllCoupons = (isActive: boolean): Coupon[] => {
  currentCoupons.forEach((c) => {
    c.isActive = isActive;
    syncCouponToSupabase(c, 'upsert');
  });
  persistCouponsToDisk(currentCoupons);
  return currentCoupons;
};

export const resetDefaultCoupons = (): Coupon[] => {
  currentCoupons.length = 0;
  defaultCoupons.forEach((c) => {
    currentCoupons.push({ ...c, createdAt: new Date().toISOString() });
    syncCouponToSupabase(c, 'upsert');
  });
  persistCouponsToDisk(currentCoupons);
  return currentCoupons;
};
