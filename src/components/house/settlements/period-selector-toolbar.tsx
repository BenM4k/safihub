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
    <div className="py-2 space-y-3 border-b border-border/60 pb-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Period Filter Buttons: text-primary, no bg */}
        <div
          className="flex items-center gap-0.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none"
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
                className={`px-2.5 py-1 text-xs transition shrink-0 h-8 flex items-center justify-center cursor-pointer bg-transparent border-0 shadow-none ${
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
        <div className="flex items-center gap-2.5 justify-between md:justify-end">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-3 text-primary/80 shrink-0" aria-hidden="true" />
            <span className="font-normal text-muted-foreground">
              {startDateStr} — {endDateStr}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs font-medium gap-1.5 cursor-pointer rounded-lg border-border/70 hover:bg-muted/50 shadow-none"
                aria-label={t("exportAria")}
              >
                <Download className="size-3 text-muted-foreground" aria-hidden="true" />
                <span>{t("export")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 font-sans p-1.5 rounded-xl bg-card border border-border shadow-lift">
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
                <FileSpreadsheet className="size-4 text-success shrink-0" />
                <span>{t("ordersCsv")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onExportCsv("payouts")}
                className="cursor-pointer gap-2.5 text-xs font-medium"
              >
                <FileSpreadsheet className="size-4 text-success shrink-0" />
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
          className="pt-2 grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-2 text-xs font-sans"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <span className="text-muted-foreground font-medium text-[11px]">{t("customFrom")}</span>
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-full sm:w-auto h-8 rounded-lg text-xs font-mono border-input"
              required
              aria-label={t("startDateAria")}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <span className="text-muted-foreground font-medium text-[11px]">{t("customTo")}</span>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-full sm:w-auto h-8 rounded-lg text-xs font-mono border-input"
              required
              aria-label={t("endDateAria")}
            />
          </div>
          <Button type="submit" size="sm" className="col-span-2 sm:col-span-1 h-8 px-3 text-xs font-medium rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground shadow-none cursor-pointer">
            {t("apply")}
          </Button>
        </form>
      )}
    </div>
  );
}
