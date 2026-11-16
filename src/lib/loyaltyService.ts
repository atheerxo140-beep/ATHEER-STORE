import fs from 'fs';
import path from 'path';
import { getStoreFilePath } from '@/lib/storePath';
import { normalizeEgyptianPhone, arePhonesEqual } from '@/lib/phoneUtils';

export interface LoyaltyConfig {
  programName: string;
  rewardType: 'digital_stamps';
  stampsRequired: number;
  minSpendPerStamp: number;
  rewardDescriptionAr: string;
  rewardDescriptionEn: string;
  rewardDiscountEgp: number;
  isActive: boolean;
}

export interface LoyaltyVoucher {
  code: string;
  discountAmount: number;
  isUsed: boolean;
  expiresAt: string;
}

export interface LoyaltyHistoryEntry {
  id: string;
  type: 'earn' | 'redeem' | 'reverse' | 'manual_adjustment';
  stamps: number;
  orderRef?: string;
  date: string;
  notes?: string;
}

export interface LoyaltyAccount {
  id: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  stampsCount: number;
  totalStampsEarned: number;
  stampsRedeemed: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Black_Edition';
  activeVouchers: LoyaltyVoucher[];
  history: LoyaltyHistoryEntry[];
}

interface LoyaltyStore {
  config: LoyaltyConfig;
  accounts: LoyaltyAccount[];
}

function getLoyaltyStorePath(): string {
  try {
    return getStoreFilePath('loyalty_store.json');
  } catch (e) {
    return path.join(process.cwd(), 'src', 'data', 'loyalty_store.json');
  }
}

const DEFAULT_LOYALTY: LoyaltyStore = {
  config: {
    programName: 'ATHEER REWARDS',
    rewardType: 'digital_stamps',
    stampsRequired: 5,
    minSpendPerStamp: 800,
    rewardDescriptionAr: 'قسيمة خصم نقدية 250 ج.م على طلبك القادم عند إكمال 5 أختام',
    rewardDescriptionEn: '250 EGP Cash Reward Voucher upon completing 5 digital stamps',
    rewardDiscountEgp: 250,
    isActive: true,
  },
  accounts: [],
};

