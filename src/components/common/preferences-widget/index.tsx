"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { UserCheck, X } from "lucide-react";
import type { AppLocale } from "@/i18n/config";
import { usePreferences } from "./use-preferences";
import { WidgetHeader } from "./widget-header";
import { WidgetLanguageMenu } from "./widget-language-menu";
import { WidgetProfiles } from "./widget-profiles";
import { WidgetControls } from "./widget-controls";
import { WidgetCookies } from "./widget-cookies";
import { WidgetFooter } from "./widget-footer";

export function PreferencesWidget() {
  const t = useTranslations("preferences");
  const currentLocale = useLocale() as AppLocale;
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    preferences,
    setTheme,
    setTextSize,
    toggleHighContrast,
    toggleCalmMotion,
    toggleReadingFocus,
    toggleEasierToSee,
    updateCookieConsent,
    resetAll,
  } = usePreferences();

  // Keyboard shortcut (Alt+A) and Escape/outside dismiss
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey && (event.key === "a" || event.key === "A")) {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setIsLanguageMenuOpen(false);
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsLanguageMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setIsLanguageMenuOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 print:hidden"
    >
      {/* Floating Popover Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
          className="absolute bottom-16 right-0 mb-2 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[min(82vh,680px)] rounded-3xl bg-white dark:bg-[#101828] border border-slate-200/90 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden transition-all animate-in fade-in zoom-in-95"
        >
          {/* Header */}
          <WidgetHeader
            currentLocale={currentLocale}
            isLanguageMenuOpen={isLanguageMenuOpen}
            onToggleLanguageMenu={() => setIsLanguageMenuOpen((prev) => !prev)}
            onClose={handleClose}
          />

          {/* Conditional Language Switcher Menu */}
          {isLanguageMenuOpen && (
            <WidgetLanguageMenu
              currentLocale={currentLocale}
              onSelectLocale={() => setIsLanguageMenuOpen(false)}
            />
          )}

          {/* Scrollable Configuration Sections */}
          <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100 dark:divide-white/5">
            <WidgetProfiles
              preferences={preferences}
              onToggleEasierToSee={toggleEasierToSee}
              onToggleReadingFocus={toggleReadingFocus}
              onToggleCalmMotion={toggleCalmMotion}
              onToggleHighContrast={toggleHighContrast}
            />

            <WidgetControls
              preferences={preferences}
              onSetTheme={setTheme}
              onSetTextSize={setTextSize}
              onToggleHighContrast={toggleHighContrast}
              onToggleCalmMotion={toggleCalmMotion}
            />

            <WidgetCookies
              cookieConsent={preferences.cookieConsent}
              onUpdateConsent={updateCookieConsent}
            />
          </div>

          {/* Footer */}
          <WidgetFooter onResetAll={resetAll} />
        </div>
      )}

      {/* Floating Circular Trigger / Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? t("close") : t("open")}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`size-13 sm:size-14 rounded-full border shadow-xl flex flex-col items-center justify-center gap-0.5 group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all ${
          isOpen
            ? "bg-slate-900 text-white border-slate-800 dark:bg-white dark:text-slate-900"
            : "bg-white/95 dark:bg-[#101828]/95 backdrop-blur-md border-slate-200/90 dark:border-white/15 text-heading hover:border-primary/50"
        }`}
      >
        {isOpen ? (
          <X className="size-6 stroke-[2.5]" />
        ) : (
          <>
            <div className="size-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <UserCheck className="size-4 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-heading group-hover:text-primary leading-none">
              {currentLocale}
            </span>
          </>
        )}
      </button>
    </div>
  );
}

// Re-export as LanguageSwitcher for backward-compatibility
export { PreferencesWidget as LanguageSwitcher };
