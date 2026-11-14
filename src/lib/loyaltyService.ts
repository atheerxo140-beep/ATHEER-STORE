import fs from 'fs';
import path from 'path';

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

const STORE_PATH = path.join(process.cwd(), 'src', 'data', 'loyalty_store.json');

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
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[loyaltyService] Error reading loyalty store:', e);
  }
  return DEFAULT_LOYALTY;
}

function writeStore(store: LoyaltyStore) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
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

export function getLoyaltyAccount(customerEmail: string): LoyaltyAccount {
  const cleanEmail = customerEmail.trim().toLowerCase();
  const store = readStore();
  let acc = store.accounts.find((a) => a.customerEmail.toLowerCase() === cleanEmail);

  if (!acc) {
    acc = {
      id: `loyalty-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      customerEmail: cleanEmail,
      stampsCount: 0,
      totalStampsEarned: 0,
      stampsRedeemed: 0,
      tier: 'Bronze',
      activeVouchers: [],
      history: [],
    };
    store.accounts.push(acc);
    writeStore(store);
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
  orderTotal: number
): { awarded: boolean; stamps: number; newTotal: number; earnedReward?: LoyaltyVoucher } {
  const store = readStore();
  if (!store.config.isActive) return { awarded: false, stamps: 0, newTotal: 0 };
  if (orderTotal < store.config.minSpendPerStamp) {
    return { awarded: false, stamps: 0, newTotal: 0 };
  }

  const cleanEmail = customerEmail.trim().toLowerCase();
  let acc = store.accounts.find((a) => a.customerEmail.toLowerCase() === cleanEmail);

  if (!acc) {
    acc = {
      id: `loyalty-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      customerEmail: cleanEmail,
      customerName: customerName || 'Valued Customer',
      stampsCount: 0,
      totalStampsEarned: 0,
      stampsRedeemed: 0,
      tier: 'Bronze',
      activeVouchers: [],
      history: [],
    };
    store.accounts.push(acc);
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
    notes: `Earned 1 Stamp for Order ${orderRef} (${orderTotal.toLocaleString()} EGP)`,
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
