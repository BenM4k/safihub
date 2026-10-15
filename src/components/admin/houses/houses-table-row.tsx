"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
    <tr
      onClick={() => onSelectHouse(house)}
      className="cursor-pointer border-b border-border-strong/70 hover:bg-surface-hover/80 transition-colors group"
      tabIndex={0}
      role="row"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectHouse(house);
        }
      }}
      aria-label={t("houseRowAria", { name: house.name })}
    >
      {/* 1. Pressing info with visible picture thumbnail */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="size-11 shrink-0 rounded-lg border-2 border-border-strong overflow-hidden bg-surface relative shadow-2xs">
            {!imageError && house.imageUrl ? (
              <Image
                src={house.imageUrl}
                alt={house.name}
                fill
                sizes="44px"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="size-full flex items-center justify-center bg-primary-soft text-primary font-bold text-xs">
                {house.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-heading text-sm group-hover:text-primary transition-colors block truncate">
              {house.name}
            </span>
            <span className="text-[11px] text-ink-600 block truncate">
              {house.addressNote || `/${house.slug}`}
            </span>
          </div>
        </div>
      </td>

      {/* 2. Quartier */}
      <td className="py-3 px-4 text-xs font-medium text-ink-700 whitespace-nowrap">
        {house.neighborhoodName || "—"}
      </td>

      {/* 3. Téléphone */}
      <td className="py-3 px-4 whitespace-nowrap">
        <PhoneCell phone={house.contactPhone} showIcon />
      </td>

      {/* 4. Commission */}
      <td className="py-3 px-4 text-xs font-semibold text-ink-800 whitespace-nowrap">
        <span
          className={`inline-block px-2 py-0.5 rounded-md border text-xs ${
            house.commissionBps === null
              ? "bg-surface border-border-strong text-ink-600"
              : "bg-primary-soft/60 border-primary/20 text-primary font-bold"
          }`}
        >
          {commissionText}
        </span>
      </td>

      {/* 5. Montant minimum */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <MoneyCell amount={house.minimumOrderAmount} />
      </td>

      {/* 6. Délai */}
      <td className="py-3 px-4 text-xs font-medium text-ink-700 whitespace-nowrap">
        {house.turnaroundHours} h
      </td>

      {/* 7. Horaires / Ouvert maintenant */}
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${
                house.isOpenNow ? "bg-success-base" : "bg-ink-400"
              }`}
            />
            <span className="text-xs font-bold text-heading">
              {house.isOpenNow ? t("openNow") : t("closedNow")}
            </span>
          </div>
          <span className="text-[11px] text-ink-500">
            {house.todayHoursText}
          </span>
        </div>
      </td>

      {/* 8. Commandes en cours */}
      <td className="py-3 px-4 text-center whitespace-nowrap">
        {house.activeOrdersCount > 0 ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary-soft text-primary border border-primary/20">
            {house.activeOrdersCount}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>

      {/* 9. Solde à régler */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <MoneyCell amount={house.balanceOwedCDF} />
      </td>

      {/* 10. Statut */}
      <td className="py-3 px-4 whitespace-nowrap">
        <HouseStatusPill status={house.status} />
      </td>

      {/* 11. Actions */}
      <td className="py-3 px-4 text-right whitespace-nowrap relative">
        <HouseRowActionsMenu
          house={house}
          onSelectHouse={onSelectHouse}
          onToggleStatus={onToggleStatus}
          onViewOrders={onViewOrders}
          onViewSettlements={onViewSettlements}
        />
      </td>
    </tr>
  );
}
