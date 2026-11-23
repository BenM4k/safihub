"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { UserCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/config";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { shouldShowCustomerBottomNav } from "@/components/customer/customer-bottom-nav";
import { usePreferences } from "./use-preferences";
import { WidgetHeader } from "./widget-header";
import { WidgetLanguageMenu } from "./widget-language-menu";
import { WidgetProfiles } from "./widget-profiles";
import { WidgetControls } from "./widget-controls";
import { WidgetCookies } from "./widget-cookies";
import { WidgetFooter } from "./widget-footer";

export function PreferencesWidget() {
  const pathname = usePathname() || "";
  const hasBottomNav = shouldShowCustomerBottomNav(pathname);
  const t = useTranslations("preferences");
  const currentLocale = useLocale() as AppLocale;
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setIsLanguageMenuOpen(false);
    }
  }, []);

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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey && (event.key === "a" || event.key === "A")) {
        event.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (!next) setIsLanguageMenuOpen(false);
          return next;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={cn(
        "fixed right-4 md:bottom-6 md:right-6 z-50 print:hidden",
        hasBottomNav ? "bottom-[4.25rem]" : "bottom-5"
      )}
    >
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          aria-label={isOpen ? t("close") : t("open")}
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
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          aria-label={t("title")}
          className="w-[calc(100vw-2rem)] sm:w-[380px] max-h-[min(82vh,680px)] rounded-3xl bg-white dark:bg-[#101828] border border-slate-200/90 dark:border-white/10 shadow-2xl p-0 flex flex-col overflow-hidden"
        >
          <WidgetHeader
            currentLocale={currentLocale}
            isLanguageMenuOpen={isLanguageMenuOpen}
            onToggleLanguageMenu={() => setIsLanguageMenuOpen((prev) => !prev)}
            onClose={() => handleOpenChange(false)}
          />

          {isLanguageMenuOpen && (
            <WidgetLanguageMenu
              currentLocale={currentLocale}
              onSelectLocale={() => setIsLanguageMenuOpen(false)}
            />
          )}

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

          <WidgetFooter onResetAll={resetAll} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { PreferencesWidget as LanguageSwitcher };