function readStore(): LoyaltyStore {
  try {
    const storePath = getLoyaltyStorePath();
    if (fs.existsSync(storePath)) {
      const data = fs.readFileSync(storePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[loyaltyService] Error reading loyalty store:', e);
  }
  return DEFAULT_LOYALTY;
}

function writeStore(store: LoyaltyStore) {
  try {
    const storePath = getLoyaltyStorePath();
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('[loyaltyService] Error writing loyalty store:', e);
  }
}

export function getLoyaltyConfig(): LoyaltyConfig {
  return readStore().config;
}

export function updateLoyaltyConfig(updates: Partial<LoyaltyConfig>): LoyaltyConfig {
  const store = readStore();
  store.config = { ...store.config, ...updates };
  writeStore(store);
  return store.config;
}

export function getLoyaltyAccount(
  customerEmail: string,
  customerName?: string,
  customerPhone?: string
): LoyaltyAccount {
  const cleanEmail = customerEmail.trim().toLowerCase();
  const cleanPhone = customerPhone ? normalizeEgyptianPhone(customerPhone) : '';
  const store = readStore();

  let acc = store.accounts.find((a) => {
    if (a.customerEmail.toLowerCase() === cleanEmail) return true;
    if (cleanPhone && a.customerPhone && arePhonesEqual(a.customerPhone, cleanPhone)) return true;
    if (
      cleanEmail.includes('@customer.atheer.store') &&
      a.customerEmail.split('@')[0] === cleanEmail.split('@')[0]
    ) {
      return true;
    }
    return false;
  });

  if (!acc) {
    acc = {
      id: `loyalty-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      customerEmail: cleanEmail,
      customerName: customerName || cleanEmail.split('@')[0],
      customerPhone: cleanPhone || undefined,
      stampsCount: 0,
      totalStampsEarned: 0,
      stampsRedeemed: 0,
      tier: 'Bronze',
      activeVouchers: [],
      history: [
        {
          id: `hist-init-${Date.now()}`,
          type: 'earn',
          stamps: 0,
          date: new Date().toISOString(),
          notes: 'إصدار كارت الولاء الرقمي بنجاح (الرصيد: 0 أختام) - تضاف الأختام تلقائياً فور توصيل وتأكيد استلام طلباتك',
        },
      ],
    };
    store.accounts.push(acc);
    writeStore(store);
  } else {
    if (cleanPhone && !acc.customerPhone) {
      acc.customerPhone = cleanPhone;
      writeStore(store);
    }
  }

  return acc;
}

export function getAllLoyaltyAccounts(): LoyaltyAccount[] {
  return readStore().accounts;
}

/**
 * Automatically award 1 digital stamp when a completed order qualifies.
 */
export function awardStampsForOrder(
  customerEmail: string,
  customerName: string | undefined,
  orderRef: string,
  orderTotal: number,
  customerPhone?: string
): { awarded: boolean; stamps: number; newTotal: number; earnedReward?: LoyaltyVoucher } {
  const store = readStore();
  if (!store.config.isActive) return { awarded: false, stamps: 0, newTotal: 0 };
  if (orderTotal < store.config.minSpendPerStamp) {
    return { awarded: false, stamps: 0, newTotal: 0 };
  }

  const cleanEmail = customerEmail.trim().toLowerCase();
  const cleanPhone = customerPhone ? normalizeEgyptianPhone(customerPhone) : '';

  let acc = store.accounts.find((a) => {
    if (a.customerEmail.toLowerCase() === cleanEmail) return true;
    if (cleanPhone && a.customerPhone && arePhonesEqual(a.customerPhone, cleanPhone)) return true;
    if (
      cleanEmail.includes('@customer.atheer.store') &&
      a.customerEmail.split('@')[0] === cleanEmail.split('@')[0]
    ) {
      return true;
    }
    return false;
  });

  if (!acc) {
    acc = {
      id: `loyalty-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      customerEmail: cleanEmail,
      customerName: customerName || 'Valued Customer',
      customerPhone: cleanPhone || undefined,
      stampsCount: 0,
      totalStampsEarned: 0,
      stampsRedeemed: 0,
      tier: 'Bronze',
      activeVouchers: [],
      history: [],
    };
    store.accounts.push(acc);
  } else if (cleanPhone && !acc.customerPhone) {
    acc.customerPhone = cleanPhone;
  }

  // Prevent duplicate awards for the same order
  const existingOrderTx = acc.history.find(
    (h) => h.orderRef === orderRef && (h.type === 'earn' || h.type === 'redeem')
  );
  if (existingOrderTx) {
    return { awarded: false, stamps: 0, newTotal: acc.stampsCount };
  }

  acc.stampsCount += 1;
  acc.totalStampsEarned += 1;

  // Upgrade Tier based on total lifetime stamps
  if (acc.totalStampsEarned >= 15) acc.tier = 'Black_Edition';
  else if (acc.totalStampsEarned >= 10) acc.tier = 'Gold';
  else if (acc.totalStampsEarned >= 5) acc.tier = 'Silver';

  acc.history.unshift({
    id: `tx-${Date.now()}`,
    type: 'earn',
    stamps: 1,
    orderRef,
    date: new Date().toISOString(),
    notes: `ختم إلكتروني لتأكيد استلام وتوصيل الطلب ${orderRef} (${orderTotal.toLocaleString()} ج.م)`,
  });

  let earnedReward: LoyaltyVoucher | undefined = undefined;

  // Check if target stamps reached (e.g. 5 stamps)
  if (acc.stampsCount >= store.config.stampsRequired) {
    acc.stampsCount -= store.config.stampsRequired;
    acc.stampsRedeemed += store.config.stampsRequired;

    const voucherCode = `ATH-VIP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    earnedReward = {
      code: voucherCode,
      discountAmount: store.config.rewardDiscountEgp,
      isUsed: false,
      expiresAt: expiry,
    };

    acc.activeVouchers.push(earnedReward);

    acc.history.unshift({
      id: `tx-reward-${Date.now()}`,
      type: 'redeem',
      stamps: -store.config.stampsRequired,
      date: new Date().toISOString(),
      notes: `Completed Stamp Card! Issued ${store.config.rewardDiscountEgp} EGP Voucher: ${voucherCode}`,
    });
  }

  writeStore(store);

  return {
    awarded: true,
    stamps: 1,
    newTotal: acc.stampsCount,
    earnedReward,
  };
}

/**
 * Reverse stamps if an order is cancelled or refunded
 */
export function reverseStampsForOrder(orderRef: string): boolean {
  const store = readStore();
  let modified = false;

  for (const acc of store.accounts) {
    const earnTx = acc.history.find((h) => h.orderRef === orderRef && h.type === 'earn');
    if (earnTx) {
      acc.stampsCount = Math.max(0, acc.stampsCount - earnTx.stamps);
      acc.history.unshift({
        id: `tx-rev-${Date.now()}`,
        type: 'reverse',
        stamps: -earnTx.stamps,
        orderRef,
        date: new Date().toISOString(),
        notes: `Reversed stamp for cancelled/refunded order ${orderRef}`,
      });
      modified = true;
      break;
    }
  }

  if (modified) {
    writeStore(store);
  }
  return modified;
}

/**
 * Validates a loyalty reward voucher code at checkout.
 */
export function validateLoyaltyVoucher(voucherCode: string): { valid: boolean; discountAmount?: number; error?: string } {
  if (!voucherCode) return { valid: false, error: 'No code provided' };
  const cleanCode = voucherCode.trim().toUpperCase();
  const store = readStore();

  for (const acc of store.accounts) {
    const v = acc.activeVouchers.find((voc) => voc.code.toUpperCase() === cleanCode);
    if (v) {
      if (v.isUsed) return { valid: false, error: 'This reward voucher has already been redeemed' };
      if (new Date(v.expiresAt).getTime() < Date.now()) {
        return { valid: false, error: 'This reward voucher has expired' };
      }
      return { valid: true, discountAmount: v.discountAmount };
    }
  }

  return { valid: false, error: 'Invalid reward voucher code' };
}

/**
 * Mark loyalty voucher as used upon order confirmation
 */
export function consumeLoyaltyVoucher(voucherCode: string, orderRef: string): boolean {
  const cleanCode = voucherCode.trim().toUpperCase();
  const store = readStore();
  let consumed = false;

  for (const acc of store.accounts) {
    const v = acc.activeVouchers.find((voc) => voc.code.toUpperCase() === cleanCode);
    if (v && !v.isUsed) {
      v.isUsed = true;
      acc.history.unshift({
        id: `tx-used-${Date.now()}`,
        type: 'redeem',
        stamps: 0,
        orderRef,
        date: new Date().toISOString(),
        notes: `Redeemed ${v.discountAmount} EGP Voucher ${cleanCode} on Order ${orderRef}`,
      });
      consumed = true;
      break;
    }
  }

  if (consumed) {
    writeStore(store);
  }
  return consumed;
}

/**
 * Admin: Adjust customer stamps (+ or - or direct override)
 */
export function adjustCustomerStamps(
  accountIdOrEmail: string,
  adjustment: number,
  notes?: string
): { success: boolean; account?: LoyaltyAccount; error?: string } {
  const store = readStore();
  const clean = accountIdOrEmail.trim().toLowerCase();
  const acc = store.accounts.find(
    (a) => a.id.toLowerCase() === clean || a.customerEmail.toLowerCase() === clean
  );

  if (!acc) {
    return { success: false, error: 'Loyalty account not found' };
  }

  const previousCount = acc.stampsCount;
  acc.stampsCount = Math.max(0, acc.stampsCount + adjustment);

  if (adjustment > 0) {
    acc.totalStampsEarned += adjustment;
  }

  // Auto tier calculation
  if (acc.totalStampsEarned >= 15) acc.tier = 'Black_Edition';
  else if (acc.totalStampsEarned >= 10) acc.tier = 'Gold';
  else if (acc.totalStampsEarned >= 5) acc.tier = 'Silver';

  acc.history.unshift({
    id: `admin-adj-${Date.now()}`,
    type: 'manual_adjustment',
    stamps: adjustment,
    date: new Date().toISOString(),
    notes: notes || `تعديل يدوي من إدارة المتجر (${adjustment > 0 ? `+${adjustment}` : adjustment} أختام)`,
  });

  writeStore(store);
  return { success: true, account: acc };
}

/**
 * Admin: Directly grant a reward voucher to a customer
 */
export function grantCustomerVoucher(
  accountIdOrEmail: string,
  discountAmount: number,
  customCode?: string,
  expiryDays: number = 90,
  notes?: string
): { success: boolean; voucher?: LoyaltyVoucher; account?: LoyaltyAccount; error?: string } {
  const store = readStore();
  const clean = accountIdOrEmail.trim().toLowerCase();
  const acc = store.accounts.find(
    (a) => a.id.toLowerCase() === clean || a.customerEmail.toLowerCase() === clean
  );

  if (!acc) {
    return { success: false, error: 'Loyalty account not found' };
  }

  const code = (
    customCode?.trim() || `ATH-VIP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
  ).toUpperCase();

  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

  const voucher: LoyaltyVoucher = {
    code,
    discountAmount: Math.max(10, discountAmount),
    isUsed: false,
    expiresAt,
  };

  acc.activeVouchers.unshift(voucher);

  acc.history.unshift({
    id: `admin-vouch-${Date.now()}`,
    type: 'manual_adjustment',
    stamps: 0,
    date: new Date().toISOString(),
    notes: notes || `منح قسيمة مكافأة إدارية بقيمة ${discountAmount} ج.م (الكود: ${code})`,
  });

  writeStore(store);
  return { success: true, voucher, account: acc };
}

/**
 * Admin: Update customer tier directly
 */
export function updateCustomerTier(
  accountIdOrEmail: string,
  newTier: 'Bronze' | 'Silver' | 'Gold' | 'Black_Edition',
  notes?: string
): { success: boolean; account?: LoyaltyAccount; error?: string } {
  const store = readStore();
  const clean = accountIdOrEmail.trim().toLowerCase();
  const acc = store.accounts.find(
    (a) => a.id.toLowerCase() === clean || a.customerEmail.toLowerCase() === clean
  );

  if (!acc) {
    return { success: false, error: 'Loyalty account not found' };
  }

  const oldTier = acc.tier;
  acc.tier = newTier;

  acc.history.unshift({
    id: `admin-tier-${Date.now()}`,
    type: 'manual_adjustment',
    stamps: 0,
    date: new Date().toISOString(),
    notes: notes || `ترقية/تعديل فئة العضوية من ${oldTier} إلى ${newTier}`,
  });

  writeStore(store);
  return { success: true, account: acc };
}

/**
 * Admin: Manually issue a new loyalty card
 */
export function createManualLoyaltyAccount(data: {
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  initialStamps?: number;
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Black_Edition';
  welcomeVoucherAmount?: number;
}): { success: boolean; account?: LoyaltyAccount; error?: string } {
  const store = readStore();
  const cleanEmail = data.customerEmail.trim().toLowerCase();

  const existing = store.accounts.find((a) => a.customerEmail.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: 'A loyalty pass already exists for this email.' };
  }

  const initialStamps = Math.max(0, data.initialStamps !== undefined ? Number(data.initialStamps) : 0);
  const welcomeAmount = Math.max(0, data.welcomeVoucherAmount !== undefined ? Number(data.welcomeVoucherAmount) : 0);
  const voucherCode = `ATH-VIP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const oneYearExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const activeVouchers: LoyaltyVoucher[] = [];
  if (welcomeAmount > 0) {
    activeVouchers.push({
      code: voucherCode,
      discountAmount: welcomeAmount,
      isUsed: false,
      expiresAt: oneYearExpiry,
    });
  }

  const newAcc: LoyaltyAccount = {
    id: `loyalty-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    customerEmail: cleanEmail,
    customerName: data.customerName || cleanEmail.split('@')[0],
    customerPhone: data.customerPhone,
    stampsCount: initialStamps,
    totalStampsEarned: initialStamps,
    stampsRedeemed: 0,
    tier: data.tier || 'Bronze',
    activeVouchers,
    history: [
      {
        id: `hist-create-${Date.now()}`,
        type: 'earn',
        stamps: initialStamps,
        date: new Date().toISOString(),
        notes:
          initialStamps > 0
            ? `إصدار كارت ولاء يدوي من الإدارة برصيد ${initialStamps} أختام`
            : 'إصدار كارت ولاء يدوي بنجاح (الرصيد: 0 أختام) - تضاف الأختام فور تأكيد استلام الطلبات',
      },
    ],
  };

  store.accounts.unshift(newAcc);
  writeStore(store);
  return { success: true, account: newAcc };
}

