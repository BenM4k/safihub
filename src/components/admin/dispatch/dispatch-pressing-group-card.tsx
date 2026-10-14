"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  Phone,
  PhoneCall,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DispatchOrderRow } from "./dispatch-order-row";
import type { EnrichedDispatchOrder, PressingGroup } from "@/lib/dispatch-grouping";

interface DispatchPressingGroupCardProps {
  group: PressingGroup;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectOrder: (order: EnrichedDispatchOrder) => void;
  onOpenOutcomeModal: (order: EnrichedDispatchOrder, channel: "call" | "whatsapp") => void;
  onOpenGroupOutcomeModal: (group: PressingGroup, channel: "call" | "whatsapp") => void;
  onOpenReassignDialog: (order: EnrichedDispatchOrder) => void;
}

export function DispatchPressingGroupCard({
  group,
  isExpanded,
  onToggleExpand,
  onSelectOrder,
  onOpenOutcomeModal,
  onOpenGroupOutcomeModal,
  onOpenReassignDialog,
}: DispatchPressingGroupCardProps) {
  const [isBulkRelancing, setIsBulkRelancing] = useState(false);
  const phone = group.housePhone || "";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    `Bonjour ${group.houseName}, vous avez ${group.pendingCount} commande(s) SafiHub en attente d'acceptation. Merci de confirmer rapidement votre disponibilité.`
  );

  const urgencyStyle =
    group.urgencyLevel === "critical"
      ? "bg-destructive-soft text-destructive border-destructive/20"
      : group.urgencyLevel === "warning"
      ? "bg-warning-soft text-warning border-warning/20"
      : "bg-secondary text-secondary-foreground border-border";

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden transition-all duration-150 hover:border-border-strong">
      {/* Group Card Header */}
      <div
        onClick={onToggleExpand}
        className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-card hover:bg-muted/50 cursor-pointer transition-colors"
      >
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-heading tracking-tight font-display">
              {group.houseName}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-soft text-primary-soft-foreground">
              {group.pendingCount} {group.pendingCount > 1 ? "commandes" : "commande"}
            </span>

            {/* Oldest waiting time */}
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold border ${urgencyStyle}`}>
              {group.urgencyLevel === "critical" ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : group.urgencyLevel === "warning" ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>Plus ancienne : {group.formattedOldestElapsed}</span>
            </span>

            {/* Subtle duplicate chase warning */}
            {group.isRecentlyRelanced && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warning-soft text-warning border border-warning/30">
                Déjà relancé il y a {group.recentRelanceMinutes} min
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {phone ? (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Phone className="w-3.5 h-3.5 text-ink-400" />
                {phone}
              </span>
            ) : (
              <span className="text-warning italic">Téléphone non renseigné</span>
            )}

            {group.relanceCount > 0 ? (
              <span className="text-muted-foreground">
                Relancé {group.relanceCount}× · dernière il y a {group.recentRelanceMinutes ?? 0} min par{" "}
                <strong className="text-heading font-semibold">{group.lastRelanceBy || "Opérateur"}</strong>
                {group.lastOutcome && (
                  <span className="ml-1 text-muted-foreground">({group.lastOutcome})</span>
                )}
              </span>
            ) : (
              <span className="text-ink-400 italic">Jamais relancé</span>
            )}
          </div>
        </div>

        {/* Group Actions */}
        <div
          className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {cleanPhone && (
            <>
              <a
                href={`tel:${phone}`}
                onClick={() => onOpenGroupOutcomeModal(group, "call")}
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
                onClick={() => onOpenGroupOutcomeModal(group, "whatsapp")}
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
          )}

          {group.pendingCount > 1 && (
            <Button
              size="sm"
              variant="outline"
              disabled={isBulkRelancing}
              onClick={() => {
                setIsBulkRelancing(true);
                onOpenGroupOutcomeModal(group, "call");
                setIsBulkRelancing(false);
              }}
              className="text-xs min-h-[40px] px-3 border-border-strong text-foreground hover:bg-muted font-medium"
            >
              <Send className="w-3.5 h-3.5 mr-1 text-ink-400" />
              Relancer tous
            </Button>
          )}

          <button
            type="button"
            onClick={onToggleExpand}
            className="p-2 rounded-lg text-muted-foreground hover:text-heading hover:bg-muted transition-colors cursor-pointer"
            aria-label={isExpanded ? "Réduire le groupe" : "Développer le groupe"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Accordion Orders List */}
      {isExpanded && (
        <div className="border-t border-border bg-surface/50 divide-y divide-border">
          {group.orders.map((order) => (
            <DispatchOrderRow
              key={order.id}
              order={order}
              onSelectOrder={onSelectOrder}
              onOpenOutcomeModal={onOpenOutcomeModal}
              onOpenReassignDialog={onOpenReassignDialog}
            />
          ))}
        </div>
      )}
    </div>
  );
}
