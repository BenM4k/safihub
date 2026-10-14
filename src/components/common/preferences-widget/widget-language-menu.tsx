"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import {
  SUPPORTED_LOCALES,
  type AppLocale,
} from "@/i18n/config";
import { setLocaleAction } from "@/actions/locale";

const LOCALE_DETAILS: Record<
  AppLocale,
  { label: string; nativeName: string; region: string }
> = {
  fr: { label: "Français", nativeName: "Français", region: "RDC • Bukavu" },
  en: { label: "English", nativeName: "English", region: "International" },
  sw: {
    label: "Kiswahili",
    nativeName: "Kiswahili",
    region: "Kivu • Afrika ya Mashariki",
  },
};

interface WidgetLanguageMenuProps {
  currentLocale: AppLocale;
  onSelectLocale: (locale: AppLocale) => void;
}

export function WidgetLanguageMenu({
  currentLocale,
  onSelectLocale,
}: WidgetLanguageMenuProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (locale: AppLocale) => {
    if (locale === currentLocale) {
      onSelectLocale(locale);
      return;
    }

    startTransition(async () => {
      await setLocaleAction(locale);
      onSelectLocale(locale);
      router.refresh();
    });
  };

  return (
    <div className="p-3 bg-slate-50/70 dark:bg-white/[0.03] border-b border-slate-100 dark:border-white/10 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-200/60 dark:border-white/5">
        <span className="text-xs font-bold text-heading">
          {t("languageHeader")}
        </span>
        {isPending && (
          <Loader2 className="size-3.5 animate-spin text-primary" />
        )}
      </div>

      <div className="flex flex-col gap-1.5 pt-1">
        {SUPPORTED_LOCALES.map((loc) => {
          const isActive = loc === currentLocale;
          const details = LOCALE_DETAILS[loc];

          return (
            <button
              key={loc}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(loc)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                isActive
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "bg-white dark:bg-white/5 border border-slate-200/70 dark:border-white/5 text-heading hover:border-primary/40"
              }`}
              aria-pressed={isActive}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight">
                  {details.nativeName}
                </span>
                <span
                  className={`text-[11px] leading-tight ${
                    isActive ? "text-white/80" : "text-muted-foreground"
                  }`}
                >
                  {details.region}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span
                  className={`text-xs uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {loc}
                </span>
                {isActive && <Check className="size-4 stroke-[2.5]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
