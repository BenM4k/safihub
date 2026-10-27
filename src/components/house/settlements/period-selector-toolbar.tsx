"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Download, FileSpreadsheet, FileText } from "lucide-react";
import type { PeriodType } from "@/types/partner-settlements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PeriodSelectorToolbarProps {
  currentPeriod: PeriodType;
  periodStart: string;
  periodEnd: string;
  onOpenStatementModal: () => void;
  onExportCsv: (type: "orders" | "payouts") => void;
}

export function PeriodSelectorToolbar({
  currentPeriod,
  periodStart,
  periodEnd,
  onOpenStatementModal,
  onExportCsv,
}: PeriodSelectorToolbarProps) {
  const t = useTranslations("house.settlements");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [customFrom, setCustomFrom] = useState(
    searchParams.get("from") || periodStart.split("T")[0]
  );
  const [customTo, setCustomTo] = useState(
    searchParams.get("to") || periodEnd.split("T")[0]
  );

  const periodOptions: Array<{ key: PeriodType; label: string }> = [
    { key: "week", label: t("periodWeek") },
    { key: "month", label: t("periodMonth") },
    { key: "last30", label: t("periodLast30") },
    { key: "custom", label: t("periodCustom") },
  ];

  function handleSelectPeriod(period: PeriodType) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    if (period !== "custom") {
      params.delete("from");
      params.delete("to");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleApplyCustomDates(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", "custom");
    params.set("from", customFrom);
    params.set("to", customTo);
    router.push(`${pathname}?${params.toString()}`);
  }

  const startDateStr = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(periodStart));
  const endDateStr = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(periodEnd));

  return (
    <div className="py-2 space-y-3 border-b border-border/60 pb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Period Filter Buttons: text-primary, no bg */}
        <div
          className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none"
          role="tablist"
          aria-label={t("periodSelectorAria")}
        >
          {periodOptions.map((opt) => {
            const isSelected = currentPeriod === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelectPeriod(opt.key)}
                className={`px-3 py-1.5 text-xs transition shrink-0 min-h-[40px] flex items-center justify-center cursor-pointer bg-transparent border-0 shadow-none ${
                  isSelected
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Right side: Active date label & shadcn DropdownMenu for Export */}
        <div className="flex items-center gap-3 justify-between md:justify-end">
          <div className="text-2xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary shrink-0" aria-hidden="true" />
            <span className="font-medium text-foreground">
              {startDateStr} — {endDateStr}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 sm:h-9 px-3.5 text-xs font-semibold gap-1.5 cursor-pointer rounded-xl"
                aria-label={t("exportAria")}
              >
                <Download className="size-3.5" aria-hidden="true" />
                <span>{t("export")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={onOpenStatementModal}
                className="cursor-pointer gap-2.5 text-xs font-medium"
              >
                <FileText className="size-4 text-primary shrink-0" />
                <span>{t("statementPdf")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onExportCsv("orders")}
                className="cursor-pointer gap-2.5 text-xs font-medium"
              >
                <FileSpreadsheet className="size-4 text-emerald-600 shrink-0" />
                <span>{t("ordersCsv")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onExportCsv("payouts")}
                className="cursor-pointer gap-2.5 text-xs font-medium"
              >
                <FileSpreadsheet className="size-4 text-emerald-600 shrink-0" />
                <span>{t("payoutsCsv")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Custom date range inputs */}
      {currentPeriod === "custom" && (
        <form
          onSubmit={handleApplyCustomDates}
          className="pt-2 flex flex-wrap items-center gap-2.5 text-xs"
        >
          <span className="text-muted-foreground font-medium">{t("customFrom")}</span>
          <Input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="w-auto h-10 sm:h-9 rounded-xl text-xs font-mono"
            required
            aria-label={t("startDateAria")}
          />
          <span className="text-muted-foreground font-medium">{t("customTo")}</span>
          <Input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="w-auto h-10 sm:h-9 rounded-xl text-xs font-mono"
            required
            aria-label={t("endDateAria")}
          />
          <Button type="submit" size="sm" className="h-10 sm:h-9 px-4 text-xs font-semibold rounded-xl">
            {t("apply")}
          </Button>
        </form>
      )}
    </div>
  );
}
