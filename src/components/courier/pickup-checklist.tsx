"use client";

import { useTranslations } from "next-intl";
import { Check, AlertTriangle, Play, XCircle } from "lucide-react";
import type { CourierMissionDetail } from "@/dal";
import { Button } from "@/components/ui/button";
import { PickupFailureDialog } from "./pickup-failure-dialog";
import { PickupItemRow } from "./pickup-item-row";
import { PickupDiscrepancyCard } from "./pickup-discrepancy-card";
import { usePickupChecklist } from "./use-pickup-checklist";

interface PickupChecklistProps {
  detail: CourierMissionDetail;
}

export function PickupChecklist({ detail }: PickupChecklistProps) {
  const t = useTranslations("courier.pickup");
  const {
    items,
    isPending,
    showFailureModal,
    setShowFailureModal,
    onSiteApproved,
    setOnSiteApproved,
    errorMessage,
    totalDeclared,
    totalCounted,
    hasDiscrepancy,
    handleStartPickup,
    handleUpdateQuantity,
    handleToggleFlagged,
    handleAttachPhoto,
    handleCompletePickup,
    handleFailPickup,
  } = usePickupChecklist(detail);

  if (detail.mission.status === "accepted") {
    return (
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="size-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">{t("instructions")}</p>
          <Button
            onClick={handleStartPickup}
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 text-sm rounded-xl shadow-xs"
          >
            <Play className="size-4 mr-2" />
            <span>Démarrer la collecte</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="size-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          {t("itemsTitle")}
        </h2>
        {items.map((item) => {
          const original = detail.items.find((i) => i.id === item.orderItemId);
          return (
            <PickupItemRow
              key={item.orderItemId}
              name={original?.itemName || original?.customLabel || "Article"}
              fabricName={original?.fabricName}
              declaredQuantity={item.declaredQuantity}
              pickupQuantity={item.pickupQuantity}
              isFlagged={item.isFlagged}
              hasPhoto={item.hasPhoto}
              onUpdateQuantity={(delta) => handleUpdateQuantity(item.orderItemId, delta)}
              onToggleFlagged={() => handleToggleFlagged(item.orderItemId)}
              onAttachPhoto={() => handleAttachPhoto(item.orderItemId)}
            />
          );
        })}
      </div>

      {hasDiscrepancy && (
        <PickupDiscrepancyCard
          totalCounted={totalCounted}
          totalDeclared={totalDeclared}
          onSiteApproved={onSiteApproved}
          onToggleApproval={setOnSiteApproved}
        />
      )}

      <div className="pt-2 space-y-2">
        <Button
          onClick={handleCompletePickup}
          disabled={isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 text-sm rounded-xl shadow-xs"
        >
          <Check className="size-4 mr-2" />
          <span>{isPending ? t("completing") : t("completeBtn")}</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowFailureModal(true)}
          disabled={isPending}
          className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 h-10 text-xs rounded-xl"
        >
          <XCircle className="size-3.5 mr-1.5" />
          <span>{t("failBtn")}</span>
        </Button>
      </div>

      <PickupFailureDialog
        isOpen={showFailureModal}
        onClose={() => setShowFailureModal(false)}
        onSubmit={handleFailPickup}
        isSubmitting={isPending}
      />
    </div>
  );
}
