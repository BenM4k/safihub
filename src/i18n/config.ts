export const SUPPORTED_LOCALES = ["fr", "en", "sw"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "fr";

export const LOCALE_LABELS: Record<AppLocale, string> = {
  fr: "Français",
  en: "English",
  sw: "Kiswahili",
};

export function isValidLocale(locale: unknown): locale is AppLocale {
  return typeof locale === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}
