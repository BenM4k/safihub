/**
 * Financial formatters and discrepancy calculation helpers for SafiHub cash controls.
 * Uses integer minor units, strict currency handling, and non-breaking spaces.
 */

export interface DiscrepancyInfo {
  difference: number;
  isZero: boolean;
  isShortage: boolean;
  isSurplus: boolean;
  sign: "+" | "-" | "";
  formattedAmount: string;
  label: "Aucun écart" | "Manquant" | "Excédent";
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
}

/**
 * Formats a monetary amount with French non-breaking space between thousands and currency:
 * e.g. "25 000 CDF", "-5 000 CDF".
 */
export function formatMoney(
  amount: number | null | undefined,
  currency: string = "CDF",
  options?: { showPlusSign?: boolean }
): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return `0\u00A0${currency}`;
  }

  const isNegative = amount < 0;
  const absVal = Math.abs(Math.round(amount));

  // Format with standard French thousands separator using non-breaking space (\u00A0)
  const formattedAbs = absVal
    .toLocaleString("fr-FR")
    .replace(/[\u202F\u00A0]/g, "\u00A0");

  let prefix = "";
  if (isNegative) {
    prefix = "-";
  } else if (options?.showPlusSign && amount > 0) {
    prefix = "+";
  }

  return `${prefix}${formattedAbs}\u00A0${currency}`;
}

/**
 * Evaluates discrepancy between Received and Expected cash:
 * Formula: Écart = Reçu − Attendu.
 */
export function getDiscrepancyInfo(
  difference: number,
  currency: string = "CDF"
): DiscrepancyInfo {
  const diffInt = Math.round(difference);

  if (diffInt === 0) {
    return {
      difference: 0,
      isZero: true,
      isShortage: false,
      isSurplus: false,
      sign: "",
      formattedAmount: `0\u00A0${currency}`,
      label: "Aucun écart",
      colorClass: "text-success-base",
      bgClass: "bg-success-light",
      borderClass: "border-success-base/20",
      badgeClass: "bg-success-light text-success-base border-success-base/30",
    };
  }

  if (diffInt < 0) {
    return {
      difference: diffInt,
      isZero: false,
      isShortage: true,
      isSurplus: false,
      sign: "-",
      formattedAmount: formatMoney(diffInt, currency),
      label: "Manquant",
      colorClass: "text-destructive-base",
      bgClass: "bg-destructive-light",
      borderClass: "border-destructive-base/20",
      badgeClass: "bg-destructive-light text-destructive-base border-destructive-base/30",
    };
  }

  return {
    difference: diffInt,
    isZero: false,
    isShortage: false,
    isSurplus: true,
    sign: "+",
    formattedAmount: formatMoney(diffInt, currency, { showPlusSign: true }),
    label: "Excédent",
    colorClass: "text-warning-base",
    bgClass: "bg-warning-light",
    borderClass: "border-warning-base/20",
    badgeClass: "bg-warning-light text-warning-base border-warning-base/30",
  };
}

/**
 * Formats a Date or ISO string into French date DD/MM/YYYY.
 */
export function formatFrenchDate(
  dateInput: Date | string | null | undefined,
  timeZone: string = "Africa/Lubumbashi"
): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput.includes("T") ? dateInput : `${dateInput}T12:00:00Z`) : dateInput;
  if (isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Formats date into readable French long day format: "14 oct. 2026".
 */
export function formatFrenchDateLong(
  dateInput: Date | string | null | undefined,
  timeZone: string = "Africa/Lubumbashi"
): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput.includes("T") ? dateInput : `${dateInput}T12:00:00Z`) : dateInput;
  if (isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Formats date and time into French format: "14/10/2026 15:42".
 */
export function formatFrenchDateTime(
  dateInput: Date | string | null | undefined,
  timeZone: string = "Africa/Lubumbashi"
): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
