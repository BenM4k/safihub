"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe, Check, Loader2 } from "lucide-react";
import { SUPPORTED_LOCALES, LOCALE_LABELS, type AppLocale } from "@/i18n/config";
import { setLocaleAction } from "@/actions/locale";

const LOCALE_DETAILS: Record<
  AppLocale,
  { label: string; nativeName: string; region: string }
> = {
  fr: { label: "Français", nativeName: "Français", region: "RDC • Bukavu" },
  en: { label: "English", nativeName: "English", region: "International" },
  sw: { label: "Kiswahili", nativeName: "Kiswahili", region: "Kivu • Afrika ya Mashariki" },
};

export function LanguageSwitcher() {
  const currentLocale = useLocale() as AppLocale;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (locale: AppLocale) => {
    if (locale === currentLocale) {
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      await setLocaleAction(locale);
      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 print:hidden"
    >
      {/* Floating Popover Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Sélection de la langue"
          className="absolute bottom-16 right-0 mb-2 w-64 rounded-2xl bg-white/95 backdrop-blur-lg border border-slate-200/90 shadow-2xl p-2.5 transition-all animate-in fade-in zoom-in-95"
        >
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold tracking-tight text-heading">
              Langue • Language
            </span>
            <span className="text-[10px] font-semibold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {currentLocale}
            </span>
          </div>

          <div className="flex flex-col gap-1 pt-1.5">
            {SUPPORTED_LOCALES.map((loc) => {
              const isActive = loc === currentLocale;
              const details = LOCALE_DETAILS[loc];

              return (
                <button
                  key={loc}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSelect(loc)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-xs font-semibold"
                      : "text-heading hover:bg-slate-100/80 hover:text-primary font-medium"
                  }`}
                  aria-pressed={isActive}
                >
                  <div className="flex flex-col">
                    <span className="text-sm leading-tight">
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
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {loc}
                    </span>
                    {isActive && <Check className="size-4 stroke-2" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Circled Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isPending}
        aria-label={`Langue actuelle : ${LOCALE_LABELS[currentLocale]}. Cliquer pour changer.`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="size-13 sm:size-14 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-0.5 group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {isPending ? (
          <Loader2 className="size-5 text-primary animate-spin" />
        ) : (
          <>
            <Globe className="size-5 text-primary transition-transform group-hover:scale-110" />
            <span className="text-[10px] font-black uppercase tracking-wider text-heading group-hover:text-primary leading-none">
              {currentLocale}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
