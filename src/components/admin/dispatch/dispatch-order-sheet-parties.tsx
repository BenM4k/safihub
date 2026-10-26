"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, AlertTriangle, Clock, MapPin, Phone, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { EnrichedDispatchOrder } from "@/lib/dispatch-grouping";

interface DispatchOrderSheetPartiesProps {
  order: EnrichedDispatchOrder;
}

export function DispatchOrderSheetParties({ order }: DispatchOrderSheetPartiesProps) {
  const t = useTranslations("admin.dispatch");

  const urgencyLabel =
    order.urgency.isOverdue
      ? t("urgencyOverdue", { minutes: order.urgency.overdueMinutes ?? 0 })
      : order.urgency.level === "critical"
      ? t("urgencyCritical", { overdue: order.urgency.overdueMinutes ?? 0 })
      : order.urgency.level === "warning"
      ? t("urgencyWarning")
      : t("urgencyNormal");

  const urgencyBadgeClass =
    order.urgency.level === "critical"
      ? "bg-destructive/10 text-destructive"
      : order.urgency.level === "warning"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      : "bg-muted text-foreground";

  return (
    <div className="space-y-4 text-xs">
      {/* Pressing section */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
          Pressing Partenaire
        </p>
        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground text-sm">
            {order.houseName || "Pressing non renseigné"}
          </p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${urgencyBadgeClass}`}>
            {order.urgency.level === "critical" ? (
              <AlertCircle className="size-3" />
            ) : order.urgency.level === "warning" ? (
              <AlertTriangle className="size-3" />
            ) : (
              <Clock className="size-3" />
            )}
            <span>{order.urgency.formattedElapsed}</span>
            <span className="opacity-80">({urgencyLabel})</span>
          </span>
        </div>

        {order.housePhone && (
          <a
            href={`tel:${order.housePhone}`}
            className="inline-flex items-center gap-1.5 font-mono text-primary hover:underline font-semibold"
          >
            <Phone className="size-3" />
            <span>{order.housePhone}</span>
          </a>
        )}

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

      <Separator />

      {/* Customer section */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
          Client
        </p>
        <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <User className="size-3.5 text-muted-foreground" />
          <span>{order.customerName || "Client non renseigné"}</span>
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {order.customerPhone && (
            <a
              href={`tel:${order.customerPhone}`}
              className="inline-flex items-center gap-1.5 font-mono text-muted-foreground hover:text-foreground"
            >
              <Phone className="size-3" />
              <span>{order.customerPhone}</span>
            </a>
          )}
          {order.neighborhoodName && (
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3 text-muted-foreground" />
              <span>{order.neighborhoodName}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
