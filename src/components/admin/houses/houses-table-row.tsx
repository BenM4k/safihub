"use client";

import { useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Edit, Ban, CheckCircle2, ShoppingBag, Landmark } from "lucide-react";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import { MoneyCell } from "@/components/admin/shared/money-cell";
import { HouseStatusPill } from "./house-status-pill";
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
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
      aria-label={`Détails du pressing ${house.name}`}
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
              {house.isOpenNow ? "Ouvert" : "Fermé"}
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

      {/* 11. Actions (menu ⋯) */}
      <td className="py-3 px-4 text-right whitespace-nowrap relative">
        <div className="inline-block text-left" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-lg border border-border hover:border-border-strong hover:bg-surface text-ink-600 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Actions pour ${house.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal className="size-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
              />
              <div
                role="menu"
                className="absolute right-0 mt-1 w-48 rounded-xl bg-card border-2 border-border-strong shadow-lg py-1.5 z-40 text-left animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onSelectHouse(house);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-heading hover:bg-surface transition-colors"
                >
                  <Edit className="size-3.5 text-primary" />
                  <span>Modifier les paramètres</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleStatus(house);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-heading hover:bg-surface transition-colors"
                >
                  {house.isActive ? (
                    <>
                      <Ban className="size-3.5 text-destructive-base" />
                      <span>Suspendre le pressing</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5 text-success-base" />
                      <span>Réactiver le pressing</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onViewOrders(house);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-heading hover:bg-surface transition-colors"
                >
                  <ShoppingBag className="size-3.5 text-violet-600" />
                  <span>Voir les commandes</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onViewSettlements(house);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-heading hover:bg-surface transition-colors"
                >
                  <Landmark className="size-3.5 text-emerald-600" />
                  <span>Voir les règlements</span>
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
