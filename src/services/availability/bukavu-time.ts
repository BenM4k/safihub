/**
 * Bukavu (South Kivu, DRC) is in Africa/Lubumbashi timezone (CAT - Central Africa Time).
 * Standard UTC offset: UTC+2 (120 minutes) all year round. No Daylight Saving Time.
 */
export const BUKAVU_UTC_OFFSET_MINUTES = 120;
export const BUKAVU_TIMEZONE = "Africa/Lubumbashi";

export interface BukavuDateTime {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  weekday: number; // 1 = Monday ... 7 = Sunday (ISO 8601)
  hours: number; // 0-23
  minutes: number; // 0-59
  dateString: string; // "YYYY-MM-DD"
  timeString: string; // "HH:MM"
}

/**
 * Converts a UTC Date into its Bukavu local date/time breakdown.
 */
export function toBukavuDateTime(utcDate: Date): BukavuDateTime {
  const localMs = utcDate.getTime() + BUKAVU_UTC_OFFSET_MINUTES * 60 * 1000;
  const localDate = new Date(localMs);

  const year = localDate.getUTCFullYear();
  const month = localDate.getUTCMonth() + 1;
  const day = localDate.getUTCDate();
  const hours = localDate.getUTCHours();
  const minutes = localDate.getUTCMinutes();

  // JavaScript getUTCDay: 0 = Sun, 1 = Mon ... 6 = Sat
  // Convert to ISO weekday: 1 = Mon ... 7 = Sun
  const rawDay = localDate.getUTCDay();
  const weekday = rawDay === 0 ? 7 : rawDay;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateString = `${year}-${pad(month)}-${pad(day)}`;
  const timeString = `${pad(hours)}:${pad(minutes)}`;

  return {
    year,
    month,
    day,
    weekday,
    hours,
    minutes,
    dateString,
    timeString,
  };
}

/**
 * Constructs a UTC Date from Bukavu local date string ("YYYY-MM-DD") and time string ("HH:MM").
 */
export function fromBukavuDateTime(dateString: string, timeString: string): Date {
  const [yearStr, monthStr, dayStr] = dateString.split("-");
  const [hourStr, minStr] = timeString.split(":");

  const year = parseInt(yearStr!, 10);
  const month = parseInt(monthStr!, 10);
  const day = parseInt(dayStr!, 10);
  const hour = parseInt(hourStr!, 10);
  const min = parseInt(minStr!, 10);

  // UTC ms for the Bukavu time minus 2 hours (120 min)
  const utcMs = Date.UTC(year, month - 1, day, hour, min) - BUKAVU_UTC_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMs);
}

/**
 * Compares two "HH:MM" strings. Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function compareTimes(timeA: string, timeB: string): number {
  return timeToMinutes(timeA) - timeToMinutes(timeB);
}

/**
 * Converts "HH:MM" to minutes from midnight (0 to 1439).
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Converts minutes from midnight to "HH:MM".
 */
export function minutesToTime(minutes: number): string {
  const normalized = Math.max(0, Math.min(1439, minutes));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
