"use client";

import { useTranslations } from "next-intl";
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
    <tr
      onClick={() => onSelect(customer)}
      className="hover:bg-surface/70 cursor-pointer transition-colors border-b border-border-strong/80 h-[52px]"
    >
      {/* 1. Client (Line 1: Name + Tag, Line 2: Phone with tap-to-call & copy) */}
      <td className="py-2.5 px-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-xs text-heading hover:text-primary transition-colors">
              {displayName}
            </span>
            {customer.isGuest && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                {t("typeGuest")}
              </span>
            )}
          </div>
          <div className="text-2xs text-ink-500 sm:hidden mt-0.5">
            <PhoneCell phone={customer.contactPhone} showCopy={true} />
          </div>
        </div>
      </td>

      {/* 2. Téléphone */}
      <td className="py-2.5 px-3 hidden sm:table-cell">
        <PhoneCell phone={customer.contactPhone} showCopy={true} />
      </td>

      {/* 3. E-mail */}
      <td className="py-2.5 px-3 hidden md:table-cell max-w-[180px]">
        {displayEmail !== "—" ? (
          <span
            className="text-xs text-ink-600 truncate block font-normal"
            title={displayEmail}
          >
            {displayEmail}
          </span>
        ) : (
          <span className="text-xs text-ink-400 italic">{t("noEmail")}</span>
        )}
      </td>

      {/* 4. Type */}
      <td className="py-2.5 px-2 hidden lg:table-cell text-center">
        {customer.isGuest ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-bold bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs">
            {t("typeGuest")}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-bold bg-primary-soft text-primary border border-primary/20 shadow-2xs">
            {t("typeRegistered")}
          </span>
        )}
      </td>

      {/* 5. Commandes */}
      <td className="py-2.5 px-3 hidden sm:table-cell text-center">
        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-mono font-bold bg-surface border border-border-strong text-ink-800">
          {customer.ordersCount}
        </span>
      </td>

      {/* 6. Total dépensé */}
      <td className="py-2.5 px-3 hidden md:table-cell text-right font-mono text-xs font-semibold text-heading">
        {formatAmount(customer.totalSpentCDF, "CDF")}
      </td>

      {/* 7. Dernière commande */}
      <td className="py-2.5 px-3 hidden lg:table-cell text-xs text-ink-600">
        {customer.lastOrderAt ? (
          <span title={formatDateTime(customer.lastOrderAt)} className="cursor-help">
            {formatRelativeTime(customer.lastOrderAt)}
          </span>
        ) : (
          <span className="text-ink-400">—</span>
        )}
      </td>

      {/* 8. Inscrit le */}
      <td className="py-2.5 px-3 hidden xl:table-cell text-xs text-ink-600 font-mono">
        {formatDateTime(customer.createdAt).split(" ")[0]}
      </td>

      {/* 9. Statut */}
      <td className="py-2.5 px-3">
        {isBlocked ? (
          <StatusPill
            status="blocked"
            customLabel={t("statusBlocked")}
            title={customer.banReason ? `Motif : ${customer.banReason}` : undefined}
          />
        ) : (
          <StatusPill status="active" customLabel={t("statusActive")} />
        )}
      </td>

      {/* 10. Actions */}
      <td
        className="py-2.5 px-3 text-right"
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
      </td>
    </tr>
  );
}
