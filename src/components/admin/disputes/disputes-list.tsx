import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, Clock, Package } from "lucide-react";
import type { AdminDisputeRecord } from "@/dal";
import { Badge } from "@/components/ui/badge";

interface DisputesListProps {
  disputes: AdminDisputeRecord[];
}

export function DisputesList({ disputes }: DisputesListProps) {
  const t = useTranslations("admin.disputes");
  const locale = useLocale();

  if (disputes.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-3">
        <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-6" />
        </div>
        <h2 className="text-sm font-bold text-foreground">
          {t("emptyTitle")}
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {t("emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {disputes.map((dispute) => {
        const isOpen = dispute.status === "open";
        return (
          <div
            key={dispute.id}
            className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    isOpen
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {isOpen ? (
                    <AlertTriangle className="size-3" />
                  ) : (
                    <CheckCircle2 className="size-3" />
                  )}
                  <span>
                    {isOpen ? t("statusOpen") : t("statusResolved")}
                  </span>
                </span>
                <Badge variant="outline" className="text-xs font-medium capitalize">
                  {dispute.type}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>
                  {new Date(dispute.createdAt).toLocaleDateString(locale, {
                    timeZone: "Africa/Lubumbashi",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <p className="text-xs text-foreground leading-relaxed font-normal bg-muted/40 p-3 rounded-xl border border-border">
              {dispute.description}
            </p>

            <div className="flex items-center justify-between pt-1">
              <Link
                href={`/admin/orders/${dispute.orderId}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Package className="size-3.5" />
                <span>
                  {t("orderLink", {
                    code: dispute.orderCode || dispute.orderId.slice(0, 8),
                  })}
                </span>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
