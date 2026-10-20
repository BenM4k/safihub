/**
 * DRC Official Legal Public Holidays (Jours fériés légaux en RDC).
 * Standard official list confirmed for Bukavu & Democratic Republic of the Congo.
 */

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
 */
export function getDrcHolidaysForYear(year: number, referenceDate: Date = new Date()): DrcYearHoliday[] {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const refIso = referenceDate.toISOString().slice(0, 10);

  return DRC_PUBLIC_HOLIDAYS.map((h) => {
    const date = `${year}-${pad(h.month)}-${pad(h.day)}`;
    const monthDay = `${pad(h.day)}/${pad(h.month)}`;
    return {
      id: `${year}_${h.key}`,
      name: h.nameFr,
      date,
      monthDay,
      isPast: date < refIso,
    };
  });
}
