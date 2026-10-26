"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { TableRow, TableCell } from "@/components/ui/table";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import { MoneyCell } from "@/components/admin/shared/money-cell";
import { HouseStatusPill } from "./house-status-pill";
import { HouseRowActionsMenu } from "./house-row-actions-menu";
import { formatCommissionDisplay } from "@/lib/commission-conversion";
import type { AdminHouseRow } from "./types";

interface HousesTableRowProps {
  house: AdminHouseRow;
  defaultCommissionBps: number;
  onSelectHouse: (house: AdminHouseRow) => void;
  onToggleStatus: (house: AdminHouseRow) => void;
  onViewOrders: (house: AdminHouseRow) => void;
  onViewSettlements: (house: AdminHouseRow) => void;
}

export function HousesTableRow({
  house,
  defaultCommissionBps,
  onSelectHouse,
  onToggleStatus,
  onViewOrders,
  onViewSettlements,
}: HousesTableRowProps) {
  const t = useTranslations("admin.houses");
  const [imageError, setImageError] = useState(false);

  const commissionText = formatCommissionDisplay(
    house.commissionBps,
    defaultCommissionBps
  );

  return (
    <TableRow
      onClick={() => onSelectHouse(house)}
      className="cursor-pointer border-b border-border hover:bg-muted/50 transition-colors group"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectHouse(house);
        }
      }}
      aria-label={t("houseRowAria", { name: house.name })}
    >
      {/* 1. Pressing info */}
      <TableCell className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 rounded-lg border border-border overflow-hidden bg-muted/40 relative">
            {!imageError && house.imageUrl ? (
              <Image
                src={house.imageUrl}
                alt={house.name}
                fill
                sizes="40px"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="size-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                {house.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors block truncate">
              {house.name}
            </span>
            <span className="text-[11px] text-muted-foreground block truncate">
              {house.addressNote || `/${house.slug}`}
            </span>
          </div>
        </div>
      </TableCell>

      {/* 2. Quartier */}
      <TableCell className="py-3 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
        {house.neighborhoodName || "—"}
      </TableCell>

      {/* 3. Téléphone */}
      <TableCell className="py-3 px-4 whitespace-nowrap">
        <PhoneCell phone={house.contactPhone} showIcon />
      </TableCell>

      {/* 4. Commission */}
      <TableCell className="py-3 px-4 text-xs font-semibold whitespace-nowrap">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs ${
            house.commissionBps === null
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary font-bold"
          }`}
        >
          {commissionText}
        </span>
      </TableCell>

      {/* 5. Montant minimum */}
      <TableCell className="py-3 px-4 text-right whitespace-nowrap">
        <MoneyCell amount={house.minimumOrderAmount} />
      </TableCell>

      {/* 6. Délai */}
      <TableCell className="py-3 px-4 text-xs font-medium text-foreground whitespace-nowrap">
        {house.turnaroundHours} h
      </TableCell>

      {/* 7. Commandes en cours */}
      <TableCell className="py-3 px-4 text-center whitespace-nowrap">
        {house.activeOrdersCount > 0 ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
            {house.activeOrdersCount}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* 8. Solde à régler */}
      <TableCell className="py-3 px-4 text-right whitespace-nowrap">
        <MoneyCell amount={house.balanceOwedCDF} />
      </TableCell>

      {/* 9. Statut */}
      <TableCell className="py-3 px-4 whitespace-nowrap">
        <HouseStatusPill status={house.status} />
      </TableCell>

      {/* 10. Actions */}
      <TableCell
        className="py-3 px-4 text-right whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <HouseRowActionsMenu
          house={house}
          onSelectHouse={onSelectHouse}
          onToggleStatus={onToggleStatus}
          onViewOrders={onViewOrders}
          onViewSettlements={onViewSettlements}
        />
      </TableCell>
    </TableRow>
  );
}
