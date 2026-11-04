export interface ShippingZone {
  id: string;
  nameEn: string;
  nameAr: string;
  countries: string[];
  cities?: string[];
  baseFee: number; // in SAR
  freeShippingThreshold: number; // in SAR (orders above this get free shipping)
  estimatedDaysEn: string;
  estimatedDaysAr: string;
  codAvailable: boolean;
  isActive: boolean;
}

// Configurable GCC Shipping Zones
export const defaultShippingZones: ShippingZone[] = [
  {
    id: 'ksa-main',
    nameEn: 'Saudi Arabia — Major Hubs (Riyadh, Jeddah, Dammam)',
    nameAr: 'المملكة العربية السعودية — المدن الرئيسية (الرياض، جدة، الدمام)',
    countries: ['SA'],
    cities: ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca', 'Medina'],
    baseFee: 25,
    freeShippingThreshold: 500,
    estimatedDaysEn: '1-3 Business Days (Express)',
    estimatedDaysAr: '١-٣ أيام عمل (توصيل سريع)',
    codAvailable: true,
    isActive: true,
  },
  {
    id: 'ksa-regional',
    nameEn: 'Saudi Arabia — Regional Cities & Provinces',
    nameAr: 'المملكة العربية السعودية — باقي المناطق والمحافظات',
    countries: ['SA'],
    baseFee: 35,
    freeShippingThreshold: 600,
    estimatedDaysEn: '2-4 Business Days',
    estimatedDaysAr: '٢-٤ أيام عمل',
    codAvailable: true,
    isActive: true,
  },
  {
    id: 'uae-all',
    nameEn: 'United Arab Emirates (Dubai, Abu Dhabi, Sharjah)',
    nameAr: 'دولة الإمارات العربية المتحدة (دبي، أبوظبي، الشارقة)',
    countries: ['AE'],
    baseFee: 40,
    freeShippingThreshold: 650,
    estimatedDaysEn: '2-4 Business Days',
    estimatedDaysAr: '٢-٤ أيام عمل',
    codAvailable: true,
    isActive: true,
  },
  {
    id: 'gcc-gulf',
    nameEn: 'Kuwait, Qatar, Bahrain & Oman',
    nameAr: 'الكويت، قطر، البحرين، وعُمان',
    countries: ['KW', 'QA', 'BH', 'OM'],
    baseFee: 55,
    freeShippingThreshold: 800,
    estimatedDaysEn: '3-5 Business Days',
    estimatedDaysAr: '٣-٥ أيام عمل',
    codAvailable: false, // COD restricted to KSA & UAE per brand guidelines
    isActive: true,
  },
];

// In-memory editable store for shipping zones
let currentShippingZones: ShippingZone[] = [...defaultShippingZones];

export const getShippingZones = (): ShippingZone[] => {
  return currentShippingZones.filter((z) => z.isActive);
};

export const getShippingZoneById = (zoneId: string): ShippingZone | undefined => {
  return currentShippingZones.find((z) => z.id === zoneId);
};

export const updateShippingZone = (
  zoneId: string,
  updates: Partial<Omit<ShippingZone, 'id'>>
): ShippingZone | null => {
  const index = currentShippingZones.findIndex((z) => z.id === zoneId);
  if (index === -1) return null;
  currentShippingZones[index] = { ...currentShippingZones[index], ...updates };
  return currentShippingZones[index];
};

export const calculateShippingFee = (
  zoneId: string,
  subtotal: number
): { fee: number; isFree: boolean; zone: ShippingZone | null } => {
  const zone = getShippingZoneById(zoneId);
  if (!zone) {
    return { fee: 35, isFree: false, zone: null }; // default safe fallback
  }

  if (subtotal >= zone.freeShippingThreshold) {
    return { fee: 0, isFree: true, zone };
  }

  return { fee: zone.baseFee, isFree: false, zone };
};
