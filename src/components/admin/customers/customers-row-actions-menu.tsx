"use client";

import { useTranslations } from "next-intl";
import {
  Ban,
  CheckCircle,
  Eye,
  GitMerge,
  KeyRound,
  ShoppingBag,
} from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { RowActionsMenu } from "@/components/admin/shared/row-actions-menu";
import type { CustomerRow } from "./types";

interface CustomersRowActionsMenuProps {
  customer: CustomerRow;
  isAdmin: boolean;
  onViewProfile: (customer: CustomerRow) => void;
  onViewOrders: (customer: CustomerRow) => void;
  onResetPassword: (customer: CustomerRow) => void;
  onMergeGuest: (customer: CustomerRow) => void;
  onToggleBlock: (customer: CustomerRow) => void;
}

export function CustomersRowActionsMenu({
  customer,
  isAdmin,
  onViewProfile,
  onViewOrders,
  onResetPassword,
  onMergeGuest,
  onToggleBlock,
}: CustomersRowActionsMenuProps) {
  const t = useTranslations("admin.customers");
  const isBlocked = customer.banned || customer.status === "blocked";
  const isGuest = customer.isGuest;

  return (
    <RowActionsMenu ariaLabel={t("actionsForCustomer", { name: customer.name || "—" })}>
      <DropdownMenuItem onClick={() => onViewProfile(customer)}>
        <Eye className="size-4" />
        <span>{t("viewProfile")}</span>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => onViewOrders(customer)}>
        <ShoppingBag className="size-4" />
        <span>{t("viewOrders")}</span>
      </DropdownMenuItem>

      {!isGuest && (
        <DropdownMenuItem
          disabled={!isAdmin}
          onClick={() => onResetPassword(customer)}
        >
          <KeyRound className="size-4" />
          <span>{t("resetPassword")}</span>
        </DropdownMenuItem>
      )}

      {isGuest && (
        <DropdownMenuItem
          disabled={!isAdmin}
          onClick={() => onMergeGuest(customer)}
          className="text-primary focus:text-primary font-semibold"
        >
          <GitMerge className="size-4 text-primary" />
          <span>{t("mergeWith")}</span>
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator />

      <DropdownMenuItem
        disabled={!isAdmin}
        variant={isBlocked ? "default" : "destructive"}
        onClick={() => onToggleBlock(customer)}
        className={isBlocked ? "text-emerald-700 focus:text-emerald-700 font-semibold" : undefined}
      >
        {isBlocked ? (
          <>
            <CheckCircle className="size-4" />
            <span>{t("unblock")}</span>
          </>
        ) : (
          <>
            <Ban className="size-4" />
            <span>{t("block")}</span>
          </>
        )}
      </DropdownMenuItem>
    </RowActionsMenu>
  );
}
