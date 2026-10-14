"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  type UserPreferences,
  type ThemeMode,
  type TextSize,
  DEFAULT_PREFERENCES,
  STORAGE_KEYS,
} from "./types";

function applyDomClasses(prefs: UserPreferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // 1. Theme
  const isDark =
    prefs.theme === "dark" ||
    (prefs.theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // 2. Text Size
  root.classList.remove("text-size-medium", "text-size-large", "text-size-xlarge");
  if (prefs.textSize !== "default") {
    root.classList.add(`text-size-${prefs.textSize}`);
  }

  // 3. High Contrast
  root.classList.toggle("high-contrast", prefs.highContrast);

  // 4. Calm Motion
  root.classList.toggle("reduce-motion", prefs.calmMotion);

  // 5. Reading Focus
  root.classList.toggle("reading-focus", prefs.readingFocus);

  // 6. Easier to see
  root.classList.toggle("easier-to-see", prefs.easierToSee);
}

export function usePreferences() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);
  const priorEasierToSeeRef = useRef<{
    textSize: TextSize;
    highContrast: boolean;
  } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UserPreferences>;
        const merged: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          cookieConsent: {
            ...DEFAULT_PREFERENCES.cookieConsent,
            ...(parsed.cookieConsent || {}),
          },
        };
        queueMicrotask(() => {
          setPreferences(merged);
        });
        applyDomClasses(merged);
      } else {
        applyDomClasses(DEFAULT_PREFERENCES);
      }
    } catch {
      applyDomClasses(DEFAULT_PREFERENCES);
    }
    queueMicrotask(() => {
      setIsLoaded(true);
    });
  }, []);

  // Listen to system dark mode changes when mode is 'system'
  useEffect(() => {
    if (!isLoaded || preferences.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyDomClasses(preferences);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [isLoaded, preferences]);

  const savePreferences = useCallback((newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    applyDomClasses(newPrefs);
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(newPrefs));
      localStorage.setItem(STORAGE_KEYS.THEME, newPrefs.theme);
      localStorage.setItem(
        STORAGE_KEYS.COOKIE_CONSENT,
        JSON.stringify(newPrefs.cookieConsent)
      );
      document.cookie = `SAFIHUB_CONSENT=${encodeURIComponent(
        JSON.stringify(newPrefs.cookieConsent)
      )}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      savePreferences({ ...preferences, theme });
    },
    [preferences, savePreferences]
  );

  const setTextSize = useCallback(
    (textSize: TextSize) => {
      savePreferences({ ...preferences, textSize });
    },
    [preferences, savePreferences]
  );

  const toggleHighContrast = useCallback(() => {
    savePreferences({ ...preferences, highContrast: !preferences.highContrast });
  }, [preferences, savePreferences]);

  const toggleCalmMotion = useCallback(() => {
    savePreferences({ ...preferences, calmMotion: !preferences.calmMotion });
  }, [preferences, savePreferences]);

  const toggleReadingFocus = useCallback(() => {
    savePreferences({
      ...preferences,
      readingFocus: !preferences.readingFocus,
      calmMotion: !preferences.readingFocus ? true : preferences.calmMotion,
    });
  }, [preferences, savePreferences]);

  const toggleEasierToSee = useCallback(() => {
    const next = !preferences.easierToSee;
    if (next) {
      priorEasierToSeeRef.current = {
        textSize: preferences.textSize,
        highContrast: preferences.highContrast,
      };
      savePreferences({
        ...preferences,
        easierToSee: true,
        textSize: "large",
        highContrast: true,
      });
    } else {
      const prior = priorEasierToSeeRef.current;
      priorEasierToSeeRef.current = null;
      savePreferences({
        ...preferences,
        easierToSee: false,
        textSize: prior ? prior.textSize : "default",
        highContrast: prior ? prior.highContrast : false,
      });
    }
  }, [preferences, savePreferences]);

  const updateCookieConsent = useCallback(
    (consent: Partial<UserPreferences["cookieConsent"]>) => {
      savePreferences({
        ...preferences,
        cookieConsent: {
          ...preferences.cookieConsent,
          ...consent,
          essential: true,
        },
      });
    },
    [preferences, savePreferences]
  );

  const resetAll = useCallback(() => {
    priorEasierToSeeRef.current = null;
    savePreferences(DEFAULT_PREFERENCES);
  }, [savePreferences]);

  return {
    preferences,
    isLoaded,
    setTheme,
    setTextSize,
    toggleHighContrast,
    toggleCalmMotion,
    toggleReadingFocus,
    toggleEasierToSee,
    updateCookieConsent,
    resetAll,
  };
}
