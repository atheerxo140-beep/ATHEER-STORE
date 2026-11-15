import fs from 'fs';
import path from 'path';
import { getStoreFilePath } from '@/lib/storePath';

export interface PromotionRule {
  id: string;
  code?: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: 'bundle_items' | 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  discountValue: number; // percentage (e.g. 15 for 15%) or fixed EGP (e.g. 100 for 100 EGP)
  minItemsRequired?: number;
  minSpendEgp?: number;
  applicableCategoryId?: string;
  isAutomatic: boolean;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  maxUsesTotal?: number;
  timesUsed: number;
}

function getPromotionsStorePath(): string {
  try {
    return getStoreFilePath('promotions_store.json');
  } catch (e) {
    return path.join(process.cwd(), 'src', 'data', 'promotions_store.json');
  }
}

function readPromotions(): PromotionRule[] {
  try {
    const storePath = getPromotionsStorePath();
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf8'));
    }
  } catch (e) {
    console.error('[promotionService] Error reading promotions:', e);
  }
  return [];
}

function writePromotions(promos: PromotionRule[]) {
  try {
    const storePath = getPromotionsStorePath();
    fs.writeFileSync(storePath, JSON.stringify(promos, null, 2), 'utf8');
  } catch (e) {
    console.error('[promotionService] Error writing promotions:', e);
  }
}

export function getAllPromotions(): PromotionRule[] {
  return readPromotions();
}

export function getPromotionByCode(code: string): PromotionRule | undefined {
  if (!code) return undefined;
  const clean = code.trim().toUpperCase();
  return readPromotions().find((p) => p.code?.toUpperCase() === clean && p.isActive);
}

