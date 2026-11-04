export type Language = 'en' | 'ar';

export type Currency = 'SAR' | 'AED' | 'USD';

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'hoodies' | 'sweatshirts' | 'tshirts';
  categoryLabelEn: string;
  categoryLabelAr: string;
  price: number; // in SAR
  originalPrice?: number;
  image: string;
  hoverImage: string;
  badgeEn?: string;
  badgeAr?: string;
  descriptionEn: string;
  descriptionAr: string;
  gsm: number; // e.g. 500 GSM
  fitEn: string; // e.g. "Boxy Oversized"
  fitAr: string; // e.g. "قصّة بوكسي أوفرسايز"
  fabricEn: string;
  fabricAr: string;
  colors: string[];
  sizes: string[];
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isComingSoon?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
}
