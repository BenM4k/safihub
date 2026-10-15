"use client";

import { Search, Filter, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { NeighborhoodRecord } from "@/dal";
import type { HouseFiltersState, HouseOperationalStatus } from "./types";

interface HousesTableToolbarProps {
  filters: HouseFiltersState;
  onFiltersChange: (next: Partial<HouseFiltersState>) => void;
  neighborhoods: NeighborhoodRecord[];
  totalFilteredCount: number;
}

export function HousesTableToolbar({
  filters,
  onFiltersChange,
  neighborhoods,
  totalFilteredCount,
}: HousesTableToolbarProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.neighborhoodId !== "";

  return (
    <div className="p-4 border-b-2 border-border-strong bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-sm">
        <Search className="size-4 text-ink-500 absolute left-3 top-3 pointer-events-none" />
        <Input
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          placeholder="Rechercher par nom, quartier, téléphone..."
          className="pl-9 h-10 text-xs border-2 border-border-strong rounded-xl bg-card focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Recherche de pressings"
        />
      </div>

      {/* Filter Dropdowns and Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="size-3.5 text-ink-500" aria-hidden="true" />
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                status: e.target.value as "all" | HouseOperationalStatus,
              })
            }
            className="h-10 rounded-xl border-2 border-border-strong bg-card px-3 text-xs font-semibold text-heading hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="paused">En pause</option>
            <option value="closed_today">Fermé aujourd&apos;hui</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>

        {/* Neighborhood Filter */}
        <select
          value={filters.neighborhoodId}
          onChange={(e) => onFiltersChange({ neighborhoodId: e.target.value })}
          className="h-10 rounded-xl border-2 border-border-strong bg-card px-3 text-xs font-semibold text-heading hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary max-w-[180px] truncate"
          aria-label="Filtrer par quartier"
        >
          <option value="">Tous les quartiers</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() =>
              onFiltersChange({ search: "", status: "all", neighborhoodId: "" })
            }
            className="h-10 px-3 rounded-xl border border-border-strong bg-card hover:bg-surface text-ink-600 hover:text-ink-900 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            title="Réinitialiser les filtres"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        )}

        {/* Count badge */}
        <span className="text-xs font-bold text-ink-700 bg-surface px-3 py-2 rounded-xl border border-border-strong whitespace-nowrap">
          {totalFilteredCount} {totalFilteredCount <= 1 ? "pressing" : "pressings"}
        </span>
      </div>
    </div>
  );
}
