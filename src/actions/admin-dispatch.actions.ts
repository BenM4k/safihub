"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { assignMissionToCourier } from "@/services/admin";

const assignMissionSchema = z.object({
  missionId: z.string().uuid("Mission invalide"),
  courierId: z.string().min(1, "Coursier requis"),
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
    revalidatePath("/admin/dispatch");
    if (parsed.data.orderId) {
      revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    }
  }

  return res;
}

const logRelanceSchema = z.object({
  pressingId: z.string().uuid("Identifiant pressing invalide"),
  orderIds: z.array(z.string().uuid("Identifiant commande invalide")).min(1, "Au moins une commande requise"),
  channel: z.enum(["call", "whatsapp"]),
  outcome: z.enum(["no_answer", "will_accept", "refused", "call_back_later", "pending"]).optional(),
  note: z.string().max(500).optional(),
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

  const { logPressingFollowUp } = await import("@/services/admin");
  const res = await logPressingFollowUp({
    ...parsed.data,
    adminId: auth.value.user.id,
    adminName: auth.value.user.name || "Opérateur",
  });

  if (res.ok) {
    revalidatePath("/admin/dispatch");
    for (const ordId of parsed.data.orderIds) {
      revalidatePath(`/admin/orders/${ordId}`);
    }
  }

  return res;
}

const reassignOrderSchema = z.object({
  orderId: z.string().uuid("Identifiant commande invalide"),
  newHouseId: z.string().uuid("Nouveau pressing requis"),
  reason: z.string().max(500).optional(),
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

  const { reassignOrderPressingService } = await import("@/services/admin");
  const res = await reassignOrderPressingService({
    orderId: parsed.data.orderId,
    newHouseId: parsed.data.newHouseId,
    adminId: auth.value.user.id,
    reason: parsed.data.reason,
  });

  if (res.ok) {
    revalidatePath("/admin/dispatch");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  }

  return res;
}

