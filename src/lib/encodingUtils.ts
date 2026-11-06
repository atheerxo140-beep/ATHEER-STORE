/**
 * Utility to detect and clean double-encoded UTF-8 (Mojibake) strings.
 * For example: 'Ù‡ÙˆØ¯ÙŠ' -> 'هودي'
 */
export function cleanMojibake(text: string | null | undefined): string {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);

  // If text contains Mojibake markers (e.g. Ø, Ù with high-ascii Latin-1 characters)
  if (text.includes('Ø') || text.includes('Ù') || text.includes('Â') || text.includes('Ã')) {
    try {
      const decoded = Buffer.from(text, 'latin1').toString('utf8');
      // If decoded doesn't have replacement character and looks like valid text
      if (decoded && !decoded.includes('\uFFFD')) {
        return decoded;
      }
    } catch (e) {
      // Fall through to returning original
    }
  }

  return text;
}
