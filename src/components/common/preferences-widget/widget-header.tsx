"use client";

import { useTranslations } from "next-intl";
import { X, ChevronDown, UserCheck } from "lucide-react";
import type { AppLocale } from "@/i18n/config";

interface WidgetHeaderProps {
  currentLocale: AppLocale;
  isLanguageMenuOpen: boolean;
  onToggleLanguageMenu: () => void;
  onClose: () => void;
}

export function WidgetHeader({
  currentLocale,
  isLanguageMenuOpen,
  onToggleLanguageMenu,
  onClose,
}: WidgetHeaderProps) {
  const t = useTranslations("preferences");

  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 dark:border-white/10 shrink-0">
      {/* Icon + Title + Alt+A Badge */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
          <UserCheck className="size-4.5 stroke-[2.2]" />
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-base font-bold text-heading truncate">
            {t("title")}
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono font-medium text-muted-foreground bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
            {t("shortcut")}
          </span>
        </div>
      </div>

      {/* Language Trigger + Close Button */}
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <button
          type="button"
          onClick={onToggleLanguageMenu}
          aria-expanded={isLanguageMenuOpen}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase rounded-lg border transition-all ${
            isLanguageMenuOpen
              ? "bg-primary text-white border-primary"
              : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-heading hover:border-primary/40"
          }`}
          aria-label={t("language")}
        >
          <span>{currentLocale}</span>
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${
              isLanguageMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-heading hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="size-4.5 stroke-2" />
        </button>
      </div>
    </div>
  );
}
