"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  addAdminOrderTimelineNote,
  adminConfirmFirstOrder,
  adminRejectFirstOrder,
  createManualAdminOrder,
  executeAdminOnBehalfAction,
  getAdminOrderDetail,
  listFilteredAdminOrdersForExport,
  resolveAdminDispute,
} from "@/services/admin";
import type {
  OrderDetailRecord,
  OrderEventRecord,
  OrderItemRecord,
  OrderListItemRecord,
} from "@/dal";
import { parseAdminOrdersSearchParams } from "@/lib/admin-orders-query";
import {
  approvalMethodEnum,
  orderStatusEnum,
} from "@/services/db/schema";

const orderIdSchema = z.string().uuid("Identifiant de commande invalide");

const createManualOrderSchema = z.object({
  idempotencyKey: z.string().uuid().optional(),
  customerPhone: z.string().trim().min(6, "Numéro de téléphone requis").max(32),
  customerName: z.string().trim().max(120).optional(),
  houseId: z.string().uuid("Pressing invalide"),
  customerNeighborhoodId: z.string().uuid("Quartier invalide"),
  landmark: z.string().trim().min(2, "Point de repère requis").max(500),
  pickupSlotStart: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Créneau de début invalide"),
  pickupSlotEnd: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Créneau de fin invalide"),
  source: z.enum(["whatsapp", "phone"]),
  items: z
    .array(
      z.object({
        serviceId: z.string().uuid("Service invalide"),
        itemId: z.string().uuid("Article invalide"),
        fabricId: z.string().uuid("Tissu invalide"),
        quantity: z.number().int().min(1).max(200),
      })
    )
    .min(1, "Au moins un article requis")
    .max(100),
});

const performOnBehalfSchema = z.object({
  orderId: orderIdSchema,
  targetStatus: z.enum(orderStatusEnum.enumValues),
  onBehalfOfHouseId: z.string().uuid("Pressing invalide"),
  reason: z.string().trim().max(500).optional(),
  note: z.string().trim().max(500).optional(),
  approvalMethod: z.enum(approvalMethodEnum.enumValues).optional(),
});

const addNoteSchema = z.object({
  orderId: orderIdSchema,
  note: z.string().trim().min(1, "La note ne peut pas être vide").max(1000),
});

const confirmFirstOrderSchema = z.object({
  orderId: orderIdSchema,
  note: z.string().trim().max(500).optional(),
});

const rejectFirstOrderSchema = z.object({
  orderId: orderIdSchema,
  reason: z.string().trim().min(1, "Un motif de rejet est obligatoire").max(500),
});

export async function createManualOrderAction(params: {
  idempotencyKey?: string;
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

  const parsed = createManualOrderSchema.safeParse(params);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données de commande invalides");
  }

  const res = await createManualAdminOrder({
    idempotencyKey: parsed.data.idempotencyKey,
    customerPhone: parsed.data.customerPhone,
    customerName: parsed.data.customerName,
    houseId: parsed.data.houseId,
    customerNeighborhoodId: parsed.data.customerNeighborhoodId,
    landmark: parsed.data.landmark,
    pickupSlotStart: new Date(parsed.data.pickupSlotStart),
    pickupSlotEnd: new Date(parsed.data.pickupSlotEnd),
    source: parsed.data.source,
    items: parsed.data.items,
    adminId: auth.value.user.id,
  });

  if (res.ok) {
    revalidateTag(CACHE_TAGS.order(res.value.orderId), "max");
    revalidateTag(CACHE_TAGS.adminDispatch, "max");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dispatch");
  }

  return res;
}

export async function performOnBehalfAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rawReason = formData.get("reason");
  const rawNote = formData.get("note");
  const rawMethod = formData.get("approvalMethod");

  const parsed = performOnBehalfSchema.safeParse({
    orderId: formData.get("orderId"),
    targetStatus: formData.get("targetStatus"),
    onBehalfOfHouseId: formData.get("onBehalfOfHouseId"),
    reason: typeof rawReason === "string" && rawReason.trim() ? rawReason : undefined,
    note: typeof rawNote === "string" && rawNote.trim() ? rawNote : undefined,
    approvalMethod: typeof rawMethod === "string" && rawMethod.trim() ? rawMethod : undefined,
  });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await executeAdminOnBehalfAction({
    orderId: parsed.data.orderId,
    targetStatus: parsed.data.targetStatus,
    adminId: auth.value.user.id,
    onBehalfOfHouseId: parsed.data.onBehalfOfHouseId,
    reason: parsed.data.reason,
    note: parsed.data.note,
    approvalMethod: parsed.data.approvalMethod,
  });

  if (res.ok) {
    revalidateTag(CACHE_TAGS.order(parsed.data.orderId), "max");
    revalidateTag(CACHE_TAGS.adminDispatch, "max");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dispatch");
  }

  return res;
}

