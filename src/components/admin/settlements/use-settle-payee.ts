"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { settleHouseAction, settleCourierAction } from "@/actions/admin-settlements.actions";
import type { PayeeSettlementTarget, SettlementReceiptData } from "./types";

interface UseSettlePayeeOptions {
  target: PayeeSettlementTarget | null;
  defaultPeriod?: string;
  onSettlementSuccess: (receipt: SettlementReceiptData) => void;
  onClose: () => void;
}

export function useSettlePayee({
  target,
  defaultPeriod = "",
  onSettlementSuccess,
  onClose,
}: UseSettlePayeeOptions) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState<number>(target?.balanceOwedCDF ?? 0);
  const [method, setMethod] = useState<"mobile_money" | "bank" | "cash">("mobile_money");
  const [reference, setReference] = useState("");
  const [period, setPeriod] = useState(defaultPeriod);
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isHouse = target?.type === "house";

  const handleNextToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!target) return;
    if (amount <= 0) {
      setErrorMsg("Le montant doit être supérieur à zéro");
      return;
    }
    if (amount > target.balanceOwedCDF) {
      setErrorMsg(`Le montant ne peut pas dépasser ${target.balanceOwedCDF.toLocaleString()} CDF`);
      return;
    }
    if (method !== "cash" && !reference.trim()) {
      setErrorMsg("Une référence de transaction est obligatoire pour ce mode");
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!target) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        amount,
        currency: "CDF" as const,
        method,
        reference: reference.trim() || undefined,
        period: period.trim() || undefined,
        note: note.trim() || undefined,
      };

      const res = isHouse
        ? await settleHouseAction({ ...payload, houseId: target.id })
        : await settleCourierAction({ ...payload, courierId: target.id });

      if (!res.ok) {
        setErrorMsg(res.error || "Échec de l'enregistrement du règlement");
        setStep(1);
        return;
      }

      const receipt: SettlementReceiptData = {
        settlementId: res.value.settlementId,
        payeeName: target.name,
        payeeType: target.type,
        payeeSubtitle: target.subtitle,
        amount,
        currency: "CDF",
        method,
        reference: reference.trim() || undefined,
        period: period.trim() || undefined,
        note: note.trim() || undefined,
        createdAt: new Date(),
        newBalanceCDF: res.value.newBalanceCDF,
      };

      router.refresh();
      onClose();
      onSettlementSuccess(receipt);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Une erreur inattendue est survenue"
      );
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    amount,
    setAmount,
    method,
    setMethod,
    reference,
    setReference,
    period,
    setPeriod,
    note,
    setNote,
    errorMsg,
    isSubmitting,
    handleNextToConfirm,
    handleFinalSubmit,
  };
}
