"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CourierMissionDetail } from "@/dal";
import { useCourierStore } from "@/lib/stores/courier-store";
import {
  startDeliveryMissionAction,
  completeDeliveryMissionAction,
  failDeliveryMissionAction,
} from "@/actions/courier.actions";

export function useDeliveryForm(detail: CourierMissionDetail) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [confirmationCode, setConfirmationCode] = useState("");
  const [cashCollected, setCashCollected] = useState(
    detail.mission.totalDue.toString()
  );
  const [currency, setCurrency] = useState<"CDF" | "USD">("CDF");

  const isOnline = useCourierStore((s) => s.isOnline);
  const enqueueAction = useCourierStore((s) => s.enqueueAction);

  const enteredCashNum = parseInt(cashCollected || "0", 10);

  const handleStartDelivery = () => {
    setErrorMessage(null);
    startTransition(async () => {
      if (!isOnline) {
        enqueueAction({
          type: "start_delivery",
          missionId: detail.mission.id,
          payload: {},
        });
        router.refresh();
        return;
      }

      const res = await startDeliveryMissionAction(detail.mission.id);
      if (!res.ok) {
        setErrorMessage(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleCompleteDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!confirmationCode || confirmationCode.trim().length === 0) {
      setErrorMessage("Le code de confirmation est requis");
      return;
    }

    startTransition(async () => {
      if (!isOnline) {
        enqueueAction({
          type: "complete_delivery",
          missionId: detail.mission.id,
          payload: {
            confirmationCode: confirmationCode.trim(),
            cashCollected: enteredCashNum,
            cashCurrency: currency,
          },
        });
        router.push("/courier");
        return;
      }

      const res = await completeDeliveryMissionAction({
        missionId: detail.mission.id,
        confirmationCode: confirmationCode.trim(),
        cashCollected: enteredCashNum,
        cashCurrency: currency,
      });

      if (!res.ok) {
        setErrorMessage(res.error);
      } else {
        router.push("/courier");
      }
    });
  };

  const handleFailDelivery = (reason: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      if (!isOnline) {
        enqueueAction({
          type: "fail_delivery",
          missionId: detail.mission.id,
          payload: { reason },
        });
        setShowFailureModal(false);
        router.push("/courier");
        return;
      }

      const res = await failDeliveryMissionAction({
        missionId: detail.mission.id,
        reason,
      });

      if (!res.ok) {
        setErrorMessage(res.error);
      } else {
        setShowFailureModal(false);
        router.push("/courier");
      }
    });
  };

  return {
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
  };
}
