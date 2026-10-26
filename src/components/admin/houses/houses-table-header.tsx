"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { HouseFiltersState } from "./types";

interface HousesTableHeaderProps {
  sortBy: HouseFiltersState["sortBy"];
  sortOrder: HouseFiltersState["sortOrder"];
  onSortToggle: (column: HouseFiltersState["sortBy"]) => void;
}

export function HousesTableHeader({
  sortBy,
  sortOrder,
  onSortToggle,
}: HousesTableHeaderProps) {
  const t = useTranslations("admin.houses");

  const renderSortIndicator = (column: HouseFiltersState["sortBy"]) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="size-3 text-muted-foreground/60 ml-1 inline" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="size-3 text-primary ml-1 inline" />
    ) : (
      <ArrowDown className="size-3 text-primary ml-1 inline" />
    );
  };

  return (
    <TableHeader className="bg-muted/40 text-xs">
      <TableRow className="border-b border-border">
        {/* 1. Nom */}
        <TableHead
          onClick={() => onSortToggle("name")}
          className="py-3 px-4 text-xs font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground"
          aria-sort={sortBy === "name" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
        >
          <span className="inline-flex items-center">
            {t("colHouse")}
            {renderSortIndicator("name")}
          </span>
        </TableHead>

        {/* 2. Quartier */}
        <TableHead className="py-3 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">
          {t("colNeighborhood")}
        </TableHead>

        {/* 3. Téléphone */}
        <TableHead className="py-3 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">
          {t("colPhone")}
        </TableHead>

        {/* 4. Commission */}
        <TableHead
          onClick={() => onSortToggle("commission")}
          className="py-3 px-4 text-xs font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap"
          aria-sort={sortBy === "commission" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
        >
          <span className="inline-flex items-center">
            {t("colCommission")}
            {renderSortIndicator("commission")}
          </span>
        </TableHead>

        {/* 5. Montant min. */}
        <TableHead
          onClick={() => onSortToggle("minOrder")}
          className="py-3 px-4 text-xs font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap"
          aria-sort={sortBy === "minOrder" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
        >
          <span className="inline-flex items-center">
            {t("colMinOrder")}
            {renderSortIndicator("minOrder")}
          </span>
        </TableHead>

        {/* 6. Délai */}
        <TableHead
          onClick={() => onSortToggle("turnaround")}
          className="py-3 px-4 text-xs font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap"
          aria-sort={sortBy === "turnaround" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
        >
          <span className="inline-flex items-center">
            {t("colTurnaround")}
            {renderSortIndicator("turnaround")}
          </span>
        </TableHead>

        {/* 7. Commandes en cours */}
        <TableHead
          onClick={() => onSortToggle("orders")}
          className="py-3 px-4 text-xs font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap"
          aria-sort={sortBy === "orders" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
        >
          <span className="inline-flex items-center">
            {t("colOrders")}
            {renderSortIndicator("orders")}
          </span>
        </TableHead>

        {/* 8. Solde dû */}
        <TableHead
          onClick={() => onSortToggle("balance")}
          className="py-3 px-4 text-xs font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap"
          aria-sort={sortBy === "balance" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
        >
          <span className="inline-flex items-center">
            {t("colBalance")}
            {renderSortIndicator("balance")}
          </span>
        </TableHead>

        {/* 9. Statut */}
        <TableHead className="py-3 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">
          {t("colStatus")}
        </TableHead>

        {/* 10. Actions */}
        <TableHead className="py-3 px-4 text-xs font-semibold text-muted-foreground text-right whitespace-nowrap">
          {t("colActions")}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
