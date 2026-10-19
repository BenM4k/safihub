"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Calendar, Download, FileSpreadsheet, FileText } from "lucide-react";
import type { PeriodType } from "@/types/partner-settlements";
import { Button } from "@/components/ui/button";

interface PeriodSelectorToolbarProps {
  currentPeriod: PeriodType;
  periodStart: string;
  periodEnd: string;
  onOpenStatementModal: () => void;
  onExportCsv: (type: "orders" | "payouts") => void;
}

const PERIOD_OPTIONS: Array<{ key: PeriodType; label: string }> = [
  { key: "week", label: "Cette semaine" },
  { key: "month", label: "Ce mois" },
  { key: "last30", label: "30 derniers jours" },
  { key: "custom", label: "Personnalisé" },
];

export function PeriodSelectorToolbar({
  currentPeriod,
  periodStart,
  periodEnd,
  onOpenStatementModal,
  onExportCsv,
}: PeriodSelectorToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(
    searchParams.get("from") || periodStart.split("T")[0]
  );
  const [customTo, setCustomTo] = useState(
    searchParams.get("to") || periodEnd.split("T")[0]
  );

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

  // Format date range text for display
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
    <div className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Period Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none" role="tablist" aria-label="Sélecteur de période">
          {PERIOD_OPTIONS.map((opt) => {
            const isSelected = currentPeriod === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelectPeriod(opt.key)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition shrink-0 min-h-[44px] flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white shadow-xs font-bold"
                    : "bg-surface text-ink-700 hover:bg-surface-hover border border-border"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Right side: Active range label & Exporter Menu */}
        <div className="flex items-center gap-2 justify-between md:justify-end">
          <div className="text-2xs text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3.5 text-primary shrink-0" aria-hidden="true" />
            <span className="font-medium text-heading">
              {startDateStr} — {endDateStr}
            </span>
          </div>

          {/* Export Dropdown Trigger */}
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="min-h-[44px] px-3.5 text-xs font-semibold gap-1.5 bg-surface hover:bg-surface-hover border-border"
              aria-expanded={isExportOpen}
              aria-label="Exporter les données"
            >
              <Download className="size-3.5" aria-hidden="true" />
              <span>Exporter</span>
            </Button>

            {isExportOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsExportOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-52 bg-card rounded-xl border border-border shadow-lg p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportOpen(false);
                      onOpenStatementModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-heading hover:bg-surface flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <FileText className="size-4 text-primary shrink-0" />
                    <span>Relevé de compte (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsExportOpen(false);
                      onExportCsv("orders");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-heading hover:bg-surface flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="size-4 text-emerald-600 shrink-0" />
                    <span>Commandes livrées (CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsExportOpen(false);
                      onExportCsv("payouts");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-heading hover:bg-surface flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="size-4 text-emerald-600 shrink-0" />
                    <span>Versements reçus (CSV)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom date range inputs when "Personnalisé" is chosen */}
      {currentPeriod === "custom" && (
        <form
          onSubmit={handleApplyCustomDates}
          className="pt-3 border-t border-border flex flex-wrap items-center gap-2.5 text-xs"
        >
          <span className="text-muted-foreground font-medium">Du</span>
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs font-mono min-h-[44px]"
            required
            aria-label="Date de début"
          />
          <span className="text-muted-foreground font-medium">au</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs font-mono min-h-[44px]"
            required
            aria-label="Date de fin"
          />
          <Button
            type="submit"
            size="sm"
            className="min-h-[44px] px-3.5 text-xs font-semibold"
          >
            Appliquer
          </Button>
        </form>
      )}
    </div>
  );
}
