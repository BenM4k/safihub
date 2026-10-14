export type TextSize = "default" | "medium" | "large" | "xlarge";
export type ThemeMode = "light" | "dark" | "system";

export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  preferences: boolean;
}

export interface UserPreferences {
  theme: ThemeMode;
  textSize: TextSize;
  highContrast: boolean;
  calmMotion: boolean;
  readingFocus: boolean;
  easierToSee: boolean;
  cookieConsent: CookiePreferences;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  textSize: "default",
  highContrast: false,
  calmMotion: false,
  readingFocus: false,
  easierToSee: false,
  cookieConsent: {
    essential: true,
    analytics: true,
    preferences: true,
  },
};

export const STORAGE_KEYS = {
  PREFERENCES: "safihub_preferences",
  THEME: "safihub_theme",
  COOKIE_CONSENT: "safihub_cookie_consent",
} as const;
