"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { CourierMissionDetail } from "@/dal";
import { useCourierStore } from "@/lib/stores/courier-store";
import {
  startPickupMissionAction,
  completePickupMissionAction,
  failPickupMissionAction,
  attachOrderPhotoAction,
} from "@/actions/courier.actions";
import { enqueueOfflinePhoto } from "@/lib/offline/offline-photo-store";

export interface ItemState {
  orderItemId: string;
  declaredQuantity: number;
  pickupQuantity: number;
  conditionNote: string;
  isFlagged: boolean;
  hasPhoto: boolean;
}

export function usePickupChecklist(detail: CourierMissionDetail) {
  const t = useTranslations("courier.pickup");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [onSiteApproved, setOnSiteApproved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isOnline = useCourierStore((s) => s.isOnline);
  const enqueueAction = useCourierStore((s) => s.enqueueAction);

  const [items, setItems] = useState<ItemState[]>(() =>
    detail.items.map((it) => {
      const photosForItem = detail.photos.filter((p) => p.orderItemId === it.id);
      return {
        orderItemId: it.id,
        declaredQuantity: it.declaredQuantity,
        pickupQuantity: it.pickupQuantity ?? it.declaredQuantity,
        conditionNote: it.conditionNote ?? "",
        isFlagged: Boolean(it.isFlagged),
        hasPhoto: photosForItem.length > 0,
      };
    })
  );

  const totalDeclared = items.reduce((sum, i) => sum + i.declaredQuantity, 0);
  const totalCounted = items.reduce((sum, i) => sum + i.pickupQuantity, 0);
  const hasDiscrepancy = totalCounted !== totalDeclared;

  const handleStartPickup = () => {
    setErrorMessage(null);
    startTransition(async () => {
      if (!isOnline) {
        enqueueAction({ type: "start_pickup", missionId: detail.mission.id, payload: {} });
        router.refresh();
        return;
      }
      const res = await startPickupMissionAction(detail.mission.id);
      if (!res.ok) setErrorMessage(res.error);
      else router.refresh();
    });
  };

  const handleUpdateQuantity = (orderItemId: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.orderItemId === orderItemId
          ? { ...it, pickupQuantity: Math.max(0, it.pickupQuantity + delta) }
          : it
      )
    );
  };

  const handleToggleFlagged = (orderItemId: string) => {
    setItems((prev) =>
      prev.map((it) => (it.orderItemId === orderItemId ? { ...it, isFlagged: !it.isFlagged } : it))
    );
  };

  const handleAttachPhoto = (orderItemId: string) => {
    const storageKey = `photos/pickup_${detail.mission.orderId}_${orderItemId}_${Date.now()}.webp`;
    setItems((prev) =>
      prev.map((it) =>
        it.orderItemId === orderItemId ? { ...it, hasPhoto: true } : it
      )
    );

    if (isOnline) {
      startTransition(async () => {
        await attachOrderPhotoAction({
          orderId: detail.mission.orderId,
          orderItemId,
          missionId: detail.mission.id,
          type: "pickup_condition",
          storageKey,
        });
      });
    } else {
      enqueueOfflinePhoto({
        id: `offline_photo_${Date.now()}`,
        orderId: detail.mission.orderId,
        orderItemId,
        missionId: detail.mission.id,
        type: "pickup_condition",
        blob: new Blob(["offline-photo"], { type: "image/webp" }),
        sizeBytes: 1024,
        timestamp: Date.now(),
      }).catch((e) => console.warn(e));
    }
  };

  const handleCompletePickup = () => {
    setErrorMessage(null);
    const missingPhotoItem = items.find((i) => i.isFlagged && !i.hasPhoto);
    if (missingPhotoItem) {
      setErrorMessage(t("photoRequired"));
      return;
    }

    startTransition(async () => {
      const payloadItems = items.map((i) => ({
        orderItemId: i.orderItemId,
        pickupQuantity: i.pickupQuantity,
        conditionNote: i.conditionNote || null,
        isFlagged: i.isFlagged,
      }));

      if (!isOnline) {
        enqueueAction({
          type: "complete_pickup",
          missionId: detail.mission.id,
          payload: { items: payloadItems, onSiteApproved },
        });
        router.push("/courier");
        return;
      }

      const res = await completePickupMissionAction({
        missionId: detail.mission.id,
        items: payloadItems,
        onSiteApproved,
      });

      if (!res.ok) setErrorMessage(res.error);
      else router.push("/courier");
    });
  };

  const handleFailPickup = (reason: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      if (!isOnline) {
        enqueueAction({ type: "fail_pickup", missionId: detail.mission.id, payload: { reason } });
        setShowFailureModal(false);
        router.push("/courier");
        return;
      }
      const res = await failPickupMissionAction({ missionId: detail.mission.id, reason });
      if (!res.ok) setErrorMessage(res.error);
      else {
        setShowFailureModal(false);
        router.push("/courier");
      }
    });
  };

  return {
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
  };
}
