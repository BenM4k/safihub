"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { checkoutOrderAction } from "@/actions/customer-order.actions";
import type { TimeSlot } from "@/services/availability";
import type { CartLineItemInput } from "@/services/order/validation";

interface CartStateInput {
  houseId: string | null;
  items: CartLineItemInput[];
  clearCart: () => void;
}

interface UseCheckoutSubmitParams {
  idempotencyKey: string;
  cart: CartStateInput;
  neighborhoodId: string | null;
  landmark: string;
  phone: string;
  customerName: string;
  selectedSlot: TimeSlot | null;
  user: { id: string } | null | undefined;
  setNextProposedSlot: (slot: TimeSlot | null) => void;
  setPriceChangeDetails: (details: Record<string, unknown> | null) => void;
}

export function useCheckoutSubmit({
  idempotencyKey,
  cart,
  neighborhoodId,
  landmark,
  phone,
  customerName,
  selectedSlot,
  user,
  setNextProposedSlot,
  setPriceChangeDetails,
}: UseCheckoutSubmitParams) {
  const router = useRouter();
  const t = useTranslations("checkout");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedSlot) {
      setServerError(t("selectSlotError"));
      return;
    }
    if (!neighborhoodId) {
      setServerError(t("selectNeighborhoodError"));
      return;
    }
    if (!landmark.trim()) {
      setServerError(t("landmarkError"));
      return;
    }
    if (!phone.trim()) {
      setServerError(t("phoneError"));
      return;
    }

    setServerError(null);
    setIsSubmitting(true);

    const res = await checkoutOrderAction({
      idempotencyKey,
      houseId: cart.houseId!,
      customerNeighborhoodId: neighborhoodId,
      landmark: landmark.trim(),
      contactPhone: phone.trim(),
      customerName: customerName.trim(),
      pickupSlot: selectedSlot,
      items: cart.items.map((i) => ({
        houseItemId: i.houseItemId,
        serviceId: i.serviceId,
        itemId: i.itemId,
        fabricId: i.fabricId,
        quantity: i.quantity,
        expectedUnitPrice: i.expectedUnitPrice,
      })),
      source: "app",
      paymentCurrency: "CDF",
    });

    setIsSubmitting(false);

    if (!res.success) {
      setServerError(res.error || t("generalError"));
      if (res.nextAvailableSlot) {
        setNextProposedSlot(res.nextAvailableSlot);
      }
      if (res.failureCode === "PRICE_CHANGED" && res.details) {
        setPriceChangeDetails(res.details);
      }
      return;
    }

    cart.clearCart();
    if (user) {
      router.push(`/orders/${res.orderId}`);
    } else {
      router.push(`/track/${res.trackingToken}`);
    }
  };

  return {
    isSubmitting,
    serverError,
    setServerError,
    submitOrder,
  };
}
