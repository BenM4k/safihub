/**
 * Threshold in days beyond which an unpaid settlement balance is considered overdue.
 * Config constant as specified in requirement 3.
 */
export const SETTLEMENT_OVERDUE_DAYS_THRESHOLD = 7;

/**
 * Calculates days overdue relative to now in UTC/Africa/Lubumbashi.
 */
export function calculateDaysOverdue(oldestUnpaidDate: Date | string | null | undefined): number {
  if (!oldestUnpaidDate) return 0;
  const date = typeof oldestUnpaidDate === "string" ? new Date(oldestUnpaidDate) : oldestUnpaidDate;
  if (isNaN(date.getTime())) return 0;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 3600 * 24));
  return Math.max(0, days);
}

/**
 * Returns the Monday and Sunday bounding the given date (default: today).
 */
export function getWeekBounds(referenceDate?: Date): { start: Date; end: Date; weekString: string } {
  const d = referenceDate ? new Date(referenceDate) : new Date();
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // ISO week string YYYY-Www
  const target = new Date(monday.valueOf());
  const dayNr = (monday.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const weekString = `${monday.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;

  return { start: monday, end: sunday, weekString };
}

/**
 * Returns the next Monday settlement date formatted in French.
 */
export function getNextSettlementDateFormatted(): string {
  const now = new Date();
  const day = now.getDay();
  const daysUntilNextMonday = day === 0 ? 1 : (8 - day);
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilNextMonday);

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Lubumbashi",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(nextMonday);
}

/**
 * Formats a weekly range in French: e.g. "6 - 12 oct. 2026".
 */
export function formatWeekRange(start: Date, end: Date): string {
  const startDay = start.getDate();
  const endFormatted = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Lubumbashi",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(end);

  return `${startDay} - ${endFormatted}`;
}
