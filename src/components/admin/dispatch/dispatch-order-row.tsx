"use client";

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
  const phone = order.housePhone || "";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    `Bonjour ${order.houseName || "Pressing"}, vous avez une nouvelle commande SafiHub #${order.code} en attente d'acceptation. Merci de confirmer rapidement votre disponibilité.`
  );

  // Urgency visual styling
  const urgencyStyle =
    order.urgency.level === "critical"
      ? "bg-destructive-soft text-destructive border-destructive/20"
      : order.urgency.level === "warning"
      ? "bg-warning-soft text-warning border-warning/20"
      : "bg-secondary text-secondary-foreground border-border";

  return (
    <div
      onClick={() => onSelectOrder(order)}
      className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border last:border-b-0"
    >
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-heading">
            {formatOrderRef(order.code, order.id)}
          </span>

          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold border ${urgencyStyle}`}>
            {order.urgency.level === "critical" ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : order.urgency.level === "warning" ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            <span>{order.urgency.formattedElapsed}</span>
            <span className="text-[11px] font-normal opacity-90">({order.urgency.label})</span>
          </span>

          {order.isRecentlyRelanced && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-warning-soft text-warning border border-warning/30">
              Déjà relancé il y a {order.recentRelanceMinutes} min
            </span>
          )}
        </div>

        <div className="text-xs text-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {order.customerName && (
            <span className="font-semibold text-heading">{order.customerName}</span>
          )}
          {order.neighborhoodName && (
            <span className="text-muted-foreground">({order.neighborhoodName})</span>
          )}
          <span className="text-ink-400">•</span>
          <span className="font-semibold text-heading">{formatCDF(order.totalDue)}</span>
        </div>

        {order.relanceCount > 0 ? (
          <p className="text-[11px] text-muted-foreground">
            Relancé {order.relanceCount}× · dernière il y a {order.recentRelanceMinutes ?? 0} min par{" "}
            <span className="font-medium text-heading">{order.lastRelanceBy || "Opérateur"}</span>
            {order.lastOutcome && (
              <span className="ml-1 text-muted-foreground">({order.lastOutcome})</span>
            )}
          </p>
        ) : (
          <p className="text-[11px] text-ink-400 italic">Jamais relancé</p>
        )}
      </div>

      {/* Actions */}
      <div
        className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {cleanPhone ? (
          <>
            <a
              href={`tel:${phone}`}
              onClick={() => onOpenOutcomeModal(order, "call")}
            >
              <Button
                size="sm"
                className="text-xs min-h-[40px] px-3.5 bg-primary hover:bg-primary-hover text-white font-medium shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5 mr-1" />
                Appeler
              </Button>
            </a>
            <a
              href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => onOpenOutcomeModal(order, "whatsapp")}
            >
              <Button
                size="sm"
                variant="outline"
                className="text-xs min-h-[40px] px-3.5 border-success text-success hover:bg-success-soft font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1 text-success" />
                WhatsApp
              </Button>
            </a>
          </>
        ) : (
          <span className="text-xs text-warning italic">Téléphone non renseigné</span>
        )}

        {order.canReassign && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenReassignDialog(order)}
            className="text-xs min-h-[40px] px-3 border-warning/40 text-warning hover:bg-warning-soft font-medium"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
            Réassigner
          </Button>
        )}
      </div>
    </div>
  );
}
