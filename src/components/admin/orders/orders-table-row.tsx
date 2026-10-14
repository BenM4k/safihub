"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  Edit,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Smartphone,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderListItemRecord } from "@/dal";
import {
  formatAmount,
  formatCustomerDisplay,
  formatDateTime,
  formatOrderReference,
  formatRelativeTime,
  getOrderStatusConfig,
  getSourceConfig,
} from "@/lib/order-formatters";

interface OrdersTableRowProps {
  order: OrderListItemRecord;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenDetails: (order: OrderListItemRecord) => void;
  onOpenReassign: (order: OrderListItemRecord) => void;
  onOpenCancel: (order: OrderListItemRecord) => void;
  showPaymentColumn?: boolean;
}

export function OrdersTableRow({
  order,
  isSelected,
  onToggleSelect,
  onOpenDetails,
  onOpenReassign,
  onOpenCancel,
  showPaymentColumn = false,
}: OrdersTableRowProps) {
  const t = useTranslations("admin.orders");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const customer = formatCustomerDisplay(order.customerName, order.customerPhone);
  const statusConfig = getOrderStatusConfig(order.status);
  const sourceConfig = getSourceConfig(order.source);
  const reference = formatOrderReference(order.code, order.id);

  return (
    <tr
      onClick={() => onOpenDetails(order)}
      className={`h-14 border-b border-border-strong transition-colors cursor-pointer select-none ${
        isSelected
          ? "bg-primary-soft/60 hover:bg-primary-soft/80"
          : "hover:bg-slate-50/90"
      }`}
    >
      {/* Checkbox */}
      <td
        className="w-10 px-3.5 py-2.5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(order.id)}
          aria-label={`Sélectionner commande ${reference}`}
          className="rounded border-border-strong text-primary focus:ring-primary w-4 h-4 cursor-pointer"
        />
      </td>

      {/* Référence (Plain text, not link colored) */}
      <td className="px-3.5 py-2.5 whitespace-nowrap">
        <span className="font-mono font-bold text-xs text-heading select-all">
          {reference}
        </span>
      </td>

      {/* Client */}
      <td className="px-3.5 py-2.5">
        <div className="space-y-0.5">
          {customer.displayName ? (
            <div className="font-semibold text-xs text-heading truncate max-w-[170px]">
              {customer.displayName}
            </div>
          ) : null}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <span>{customer.formattedPhone}</span>
            {customer.isGuest && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-sans font-semibold bg-surface border border-border-strong text-ink-600">
                {t("guestTag")}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Pressing */}
      <td className="px-3.5 py-2.5 hidden md:table-cell text-xs text-foreground font-medium truncate max-w-[160px]">
        {order.houseName || "—"}
      </td>

      {/* Date de création */}
      <td className="px-3.5 py-2.5 hidden sm:table-cell whitespace-nowrap">
        <div
          title={new Date(order.createdAt).toISOString()}
          className="space-y-0.5"
        >
          <div className="text-xs text-heading font-medium">
            {formatDateTime(order.createdAt)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {formatRelativeTime(order.createdAt)}
          </div>
        </div>
      </td>

      {/* Canal (Neutral tag with icon) */}
      <td className="px-3.5 py-2.5 hidden lg:table-cell whitespace-nowrap">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface text-foreground border border-border-strong shadow-2xs">
          {sourceConfig.iconName === "whatsapp" ? (
            <MessageSquare className="w-3 h-3 text-emerald-600" />
          ) : sourceConfig.iconName === "phone" ? (
            <Phone className="w-3 h-3 text-ink-600" />
          ) : (
            <Smartphone className="w-3 h-3 text-primary" />
          )}
          <span>{sourceConfig.label}</span>
        </span>
      </td>

      {/* Paiement (Conditionally shown if backend field exists) */}
      {showPaymentColumn && (
        <td className="px-3.5 py-2.5 hidden xl:table-cell whitespace-nowrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface border border-border-strong text-muted-foreground">
            À payer
          </span>
        </td>
      )}

      {/* Montant (Right-aligned, tabular numbers) */}
      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
        <span className="font-mono tabular-nums text-xs font-bold text-heading">
          {formatAmount(order.totalDue, order.currency)}
        </span>
      </td>

      {/* Statut (Colour-coded pill with dot and text) */}
      <td className="px-3.5 py-2.5 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs ${statusConfig.badgeClass}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusConfig.dotClass}`}
            aria-hidden="true"
          />
          <span>{statusConfig.label}</span>
        </span>
      </td>

      {/* Row Action Menu ("⋯") */}
      <td
        className="w-10 px-2 py-2 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative inline-block text-left" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={`Actions pour la commande ${reference}`}
            aria-expanded={menuOpen}
            className="p-1.5 rounded-lg text-ink-500 hover:text-heading hover:bg-card border border-border-strong bg-card shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-card border border-border-strong shadow-lift z-30 py-1 font-sans text-xs divide-y divide-border-strong animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenDetails(order);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-heading hover:bg-surface transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-ink-500" />
                  <span>{t("actionView")}</span>
                </button>

                <Link
                  href={`/admin/orders/${order.id}`}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-heading hover:bg-surface transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-ink-500" />
                  <span>{t("actionEdit")}</span>
                </Link>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenReassign(order);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-heading hover:bg-surface transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-ink-500" />
                  <span>{t("actionReassign")}</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenCancel(order);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive-soft transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 text-destructive" />
                  <span>{t("actionCancel")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
