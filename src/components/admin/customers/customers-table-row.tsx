"use client";

import { useTranslations } from "next-intl";
import { TableCell, TableRow } from "@/components/ui/table";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import { StatusPill } from "@/components/admin/shared/status-pill";
import { formatCustomerEmail, formatCustomerName } from "@/lib/customer-formatters";
import {
  formatAmount,
  formatDateTime,
  formatRelativeTime,
} from "@/lib/order-formatters";
import { CustomersRowActionsMenu } from "./customers-row-actions-menu";
import type { CustomerRow } from "./types";

interface CustomersTableRowProps {
  customer: CustomerRow;
  isAdmin: boolean;
  onSelect: (customer: CustomerRow) => void;
  onViewProfile: (customer: CustomerRow) => void;
  onViewOrders: (customer: CustomerRow) => void;
  onResetPassword: (customer: CustomerRow) => void;
  onMergeGuest: (customer: CustomerRow) => void;
  onToggleBlock: (customer: CustomerRow) => void;
}

export function CustomersTableRow({
  customer,
  isAdmin,
  onSelect,
  onViewProfile,
  onViewOrders,
  onResetPassword,
  onMergeGuest,
  onToggleBlock,
}: CustomersTableRowProps) {
  const t = useTranslations("admin.customers");

  const displayName = formatCustomerName(customer.name, customer.contactPhone);
  const displayEmail = formatCustomerEmail(customer.email);
  const isBlocked = customer.banned || customer.status === "blocked";

  return (
    <TableRow
      onClick={() => onSelect(customer)}
      className="cursor-pointer transition-colors h-12"
    >
      {/* 1. Client */}
      <TableCell className="py-2 px-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-xs text-foreground hover:text-primary transition-colors">
              {displayName}
            </span>
            {customer.isGuest && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                {t("typeGuest")}
              </span>
            )}
          </div>
          <div className="text-2xs text-muted-foreground sm:hidden mt-0.5">
            <PhoneCell phone={customer.contactPhone} showCopy={true} />
          </div>
        </div>
      </TableCell>

      {/* 2. Téléphone */}
      <TableCell className="py-2 px-3 hidden sm:table-cell">
        <PhoneCell phone={customer.contactPhone} showCopy={true} />
      </TableCell>

      {/* 3. E-mail */}
      <TableCell className="py-2 px-3 hidden md:table-cell max-w-[180px]">
        {displayEmail !== "—" ? (
          <span
            className="text-xs text-muted-foreground truncate block font-normal"
            title={displayEmail}
          >
            {displayEmail}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/60 italic">{t("noEmail")}</span>
        )}
      </TableCell>

      {/* 4. Type */}
      <TableCell className="py-2 px-2 hidden lg:table-cell text-center">
        {customer.isGuest ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            {t("typeGuest")}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-primary/10 text-primary border border-primary/20">
            {t("typeRegistered")}
          </span>
        )}
      </TableCell>

      {/* 5. Commandes */}
      <TableCell className="py-2 px-3 hidden sm:table-cell text-center">
        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-mono font-medium bg-muted text-foreground">
          {customer.ordersCount}
        </span>
      </TableCell>

      {/* 6. Total dépensé */}
      <TableCell className="py-2 px-3 hidden md:table-cell text-right font-mono text-xs font-semibold text-foreground">
        {formatAmount(customer.totalSpentCDF, "CDF")}
      </TableCell>

      {/* 7. Dernière commande */}
      <TableCell className="py-2 px-3 hidden lg:table-cell text-xs text-muted-foreground">
        {customer.lastOrderAt ? (
          <span title={formatDateTime(customer.lastOrderAt)} className="cursor-help">
            {formatRelativeTime(customer.lastOrderAt)}
          </span>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </TableCell>

      {/* 8. Inscrit le */}
      <TableCell className="py-2 px-3 hidden xl:table-cell text-xs text-muted-foreground font-mono">
        {formatDateTime(customer.createdAt).split(" ")[0]}
      </TableCell>

      {/* 9. Statut */}
      <TableCell className="py-2 px-3">
        {isBlocked ? (
          <StatusPill
            status="blocked"
            customLabel={t("statusBlocked")}
            title={customer.banReason ? t("reasonPrefix", { reason: customer.banReason }) : undefined}
          />
        ) : (
          <StatusPill status="active" customLabel={t("statusActive")} />
        )}
      </TableCell>

      {/* 10. Actions */}
      <TableCell
        className="py-2 px-3 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <CustomersRowActionsMenu
          customer={customer}
          isAdmin={isAdmin}
          onViewProfile={onViewProfile}
          onViewOrders={onViewOrders}
          onResetPassword={onResetPassword}
          onMergeGuest={onMergeGuest}
          onToggleBlock={onToggleBlock}
        />
      </TableCell>
    </TableRow>
  );
}
