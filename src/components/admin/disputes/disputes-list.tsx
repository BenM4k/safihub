"use client";

import { useOptimistic, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, Clock, Package } from "lucide-react";
import type { AdminDisputeRecord } from "@/dal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { DataTablePagination } from "@/components/admin/shared/data-table-pagination";

const ResolveDisputeDialog = dynamic(
  () =>
    import("./resolve-dispute-dialog").then((m) => m.ResolveDisputeDialog),
  { ssr: false }
);

interface DisputesListProps {
  disputes: AdminDisputeRecord[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export function DisputesList({
  disputes,
  page,
  pageSize,
  totalItems,
}: DisputesListProps) {
  const t = useTranslations("admin.disputes");
  const locale = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [resolvingDispute, setResolvingDispute] =
    useState<AdminDisputeRecord | null>(null);

  const [optimisticDisputes, applyOptimisticResolve] = useOptimistic(
    disputes,
    (
      state: AdminDisputeRecord[],
      update: {
        disputeId: string;
        resolution: string;
        compensationAmount: number | null;
        currency: "CDF" | "USD";
      }
    ) =>
      state.map((d) =>
        d.id === update.disputeId
          ? {
              ...d,
              status: "resolved",
              resolution: update.resolution,
              compensationAmount: update.compensationAmount,
              currency: update.currency,
            }
          : d
      )
  );

  if (optimisticDisputes.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-3 animate-enter">
        <div className="size-12 rounded-2xl bg-success-soft text-success flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-6" />
        </div>
        <h2 className="text-sm font-bold text-foreground">{t("emptyTitle")}</h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {t("emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 animate-stagger">
        {optimisticDisputes.map((dispute) => {
          const isOpen = dispute.status === "open";
          return (
            <div
              key={dispute.id}
              className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3 hover-lift"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    tone={isOpen ? "destructive" : "success"}
                    icon={
                      isOpen ? (
                        <AlertTriangle className="size-3" />
                      ) : (
                        <CheckCircle2 className="size-3" />
                      )
                    }
                    className="animate-badge-pop"
                  >
                    {isOpen ? t("statusOpen") : t("statusResolved")}
                  </StatusBadge>
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

              {dispute.resolution && (
                <div className="text-xs bg-success-soft text-success border border-success/20 p-3 rounded-xl space-y-1 animate-enter-fast">
                  <p className="font-semibold">{t("resolutionSummaryTitle")}</p>
                  <p>{dispute.resolution}</p>
                  {dispute.compensationAmount !== null &&
                    dispute.compensationAmount > 0 && (
                      <p className="font-mono text-[11px]">
                        {t("compensationLabel")}:{" "}
                        {dispute.compensationAmount.toLocaleString(locale)}{" "}
                        {dispute.currency}
                      </p>
                    )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
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

                {isOpen && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setResolvingDispute(dispute)}
                    className="min-h-10 text-xs font-semibold press"
                  >
                    {t("resolveButton")}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DataTablePagination
        urlMode
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        hideIfSinglePage
        className="rounded-xl border border-border"
      />

      {resolvingDispute && (
        <ResolveDisputeDialog
          dispute={resolvingDispute}
          onClose={() => {
            setResolvingDispute(null);
            startTransition(() => {
              router.refresh();
            });
          }}
          onResolved={applyOptimisticResolve}
          onReconcile={() => {
            startTransition(() => {
              router.refresh();
            });
          }}
        />
      )}
    </div>
  );
}
