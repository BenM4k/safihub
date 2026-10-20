import {
  toBukavuDateTime,
  timeToMinutes,
  minutesToTime,
  BUKAVU_TIMEZONE,
} from "@/services/availability/bukavu-time";

export const TIMEZONE_CONFIG = {
  timezone: BUKAVU_TIMEZONE,
  label: "Heure de Bukavu, UTC+2",
} as const;

export interface TimeRange {
  opensAt: string; // "HH:MM"
  closesAt: string; // "HH:MM"
}

export interface DaySchedule {
  weekday: number; // 1 = Monday ... 7 = Sunday
  name: string;
  shortName: string;
  isOpen: boolean;
  ranges: TimeRange[];
}

export interface ClosureItem {
  id: string;
  startsOn: string; // "YYYY-MM-DD"
  endsOn: string; // "YYYY-MM-DD"
  reason?: string | null;
  createdAt?: Date | string | null;
}

export type ClosureStatus = "upcoming" | "ongoing" | "past";

export const WEEKDAY_DEFS = [
  { weekday: 1, name: "Lundi", shortName: "Lun" },
  { weekday: 2, name: "Mardi", shortName: "Mar" },
  { weekday: 3, name: "Mercredi", shortName: "Mer" },
  { weekday: 4, name: "Jeudi", shortName: "Jeu" },
  { weekday: 5, name: "Vendredi", shortName: "Ven" },
  { weekday: 6, name: "Samedi", shortName: "Sam" },
  { weekday: 7, name: "Dimanche", shortName: "Dim" },
] as const;

/**
 * Generate 24-hour time options with specified step in minutes (default 30 min).
 * Typically from 06:00 to 22:00 for daytime laundry houses.
 */
export function generateTimeOptions(stepMinutes: number = 30, startHour = 6, endHour = 22): string[] {
  const options: string[] = [];
  const startMin = startHour * 60;
  const endMin = endHour * 60;

  for (let m = startMin; m <= endMin; m += stepMinutes) {
    options.push(minutesToTime(m));
  }
  return options;
}

/**
 * Validates a single time range.
 */
export function validateRange(range: TimeRange): string | null {
  if (!range.opensAt || !range.closesAt) {
    return "Heures d'ouverture et de fermeture requises";
  }
  const openMin = timeToMinutes(range.opensAt);
  const closeMin = timeToMinutes(range.closesAt);
  if (closeMin <= openMin) {
    return "L'heure de fermeture doit être après l'heure d'ouverture";
  }
  return null;
}

/**
 * Checks for overlapping ranges on the same day.
 */
export function validateDayRanges(ranges: TimeRange[]): string | null {
  for (let i = 0; i < ranges.length; i++) {
    const err = validateRange(ranges[i]);
    if (err) return err;

    const startA = timeToMinutes(ranges[i].opensAt);
    const endA = timeToMinutes(ranges[i].closesAt);

    for (let j = i + 1; j < ranges.length; j++) {
      const startB = timeToMinutes(ranges[j].opensAt);
      const endB = timeToMinutes(ranges[j].closesAt);

      // Overlap condition: startA < endB && startB < endA
      if (startA < endB && startB < endA) {
        return "Les plages horaires ne peuvent pas se chevaucher";
      }
    }
  }
  return null;
}

/**
 * Calculates total weekly open hours in formatted French text.
 */
export function calculateWeeklyTotalMinutes(schedule: Record<number, DaySchedule>): number {
  let totalMin = 0;
  for (let w = 1; w <= 7; w++) {
    const day = schedule[w];
    if (day && day.isOpen) {
      for (const r of day.ranges) {
        const diff = timeToMinutes(r.closesAt) - timeToMinutes(r.opensAt);
        if (diff > 0) totalMin += diff;
      }
    }
  }
  return totalMin;
}

export function formatWeeklyHoursTotal(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) {
    return `${hours} h par semaine`;
  }
  return `${hours} h ${mins.toString().padStart(2, "0")} par semaine`;
}

/**
 * Formats YYYY-MM-DD into jj/mm/aaaa.
 */
export function formatDateFr(isoDate: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
}

/**
 * Calculates duration in days between two YYYY-MM-DD dates inclusive.
 */
