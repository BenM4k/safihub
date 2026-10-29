"use client";

import { useState } from "react";
import { ShieldCheck, CheckCircle2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function PressingVerifiedPopover() {
  const t = useTranslations("customerHouses");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={(open: boolean) => setIsOpen(open)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-soft text-primary hover:bg-primary/20 transition cursor-pointer"
        >
          <ShieldCheck className="size-3.5" />
          <span>{t("verifiedPartner")}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-72 sm:w-80 bg-card rounded-2xl p-4 shadow-xl border border-border/60"
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
          <div className="flex items-center gap-1.5 text-xs font-black text-heading">
            <ShieldCheck className="size-4 text-primary" />
            <span>{t("verifiedPopoverTitle")}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition cursor-pointer"
            aria-label={t("verifiedClose")}
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-3 font-medium">
          Ce pressing a été audité et validé par l&apos;équipe SafiHub sur les critères suivants :
        </p>

        <ul className="space-y-2 text-xs text-foreground font-medium">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="size-3.5 text-success mt-0.5 shrink-0" />
            <span>{t("verifiedPoint1")}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="size-3.5 text-success mt-0.5 shrink-0" />
            <span>{t("verifiedPoint2")}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="size-3.5 text-success mt-0.5 shrink-0" />
            <span>{t("verifiedPoint3")}</span>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}
