"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireHouseAccess } from "@/services/auth";
import { err, ok, type Result } from "@/lib/result";
import {
  listPartnerOrders,
  getPartnerOrderTabCounts,
  getPartnerOrderDetail,
  acceptPartnerOrder,
  rejectPartnerOrder,
  markPartnerOrderReceived,
  startPartnerOrderWashing,
  markPartnerOrderReady,
  handoverPartnerOrderToCourier,
  reportPartnerOrderIssueActionService,
  type PartnerOrderDetailDTO,
} from "@/services/house/partner-order.service";
import type {
  PartnerOrderListItemDTO,
  PartnerOrderTabCounts,
  PartnerOrderTab,
} from "@/dal/partner-order.dal";
import type {
  OrderItemRecord,
  OrderEventRecord,
} from "@/dal/order.dal";

async function getAuthenticatedPartnerContext(houseSlug: string) {
  const authRes = await requireHouseAccess({ houseSlug });
  if (!authRes.ok) return authRes;

  const houseId = authRes.value.houseId;
  if (!houseId) {
    return err("Aucun atelier sélectionné ou associé à ce compte.");
  }

  return ok({
    user: authRes.value.user,
    houseId,
    actorRole: (authRes.value.user.role === "admin" ? "admin" : "house") as "admin" | "house",
  });
}

const listOrdersSchema = z.object({
  houseSlug: z.string().min(1),
  tab: z
    .enum(["to_accept", "to_collect", "in_treatment", "ready", "delivered", "failed"])
    .optional(),
  search: z.string().optional(),
  date: z.string().optional(),
  sort: z.enum(["deadline", "promised", "recent"]).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  offset: z.number().int().min(0).optional(),
});

export async function listPartnerOrdersAction(
  input: z.infer<typeof listOrdersSchema>
): Promise<Result<PartnerOrderListItemDTO[]>> {
  const parsed = listOrdersSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  const authCtx = await getAuthenticatedPartnerContext(parsed.data.houseSlug);
  if (!authCtx.ok) return authCtx;

  const limit = parsed.data.pageSize ?? parsed.data.limit ?? 50;
  const offset = parsed.data.page
    ? (parsed.data.page - 1) * limit
    : (parsed.data.offset ?? 0);

  return listPartnerOrders(authCtx.value.houseId, {
    tab: parsed.data.tab as PartnerOrderTab | undefined,
    search: parsed.data.search,
    date: parsed.data.date,
    sort: parsed.data.sort,
    limit,
    offset,
  });
}

const tabCountsSchema = z.object({
  houseSlug: z.string().min(1),
});

export async function getPartnerOrderTabCountsAction(
  input: z.infer<typeof tabCountsSchema>
): Promise<Result<PartnerOrderTabCounts>> {
  const parsed = tabCountsSchema.safeParse(input);
  if (!parsed.success) {
    return err("Slug d'atelier manquant");
  }

  const authCtx = await getAuthenticatedPartnerContext(parsed.data.houseSlug);
  if (!authCtx.ok) return authCtx;

  return getPartnerOrderTabCounts(authCtx.value.houseId);
}

const orderDetailSchema = z.object({
  houseSlug: z.string().min(1),
  orderId: z.string().uuid("ID de commande invalide"),
});

export async function getPartnerOrderDetailAction(
  input: z.infer<typeof orderDetailSchema>
): Promise<
  Result<{
    order: PartnerOrderDetailDTO;
    items: OrderItemRecord[];
    events: OrderEventRecord[];
  }>
> {
  const parsed = orderDetailSchema.safeParse(input);
  if (!parsed.success) {
    return err("Paramètres de commande invalides");
  }

  const authCtx = await getAuthenticatedPartnerContext(parsed.data.houseSlug);
  if (!authCtx.ok) return authCtx;

  return getPartnerOrderDetail(authCtx.value.houseId, parsed.data.orderId);
}

const orderActionSchema = z.object({
  houseSlug: z.string().min(1),
  orderId: z.string().uuid("ID de commande invalide"),
});

export async function acceptPartnerOrderAction(
  input: z.infer<typeof orderActionSchema>
): Promise<Result<void>> {
  const parsed = orderActionSchema.safeParse(input);
  if (!parsed.success) {
    return err("Paramètres de commande invalides");
  }

  const authCtx = await getAuthenticatedPartnerContext(parsed.data.houseSlug);
  if (!authCtx.ok) return authCtx;

  const res = await acceptPartnerOrder({
    houseId: authCtx.value.houseId,
    orderId: parsed.data.orderId,
    actorId: authCtx.value.user.id,
    actorRole: authCtx.value.actorRole,
  });

  if (res.ok) {
    revalidatePath(`/partner/${parsed.data.houseSlug}/orders`, "page");
    revalidatePath(`/partner/${parsed.data.houseSlug}`, "layout");
  }

  return res;
}

const rejectActionSchema = z.object({
  houseSlug: z.string().min(1),
  orderId: z.string().uuid("ID de commande invalide"),
  reason: z.string().min(1, "Le motif du refus est obligatoire"),
});

