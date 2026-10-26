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
        <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1.5">
          <div className="font-bold text-foreground">{t("guestSourceTitle")}</div>
          <div className="text-2xs text-muted-foreground">{t("guestSourceSubtitle")}</div>
          <div className="text-foreground font-semibold">{formatCustomerName(guest.name, guest.contactPhone)}</div>
          <div className="text-2xs font-mono text-muted-foreground">{guest.contactPhone || "—"}</div>
          <div className="pt-2 text-2xs space-y-1 border-t border-border">
            <div>{t("ordersLabel")} <span className="font-bold">{guest.ordersCount}</span></div>
            <div>{t("addressesLabel")} <span className="font-bold">{guest.addressesCount}</span></div>
            <div>{t("totalSpentLabel")} <span className="font-bold">{formatAmount(guest.totalSpentCDF, "CDF")}</span></div>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-1.5">
          <div className="font-bold text-primary">{t("targetTitle")}</div>
          <div className="text-2xs text-muted-foreground">{t("targetSubtitle")}</div>
          <div className="text-foreground font-semibold">{target.name}</div>
          <div className="text-2xs font-mono text-muted-foreground">{formatCustomerEmail(target.email)}</div>
          <div className="pt-2 text-2xs space-y-1 border-t border-primary/20">
            <div>{t("ordersLabel")} <span className="font-bold">{target.ordersCount}</span> (+{ordersToMoveCount})</div>
            <div>{t("addressesLabel")} <span className="font-bold">{target.addressesCount}</span> (+{addressesToMoveCount})</div>
            <div>{t("combinedTotalLabel")} <span className="font-bold">{formatAmount(target.totalSpentCDF + guest.totalSpentCDF, "CDF")}</span></div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-muted/40 border border-border text-2xs space-y-1 text-muted-foreground">
        <div className="font-bold text-foreground">{t("mergeConsequencesTitle")}</div>
        <div>• {t("consequenceOrders", { count: ordersToMoveCount })}</div>
        <div>• {t("consequenceAddresses", { count: addressesToMoveCount })}</div>
        <div>• {t("consequenceDeactivated")}</div>
      </div>
    </div>
  );
}
