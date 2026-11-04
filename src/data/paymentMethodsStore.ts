import { PaymentMethodConfig } from '@/types';
import fs from 'fs';
import path from 'path';

export const defaultPaymentMethods: PaymentMethodConfig[] = [
  {
    id: 'cod',
    nameEn: 'Cash on Delivery (COD)',
    nameAr: 'الدفع عند الاستلام نقداً',
    type: 'cash_on_delivery',
    descriptionEn: 'Pay in cash to courier upon delivery in Egypt.',
    descriptionAr: 'الدفع نقداً لمندوب شركة الشحن عند استلام شحنتك وفحص العبوة.',
    accountDetails: 'Cash payment upon delivery',
    instructionsEn: 'Please prepare the exact order amount in EGP for the courier.',
    instructionsAr: 'يرجى تحضير المبلغ المطلوب بالجنيه المصري لمندوب التوصيل.',
    isActive: true,
    isDefault: true,
  },
  {
    id: 'instapay',
    nameEn: 'InstaPay Direct Transfer',
    nameAr: 'إنستاباي (التحويل الفوري المباشر)',
    type: 'instapay',
    descriptionEn: 'Instant bank-to-bank transfer across all Egyptian banks.',
    descriptionAr: 'تحويل بنكي فوري عبر تطبيق إنستاباي لجميع البنوك المصرية بدون رسوم.',
    accountDetails: 'atheer@instapay',
    instructionsEn: 'Transfer the order total to our official InstaPay handle (atheer@instapay) and enter your reference ID.',
    instructionsAr: 'حول إجمالي قيمة الطلب إلى عنوان إنستاباي (atheer@instapay) وأدخل رقم العملية لتأكيد الطلب فوراً.',
    isActive: true,
    isDefault: false,
  },
  {
    id: 'vodafone_cash',
    nameEn: 'Vodafone Cash & Smart Wallets',
    nameAr: 'فودافون كاش والمحافظ الذكية',
    type: 'vodafone_cash',
    descriptionEn: 'Mobile wallet transfer (Vodafone, Orange, Etisalat, WE).',
    descriptionAr: 'تحويل فوري لمحفظة الهاتف (فودافون كاش، أورنج، اتصالات، وي باي).',
    accountDetails: '01012345678',
    instructionsEn: 'Transfer the order total to our official wallet number (01012345678) and enter your wallet phone number.',
    instructionsAr: 'حول قيمة الطلب إلى رقم المحفظة (01012345678) واكتب رقم الهاتف الذي تم التحويل منه للتأكيد.',
    isActive: true,
    isDefault: false,
  },
  {
    id: 'credit_card',
    nameEn: 'Credit / Debit Card (Online)',
    nameAr: 'بطاقة بنكية (فيزا / ماستركارد / ميزة)',
    type: 'credit_card',
    descriptionEn: 'Secure payment via Visa, Mastercard, or Egyptian Meeza card.',
    descriptionAr: 'دفع إلكتروني آمن عبر البطاقات الائتمانية وبطاقات ميزة الوطنية المصرية.',
    accountDetails: 'Electronic Payment Gateway',
    instructionsEn: 'Payment link will be generated and confirmed directly for your order.',
    instructionsAr: 'يتم تأكيد عملية الدفع ببطاقتك البنكية بأمان تام وسرية مصرفية.',
    isActive: false,
    isDefault: false,
  },
  {
    id: 'bank_transfer',
    nameEn: 'Official Bank Wire (CIB / NBE)',
    nameAr: 'تحويل بنكي مباشر (CIB / الأهلي المصري)',
    type: 'bank_transfer',
    descriptionEn: 'Direct bank transfer to ATHEER corporate commercial account.',
    descriptionAr: 'تحويل بنكي مباشر لحساب الشركة البنكي المعتمد في البنك التجاري الدولي CIB.',
    accountDetails: 'Bank: CIB Egypt · Account: 1000-4829-1920 · IBAN: EG4200100000000000000000000',
    instructionsEn: 'Transfer order amount to our CIB corporate account and our concierge will verify it within 1 hour.',
    instructionsAr: 'قم بالتحويل لحسابنا البنكي وسيقوم كونسيرج أثير بتأكيد الإيداع وإصدار فاتورتك فوراً.',
    isActive: false,
    isDefault: false,
  },
];

const JSON_PATH = path.join(process.cwd(), 'src', 'data', 'payment_methods.json');

function loadPersistedMethods(): PaymentMethodConfig[] {
  try {
    if (fs.existsSync(JSON_PATH)) {
      const data = fs.readFileSync(JSON_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[PaymentMethodsStore] Error reading json file:', err);
  }
  return [...defaultPaymentMethods];
}

function persistMethods(methods: PaymentMethodConfig[]) {
  try {
    fs.writeFileSync(JSON_PATH, JSON.stringify(methods, null, 2), 'utf8');
  } catch (err) {
    console.error('[PaymentMethodsStore] Error writing json file:', err);
  }
}

// Global runtime instance to preserve across hot reloads in dev
const globalForPayment = global as unknown as { currentPaymentMethods?: PaymentMethodConfig[] };
export const currentPaymentMethods: PaymentMethodConfig[] =
  globalForPayment.currentPaymentMethods || loadPersistedMethods();

if (process.env.NODE_ENV !== 'production') {
  globalForPayment.currentPaymentMethods = currentPaymentMethods;
}

export const getPaymentMethods = (): PaymentMethodConfig[] => {
  return currentPaymentMethods;
};

export const getActivePaymentMethods = (): PaymentMethodConfig[] => {
  return currentPaymentMethods.filter((m) => m.isActive);
};

export const getPaymentMethodById = (id: string): PaymentMethodConfig | undefined => {
  return currentPaymentMethods.find((m) => m.id === id);
};

export const addPaymentMethod = (input: Omit<PaymentMethodConfig, 'id'>): PaymentMethodConfig => {
  const id = `pm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newMethod: PaymentMethodConfig = {
    ...input,
    id,
  };
  currentPaymentMethods.push(newMethod);
  persistMethods(currentPaymentMethods);
  return newMethod;
};

export const updatePaymentMethod = (
  id: string,
  updates: Partial<PaymentMethodConfig>
): PaymentMethodConfig | null => {
  const index = currentPaymentMethods.findIndex((m) => m.id === id);
  if (index === -1) return null;

  // If setting this method as default, unset other defaults
  if (updates.isDefault) {
    currentPaymentMethods.forEach((m) => {
      m.isDefault = false;
    });
  }

  currentPaymentMethods[index] = {
    ...currentPaymentMethods[index],
    ...updates,
  };

  persistMethods(currentPaymentMethods);
  return currentPaymentMethods[index];
};

export const deletePaymentMethod = (id: string): boolean => {
  // Prevent deleting COD as it is the core fallback
  if (id === 'cod') {
    return false;
  }
  const index = currentPaymentMethods.findIndex((m) => m.id === id);
  if (index === -1) return false;

  currentPaymentMethods.splice(index, 1);
  persistMethods(currentPaymentMethods);
  return true;
};

export const togglePaymentMethodActive = (id: string): PaymentMethodConfig | null => {
  const method = currentPaymentMethods.find((m) => m.id === id);
  if (!method) return null;

  // Don't allow disabling COD if it's the only active method
  const activeCount = currentPaymentMethods.filter((m) => m.isActive).length;
  if (method.isActive && activeCount <= 1 && id === 'cod') {
    return method; // refuse to disable the only active method
  }

  method.isActive = !method.isActive;
  persistMethods(currentPaymentMethods);
  return method;
};
