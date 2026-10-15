import { formatMoney, getDiscrepancyInfo } from "@/lib/cash-formatters";
import { CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";

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
          <CheckCircle2 className="size-3.5 text-success-base shrink-0" aria-hidden="true" />
          <span className="font-mono tabular-nums font-semibold text-success-base">
            0&nbsp;{currency}
          </span>
          <span className="text-xs text-success-base/80 font-medium">
            (Aucun écart)
          </span>
        </div>
      );
    }

    if (info.isShortage) {
      return (
        <div className={`flex items-center justify-end gap-1.5 text-right ${className}`}>
          <ShieldAlert className="size-3.5 text-destructive-base shrink-0" aria-hidden="true" />
          <span className="font-mono tabular-nums font-bold text-destructive-base">
            {info.formattedAmount}
          </span>
          <span className="text-xs font-bold text-destructive-base px-1.5 py-0.5 bg-destructive-light rounded border border-destructive-base/20">
            Manquant
          </span>
        </div>
      );
    }

    // Surplus
    return (
      <div className={`flex items-center justify-end gap-1.5 text-right ${className}`}>
        <AlertCircle className="size-3.5 text-warning-base shrink-0" aria-hidden="true" />
        <span className="font-mono tabular-nums font-bold text-warning-base">
          {info.formattedAmount}
        </span>
        <span className="text-xs font-bold text-warning-base px-1.5 py-0.5 bg-warning-light rounded border border-warning-base/20">
          Excédent
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
