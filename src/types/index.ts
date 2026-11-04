export type Language = 'en' | 'ar';

export type Currency = 'EGP';

export type EgyptianGovernorate =
  | 'Cairo'
  | 'Giza'
  | 'Alexandria'
  | 'Qalyubia'
  | 'Sharqia'
  | 'Dakahlia'
  | 'Beheira'
  | 'Gharbia'
  | 'Monufia'
  | 'Kafr El Sheikh'
  | 'Damietta'
  | 'Port Said'
  | 'Ismailia'
  | 'Suez'
  | 'Faiyum'
  | 'Beni Suef'
  | 'Minya'
  | 'Asyut'
  | 'Sohag'
  | 'Qena'
  | 'Luxor'
  | 'Aswan'
  | 'Red Sea'
  | 'South Sinai'
  | 'North Sinai'
  | 'Matrouh'
  | 'New Valley';

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'hoodies' | 'sweatshirts' | 'tshirts';
  categoryLabelEn: string;
  categoryLabelAr: string;
  price: number; // in EGP
  originalPrice?: number;
  image: string;
  hoverImage: string;
  badgeEn?: string;
  badgeAr?: string;
  descriptionEn: string;
  descriptionAr: string;
  gsm: number; // e.g. 500 GSM spec
  fitEn: string;
  fitAr: string;
  fabricEn: string;
  fabricAr: string;
  colors: string[];
  sizes: string[];
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isComingSoon?: boolean;
  inventory?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
}

export interface ShippingZone {
  id: string;
  nameEn: string;
  nameAr: string;
  governorates: string[];
  baseFee: number; // in EGP
  freeShippingThreshold: number; // in EGP
  estimatedDaysEn: string;
  estimatedDaysAr: string;
  codAvailable: boolean;
  isActive: boolean;
  isProvisional?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (e.g. 10 for 10%) or fixed EGP (e.g. 100 for 100 EGP)
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
}

export interface PaymentMethodConfig {
  id: string;
  nameEn: string;
  nameAr: string;
  type: 'cash_on_delivery' | 'instapay' | 'vodafone_cash' | 'credit_card' | 'bank_transfer' | 'custom';
  descriptionEn: string;
  descriptionAr: string;
  accountDetails?: string;
  instructionsEn?: string;
  instructionsAr?: string;
  isActive: boolean;
  isDefault?: boolean;
}

export interface StoreSettings {
  storeNameEn: string;
  storeNameAr: string;
  taglineEn: string;
  taglineAr: string;
  whatsappNumber: string; // e.g. +20 10 0000 0000
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: Currency;
  cairoShowroomsEn: string;
  cairoShowroomsAr: string;
  socialInstagram: string;
  socialTiktok: string;
}

export interface ShowcaseCategoryItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  tagEn: string;
  tagAr: string;
  image: string;
  href: string;
  isPrimary?: boolean;
}

export interface HomepageContent {
  announcementTextEn: string;
  announcementTextAr: string;
  heroBadgeEn: string;
  heroBadgeAr: string;
  heroTitleEn: string;
  heroTitleAr: string;
  heroSubtitleEn: string;
  heroSubtitleAr: string;
  heroBgImage: string;
  heroCtaPrimaryEn: string;
  heroCtaPrimaryAr: string;
  heroCtaSecondaryEn: string;
  heroCtaSecondaryAr: string;
  categoriesSubtitleEn: string;
  categoriesSubtitleAr: string;
  categoriesTitleEn: string;
  categoriesTitleAr: string;
  categoriesDescriptionEn: string;
  categoriesDescriptionAr: string;
  categories: ShowcaseCategoryItem[];
  updatedAt?: string;
}
