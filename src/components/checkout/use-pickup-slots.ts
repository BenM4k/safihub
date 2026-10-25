"use client";

import { useEffect, useState } from "react";
import { getPickupSlotsAction } from "@/actions/customer-order.actions";
import type { TimeSlot } from "@/services/availability";

interface SlotsState {
  houseId: string;
  neighborhoodId: string;
  slots: TimeSlot[];
  serverProposedSlot: TimeSlot | null;
  reason: string | null;
}

export function usePickupSlots(
  houseId: string | null | undefined,
  neighborhoodId: string | null | undefined
) {
  const [data, setData] = useState<SlotsState | null>(null);
  const [override, setOverride] = useState<{
    key: string;
    slot: TimeSlot | null;
  } | null>(null);

  const currentKey = `${houseId ?? ""}:${neighborhoodId ?? ""}`;

  useEffect(() => {
    if (!houseId || !neighborhoodId) {
      return;
    }

    let isMounted = true;

    getPickupSlotsAction(houseId, neighborhoodId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success) {
          setData({
            houseId,
            neighborhoodId,
            slots: res.slots,
            serverProposedSlot: res.nextAvailableSlot,
            reason: res.reason ?? null,
          });
        } else {
          setData({
            houseId,
            neighborhoodId,
            slots: [],
            serverProposedSlot: res.nextAvailableSlot,
            reason: res.reason ?? "Impossible de charger les créneaux",
          });
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setData({
          houseId,
          neighborhoodId,
          slots: [],
          serverProposedSlot: null,
          reason: "Erreur de connexion",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [houseId, neighborhoodId]);

  const hasParams = Boolean(houseId && neighborhoodId);
  const matchesCurrentParams =
    data !== null &&
    data.houseId === houseId &&
    data.neighborhoodId === neighborhoodId;

  const activeOverride =
    override?.key === currentKey ? override.slot : undefined;

  const nextProposedSlot =
    activeOverride !== undefined
      ? activeOverride
      : hasParams && matchesCurrentParams && data !== null
      ? data.serverProposedSlot
      : null;

  return {
    slots: hasParams && matchesCurrentParams && data !== null ? data.slots : [],
    nextProposedSlot,
    setNextProposedSlot: (slot: TimeSlot | null) =>
      setOverride({ key: currentKey, slot }),
    isLoading: hasParams && !matchesCurrentParams,
    reason:
      hasParams && matchesCurrentParams && data !== null ? data.reason : null,
  };
}
