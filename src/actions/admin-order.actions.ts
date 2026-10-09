"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  addAdminOrderTimelineNote,
  adminConfirmFirstOrder,
  adminRejectFirstOrder,
  createManualAdminOrder,
  executeAdminOnBehalfAction,
} from "@/services/admin";
import type { ApprovalMethod, OrderStatus } from "@/services/db/schema";

export async function createManualOrderAction(params: {
  customerPhone: string;
  customerName?: string;
  houseId: string;
  customerNeighborhoodId: string;
  landmark: string;
  pickupSlotStart: string;
  pickupSlotEnd: string;
  source: "whatsapp" | "phone";
  items: Array<{
    serviceId: string;
    itemId: string;
    fabricId: string;
    quantity: number;
  }>;
}): Promise<Result<{ orderId: string; code: string; trackingToken: string }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await createManualAdminOrder({
    customerPhone: params.customerPhone,
    customerName: params.customerName,
    houseId: params.houseId,
    customerNeighborhoodId: params.customerNeighborhoodId,
    landmark: params.landmark,
    pickupSlotStart: new Date(params.pickupSlotStart),
    pickupSlotEnd: new Date(params.pickupSlotEnd),
    source: params.source,
    items: params.items,
    adminId: auth.value.user.id,
  });

  if (res.ok) {
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dispatch");
  }

  return res;
}

export async function performOnBehalfAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const orderId = String(formData.get("orderId"));
  const targetStatus = String(formData.get("targetStatus")) as OrderStatus;
  const onBehalfOfHouseId = String(formData.get("onBehalfOfHouseId"));
  const reason = formData.get("reason") ? String(formData.get("reason")) : undefined;
  const note = formData.get("note") ? String(formData.get("note")) : undefined;
  const approvalMethod = formData.get("approvalMethod")
    ? (String(formData.get("approvalMethod")) as ApprovalMethod)
    : undefined;

  const res = await executeAdminOnBehalfAction({
    orderId,
    targetStatus,
    adminId: auth.value.user.id,
    onBehalfOfHouseId,
    reason,
    note,
    approvalMethod,
  });

  if (res.ok) {
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dispatch");
  }

  return res;
}

export async function addOrderTimelineNoteAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const orderId = String(formData.get("orderId"));
  const note = String(formData.get("note"));

  const res = await addAdminOrderTimelineNote({
    orderId,
    adminId: auth.value.user.id,
    note,
  });

  if (res.ok) {
    revalidatePath(`/admin/orders/${orderId}`);
  }

  return res;
}

export async function confirmFirstOrderAction(
  orderId: string,
  note?: string
): Promise<Result<void>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await adminConfirmFirstOrder({
    orderId,
    adminId: auth.value.user.id,
    note,
  });

  if (res.ok) {
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dispatch");
  }

  return res;
}

export async function rejectFirstOrderAction(
  orderId: string,
  reason: string
): Promise<Result<void>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await adminRejectFirstOrder({
    orderId,
    adminId: auth.value.user.id,
    reason,
  });

  if (res.ok) {
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dispatch");
  }

  return res;
}
