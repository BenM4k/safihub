import { toBukavuDateTime } from "@/services/availability";


export interface DrcHolidayTemplate {
  key: string;
  month: number; // 1-12
  day: number; // 1-31
  nameFr: string;
  nameEn: string;
  nameSw: string;
  descriptionFr?: string;
}

export const DRC_PUBLIC_HOLIDAYS: readonly DrcHolidayTemplate[] = [
  {
    key: "new_year",
    month: 1,
    day: 1,
    nameFr: "Nouvel An",
    nameEn: "New Year's Day",
    nameSw: "Mwaka Mpya",
  },
  {
    key: "martyrs",
    month: 1,
    day: 4,
    nameFr: "Journée des Martyrs de l'Indépendance",
    nameEn: "Martyrs of Independence Day",
    nameSw: "Siku ya Mashahidi wa Uhuru",
  },
  {
    key: "mzee_kabila",
    month: 1,
    day: 16,
    nameFr: "Mort du Président Laurent-Désiré Kabila",
    nameEn: "Laurent-Désiré Kabila Commemoration",
    nameSw: "Kumbukumbu ya Laurent-Désiré Kabila",
  },
  {
    key: "lumumba",
    month: 1,
    day: 17,
    nameFr: "Mort du Premier Ministre Patrice-Emery Lumumba",
    nameEn: "Patrice Lumumba Commemoration",
    nameSw: "Kumbukumbu ya Patrice Lumumba",
  },
  {
    key: "kimbangu",
    month: 4,
    day: 6,
    nameFr: "Journée de Simon Kimbangu et de la Conscience Africaine",
    nameEn: "Simon Kimbangu Day",
    nameSw: "Siku ya Simon Kimbangu",
  },
  {
    key: "labour",
    month: 5,
    day: 1,
    nameFr: "Fête du Travail",
    nameEn: "Labor Day",
    nameSw: "Siku ya Wafanyakazi",
  },
  {
    key: "fardc",
    month: 5,
    day: 17,
    nameFr: "Journée des Forces Armées (FARDC)",
    nameEn: "Armed Forces Day",
    nameSw: "Siku ya Majeshi (FARDC)",
  },
  {
    key: "independence",
    month: 6,
    day: 30,
    nameFr: "Fête de l'Indépendance",
    nameEn: "Independence Day",
    nameSw: "Siku ya Uhuru",
  },
  {
    key: "parents",
    month: 8,
    day: 1,
    nameFr: "Fête des Parents",
    nameEn: "Parents' Day",
    nameSw: "Siku ya Wazazi",
  },
  {
    key: "christmas",
    month: 12,
    day: 25,
    nameFr: "Noël",
    nameEn: "Christmas Day",
    nameSw: "Sikukuu ya Krismasi",
  },
] as const;

export interface DrcYearHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  monthDay: string; // DD/MM
  isPast: boolean;
}

/**
 * Returns DRC holidays for a specific year, formatted for selection.
 * If a legal public holiday falls on a Sunday, the statutory DRC practice
 * carries it back to the preceding day (Saturday).
 */
export function getDrcHolidaysForYear(year: number, referenceDate: Date = new Date()): DrcYearHoliday[] {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const refIso = toBukavuDateTime(referenceDate).dateString;

  return DRC_PUBLIC_HOLIDAYS.map((h) => {
    // Construct calendar date in UTC to check day of week
    const calDate = new Date(Date.UTC(year, h.month - 1, h.day));
    // If it falls on Sunday (day 0), carry back to preceding day (day - 1)
    if (calDate.getUTCDay() === 0) {
      calDate.setUTCDate(calDate.getUTCDate() - 1);
    }
    const cYear = calDate.getUTCFullYear();
    const cMonth = calDate.getUTCMonth() + 1;
    const cDay = calDate.getUTCDate();

    const date = `${cYear}-${pad(cMonth)}-${pad(cDay)}`;
    const monthDay = `${pad(cDay)}/${pad(cMonth)}`;
    return {
      id: `${year}_${h.key}`,
      name: h.nameFr,
      date,
      monthDay,
      isPast: date < refIso,
    };
  });
}
