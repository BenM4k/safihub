"use client";

import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface HistoryFilterState {
  search: string;
  courierId: string;
  status: "all" | "reconciled" | "discrepancy" | "cancelled";
  period: "30_days" | "7_days" | "all";
}

interface HistoryFiltersProps {
  filters: HistoryFilterState;
  onFilterChange: (filters: HistoryFilterState) => void;
  courierOptions: Array<{ id: string; name: string }>;
  onExportCsv: () => void;
  filteredCount: number;
}

export function HistoryFilters({
  filters,
  onFilterChange,
  courierOptions,
  onExportCsv,
  filteredCount,
}: HistoryFiltersProps) {
  return (
    <div className="p-4 border-b border-border-strong bg-surface/50 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
      {/* Search and Dropdowns */}
      <div className="flex items-center gap-2.5 flex-1 flex-wrap">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="size-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Rechercher par nom ou tél..."
            className="pl-9 h-10 min-h-[40px] text-xs border-border-strong"
            aria-label="Rechercher par nom de coursier ou numéro"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              status: e.target.value as HistoryFilterState["status"],
            })
          }
          className="h-10 min-h-[40px] px-3 text-xs rounded-xl border border-border-strong bg-card font-medium focus:ring-2 focus:ring-primary/20 text-heading"
          aria-label="Filtrer par statut"
        >
          <option value="all">Tous les statuts</option>
          <option value="reconciled">Réconcilié (sans écart)</option>
          <option value="discrepancy">Avec écart</option>
          <option value="cancelled">Annulé</option>
        </select>

        {/* Courier */}
        {courierOptions.length > 0 && (
          <select
            value={filters.courierId}
            onChange={(e) =>
              onFilterChange({ ...filters, courierId: e.target.value })
            }
            className="h-10 min-h-[40px] px-3 text-xs rounded-xl border border-border-strong bg-card font-medium focus:ring-2 focus:ring-primary/20 max-w-[170px] truncate text-heading"
            aria-label="Filtrer par coursier"
          >
            <option value="all">Tous les coursiers</option>
            {courierOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {/* Period */}
        <select
          value={filters.period}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              period: e.target.value as HistoryFilterState["period"],
            })
          }
          className="h-10 min-h-[40px] px-3 text-xs rounded-xl border border-border-strong bg-card font-medium focus:ring-2 focus:ring-primary/20 text-heading"
          aria-label="Filtrer par période"
        >
          <option value="30_days">30 derniers jours</option>
          <option value="7_days">7 derniers jours</option>
          <option value="all">Toutes les dates</option>
        </select>
      </div>

      {/* Export Button */}
      <div className="flex items-center gap-2.5 self-start md:self-auto">
        <span className="text-xs text-muted-foreground font-medium">
          {filteredCount} {filteredCount > 1 ? "écritures" : "écriture"}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          className="h-10 min-h-[40px] px-3.5 text-xs font-semibold gap-1.5 border-border-strong hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary"
          title="Exporter l'historique filtré en CSV"
        >
          <Download className="size-3.5" />
          <span>Exporter CSV</span>
        </Button>
      </div>
    </div>
  );
}
