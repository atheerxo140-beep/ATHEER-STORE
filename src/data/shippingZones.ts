import { ShippingZone, EgyptianGovernorate } from '@/types';

export interface GovernorateInfo {
  id: EgyptianGovernorate;
  nameEn: string;
  nameAr: string;
  zoneId: string;
}

export const EGYPTIAN_GOVERNORATES: GovernorateInfo[] = [
  // Cairo & Giza
  { id: 'Cairo', nameEn: 'Cairo', nameAr: 'القاهرة', zoneId: 'cairo-giza' },
  { id: 'Giza', nameEn: 'Giza', nameAr: 'الجيزة', zoneId: 'cairo-giza' },

  // Alexandria & Delta
  { id: 'Alexandria', nameEn: 'Alexandria', nameAr: 'الإسكندرية', zoneId: 'alex-delta' },
  { id: 'Qalyubia', nameEn: 'Qalyubia', nameAr: 'القليوبية', zoneId: 'alex-delta' },
  { id: 'Sharqia', nameEn: 'Sharqia', nameAr: 'الشرقية', zoneId: 'alex-delta' },
  { id: 'Dakahlia', nameEn: 'Dakahlia', nameAr: 'الدقهلية', zoneId: 'alex-delta' },
  { id: 'Beheira', nameEn: 'Beheira', nameAr: 'البحيرة', zoneId: 'alex-delta' },
  { id: 'Gharbia', nameEn: 'Gharbia', nameAr: 'الغربية', zoneId: 'alex-delta' },
  { id: 'Monufia', nameEn: 'Monufia', nameAr: 'المنوفية', zoneId: 'alex-delta' },
  { id: 'Kafr El Sheikh', nameEn: 'Kafr El Sheikh', nameAr: 'كفر الشيخ', zoneId: 'alex-delta' },
  { id: 'Damietta', nameEn: 'Damietta', nameAr: 'دمياط', zoneId: 'alex-delta' },

  // Canal Cities
  { id: 'Port Said', nameEn: 'Port Said', nameAr: 'بورسعيد', zoneId: 'canal-cities' },
  { id: 'Ismailia', nameEn: 'Ismailia', nameAr: 'الإسماعيلية', zoneId: 'canal-cities' },
  { id: 'Suez', nameEn: 'Suez', nameAr: 'السويس', zoneId: 'canal-cities' },

  // Upper Egypt
  { id: 'Faiyum', nameEn: 'Faiyum', nameAr: 'الفيوم', zoneId: 'upper-egypt' },
  { id: 'Beni Suef', nameEn: 'Beni Suef', nameAr: 'بني سويف', zoneId: 'upper-egypt' },
  { id: 'Minya', nameEn: 'Minya', nameAr: 'المنيا', zoneId: 'upper-egypt' },
  { id: 'Asyut', nameEn: 'Asyut', nameAr: 'أسيوط', zoneId: 'upper-egypt' },
  { id: 'Sohag', nameEn: 'Sohag', nameAr: 'سوهاج', zoneId: 'upper-egypt' },
  { id: 'Qena', nameEn: 'Qena', nameAr: 'قنا', zoneId: 'upper-egypt' },
  { id: 'Luxor', nameEn: 'Luxor', nameAr: 'الأقصر', zoneId: 'upper-egypt' },
  { id: 'Aswan', nameEn: 'Aswan', nameAr: 'أسوان', zoneId: 'upper-egypt' },

  // Frontier & Coastal
  { id: 'Red Sea', nameEn: 'Red Sea (Hurghada / El Gouna)', nameAr: 'البحر الأحمر (الغردقة / الجونة)', zoneId: 'coastal-remote' },
  { id: 'South Sinai', nameEn: 'South Sinai (Sharm El Sheikh / Dahab)', nameAr: 'جنوب سيناء (شرم الشيخ / دهب)', zoneId: 'coastal-remote' },
  { id: 'North Sinai', nameEn: 'North Sinai', nameAr: 'شمال سيناء', zoneId: 'coastal-remote' },
  { id: 'Matrouh', nameEn: 'Matrouh (North Coast / Marsa Matrouh)', nameAr: 'مطروح (الساحل الشمالي / مرسى مطروح)', zoneId: 'coastal-remote' },
  { id: 'New Valley', nameEn: 'New Valley', nameAr: 'الوادي الجديد', zoneId: 'coastal-remote' },
];

