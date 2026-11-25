"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  assignMissionToCourier,
  logPressingFollowUp,
  reassignOrderPressingService,
} from "@/services/admin";

const assignMissionSchema = z.object({
  missionId: z.string().uuid("Mission invalide"),
  courierId: z.string().trim().min(1, "Coursier requis").max(128),
  orderId: z.string().uuid().optional(),
});

export async function assignMissionAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = assignMissionSchema.safeParse({
    missionId: formData.get("missionId"),
    courierId: formData.get("courierId"),
    orderId: formData.get("orderId") || undefined,
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await assignMissionToCourier({
    missionId: parsed.data.missionId,
    orderId: parsed.data.orderId,
    courierId: parsed.data.courierId,
    adminId: auth.value.user.id,
  });

  if (res.ok) {
    revalidateTag(CACHE_TAGS.adminDispatch, "max");
    revalidateTag(CACHE_TAGS.courierMissions(parsed.data.courierId), "max");
    revalidatePath("/admin/dispatch");
    if (parsed.data.orderId) {
      revalidateTag(CACHE_TAGS.order(parsed.data.orderId), "max");
      revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    }
  }

  return res;
}

const logRelanceSchema = z.object({
  pressingId: z.string().uuid("Identifiant pressing invalide"),
  orderIds: z
    .array(z.string().uuid("Identifiant commande invalide"))
    .min(1, "Au moins une commande requise")
    .max(100, "Trop de commandes sélectionnées"),
  channel: z.enum(["call", "whatsapp"]),
  outcome: z.enum(["no_answer", "will_accept", "refused", "call_back_later", "pending"]).optional(),
  note: z.string().trim().max(500).optional(),
});

export async function logPressingRelanceAction(data: {
  pressingId: string;
  orderIds: string[];
  channel: "call" | "whatsapp";
  outcome?: "no_answer" | "will_accept" | "refused" | "call_back_later" | "pending";
  note?: string;
}): Promise<Result<void>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = logRelanceSchema.safeParse(data);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await logPressingFollowUp({
    ...parsed.data,
    adminId: auth.value.user.id,
    adminName: auth.value.user.name || "Opérateur",
  });

  if (res.ok) {
    revalidateTag(CACHE_TAGS.adminDispatch, "max");
    revalidatePath("/admin/dispatch");
    for (const ordId of parsed.data.orderIds) {
      revalidateTag(CACHE_TAGS.order(ordId), "max");
      revalidatePath(`/admin/orders/${ordId}`);
    }
  }

  return res;
}

const reassignOrderSchema = z.object({
  orderId: z.string().uuid("Identifiant commande invalide"),
  newHouseId: z.string().uuid("Nouveau pressing requis"),
  reason: z.string().trim().max(500).optional(),
});

export async function reassignOrderPressingAction(data: {
  orderId: string;
  newHouseId: string;
  reason?: string;
}): Promise<Result<void>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = reassignOrderSchema.safeParse(data);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await reassignOrderPressingService({
    orderId: parsed.data.orderId,
    newHouseId: parsed.data.newHouseId,
    adminId: auth.value.user.id,
    reason: parsed.data.reason,
  });

  if (res.ok) {
    revalidateTag(CACHE_TAGS.adminDispatch, "max");
    revalidateTag(CACHE_TAGS.order(parsed.data.orderId), "max");
    revalidatePath("/admin/dispatch");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  }

  return res;
}

