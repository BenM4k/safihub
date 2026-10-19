/**
 * DRC (+243) Phone Normalization, Validation, and Formatting Utilities.
 * Handles Democratic Republic of Congo mobile prefixes:
 * - Airtel: 97, 98, 99
 * - Vodacom: 81, 82, 83
 * - Orange: 80, 84, 85, 89
 * - Africell: 90, 91
 */

/**
 * Normalizes any user-entered DRC phone number into standard international digits.
 * e.g. "090 000 0001" -> "+243900000001"
 * e.g. "900000001" -> "+243900000001"
 * e.g. "+243 90 000 0001" -> "+243900000001"
 */
export function normalizeDrcPhone(input: string | null | undefined): string {
  if (!input) return "";

  const digits = input.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("243") && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `+243${digits.slice(1)}`;
  }

  if (digits.length === 9) {
    return `+243${digits}`;
  }

  return input.trim();
}

/**
 * Formats a DRC phone number into the human-readable standard format:
 * "+243 90 000 0001" (+243 XX XXX XXXX).
 */
export function formatDrcPhone(input: string | null | undefined): string {
  if (!input) return "—";

  const digits = input.replace(/\D/g, "");
  let national = "";

  if (digits.startsWith("243") && digits.length === 12) {
    national = digits.slice(3);
  } else if (digits.startsWith("0") && digits.length === 10) {
    national = digits.slice(1);
  } else if (digits.length === 9) {
    national = digits;
  }

  if (national.length === 9) {
    const p1 = national.slice(0, 2);
    const p2 = national.slice(2, 5);
    const p3 = national.slice(5, 9);
    return `+243 ${p1} ${p2} ${p3}`;
  }

  return input.trim() || "—";
}

/**
 * Validates whether a phone number matches standard DRC mobile format.
 * Must have 9 national digits starting with 8 or 9 (standard mobile prefix).
 */
export function isValidDrcPhone(input: string | null | undefined): boolean {
  if (!input || !input.trim()) return false;

  const digits = input.replace(/\D/g, "");
  let national = "";

  if (digits.startsWith("243") && digits.length === 12) {
    national = digits.slice(3);
  } else if (digits.startsWith("0") && digits.length === 10) {
    national = digits.slice(1);
  } else if (digits.length === 9) {
    national = digits;
  }

  // DRC mobile networks start with 8 or 9 and have 9 digits
  return /^[89]\d{8}$/.test(national);
}

/**
 * Masks a phone number for partner privacy, revealing country/carrier prefix and last 4 digits.
 * e.g. "+243 99 123 4567" -> "+243 99 ••• 4567"
 */
export function maskPhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.trim();
  if (cleaned.length < 7) return cleaned;

  if (cleaned.startsWith("+243")) {
    const withoutPrefix = cleaned.slice(4).trim();
    const networkCode = withoutPrefix.slice(0, 2);
    const lastFour = cleaned.slice(-4);
    return `+243 ${networkCode} ••• ${lastFour}`;
  }

  const firstFour = cleaned.slice(0, 4);
  const lastFour = cleaned.slice(-4);
  return `${firstFour} ••• ${lastFour}`;
}

