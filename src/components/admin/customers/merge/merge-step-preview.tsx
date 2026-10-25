"use client";

import { useTranslations } from "next-intl";
import { formatCustomerEmail, formatCustomerName } from "@/lib/customer-formatters";
import { formatAmount } from "@/lib/order-formatters";
import type { CustomerMergePreview } from "@/services/admin";

interface MergeStepPreviewProps {
  previewData: CustomerMergePreview;
}

export function MergeStepPreview({ previewData }: MergeStepPreviewProps) {
  const t = useTranslations("admin.customers.mergeDialog");
  const { guest, target, ordersToMoveCount, addressesToMoveCount } = previewData;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl border-2 border-border-strong bg-slate-50 space-y-1.5">
          <div className="font-bold text-heading">{t("guestSourceTitle")}</div>
          <div className="text-2xs text-ink-500">{t("guestSourceSubtitle")}</div>
          <div className="text-ink-700 font-semibold">{formatCustomerName(guest.name, guest.contactPhone)}</div>
          <div className="text-2xs font-mono">{guest.contactPhone || "—"}</div>
          <div className="pt-2 text-2xs space-y-1 border-t border-border-strong">
            <div>{t("ordersLabel")} <span className="font-bold">{guest.ordersCount}</span></div>
            <div>{t("addressesLabel")} <span className="font-bold">{guest.addressesCount}</span></div>
            <div>{t("totalSpentLabel")} <span className="font-bold">{formatAmount(guest.totalSpentCDF, "CDF")}</span></div>
          </div>
        </div>

        <div className="p-3 rounded-xl border-2 border-primary/40 bg-primary-soft/30 space-y-1.5">
          <div className="font-bold text-primary">{t("targetTitle")}</div>
          <div className="text-2xs text-ink-500">{t("targetSubtitle")}</div>
          <div className="text-ink-700 font-semibold">{target.name}</div>
          <div className="text-2xs font-mono">{formatCustomerEmail(target.email)}</div>
          <div className="pt-2 text-2xs space-y-1 border-t border-primary/20">
            <div>{t("ordersLabel")} <span className="font-bold">{target.ordersCount}</span> (+{ordersToMoveCount})</div>
            <div>{t("addressesLabel")} <span className="font-bold">{target.addressesCount}</span> (+{addressesToMoveCount})</div>
            <div>{t("combinedTotalLabel")} <span className="font-bold">{formatAmount(target.totalSpentCDF + guest.totalSpentCDF, "CDF")}</span></div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-surface border-2 border-border-strong text-2xs space-y-1 text-ink-600">
        <div className="font-bold text-heading">{t("mergeConsequencesTitle")}</div>
        <div>• {t("consequenceOrders", { count: ordersToMoveCount })}</div>
        <div>• {t("consequenceAddresses", { count: addressesToMoveCount })}</div>
        <div>• {t("consequenceDeactivated")}</div>
      </div>
    </div>
  );
}
