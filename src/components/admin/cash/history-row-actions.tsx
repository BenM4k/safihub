"use client";

import { useState } from "react";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { reverseCourierReconciliationAction } from "@/actions/admin-cash.actions";
import { useRouter } from "next/navigation";

interface HistoryRowActionsProps {
  reconciliationId: string;
  courierName: string;
  businessDate: string;
  isCancelled: boolean;
}

export function HistoryRowActions({
  reconciliationId,
  courierName,
  businessDate,
  isCancelled,
}: HistoryRowActionsProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (isCancelled) {
    return (
      <span className="text-xs text-muted-foreground italic">
        Annulée
      </span>
    );
  }

  const handleConfirmReversal = async (reason?: string) => {
    if (!reason?.trim()) {
      return { ok: false, error: "Un motif d'annulation est requis." };
    }

    const res = await reverseCourierReconciliationAction({
      reconciliationId,
      reason: reason.trim(),
    });

    if (res.ok) {
      router.refresh();
      return { ok: true };
    }

    return { ok: false, error: res.error || "Échec de l'annulation" };
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsConfirmOpen(true)}
        className="min-h-[40px] h-10 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive-light/60 gap-1.5 focus-visible:ring-2 focus-visible:ring-destructive rounded-lg"
        title="Annuler cette écriture de réconciliation"
      >
        <Undo2 className="size-3.5" />
        <span>Annuler</span>
      </Button>

      {isConfirmOpen && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmReversal}
          title="Annuler l'écriture de réconciliation"
          description={
            <div className="space-y-2">
              <p>
                Vous êtes sur le point d&apos;annuler la réconciliation du coursier{" "}
                <span className="font-bold text-heading">{courierName}</span> pour la date du{" "}
                <span className="font-bold text-heading">{businessDate}</span>.
              </p>
              <p className="p-2.5 bg-destructive-light text-destructive-base rounded-lg border border-destructive-base/20 font-medium">
                Conséquence comptable : Une contre-passation compensatoire sera inscrite dans le grand livre. L&apos;écriture d&apos;origine restera visible avec la mention Annulée et ne sera jamais supprimée.
              </p>
            </div>
          }
          confirmLabel="Confirmer l'annulation"
          variant="destructive"
          requireReason={true}
          reasonLabel="Motif obligatoire de l'annulation"
          reasonPlaceholder="Ex. Erreur de comptage des billets, saisie erronée..."
        />
      )}
    </>
  );
}