export function calculateDurationDays(startsOn: string, endsOn: string): number {
  if (!startsOn || !endsOn) return 0;
  const d1 = new Date(`${startsOn}T00:00:00Z`);
  const d2 = new Date(`${endsOn}T00:00:00Z`);
  const diffTime = d2.getTime() - d1.getTime();
  if (diffTime < 0) return 0;
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Determines whether a closure is upcoming, ongoing, or past relative to Bukavu local date.
 */
export function getClosureStatus(
  closure: { startsOn: string; endsOn: string },
  now: Date = new Date()
): ClosureStatus {
  const local = toBukavuDateTime(now);
  const today = local.dateString;

  if (today > closure.endsOn) {
    return "past";
  }
  if (today >= closure.startsOn && today <= closure.endsOn) {
    return "ongoing";
  }
  return "upcoming";
}

/**
 * Computes live open/closed status with exact next opening time, matching dashboard logic.
 */
export function computeLiveStatus(
  schedule: Record<number, DaySchedule>,
  closures: Array<{ startsOn: string; endsOn: string }>,
  now: Date = new Date(),
  isPaused: boolean = false
): {
  status: "open" | "closed" | "paused";
  text: string;
  nextInfo: string;
  badgeClass: string;
} {
  if (isPaused) {
    return {
      status: "paused",
      text: "En pause",
      nextInfo: "Pressing temporairement en pause",
      badgeClass: "bg-warning-soft text-warning border-warning/30",
    };
  }

  const local = toBukavuDateTime(now);
  const todayDateStr = local.dateString;
  const currentWeekday = local.weekday;
  const currentTime = local.timeString;

  // Check scheduled closure
  const activeClosure = closures.find(
    (c) => todayDateStr >= c.startsOn && todayDateStr <= c.endsOn
  );

  if (activeClosure) {
    const nextDay = findNextOpenDay(schedule, closures, local);
    return {
      status: "closed",
      text: "Fermé (fermeture exceptionnelle)",
      nextInfo: nextDay ? `Rouvre ${nextDay}` : "Aucune réouverture programmée",
      badgeClass: "bg-destructive-soft text-destructive border-destructive/30",
    };
  }

  const today = schedule[currentWeekday];
  if (!today || !today.isOpen || today.ranges.length === 0) {
    const nextDay = findNextOpenDay(schedule, closures, local);
    return {
      status: "closed",
      text: "Fermé aujourd'hui",
      nextInfo: nextDay ? `Rouvre ${nextDay}` : "Aucune réouverture programmée",
      badgeClass: "bg-destructive-soft text-destructive border-destructive/30",
    };
  }

  // Check if inside any open range
  for (const r of today.ranges) {
    if (currentTime >= r.opensAt && currentTime < r.closesAt) {
      return {
        status: "open",
        text: `Ouvert maintenant`,
        nextInfo: `ferme à ${r.closesAt}`,
        badgeClass: "bg-success-soft text-success border-success/30",
      };
    }
  }

  // Check if before the earliest opening today
  const sorted = [...today.ranges].sort((a, b) => a.opensAt.localeCompare(b.opensAt));
  const firstRange = sorted[0];
  if (currentTime < firstRange.opensAt) {
    return {
      status: "closed",
      text: "Fermé",
      nextInfo: `rouvre aujourd'hui à ${firstRange.opensAt}`,
      badgeClass: "bg-secondary text-muted-foreground border-border",
    };
  }

  // Check if in a break between ranges today
  for (let i = 0; i < sorted.length - 1; i++) {
    const prev = sorted[i];
    const next = sorted[i + 1];
    if (currentTime >= prev.closesAt && currentTime < next.opensAt) {
      return {
        status: "closed",
        text: "En pause",
        nextInfo: `rouvre aujourd'hui à ${next.opensAt}`,
        badgeClass: "bg-secondary text-muted-foreground border-border",
      };
    }
  }

  // After last range today: find next open day
  const nextDay = findNextOpenDay(schedule, closures, local);
  return {
    status: "closed",
    text: "Fermé",
    nextInfo: nextDay ? `rouvre ${nextDay}` : "Aucune réouverture programmée",
    badgeClass: "bg-secondary text-muted-foreground border-border",
  };
}

/**
 * Searches up to 14 days ahead for the next opening moment.
 */
function findNextOpenDay(
  schedule: Record<number, DaySchedule>,
  closures: Array<{ startsOn: string; endsOn: string }>,
  localNow: { dateString: string; weekday: number }
): string | null {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const refDate = new Date(`${localNow.dateString}T12:00:00Z`);

  for (let d = 1; d <= 14; d++) {
    const candidate = new Date(refDate.getTime() + d * 24 * 60 * 60 * 1000);
    const cYear = candidate.getUTCFullYear();
    const cMonth = candidate.getUTCMonth() + 1;
    const cDay = candidate.getUTCDate();
    const dateStr = `${cYear}-${pad(cMonth)}-${pad(cDay)}`;

    // Weekday
    const rawDay = candidate.getUTCDay();
    const weekday = rawDay === 0 ? 7 : rawDay;

    // Check closure
    const isClosed = closures.some((c) => dateStr >= c.startsOn && dateStr <= c.endsOn);
    if (isClosed) continue;

    const daySched = schedule[weekday];
    if (daySched && daySched.isOpen && daySched.ranges.length > 0) {
      const sorted = [...daySched.ranges].sort((a, b) => a.opensAt.localeCompare(b.opensAt));
      const firstOpen = sorted[0].opensAt;
      const dayDef = WEEKDAY_DEFS.find((w) => w.weekday === weekday);
      const dayName = d === 1 ? "demain" : dayDef?.name.toLowerCase() || "";
      return `${dayName} à ${firstOpen}`;
    }
  }
  return null;
}

/**
 * Computes a realistic, concrete example of how the acceptance timer behaves based on the real schedule.
 */
export function computeTimerExample(schedule: Record<number, DaySchedule>): string {
  // Find a day that is open followed by a day that is closed, or the end of the work week
  let targetWeekday = 6; // Saturday by default
  let closingDay = schedule[targetWeekday];

  if (!closingDay || !closingDay.isOpen || closingDay.ranges.length === 0) {
    // Pick the last open weekday of the week
    for (let w = 7; w >= 1; w--) {
      if (schedule[w]?.isOpen && (schedule[w]?.ranges.length ?? 0) > 0) {
        targetWeekday = w;
        closingDay = schedule[w];
        break;
      }
    }
  }

  if (!closingDay || !closingDay.isOpen || closingDay.ranges.length === 0) {
    return "Actuellement, aucun jour ouvré n'est configuré : le pressing ne peut recevoir de commandes.";
  }

  const sortedRanges = [...closingDay.ranges].sort((a, b) => a.opensAt.localeCompare(b.opensAt));
  const lastRange = sortedRanges[sortedRanges.length - 1];
  const closeMin = timeToMinutes(lastRange.closesAt);
  const orderMin = Math.max(0, closeMin - 10);
  const orderTimeStr = minutesToTime(orderMin);

  // Find next open day after targetWeekday
  let nextDayName = "le prochain jour ouvré";
  let nextOpenTime = "08:00";

  for (let step = 1; step <= 7; step++) {
    const nextWeekday = ((targetWeekday - 1 + step) % 7) + 1;
    const nextSched = schedule[nextWeekday];
    if (nextSched && nextSched.isOpen && nextSched.ranges.length > 0) {
      const sortedNext = [...nextSched.ranges].sort((a, b) => a.opensAt.localeCompare(b.opensAt));
      nextDayName = WEEKDAY_DEFS.find((w) => w.weekday === nextWeekday)?.name.toLowerCase() || "jour suivant";
      nextOpenTime = sortedNext[0].opensAt;
      break;
    }
  }

  const dayName = WEEKDAY_DEFS.find((w) => w.weekday === targetWeekday)?.name.toLowerCase() || "jour ouvré";
  const resumeMin = timeToMinutes(nextOpenTime) + 35; // 45 min total minus 10 min
  const expireTimeStr = minutesToTime(resumeMin);

  return `Exemple réel : une commande reçue ${dayName} à ${orderTimeStr} (10 min avant la fermeture à ${lastRange.closesAt}) verra son délai d'acceptation de 45 min se mettre en pause jusqu'au ${nextDayName} à ${nextOpenTime}, pour expirer à ${expireTimeStr}.`;
}

/**
 * Checks if a closure date range overlaps with any other closure.
 */
export function checkClosureOverlap(
  startsOn: string,
  endsOn: string,
  closures: ClosureItem[],
  ignoreId?: string
): ClosureItem | null {
  if (!startsOn || !endsOn) return null;
  for (const c of closures) {
    if (ignoreId && c.id === ignoreId) continue;
    // Overlap: startsOn <= c.endsOn && endsOn >= c.startsOn
    if (startsOn <= c.endsOn && endsOn >= c.startsOn) {
      return c;
    }
  }
  return null;
}
