"use client";

import { AlertTriangle } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { toggleHouseActiveStatusAction } from "@/actions/admin-house.actions";
import type { AdminHouseRow } from "./types";

interface HouseSuspendDialogProps {
  house: AdminHouseRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function HouseSuspendDialog({
  house,
  isOpen,
  onClose,
  onSuccess,
}: HouseSuspendDialogProps) {
  if (!house) return null;

  const isSuspending = house.isActive;

  const handleConfirm = async (reason?: string) => {
    const res = await toggleHouseActiveStatusAction({
      houseId: house.id,
      isActive: !house.isActive,
      reason,
    });

    if (res.ok) {
      onSuccess();
    }
    return res;
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={isSuspending ? `Suspendre ${house.name}` : `Réactiver ${house.name}`}
      variant={isSuspending ? "destructive" : "primary"}
      confirmLabel={isSuspending ? "Confirmer la suspension" : "Réactiver le pressing"}
      cancelLabel="Annuler"
      requireReason={isSuspending}
      reasonLabel={isSuspending ? "Motif obligatoire de suspension" : "Motif de réactivation"}
      reasonPlaceholder={
        isSuspending
          ? "ex: Pénurie d'eau / coupure prolongée, maintenance des machines..."
          : "ex: Reprise normale des opérations..."
      }
      description={
        <div className="space-y-3">
          {isSuspending ? (
            <>
              <p>
                Vous êtes sur le point de suspendre temporairement le pressing{" "}
                <span className="font-bold text-heading">{house.name}</span> sur la plateforme.
              </p>

              {house.activeOrdersCount > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">
                      Attention : {house.activeOrdersCount} commande(s) en cours
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      La suspension empêche la prise de nouvelles commandes par les clients mais n&apos;annule pas les commandes en cours de traitement par ce pressing.
                    </p>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-ink-600">
                Cette action est journalisée avec l&apos;identité de l&apos;opérateur, la date et le motif saisi ci-dessous.
              </p>
            </>
          ) : (
            <p>
              Le pressing <span className="font-bold text-heading">{house.name}</span> sera immédiatement réactivé et apparaîtra à nouveau dans les résultats de recherche des clients selon ses horaires d&apos;ouverture.
            </p>
          )}
        </div>
      }
    />
  );
}