export async function addOrderTimelineNoteAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = addNoteSchema.safeParse({
    orderId: formData.get("orderId"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await addAdminOrderTimelineNote({
    orderId: parsed.data.orderId,
    adminId: auth.value.user.id,
    note: parsed.data.note,
  });

  if (res.ok) {
    revalidateTag(CACHE_TAGS.order(parsed.data.orderId), "max");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  }

  return res;
}

export async function confirmFirstOrderAction(
  orderId: string,
  note?: string
): Promise<Result<void>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = confirmFirstOrderSchema.safeParse({ orderId, note });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await adminConfirmFirstOrder({
    orderId: parsed.data.orderId,
    adminId: auth.value.user.id,
    note: parsed.data.note,
  });

  if (res.ok) {
    revalidateTag(CACHE_TAGS.order(parsed.data.orderId), "max");
    revalidateTag(CACHE_TAGS.adminDispatch, "max");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
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

  const parsed = rejectFirstOrderSchema.safeParse({ orderId, reason });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await adminRejectFirstOrder({
    orderId: parsed.data.orderId,
    adminId: auth.value.user.id,
    reason: parsed.data.reason,
  });

  if (res.ok) {
    revalidateTag(CACHE_TAGS.order(parsed.data.orderId), "max");
    revalidateTag(CACHE_TAGS.adminDispatch, "max");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dispatch");
  }

  return res;
}

export async function getAdminOrderDetailAction(orderId: string): Promise<
  Result<{
    order: OrderDetailRecord;
    items: OrderItemRecord[];
    events: OrderEventRecord[];
  }>
> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = orderIdSchema.safeParse(orderId);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Identifiant de commande invalide");
  }

  return getAdminOrderDetail(parsed.data);
}

const resolveDisputeSchema = z.object({
  disputeId: z.string().uuid("INVALID_DISPUTE_ID"),
  resolution: z
    .string()
    .trim()
    .min(5, "RESOLUTION_TOO_SHORT")
    .max(1000, "INVALID_INPUT"),
  compensationAmount: z
    .number()
    .int("INVALID_COMPENSATION")
    .min(0, "INVALID_COMPENSATION")
    .max(10_000_000, "INVALID_COMPENSATION")
    .nullable()
    .optional(),
  currency: z.enum(["CDF", "USD"]).optional(),
});

export async function exportFilteredAdminOrdersAction(
  rawParams: Record<string, string | string[] | undefined>
): Promise<Result<OrderListItemRecord[]>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err("UNAUTHORIZED");

  const query = parseAdminOrdersSearchParams(rawParams);
  return listFilteredAdminOrdersForExport(query);
}

export async function resolveAdminDisputeAction(input: {
  disputeId: string;
  resolution: string;
  compensationAmount?: number | null;
  currency?: "CDF" | "USD";
}): Promise<Result<{ orderId: string; resolvedAt: Date }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err("UNAUTHORIZED");

  const parsed = resolveDisputeSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const code = firstIssue?.message;
    if (
      code === "INVALID_DISPUTE_ID" ||
      code === "RESOLUTION_TOO_SHORT" ||
      code === "INVALID_COMPENSATION"
    ) {
      return err(code);
    }
    return err("INVALID_INPUT");
  }

  const res = await resolveAdminDispute({
    disputeId: parsed.data.disputeId,
    resolution: parsed.data.resolution,
    compensationAmount: parsed.data.compensationAmount ?? null,
    currency: parsed.data.currency,
    adminId: auth.value.user.id,
  });

  if (res.ok) {
    revalidateTag(CACHE_TAGS.order(res.value.orderId), "max");
    revalidatePath(`/admin/orders/${res.value.orderId}`);
    revalidatePath("/admin/disputes");
    revalidatePath("/admin");
  }

  return res;
}