export function createPromotion(promo: Omit<PromotionRule, 'id' | 'timesUsed'>): PromotionRule {
  const promos = readPromotions();
  const newPromo: PromotionRule = {
    ...promo,
    id: `promo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    code: promo.code ? promo.code.trim().toUpperCase() : undefined,
    timesUsed: 0,
  };
  promos.push(newPromo);
  writePromotions(promos);
  return newPromo;
}

export function updatePromotion(id: string, updates: Partial<PromotionRule>): PromotionRule | null {
  const promos = readPromotions();
  const idx = promos.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  promos[idx] = {
    ...promos[idx],
    ...updates,
    code: updates.code ? updates.code.trim().toUpperCase() : promos[idx].code,
  };
  writePromotions(promos);

  // Synchronize isActive status with couponsStore and homepage if code exists
  if (updates.isActive !== undefined && promos[idx].code) {
    try {
      const { toggleCouponActive, getCoupons } = require('@/data/couponsStore');
      const allCoupons = getCoupons ? getCoupons() : [];
      const matching = allCoupons.find((c: any) => c.code?.toUpperCase() === promos[idx].code?.toUpperCase());
      if (matching && matching.isActive !== updates.isActive) {
        toggleCouponActive(matching.id);
      }
    } catch (e) {}
  }

  return promos[idx];
}

export function deletePromotion(idOrCode: string): boolean {
  const promos = readPromotions();
  const clean = idOrCode.trim();
  const target = promos.find(
    (p) => p.id === clean || (p.code && p.code.toUpperCase() === clean.toUpperCase())
  );
  const filtered = promos.filter(
    (p) => p.id !== clean && (!p.code || p.code.toUpperCase() !== clean.toUpperCase())
  );
  if (filtered.length !== promos.length) {
    writePromotions(filtered);

    // Sync deletion across couponsStore and homepage_content
    if (target?.code) {
      try {
        const { deleteCoupon } = require('@/data/couponsStore');
        if (typeof deleteCoupon === 'function') {
          deleteCoupon(target.code);
        }
      } catch (e) {}

      try {
        const hpPath = path.join(process.cwd(), 'src', 'data', 'homepage_content.json');
        if (fs.existsSync(hpPath)) {
          const hp = JSON.parse(fs.readFileSync(hpPath, 'utf8'));
          if (Array.isArray(hp.promoOffers)) {
            hp.promoOffers = hp.promoOffers.filter(
              (o: any) => o.couponCode?.toUpperCase() !== target.code?.toUpperCase() && o.id !== target.id
            );
            fs.writeFileSync(hpPath, JSON.stringify(hp, null, 2), 'utf8');
          }
        }
      } catch (e) {}
    }

    return true;
  }
  return false;
}

export function syncPromoCodeStatus(code: string, isActive: boolean, isDeleted = false): void {
  if (!code) return;
  const clean = code.trim().toUpperCase();
  const promos = readPromotions();
  if (isDeleted) {
    const filtered = promos.filter((p) => p.code?.toUpperCase() !== clean);
    if (filtered.length !== promos.length) {
      writePromotions(filtered);
    }
  } else {
    let modified = false;
    for (const p of promos) {
      if (p.code?.toUpperCase() === clean) {
        p.isActive = isActive;
        modified = true;
      }
    }
    if (modified) {
      writePromotions(promos);
    }
  }
}

export interface PromotionEvaluationResult {
  appliedDiscount: number;
  promoCode?: string;
  promoTitleAr?: string;
  promoTitleEn?: string;
  promoType?: string;
  freeShippingQualified: boolean;
  notes?: string;
}

/**
 * Server-Side Cart & Order Promotion Engine.
 * Evaluates item quantities, subtotal, and entered code.
 * Re-computes discounts strictly from official product data.
 */
export function evaluateCartPromotions(
  totalItemCount: number,
  subtotal: number,
  enteredCode?: string
): PromotionEvaluationResult {
  const activePromos = readPromotions().filter((p) => p.isActive);
  const result: PromotionEvaluationResult = {
    appliedDiscount: 0,
    freeShippingQualified: subtotal >= 1800,
  };

  const cleanCode = enteredCode?.trim().toUpperCase();

  // 1. Direct Code Evaluation
  if (cleanCode) {
    const promo = activePromos.find((p) => p.code?.toUpperCase() === cleanCode);
    if (promo) {
      const minItems = promo.minItemsRequired || 1;
      const minSpend = promo.minSpendEgp || 0;

      if (totalItemCount >= minItems && subtotal >= minSpend) {
        if (promo.type === 'bundle_items' || promo.type === 'percentage') {
          result.appliedDiscount = Math.round((subtotal * promo.discountValue) / 100);
          result.promoCode = promo.code;
          result.promoTitleAr = promo.titleAr;
          result.promoTitleEn = promo.titleEn;
          result.promoType = promo.type;
        } else if (promo.type === 'fixed_amount') {
          result.appliedDiscount = Math.min(subtotal, promo.discountValue);
          result.promoCode = promo.code;
          result.promoTitleAr = promo.titleAr;
          result.promoTitleEn = promo.titleEn;
          result.promoType = promo.type;
        } else if (promo.type === 'free_shipping') {
          result.freeShippingQualified = true;
          result.promoCode = promo.code;
          result.promoTitleAr = promo.titleAr;
          result.promoTitleEn = promo.titleEn;
        }
      }
    }
  }

  // 2. Automatic Promotions (e.g. 4 items bundle if no code entered)
  if (result.appliedDiscount === 0 && !cleanCode) {
    const autoBundle = activePromos.find(
      (p) => p.isAutomatic && p.type === 'bundle_items' && (p.minItemsRequired || 4) <= totalItemCount
    );

    if (autoBundle && subtotal >= (autoBundle.minSpendEgp || 0)) {
      result.appliedDiscount = Math.round((subtotal * autoBundle.discountValue) / 100);
      result.promoCode = autoBundle.code || 'AUTO_BUNDLE';
      result.promoTitleAr = autoBundle.titleAr;
      result.promoTitleEn = autoBundle.titleEn;
      result.promoType = autoBundle.type;
    }
  }

  return result;
}