export const defaultEgyptianShippingZones: ShippingZone[] = [
  {
    id: 'cairo-giza',
    nameEn: 'Greater Cairo & Giza (Cairo, Giza, New Cairo, 6th October)',
    nameAr: 'القاهرة الكبرى والجيزة (القاهرة، الجيزة، التجمع، الشيخ زايد، أكتوبر)',
    governorates: ['Cairo', 'Giza'],
    baseFee: 60,
    freeShippingThreshold: 1800,
    estimatedDaysEn: 'Provisional 1-2 Business Days (Subject to courier conditions)',
    estimatedDaysAr: 'تقديري ١-٢ أيام عمل (غير مضمون بنسبة ١٠٠٪ حسب شركة الشحن)',
    codAvailable: true,
    isActive: true,
    isProvisional: true,
  },
  {
    id: 'alex-delta',
    nameEn: 'Alexandria & Delta Governorates',
    nameAr: 'الإسكندرية ومحافظات الدلتا (الإسكندرية، البحيرة، طنطا، المنصورة، الزقازيق)',
    governorates: [
      'Alexandria',
      'Qalyubia',
      'Sharqia',
      'Dakahlia',
      'Beheira',
      'Gharbia',
      'Monufia',
      'Kafr El Sheikh',
      'Damietta',
    ],
    baseFee: 75,
    freeShippingThreshold: 2000,
    estimatedDaysEn: 'Provisional 2-3 Business Days (Subject to courier conditions)',
    estimatedDaysAr: 'تقديري ٢-٣ أيام عمل (غير مضمون بنسبة ١٠٠٪)',
    codAvailable: true,
    isActive: true,
    isProvisional: true,
  },
  {
    id: 'canal-cities',
    nameEn: 'Canal Zone (Port Said, Ismailia, Suez)',
    nameAr: 'مدن القناة (بورسعيد، الإسماعيلية، السويس)',
    governorates: ['Port Said', 'Ismailia', 'Suez'],
    baseFee: 85,
    freeShippingThreshold: 2200,
    estimatedDaysEn: 'Provisional 2-3 Business Days (Subject to courier conditions)',
    estimatedDaysAr: 'تقديري ٢-٣ أيام عمل (غير مضمون بنسبة ١٠٠٪)',
    codAvailable: true,
    isActive: true,
    isProvisional: true,
  },
  {
    id: 'upper-egypt',
    nameEn: 'Upper Egypt (Beni Suef, Minya, Asyut, Sohag, Luxor, Aswan)',
    nameAr: 'محافظات الصعيد (بني سويف، الفيوم، المنيا، أسيوط، سوهاج، قنا، الأقصر، أسوان)',
    governorates: ['Faiyum', 'Beni Suef', 'Minya', 'Asyut', 'Sohag', 'Qena', 'Luxor', 'Aswan'],
    baseFee: 95,
    freeShippingThreshold: 2500,
    estimatedDaysEn: 'Provisional 3-4 Business Days (Subject to courier conditions)',
    estimatedDaysAr: 'تقديري ٣-٤ أيام عمل (غير مضمون بنسبة ١٠٠٪)',
    codAvailable: true,
    isActive: true,
    isProvisional: true,
  },
  {
    id: 'coastal-remote',
    nameEn: 'Coastal & Frontier (Red Sea, Hurghada, Sharm El Sheikh, North Coast)',
    nameAr: 'المحافظات الساحلية والحدودية (الغردقة، شرم الشيخ، دهب، الساحل الشمالي)',
    governorates: ['Red Sea', 'South Sinai', 'North Sinai', 'Matrouh', 'New Valley'],
    baseFee: 120,
    freeShippingThreshold: 2800,
    estimatedDaysEn: 'Provisional 3-5 Business Days (Subject to courier conditions)',
    estimatedDaysAr: 'تقديري ٣-٥ أيام عمل (غير مضمون بنسبة ١٠٠٪)',
    codAvailable: true,
    isActive: true,
    isProvisional: true,
  },
];

// In-memory editable repository for Egyptian shipping zones
const globalForShipping = global as unknown as { currentEgyptianShippingZones?: ShippingZone[] };
export const currentEgyptianShippingZones: ShippingZone[] =
  globalForShipping.currentEgyptianShippingZones || [...defaultEgyptianShippingZones];
if (process.env.NODE_ENV !== 'production') {
  globalForShipping.currentEgyptianShippingZones = currentEgyptianShippingZones;
}

export const getShippingZones = (): ShippingZone[] => {
  return currentEgyptianShippingZones.filter((z) => z.isActive);
};

export const getShippingZoneById = (zoneId: string): ShippingZone | undefined => {
  return currentEgyptianShippingZones.find((z) => z.id === zoneId);
};

export const getZoneByGovernorate = (govName: string): ShippingZone => {
  const gov = EGYPTIAN_GOVERNORATES.find(
    (g) =>
      g.id.toLowerCase() === govName.toLowerCase() ||
      g.nameEn.toLowerCase() === govName.toLowerCase() ||
      g.nameAr === govName
  );
  if (gov) {
    const matched = getShippingZoneById(gov.zoneId);
    if (matched) return matched;
  }
  return currentEgyptianShippingZones[0]; // fallback to Cairo/Giza
};

export const updateShippingZone = (
  zoneId: string,
  updates: Partial<Omit<ShippingZone, 'id'>>
): ShippingZone | null => {
  const index = currentEgyptianShippingZones.findIndex((z) => z.id === zoneId);
  if (index === -1) return null;
  currentEgyptianShippingZones[index] = { ...currentEgyptianShippingZones[index], ...updates };
  return currentEgyptianShippingZones[index];
};

export const calculateShippingFee = (
  zoneId: string,
  subtotal: number
): { fee: number; isFree: boolean; zone: ShippingZone | null } => {
  const zone = getShippingZoneById(zoneId);
  if (!zone) {
    return { fee: 60, isFree: false, zone: null }; // default Cairo fee
  }

  if (subtotal >= zone.freeShippingThreshold) {
    return { fee: 0, isFree: true, zone };
  }

  return { fee: zone.baseFee, isFree: false, zone };
};