/**
 * Admin: Delete customer loyalty account
 */
export function deleteLoyaltyAccount(accountIdOrEmail: string): boolean {
  const store = readStore();
  const clean = accountIdOrEmail.trim().toLowerCase();
  const prevLen = store.accounts.length;
  store.accounts = store.accounts.filter(
    (a) => a.id.toLowerCase() !== clean && a.customerEmail.toLowerCase() !== clean
  );

  if (store.accounts.length !== prevLen) {
    writeStore(store);
    return true;
  }
  return false;
}

/**
 * Admin: Reset customer stamps count to 0
 */
export function resetCustomerStamps(
  accountIdOrEmail: string,
  notes?: string
): { success: boolean; account?: LoyaltyAccount; error?: string } {
  const store = readStore();
  const clean = accountIdOrEmail.trim().toLowerCase();
  const acc = store.accounts.find(
    (a) => a.id.toLowerCase() === clean || a.customerEmail.toLowerCase() === clean
  );

  if (!acc) {
    return { success: false, error: 'Loyalty account not found' };
  }

  acc.stampsCount = 0;
  acc.history.unshift({
    id: `admin-reset-${Date.now()}`,
    type: 'manual_adjustment',
    stamps: 0,
    date: new Date().toISOString(),
    notes: notes || 'تصفير رصيد الأختام الحالية من قبل إدارة المتجر',
  });

  writeStore(store);
  return { success: true, account: acc };
}
