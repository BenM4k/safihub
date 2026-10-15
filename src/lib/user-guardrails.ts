/**
 * Phone number normalization and validation for DRC (+243).
 * Accepts various user inputs (0999537712, +243 99 953 7712, 999537712)
 * and formats to canonical "+243 99 953 7712".
 */
export function normalizeDrcPhone(input: string | null | undefined): string {
  if (!input) return "";
  const cleaned = input.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+243")) {
    const local = cleaned.slice(4);
    return formatDrcLocalParts(local);
  }
  if (cleaned.startsWith("243")) {
    const local = cleaned.slice(3);
    return formatDrcLocalParts(local);
  }
  if (cleaned.startsWith("0")) {
    const local = cleaned.slice(1);
    return formatDrcLocalParts(local);
  }
  return formatDrcLocalParts(cleaned);
}

function formatDrcLocalParts(local: string): string {
  const digits = local.replace(/\D/g, "");
  if (!digits) return "+243";
  if (digits.length <= 2) return `+243 ${digits}`;
  if (digits.length <= 5) return `+243 ${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `+243 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
}

export function isValidDrcPhone(input: string | null | undefined): boolean {
  if (!input) return false;
  const digits = input.replace(/\D/g, "");
  // Valid DRC phone with 243 prefix: 12 digits (243 + 9 digits)
  // or local format: 9 digits starting with 8 or 9
  if (digits.startsWith("243") && digits.length === 12) {
    const local = digits.slice(3);
    return /^[89]\d{8}$/.test(local);
  }
  if (digits.length === 9) {
    return /^[89]\d{8}$/.test(digits);
  }
  if (digits.length === 10 && digits.startsWith("0")) {
    return /^[89]\d{8}$/.test(digits.slice(1));
  }
  return false;
}

export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.endsWith("@guest.invalid")) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export interface PasswordStrengthResult {
  score: 1 | 2 | 3;
  labelKey: "passwordWeak" | "passwordMedium" | "passwordStrong";
  isValid: boolean;
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-=+]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);

  const isValid = hasMinLength && (hasNumber || hasSpecial);

  let score: 1 | 2 | 3 = 1;
  let labelKey: "passwordWeak" | "passwordMedium" | "passwordStrong" = "passwordWeak";

  if (hasMinLength && hasNumber && hasSpecial && (hasUpper || hasLower) && password.length >= 10) {
    score = 3;
    labelKey = "passwordStrong";
  } else if (hasMinLength && (hasNumber || hasSpecial)) {
    score = 2;
    labelKey = "passwordMedium";
  }

  return {
    score,
    labelKey,
    isValid,
    hasMinLength,
    hasNumber,
    hasSpecial,
  };
}

export function generateSecurePassword(): string {
  const letters = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const specials = "!@#$%&*";

  let result = "";
  // Ensure at least 1 uppercase/lowercase, 1 number, 1 special
  result += letters.charAt(Math.floor(Math.random() * letters.length));
  result += letters.charAt(Math.floor(Math.random() * letters.length));
  result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  result += specials.charAt(Math.floor(Math.random() * specials.length));

  const all = letters + numbers + specials;
  for (let i = 0; i < 8; i++) {
    result += all.charAt(Math.floor(Math.random() * all.length));
  }

  // Shuffle string
  return result
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export function isLastAdmin(
  targetRole: string | null | undefined,
  activeAdminsCount: number
): boolean {
  return targetRole === "admin" && activeAdminsCount <= 1;
}

export function isSelfAction(
  currentUserId: string | null | undefined,
  targetUserId: string
): boolean {
  if (!currentUserId || !targetUserId) return false;
  return currentUserId === targetUserId;
}

export function isTestStaffAccount(user: {
  name?: string | null;
  email?: string | null;
  contactPhone?: string | null;
}): boolean {
  const email = (user.email || "").toLowerCase();
  const name = (user.name || "").toLowerCase();
  const phone = (user.contactPhone || "").replace(/\s+/g, "");

  return (
    email.endsWith("@test.invalid") ||
    email.endsWith("@example.com") ||
    email.includes("test@") ||
    name.includes("test") ||
    phone.includes("000000") ||
    phone === "+243000000000"
  );
}
