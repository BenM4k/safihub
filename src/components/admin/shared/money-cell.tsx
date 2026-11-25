"use client";

import { CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatMoney, getDiscrepancyInfo } from "@/lib/cash-formatters";

interface MoneyCellProps {
  amount: number | null | undefined;
  currency?: string;
  isDiscrepancy?: boolean;
  isCancelled?: boolean;
  className?: string;
}

export function MoneyCell({
  amount,
  currency = "CDF",
  isDiscrepancy = false,
  isCancelled = false,
  className = "",
}: MoneyCellProps) {
  const t = useTranslations("admin.shared");

  if (amount === null || amount === undefined) {
    return <span className="font-mono text-muted-foreground">—</span>;
  }

  if (isCancelled) {
    return (
      <span
        className={`font-mono tabular-nums text-muted-foreground line-through text-right block ${className}`}
      >
        {formatMoney(amount, currency)}
      </span>
    );
  }

  if (isDiscrepancy) {
    const info = getDiscrepancyInfo(amount, currency);

    if (info.isZero) {
      return (
        <div className={`flex items-center justify-end gap-1.5 text-right ${className}`}>
          <CheckCircle2 className="size-3.5 text-success shrink-0" aria-hidden="true" />
          <span className="font-mono tabular-nums font-semibold text-success">
            0&nbsp;{currency}
          </span>
          <span className="text-xs text-success/80 font-medium">
            {t("zeroDiscrepancy")}
          </span>
        </div>
      );
    }

    if (info.isShortage) {
      return (
        <div className={`flex items-center justify-end gap-1.5 text-right ${className}`}>
          <ShieldAlert className="size-3.5 text-destructive shrink-0" aria-hidden="true" />
          <span className="font-mono tabular-nums font-bold text-destructive">
            {info.formattedAmount}
          </span>
          <span className="text-xs font-bold text-destructive px-1.5 py-0.5 bg-destructive-soft rounded border border-destructive/20">
            {t("shortage")}
          </span>
        </div>
      );
    }

    return (
      <div className={`flex items-center justify-end gap-1.5 text-right ${className}`}>
        <AlertCircle className="size-3.5 text-warning shrink-0" aria-hidden="true" />
        <span className="font-mono tabular-nums font-bold text-warning">
          {info.formattedAmount}
        </span>
        <span className="text-xs font-bold text-warning px-1.5 py-0.5 bg-warning-soft rounded border border-warning/20">
          {t("surplus")}
        </span>
      </div>
    );
  }

  return (
    <span
      className={`tabular-nums text-heading font-medium text-right block ${className}`}
    >
      {formatMoney(amount, currency)}
    </span>
  );
}
