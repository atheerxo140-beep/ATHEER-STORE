import { Product } from '@/types';

/**
 * Normalizes Arabic text for flexible matching:
 * - Removes diacritics / tashkeel
 * - Normalizes alef forms (أ, إ, آ -> ا)
 * - Normalizes teh marbuta and heh (ة -> ه)
 * - Normalizes alef maqsura and yeh (ى -> ي)
 * - Normalizes hamza forms (ؤ -> و, ئ -> ي)
 * - Trims and lowercases
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .trim();
}

/**
 * Streetwear terms synonyms and plural/singular variations in Arabic & English
 */
const SEARCH_SYNONYMS: Record<string, string[]> = {
  هوديز: ['هودي', 'hoodie', 'hoodies', 'بلوفر'],
  هودي: ['هوديز', 'hoodie', 'hoodies', 'بلوفر'],
  بلوفر: ['هودي', 'هوديز', 'سويت شيرت', 'hoodie'],
  سويت: ['سويت شيرت', 'سويت شيرتات', 'كرو نيك', 'sweatshirt', 'sweatshirts', 'crewneck'],
  'سويت شيرت': ['سويت شيرتات', 'كرو نيك', 'sweatshirt', 'sweatshirts'],
  'سويت شيرتات': ['سويت شيرت', 'كرو نيك', 'sweatshirt', 'sweatshirts'],
  سويتشيرت: ['سويت شيرت', 'sweatshirt'],
  تيشيرت: ['تي شيرت', 'تيشيرتات', 'تي شيرتات', 'tee', 'tees', 't-shirt', 'tshirt'],
  تيشيرتات: ['تي شيرت', 'تي شيرتات', 'tee', 'tees'],
  'تي شيرت': ['تيشيرت', 'تيشيرتات', 'tee', 'tshirt'],
  'تي شيرتات': ['تي شيرت', 'تيشيرت', 'tee'],
  اوفرسايز: ['اوفر سايز', 'عريض', 'boxy', 'oversized'],
  بوكسي: ['عريض', 'boxy', 'drop-shoulder', 'ساقطة'],
  اسود: ['black', 'onyx', 'فحم', 'charcoal', 'داكن'],
  عاجي: ['ivory', 'bone', 'عاج', 'ابيض'],
  صنوبر: ['اخضر', 'pine', 'green'],
  اخضر: ['صنوبر', 'pine', 'green'],
  رمادي: ['slate', 'grey', 'gray', 'charcoal', 'فحم'],
  قطن: ['cotton', 'تيري', 'terry', 'قماش'],
  فخم: ['فاخر', 'luxury', 'heavyweight', 'ثقيل'],
  ثقيل: ['heavyweight', 'gsm', 'كثيف', '500'],
};

/**
 * Checks if a Product matches a raw search query.
 */
export function matchesProduct(product: Product, rawQuery: string): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;

  const normalizedQuery = normalizeArabic(rawQuery);
  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const searchableFields = [
    product.nameAr,
    product.nameEn,
    product.category,
    product.categoryLabelAr,
    product.categoryLabelEn,
    product.badgeAr || '',
    product.badgeEn || '',
    product.descriptionAr,
    product.descriptionEn,
    product.fitAr,
    product.fitEn,
    product.fabricAr,
    product.fabricEn,
    `${product.gsm} gsm`,
    `${product.gsm}`,
    ...(product.colors || []),
    ...(product.sizes || []),
  ].map((field) => normalizeArabic(field));

  const fullSearchString = searchableFields.join(' ');

  return words.every((word) => {
    // 1. Direct substring match
    if (fullSearchString.includes(word)) return true;

    // 2. Synonyms match
    const syns = SEARCH_SYNONYMS[word];
    if (syns && syns.some((syn) => fullSearchString.includes(normalizeArabic(syn)))) {
      return true;
    }

    // 3. Prefix matching for Arabic stems (e.g. "هود" matches "هودي" and "هوديز")
    if (word.length >= 3) {
      const stem = word.substring(0, Math.min(4, word.length));
      if (fullSearchString.includes(stem)) {
        return true;
      }
    }

    return false;
  });
}
