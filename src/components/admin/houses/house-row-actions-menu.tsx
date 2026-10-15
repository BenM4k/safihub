"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Ban, CheckCircle2, ShoppingBag, Landmark } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AdminHouseRow } from "./types";

interface HouseRowActionsMenuProps {
  house: AdminHouseRow;
  onSelectHouse: (house: AdminHouseRow) => void;
  onToggleStatus: (house: AdminHouseRow) => void;
  onViewOrders: (house: AdminHouseRow) => void;
  onViewSettlements: (house: AdminHouseRow) => void;
}

export function HouseRowActionsMenu({
  house,
  onSelectHouse,
  onToggleStatus,
  onViewOrders,
  onViewSettlements,
}: HouseRowActionsMenuProps) {
  const t = useTranslations("admin.houses");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="p-1.5 rounded-lg border border-border hover:border-border-strong hover:bg-surface text-ink-600 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={t("houseActionsAria", { name: house.name })}
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
              <span>{t("editSettings")}</span>
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
                  <span>{t("suspendHouse")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5 text-success-base" />
                  <span>{t("reactivateHouse")}</span>
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
              <span>{t("viewOrders")}</span>
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
              <span>{t("viewSettlements")}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
