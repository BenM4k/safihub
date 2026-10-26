"use client";

import { Search, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SettlementHistoryFiltersState {
  search: string;
  payeeType: "all" | "house" | "courier";
  status: "all" | "valid" | "reversed";
  period: "7_days" | "30_days" | "all";
}

interface SettlementHistoryFiltersProps {
  filters: SettlementHistoryFiltersState;
  onChange: (next: SettlementHistoryFiltersState) => void;
  onReset: () => void;
  onExportCsv: () => void;
}

export function SettlementHistoryFilters({
  filters,
  onChange,
  onReset,
  onExportCsv,
}: SettlementHistoryFiltersProps) {
  return (
    <div className="p-3 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="size-4 text-muted-foreground absolute left-2.5 top-2.5 pointer-events-none" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Rechercher bénéficiaire, réf, note..."
          className="pl-8 h-9 text-xs border-border bg-card"
        />
      </div>

      {/* Filter select groups */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Type Filter */}
        <div className="flex items-center bg-card rounded-lg border border-border p-0.5">
          {(
            [
              { id: "all", label: "Tous" },
              { id: "house", label: "Pressings" },
              { id: "courier", label: "Coursiers" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ ...filters, payeeType: t.id })}
              className={`px-2 py-1 rounded-md text-2xs font-semibold transition-colors cursor-pointer ${
                filters.payeeType === t.id
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center bg-card rounded-lg border border-border p-0.5">
          {(
            [
              { id: "all", label: "Tous statuts" },
              { id: "valid", label: "Validés" },
              { id: "reversed", label: "Annulés" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange({ ...filters, status: s.id })}
              className={`px-2 py-1 rounded-md text-2xs font-semibold transition-colors cursor-pointer ${
                filters.status === s.id
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Period Filter */}
        <select
          value={filters.period}
          onChange={(e) =>
            onChange({
              ...filters,
              period: e.target.value as SettlementHistoryFiltersState["period"],
            })
          }
          className="h-8 px-2 rounded-lg border border-border bg-card text-foreground text-xs font-medium"
          aria-label="Filtrer par période"
        >
          <option value="7_days">7 derniers jours</option>
          <option value="30_days">30 derniers jours</option>
          <option value="all">Tout l&apos;historique</option>
        </select>

        {/* Reset Filters */}
        {(filters.search ||
          filters.payeeType !== "all" ||
          filters.status !== "all" ||
          filters.period !== "30_days") && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            title="Réinitialiser les filtres"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </Button>
        )}

        {/* Export CSV */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          className="h-8 px-2.5 text-xs font-semibold border-border gap-1.5"
          title="Exporter l'historique filtré en CSV"
        >
          <Download className="size-3.5" />
          <span>Exporter</span>
        </Button>
      </div>
    </div>
  );
}
