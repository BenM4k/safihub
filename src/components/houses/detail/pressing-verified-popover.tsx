"use client";

import { useState, useRef, useEffect } from "react";
import { ShieldCheck, CheckCircle2, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function PressingVerifiedPopover() {
  const t = useTranslations("customerHouses");
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-soft text-primary hover:bg-primary/20 transition cursor-pointer"
      >
        <ShieldCheck className="size-3.5" />
        <span>{t("verifiedPartner")}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-card rounded-2xl p-4 shadow-xl border border-border z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
            <div className="flex items-center gap-1.5 text-xs font-black text-heading">
              <ShieldCheck className="size-4 text-primary" />
              <span>{t("verifiedPopoverTitle")}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition"
              aria-label={t("verifiedClose")}
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground mb-3 font-medium">
            Ce pressing a été audité et validé par l&apos;équipe SafiHub sur les critères suivants :
          </p>

          <ul className="space-y-2 text-xs text-foreground font-medium">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <span>{t("verifiedPoint1")}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <span>{t("verifiedPoint2")}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <span>{t("verifiedPoint3")}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
