"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCDF, formatOrderRef } from "@/lib/dispatch-urgency";
import { DispatchOrderSheetParties } from "./dispatch-order-sheet-parties";
import { DispatchOrderSheetActions } from "./dispatch-order-sheet-actions";
import type { EnrichedDispatchOrder } from "@/lib/dispatch-grouping";

interface DispatchOrderDetailsSheetProps {
  order: EnrichedDispatchOrder | null;
  onClose: () => void;
  onOpenOutcomeModal: (order: EnrichedDispatchOrder, channel: "call" | "whatsapp") => void;
  onOpenReassignDialog: (order: EnrichedDispatchOrder) => void;
}

export function DispatchOrderDetailsSheet({
  order,
  onClose,
  onOpenOutcomeModal,
  onOpenReassignDialog,
}: DispatchOrderDetailsSheetProps) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  function copyId() {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const orderRef = formatOrderRef(order.code, order.id);

  return (
    <Sheet open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg h-full p-0 flex flex-col border-l border-border bg-background"
      >
        {/* Header with prominent code and compact channel badge */}
        <SheetHeader className="px-6 py-4 border-b border-border bg-muted/20 shrink-0 space-y-0 text-left">
          <div className="flex items-center gap-2.5">
            <SheetTitle className="font-mono text-lg font-bold text-foreground">
              {orderRef}
            </SheetTitle>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground capitalize">
              Canal: {order.source}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Détails opérationnels et suivi de la relance
          </p>
        </SheetHeader>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* UUID with copy */}
          <div className="flex items-center justify-between">
            <div className="min-w-0 mr-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Identifiant complet
              </p>
              <p className="font-mono text-xs text-foreground truncate select-all">
                {order.id}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyId}
              className="h-8 px-2.5 text-xs font-semibold gap-1 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copié</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-muted-foreground" />
                  <span>Copier</span>
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Pressing and Customer */}
          <DispatchOrderSheetParties order={order} />

          <Separator />

          {/* Financial summary */}
          <div className="text-xs space-y-1.5 py-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Montant commande</span>
              <span className="font-mono text-foreground font-semibold">
                {formatCDF(order.totalDue)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Frais de livraison</span>
              <span className="font-mono text-foreground">
                {formatCDF(order.deliveryFee)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <DispatchOrderSheetActions
          order={order}
          onOpenOutcomeModal={onOpenOutcomeModal}
          onOpenReassignDialog={onOpenReassignDialog}
        />
      </SheetContent>
    </Sheet>
  );
}
