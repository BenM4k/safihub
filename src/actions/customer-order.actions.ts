"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/services/auth";
import { createGuestUser } from "@/dal/auth.dal";
import type { TimeSlot } from "@/services/availability";
import {
  approveCustomerPriceAdjustment,
  cancelCustomerOrder,
  confirmCustomerDeliverySlot,
  declineCustomerPriceAdjustment,
  estimateCustomerCart,
  openCustomerOrderDispute,
  placeCustomerOrder,
  type CartEstimateResult,
} from "@/services/order";
import type { CartLineItemInput, CheckoutInput } from "@/services/order/validation";

export interface CheckoutActionResult {
  success: boolean;
  orderId?: string;
  trackingToken?: string;
  code?: string;
  error?: string;
  failureCode?: string;
  details?: Record<string, unknown>;
  nextAvailableSlot?: TimeSlot | null;
}

export async function getCartEstimateAction(
  houseId: string,
  items: CartLineItemInput[],
  customerNeighborhoodId?: string
): Promise<{ success: boolean; data?: CartEstimateResult; error?: string }> {
  const res = await estimateCustomerCart(houseId, items, customerNeighborhoodId);
  if (!res.ok) {
    return { success: false, error: res.error };
  }
  return { success: true, data: res.value };
}

export async function checkoutOrderAction(
  input: Omit<CheckoutInput, "customerId"> & { customerName?: string }
): Promise<CheckoutActionResult> {
  const user = await getCurrentUser();
  let customerId = user?.id;

  if (!customerId) {
    // Guest checkout
    const guestRes = await createGuestUser({
      name: input.customerName || "Client Invité",
      phone: input.contactPhone,
    });
    if (!guestRes.ok) {
      return { success: false, error: "Impossible de créer le compte invité." };
    }
    customerId = guestRes.value.id;
  }

  const res = await placeCustomerOrder({
    ...input,
    customerId,
  });

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message,
      failureCode: res.error.code,
      details: res.error.details,
      nextAvailableSlot: res.error.nextAvailableSlot,
    };
  }

  revalidatePath("/orders");
  revalidatePath("/house/orders");
  revalidatePath("/admin/orders");

  return {
    success: true,
    orderId: res.value.orderId,
    trackingToken: res.value.trackingToken,
    code: res.value.code,
  };
}

export async function cancelOrderAction(
  orderId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté pour annuler." };
  }

  const res = await cancelCustomerOrder(orderId, user.id, reason);
  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/house/orders");
  return { success: true };
}

export async function approvePriceAdjustmentAction(
  orderId: string,
  method: "app" | "tracking_link" = "app"
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  const actorId = user?.id || "guest-customer";

  const res = await approveCustomerPriceAdjustment(orderId, actorId, method);
  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  return { success: true };
}

export async function declinePriceAdjustmentAction(
  orderId: string,
  method: "app" | "tracking_link" = "app",
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  const actorId = user?.id || "guest-customer";

  const res = await declineCustomerPriceAdjustment(orderId, actorId, method, reason);
  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  return { success: true };
}

export async function confirmDeliverySlotAction(
  orderId: string,
  slotStart: string,
  slotEnd: string,
  method: "app" | "tracking_link" = "app"
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  const actorId = user?.id || "guest-customer";

  const res = await confirmCustomerDeliverySlot(
    orderId,
    actorId,
    { start: new Date(slotStart), end: new Date(slotEnd) },
    method
  );

  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  return { success: true };
}

export async function openDisputeAction(
  orderId: string,
  formData: FormData
): Promise<{ success: boolean; disputeId?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté pour ouvrir un litige." };
  }

  const type = (formData.get("type")?.toString() || "other") as
    | "loss"
    | "damage"
    | "payment"
    | "other";
  const description = formData.get("description")?.toString() || "";

  if (!description.trim()) {
    return { success: false, error: "Veuillez fournir un motif détaillé du litige." };
  }

  const res = await openCustomerOrderDispute(orderId, user.id, {
    type,
    description,
  });

  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/admin/orders");
  return { success: true, disputeId: res.value.disputeId };
}
