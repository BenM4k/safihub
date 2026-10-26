"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, AlertTriangle, ArrowRightLeft, Clock, MessageSquare, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCDF, formatOrderRef } from "@/lib/dispatch-urgency";
import type { EnrichedDispatchOrder } from "@/lib/dispatch-grouping";

interface DispatchOrderRowProps {
  order: EnrichedDispatchOrder;
  onSelectOrder: (order: EnrichedDispatchOrder) => void;
  onOpenOutcomeModal: (order: EnrichedDispatchOrder, channel: "call" | "whatsapp") => void;
  onOpenReassignDialog: (order: EnrichedDispatchOrder) => void;
}

export function DispatchOrderRow({
  order,
  onSelectOrder,
  onOpenOutcomeModal,
  onOpenReassignDialog,
}: DispatchOrderRowProps) {
  const t = useTranslations("admin.dispatch");
  const phone = order.housePhone || "";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    `Bonjour ${order.houseName || "Pressing"}, vous avez une nouvelle commande SafiHub #${order.code} en attente d'acceptation. Merci de confirmer rapidement votre disponibilité.`
  );

  const urgencyStyle =
    order.urgency.level === "critical"
      ? "bg-destructive/10 text-destructive"
      : order.urgency.level === "warning"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      : "bg-muted text-foreground";

  const urgencyLabel =
    order.urgency.isOverdue
      ? t("urgencyOverdue", { minutes: order.urgency.overdueMinutes ?? 0 })
      : order.urgency.level === "critical"
      ? t("urgencyCritical", { overdue: order.urgency.overdueMinutes ?? 0 })
      : order.urgency.level === "warning"
      ? t("urgencyWarning")
      : t("urgencyNormal");

  return (
    <div
      onClick={() => onSelectOrder(order)}
      className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-foreground">
            {formatOrderRef(order.code, order.id)}
          </span>

          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${urgencyStyle}`}>
            {order.urgency.level === "critical" ? (
              <AlertCircle className="size-3" />
            ) : order.urgency.level === "warning" ? (
              <AlertTriangle className="size-3" />
            ) : (
              <Clock className="size-3" />
            )}
            <span>{order.urgency.formattedElapsed}</span>
            <span className="text-[11px] font-normal opacity-80">({urgencyLabel})</span>
          </span>

          {order.isRecentlyRelanced && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
              Déjà relancé il y a {order.recentRelanceMinutes} min
            </span>
          )}
        </div>

        <div className="text-xs text-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {order.customerName && (
            <span className="font-semibold text-foreground">{order.customerName}</span>
          )}
          {order.neighborhoodName && (
            <span className="text-muted-foreground">({order.neighborhoodName})</span>
          )}
          <span className="text-muted-foreground">·</span>
          <span className="font-semibold text-foreground">{formatCDF(order.totalDue)}</span>
        </div>

        {order.relanceCount > 0 ? (
          <p className="text-[11px] text-muted-foreground">
            Relancé {order.relanceCount}× · dernière il y a {order.recentRelanceMinutes ?? 0} min par{" "}
            <span className="font-medium text-foreground">{order.lastRelanceBy || "Opérateur"}</span>
            {order.lastOutcome && (
              <span className="ml-1 text-muted-foreground">({order.lastOutcome})</span>
            )}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground italic">Jamais relancé</p>
        )}
      </div>

      {/* Actions */}
      <div
        className="flex flex-wrap items-center gap-1.5 self-start sm:self-center shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {cleanPhone ? (
          <>
            <Button
              asChild
              size="sm"
              className="text-xs h-8 px-2.5 gap-1"
            >
              <a
                href={`tel:${phone}`}
                onClick={() => onOpenOutcomeModal(order, "call")}
              >
                <PhoneCall className="size-3" />
                <span>{t("callAction")}</span>
              </a>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="text-xs h-8 px-2.5 gap-1"
            >
              <a
                href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => onOpenOutcomeModal(order, "whatsapp")}
              >
                <MessageSquare className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </Button>
          </>
        ) : (
          <span className="text-xs text-amber-600 dark:text-amber-400 italic">Téléphone non renseigné</span>
        )}

        {order.canReassign && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenReassignDialog(order)}
            className="text-xs h-8 px-2.5 gap-1"
          >
            <ArrowRightLeft className="size-3" />
            <span>Réassigner</span>
          </Button>
        )}
      </div>
    </div>
  );
}
