/**
 * Egyptian Mobile Phone Normalization Utility
 *
 * Normalizes all Egyptian mobile number formats:
 * - 01015993802
 * - +20 101 599 3802
 * - 201015993802
 * - 00201015993802
 * - 1015993802
 *
 * Into canonical 11-digit national format: "01xxxxxxxxx" (e.g. "01015993802")
 */
export function normalizeEgyptianPhone(input: string): string {
  if (!input) return '';
  const digits = input.trim().replace(/[^0-9]/g, '');
  if (digits.length >= 10) {
    const last10 = digits.slice(-10); // e.g. "1015993802"
    return `0${last10}`;
  }
  return digits;
}

/**
 * Checks if two phone numbers match under Egyptian mobile rules
 */
export function arePhonesEqual(phoneA: string, phoneB: string): boolean {
  if (!phoneA || !phoneB) return false;
  const normA = normalizeEgyptianPhone(phoneA);
  const normB = normalizeEgyptianPhone(phoneB);
  if (!normA || !normB) return false;
  return normA === normB || normA.slice(-10) === normB.slice(-10);
}
