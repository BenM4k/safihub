"use client";

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
  const phone = group.housePhone || "";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    `Bonjour ${group.houseName}, vous avez ${group.pendingCount} commande(s) SafiHub en attente d'acceptation. Merci de confirmer rapidement votre disponibilité.`
  );

  const urgencyStyle =
    group.urgencyLevel === "critical"
      ? "bg-destructive/10 text-destructive"
      : group.urgencyLevel === "warning"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      : "bg-muted text-foreground";

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden transition-colors">
      {/* Group Card Header */}
      <div
        onClick={onToggleExpand}
        className="p-3.5 sm:px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
      >
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-foreground tracking-tight font-display">
              {group.houseName}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {group.pendingCount} {group.pendingCount > 1 ? "commandes" : "commande"}
            </span>

            {/* Oldest waiting time */}
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${urgencyStyle}`}>
              {group.urgencyLevel === "critical" ? (
                <AlertCircle className="size-3" />
              ) : group.urgencyLevel === "warning" ? (
                <AlertTriangle className="size-3" />
              ) : (
                <Clock className="size-3" />
              )}
              <span>Plus ancienne : {group.formattedOldestElapsed}</span>
            </span>

            {/* Subtle duplicate chase warning */}
            {group.isRecentlyRelanced && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                Déjà relancé il y a {group.recentRelanceMinutes} min
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {phone ? (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Phone className="size-3 text-muted-foreground" />
                <span>{phone}</span>
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 italic">Téléphone non renseigné</span>
            )}

            {group.relanceCount > 0 ? (
              <span className="text-muted-foreground">
                Relancé {group.relanceCount}× · dernière il y a {group.recentRelanceMinutes ?? 0} min par{" "}
                <strong className="text-foreground font-semibold">{group.lastRelanceBy || "Opérateur"}</strong>
                {group.lastOutcome && (
                  <span className="ml-1 text-muted-foreground">({group.lastOutcome})</span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground italic">Jamais relancé</span>
            )}
          </div>
        </div>

        {/* Group Actions */}
        <div
          className="flex flex-wrap items-center gap-1.5 self-start md:self-center shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {cleanPhone && (
            <>
              <Button
                asChild
                size="sm"
                className="text-xs h-8 px-2.5 gap-1"
              >
                <a
                  href={`tel:${phone}`}
                  onClick={() => onOpenGroupOutcomeModal(group, "call")}
                >
                  <PhoneCall className="size-3" />
                  <span>Appeler</span>
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
                  onClick={() => onOpenGroupOutcomeModal(group, "whatsapp")}
                >
                  <MessageSquare className="size-3 text-emerald-600 dark:text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </Button>
            </>
          )}

          {group.pendingCount > 1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenGroupOutcomeModal(group, "call")}
              className="text-xs h-8 px-2.5 gap-1"
            >
              <Send className="size-3 text-muted-foreground" />
              <span>Relancer tous</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="h-8 w-8 p-0"
            aria-label={isExpanded ? "Réduire le groupe" : "Développer le groupe"}
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Accordion Orders List */}
      {isExpanded && (
        <div className="border-t border-border divide-y divide-border">
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