export async function rejectPartnerOrderAction(
  input: z.infer<typeof rejectActionSchema>
): Promise<Result<void>> {
  const parsed = rejectActionSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  const authCtx = await getAuthenticatedPartnerContext(parsed.data.houseSlug);
  if (!authCtx.ok) return authCtx;

  const res = await rejectPartnerOrder({
    houseId: authCtx.value.houseId,
    orderId: parsed.data.orderId,
    actorId: authCtx.value.user.id,
    actorRole: authCtx.value.actorRole,
    reason: parsed.data.reason,
  });

  if (res.ok) {
    revalidatePath(`/partner/${parsed.data.houseSlug}/orders`, "page");
    revalidatePath(`/partner/${parsed.data.houseSlug}`, "layout");
  }

  return res;
}

export async function markPartnerOrderReceivedAction(
  input: z.infer<typeof orderActionSchema>
): Promise<Result<void>> {
  const parsed = orderActionSchema.safeParse(input);
  if (!parsed.success) {
    return err("Paramètres de commande invalides");
  }

  const authCtx = await getAuthenticatedPartnerContext(parsed.data.houseSlug);
  if (!authCtx.ok) return authCtx;

  const res = await markPartnerOrderReceived({
    houseId: authCtx.value.houseId,
    orderId: parsed.data.orderId,
    actorId: authCtx.value.user.id,
    actorRole: authCtx.value.actorRole,
  });

  if (res.ok) {
    revalidatePath(`/partner/${parsed.data.houseSlug}/orders`, "page");
    revalidatePath(`/partner/${parsed.data.houseSlug}`, "layout");
  }

  return res;
}

export async function startPartnerOrderWashingAction(
  input: z.infer<typeof orderActionSchema>
): Promise<Result<void>> {
  const parsed = orderActionSchema.safeParse(input);
  if (!parsed.success) {
    return err("Paramètres de commande invalides");
  }

  const authCtx = await getAuthenticatedPartnerContext(parsed.data.houseSlug);
  if (!authCtx.ok) return authCtx;

  const res = await startPartnerOrderWashing({
    houseId: authCtx.value.houseId,
    orderId: parsed.data.orderId,
    actorId: authCtx.value.user.id,
    actorRole: authCtx.value.actorRole,
  });

  if (res.ok) {
    revalidatePath(`/partner/${parsed.data.houseSlug}/orders`, "page");
    revalidatePath(`/partner/${parsed.data.houseSlug}`, "layout");
  }

  return res;
}

export async function markPartnerOrderReadyAction(
  input: z.infer<typeof orderActionSchema>
): Promise<Result<void>> {
  const parsed = orderActionSchema.safeParse(input);
  if (!parsed.success) {
    return err("Paramètres de commande invalides");
  }

  const authCtx = await getAuthenticatedPartnerContext(parsed.data.houseSlug);
  if (!authCtx.ok) return authCtx;

  const res = await markPartnerOrderReady({
    houseId: authCtx.value.houseId,
    orderId: parsed.data.orderId,
    actorId: authCtx.value.user.id,
    actorRole: authCtx.value.actorRole,
  });

  if (res.ok) {
    revalidatePath(`/partner/${parsed.data.houseSlug}/orders`, "page");
    revalidatePath(`/partner/${parsed.data.houseSlug}`, "layout");
  }

  return res;
}

const handoverSchema = z.object({
  houseSlug: z.string().min(1),
  orderId: z.string().uuid("ID de commande invalide"),
  note: z.string().optional(),
});

export async function handoverPartnerOrderToCourierAction(
  input: z.infer<typeof handoverSchema>
): Promise<Result<void>> {
  const parsed = handoverSchema.safeParse(input);
  if (!parsed.success) {
    return err("Paramètres de commande invalides");
  }

  const authCtx = await getAuthenticatedPartnerContext(parsed.data.houseSlug);
  if (!authCtx.ok) return authCtx;

  const res = await handoverPartnerOrderToCourier({
    houseId: authCtx.value.houseId,
    orderId: parsed.data.orderId,
    actorId: authCtx.value.user.id,
    actorRole: authCtx.value.actorRole,
    note: parsed.data.note,
  });

  if (res.ok) {
    revalidatePath(`/partner/${parsed.data.houseSlug}/orders`, "page");
    revalidatePath(`/partner/${parsed.data.houseSlug}`, "layout");
  }

  return res;
}

const reportIssueSchema = z.object({
  houseSlug: z.string().min(1),
  orderId: z.string().uuid("ID de commande invalide"),
  reason: z.string().min(1, "Le motif de signalement est obligatoire"),
  note: z.string().optional(),
});

export async function reportPartnerOrderIssueAction(
  input: z.infer<typeof reportIssueSchema>
): Promise<Result<void>> {
  const parsed = reportIssueSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  const authCtx = await getAuthenticatedPartnerContext(parsed.data.houseSlug);
  if (!authCtx.ok) return authCtx;

  const res = await reportPartnerOrderIssueActionService({
    houseId: authCtx.value.houseId,
    orderId: parsed.data.orderId,
    actorId: authCtx.value.user.id,
    actorRole: authCtx.value.actorRole,
    reason: parsed.data.reason,
    note: parsed.data.note,
  });

  if (res.ok) {
    revalidatePath(`/partner/${parsed.data.houseSlug}/orders`, "page");
    revalidatePath(`/partner/${parsed.data.houseSlug}`, "layout");
  }

  return res;
}
