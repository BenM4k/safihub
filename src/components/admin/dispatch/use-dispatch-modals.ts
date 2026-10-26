"use client";

import { useState } from "react";
import type { EnrichedDispatchOrder, PressingGroup } from "@/lib/dispatch-grouping";

export function useDispatchModals() {
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<EnrichedDispatchOrder | null>(null);

  const [outcomeModal, setOutcomeModal] = useState<{
    isOpen: boolean;
    pressingId: string;
    pressingName: string;
    orderIds: string[];
    channel: "call" | "whatsapp";
  }>({
    isOpen: false,
    pressingId: "",
    pressingName: "",
    orderIds: [],
    channel: "call",
  });

  const [reassignModal, setReassignModal] = useState<{
    isOpen: boolean;
    orderId: string;
    orderCode?: string;
    currentHouseId: string;
    currentHouseName?: string;
  }>({
    isOpen: false,
    orderId: "",
    currentHouseId: "",
  });

  function openOrderOutcome(ord: EnrichedDispatchOrder, channel: "call" | "whatsapp") {
    setOutcomeModal({
      isOpen: true,
      pressingId: ord.houseId,
      pressingName: ord.houseName || "Pressing",
      orderIds: [ord.id],
      channel,
    });
  }

  function openGroupOutcome(grp: PressingGroup, channel: "call" | "whatsapp") {
    setOutcomeModal({
      isOpen: true,
      pressingId: grp.houseId,
      pressingName: grp.houseName,
      orderIds: grp.orderIds,
      channel,
    });
  }

  function openReassign(ord: EnrichedDispatchOrder) {
    setReassignModal({
      isOpen: true,
      orderId: ord.id,
      orderCode: ord.code,
      currentHouseId: ord.houseId,
      currentHouseName: ord.houseName,
    });
  }

  function closeOutcomeModal() {
    setOutcomeModal((prev) => ({ ...prev, isOpen: false }));
  }

  function closeReassignModal() {
    setReassignModal((prev) => ({ ...prev, isOpen: false }));
  }

  return {
    selectedOrderForDetails,
    setSelectedOrderForDetails,
    outcomeModal,
    reassignModal,
    openOrderOutcome,
    openGroupOutcome,
    openReassign,
    closeOutcomeModal,
    closeReassignModal,
  };
}
