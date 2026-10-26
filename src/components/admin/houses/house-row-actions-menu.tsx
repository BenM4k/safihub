"use client";

import { useTranslations } from "next-intl";
import { Edit, Ban, CheckCircle2, ShoppingBag, Landmark } from "lucide-react";
import { RowActionsMenu } from "@/components/admin/shared/row-actions-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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

  return (
    <RowActionsMenu ariaLabel={t("houseActionsAria", { name: house.name })}>
      <DropdownMenuItem onClick={() => onSelectHouse(house)}>
        <Edit className="size-3.5 text-primary" />
        <span>{t("editSettings")}</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => onToggleStatus(house)}
        variant={house.isActive ? "destructive" : "default"}
      >
        {house.isActive ? (
          <>
            <Ban className="size-3.5 text-destructive" />
            <span>{t("suspendHouse")}</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("reactivateHouse")}</span>
          </>
        )}
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => onViewOrders(house)}>
        <ShoppingBag className="size-3.5 text-violet-600 dark:text-violet-400" />
        <span>{t("viewOrders")}</span>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => onViewSettlements(house)}>
        <Landmark className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{t("viewSettlements")}</span>
      </DropdownMenuItem>
    </RowActionsMenu>
  );
}
