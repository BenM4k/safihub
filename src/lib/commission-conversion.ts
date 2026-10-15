/**
 * Commission conversion utilities for SafiHub.
 * Converts between user-facing percentages (e.g. "20", "20.5", 20.5)
 * and internal integer basis points (bps, 1% = 100 bps) without floating point inaccuracies.
 */

/**
 * Converts a percentage string or number into basis points (integer).
 * Accepts comma or dot as decimal separator (e.g. "20", "20.5", "20,5").
 * Empty string, null, or undefined returns null (meaning default commission).
 * Range allowed: 0% to 100% (0 to 10000 bps).
 *
 * @throws Error if value is out of range or not a valid number.
 */
export function percentToBps(
  input: string | number | null | undefined
): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  const str = String(input).trim().replace(",", ".");
  if (str === "") {
    return null;
  }

  // Validate number format (up to 2 decimal places)
  if (!/^\d+(\.\d{1,2})?$/.test(str)) {
    throw new Error(
      "La commission doit être un nombre valide entre 0 et 100 (ex: 20 ou 20.5)."
    );
  }

  const parts = str.split(".");
  const intPart = parseInt(parts[0], 10);
  const decStr = parts[1] || "";
  const decPart = parseInt(decStr.padEnd(2, "0").slice(0, 2), 10);

  const bps = intPart * 100 + decPart;

  if (bps < 0 || bps > 10000) {
    throw new Error("La commission doit être comprise entre 0 % et 100 %.");
  }

  return bps;
}

/**
 * Converts integer basis points (bps) into a clean percentage string.
 * Uses integer math to avoid IEEE-754 precision artifacts.
 * e.g. 2000 -> "20", 2050 -> "20.5", 2025 -> "20.25", 0 -> "0", null -> null
 */
export function bpsToPercentString(
  bps: number | null | undefined
): string | null {
  if (bps === null || bps === undefined) {
    return null;
  }

  if (!Number.isInteger(bps) || bps < 0 || bps > 10000) {
    return "0";
  }

  const intPart = Math.floor(bps / 100);
  const remainder = bps % 100;

  if (remainder === 0) {
    return `${intPart}`;
  }

  if (remainder % 10 === 0) {
    return `${intPart}.${remainder / 10}`;
  }

  return `${intPart}.${remainder.toString().padStart(2, "0")}`;
}

/**
 * Formats a commission value for display in the table or details views.
 * Shows "20 %" for custom values and "Défaut (20 %)" for default / null values.
 * Uses French formatting with space before the % sign.
 */
export function formatCommissionDisplay(
  bps: number | null | undefined,
  defaultBps: number = 2000
): string {
  if (bps === null || bps === undefined) {
    const defaultPercent = bpsToPercentString(defaultBps) ?? "20";
    return `Défaut (${defaultPercent} %)`;
  }

  const percent = bpsToPercentString(bps) ?? "0";
  return `${percent} %`;
}
