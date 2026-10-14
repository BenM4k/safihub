export const HOUSE_ACCEPTANCE_SLA_MINUTES = 45;
export const HOUSE_ACCEPTANCE_WARNING_MINUTES = 45;
export const HOUSE_ACCEPTANCE_CRITICAL_MINUTES = 90;
export const RECENT_RELANCE_THRESHOLD_MINUTES = 15;

export type UrgencyLevel = "neutral" | "warning" | "critical";

export interface UrgencyInfo {
  level: UrgencyLevel;
  elapsedMinutes: number;
  formattedElapsed: string;
  isOverdue: boolean;
  isCritical: boolean;
  overdueMinutes: number;
  label?: string;
}

/**
 * Calculates elapsed minutes between a starting date and now.
 */
export function getElapsedMinutes(
  createdAt: Date | string | number,
  now: Date = new Date()
): number {
  const created = typeof createdAt === "object" ? createdAt.getTime() : new Date(createdAt).getTime();
  const current = now.getTime();
  const diffMs = Math.max(0, current - created);
  return Math.floor(diffMs / (60 * 1000));
}

/**
 * Formats elapsed time in French style: "12 min", "52 min", "2 h 10", "1 j 4 h".
 */
export function formatElapsedTime(
  createdAt: Date | string | number,
  now: Date = new Date()
): string {
  const minutes = getElapsedMinutes(createdAt, now);

  if (minutes < 1) {
    return "< 1 min";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    if (remainingMinutes === 0) {
      return `${hours} h`;
    }
    return `${hours} h ${remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes}`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return `${days} j`;
  }
  return `${days} j ${remainingHours} h`;
}

/**
 * Computes urgency level based on SLA thresholds (45 min warning, 90 min critical).
 * Never relies on colour alone: returns explicit label and level.
 */
export function getUrgencyInfo(
  createdAt: Date | string | number,
  now: Date = new Date()
): UrgencyInfo {
  const elapsedMinutes = getElapsedMinutes(createdAt, now);
  const formattedElapsed = formatElapsedTime(createdAt, now);
  const overdueMinutes = Math.max(0, elapsedMinutes - HOUSE_ACCEPTANCE_SLA_MINUTES);

  if (elapsedMinutes >= HOUSE_ACCEPTANCE_CRITICAL_MINUTES) {
    return {
      level: "critical",
      elapsedMinutes,
      formattedElapsed,
      isOverdue: true,
      isCritical: true,
      overdueMinutes,
    };
  }

  if (elapsedMinutes >= HOUSE_ACCEPTANCE_WARNING_MINUTES) {
    return {
      level: "warning",
      elapsedMinutes,
      formattedElapsed,
      isOverdue: true,
      isCritical: false,
      overdueMinutes,
    };
  }

  return {
    level: "neutral",
    elapsedMinutes,
    formattedElapsed,
    isOverdue: false,
    isCritical: false,
    overdueMinutes: 0,
  };
}

/**
 * Formats an amount in CDF using French number formatting: e.g. "18 000 CDF".
 */
export function formatCDF(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0 CDF";
  }
  return `${Math.round(amount).toLocaleString("fr-FR")} CDF`;
}

/**
 * Formats order code into a short readable reference: e.g. #1042 instead of long strings.
 */
export function formatOrderRef(code: string | undefined | null, fallbackId?: string): string {
  if (!code && !fallbackId) return "#---";
  const val = code || fallbackId || "";
  // Strip prefixes like ORD- or SAF- if present, or keep clean alphanumeric
  const clean = val.replace(/^(ORD|SAF)-/i, "");
  if (clean.length > 8) {
    return `#${clean.slice(0, 8)}`;
  }
  return `#${clean}`;
}
