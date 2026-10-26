"use client";

import { useTranslations } from "next-intl";
import { MoreHorizontal, Scale, Coins, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CourierActionMenuProps {
  courierName: string;
  isConfirmed: boolean;
  hasOrders: boolean;
  onReconcile: () => void;
  onManageDeposit: () => void;
  onViewOrders: () => void;
}

export function CourierActionMenu({
  courierName,
  isConfirmed,
  hasOrders,
  onReconcile,
  onManageDeposit,
  onViewOrders,
}: CourierActionMenuProps) {
  const t = useTranslations("admin.cash");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          aria-label={t("courierActionsAria", { name: courierName })}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {(!isConfirmed || hasOrders) && (
          <>
            {!isConfirmed && (
              <DropdownMenuItem onClick={onReconcile}>
                <Scale className="size-4 mr-2 text-primary shrink-0" />
                <span>{t("reconcileBtn")}</span>
              </DropdownMenuItem>
            )}
            {hasOrders && (
              <DropdownMenuItem onClick={onViewOrders}>
                <PackageCheck className="size-4 mr-2 text-muted-foreground shrink-0" />
                <span>{t("viewOrderDetails")}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={onManageDeposit}>
          <Coins className="size-4 mr-2 text-amber-500 shrink-0" />
          <span>{t("depositFloatBtn")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
