"use client";

import { useTranslations } from "next-intl";
import { Play, CheckCircle2, XCircle, AlertTriangle, KeyRound } from "lucide-react";
import type { CourierMissionDetail } from "@/dal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeliveryFailureDialog } from "./delivery-failure-dialog";
import { DeliveryCashCard } from "./delivery-cash-card";
import { useDeliveryForm } from "./use-delivery-form";

interface DeliveryCompletionFormProps {
  detail: CourierMissionDetail;
}

export function DeliveryCompletionForm({
  detail,
}: DeliveryCompletionFormProps) {
  const t = useTranslations("courier.delivery");
  const {
    isPending,
    showFailureModal,
    setShowFailureModal,
    errorMessage,
    confirmationCode,
    setConfirmationCode,
    cashCollected,
    setCashCollected,
    currency,
    setCurrency,
    handleStartDelivery,
    handleCompleteDelivery,
    handleFailDelivery,
  } = useDeliveryForm(detail);

  const isAcceptedOnly = detail.mission.status === "accepted";

  if (isAcceptedOnly) {
    return (
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="size-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">
            {t("instructions")}
          </p>
          <Button
            onClick={handleStartDelivery}
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 text-sm rounded-xl shadow-xs"
          >
            <Play className="size-4 mr-2" />
            <span>Démarrer la livraison</span>
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

      <form onSubmit={handleCompleteDelivery} className="space-y-4">
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1 text-center">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
            {t("totalDue")}
          </span>
          <p className="text-2xl font-black text-blue-950 font-mono">
            {detail.mission.totalDue.toLocaleString()} CDF
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <KeyRound className="size-3.5 text-blue-600" />
            <span>{t("codeTitle")}</span>
          </label>
          <Input
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            placeholder={t("codePlaceholder")}
            maxLength={8}
            required
            className="text-center font-mono text-lg font-bold tracking-widest h-11 rounded-xl"
          />
          <p className="text-[11px] text-slate-500 leading-tight">
            {t("codeHelp")}
          </p>
        </div>

        <DeliveryCashCard
          cashCollected={cashCollected}
          currency={currency}
          totalDue={detail.mission.totalDue}
          onCashChange={setCashCollected}
          onCurrencyChange={setCurrency}
        />

        <div className="pt-2 space-y-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 text-sm rounded-xl shadow-xs"
          >
            <CheckCircle2 className="size-4 mr-2" />
            <span>{isPending ? t("completing") : t("completeBtn")}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFailureModal(true)}
            disabled={isPending}
            className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 h-10 text-xs rounded-xl"
          >
            <XCircle className="size-3.5 mr-1.5" />
            <span>{t("failBtn")}</span>
          </Button>
        </div>
      </form>

      <DeliveryFailureDialog
        isOpen={showFailureModal}
        onClose={() => setShowFailureModal(false)}
        onSubmit={handleFailDelivery}
        isSubmitting={isPending}
      />
    </div>
  );
}
