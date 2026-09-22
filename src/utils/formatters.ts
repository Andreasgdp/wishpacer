/**
 * Parses a price/numeric input string supporting thousand separators (commas, spaces)
 * and localized decimal separators (commas or dots).
 *
 * Examples:
 * - "1,200.5" -> 1200.5
 * - "1,200" -> 1200
 * - "1200,5" -> 1200.5
 * - "1200,50" -> 1200.5
 * - " 1,200.50 " -> 1200.5
 * - "1 200,50" -> 1200.5
 * - "invalid" -> NaN
 */
export function parsePriceInput(input: string | number | null | undefined): number {
  if (input === null || input === undefined) {
    return NaN;
  }
  if (typeof input === 'number') {
    return isNaN(input) ? NaN : input;
  }

  const str = String(input).trim();
  if (!str) {
    return NaN;
  }

  // Remove spaces (including non-breaking spaces)
  let cleaned = str.replace(/[\s\u00a0]/g, '');

  // Check if string contains invalid characters (allowed: optional +/-, digits, commas, dots)
  if (!/^[+-]?[0-9,.]+$/.test(cleaned)) {
    return NaN;
  }

  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma && hasDot) {
    const firstComma = cleaned.indexOf(',');
    const firstDot = cleaned.indexOf('.');
    if (firstComma < firstDot) {
      // e.g. "1,200.50" or "1,234,567.89" -> commas are thousand separators
      cleaned = cleaned.replace(/,/g, '');
    } else {
      // e.g. "1.200,50" or "1.234.567,89" -> dots are thousand separators, comma is decimal
      cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (hasComma) {
    // Only comma present
    const commaCount = (cleaned.match(/,/g) || []).length;
    if (commaCount > 1) {
      // Multiple commas e.g. "1,234,567" -> thousand separators
      cleaned = cleaned.replace(/,/g, '');
    } else {
      // Single comma e.g. "1,200" vs "1200,5" vs "1200,50" vs "1,5"
      // If matches thousands separator pattern like "1,200" or "12,345"
      // (comma followed by exactly 3 digits at end of integer part)
      const isThousandSeparator = /^[+-]?\d{1,3},\d{3}$/.test(cleaned);
      if (isThousandSeparator) {
        cleaned = cleaned.replace(/,/g, '');
      } else {
        cleaned = cleaned.replace(/,/g, '.');
      }
    }
  } else if (hasDot) {
    // Only dot present
    const dotCount = (cleaned.match(/\./g) || []).length;
    if (dotCount > 1) {
      // Multiple dots e.g. "1.234.567"
      cleaned = cleaned.replace(/\./g, '');
    }
  }

  const num = Number(cleaned);
  return isNaN(num) ? NaN : num;
}
