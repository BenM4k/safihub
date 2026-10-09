"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, ok, type Result } from "@/lib/result";
import {
  acceptMissionService,
  completeDeliveryMissionService,
  completePickupMissionService,
  failDeliveryMissionService,
  failPickupMissionService,
  startDeliveryMissionService,
  startPickupMissionService,
  syncOfflineCourierActionsService,
  type OfflineSyncResult,
  type QueuedCourierAction,
} from "@/services/courier";
import { recordUploadedPhotoService } from "@/services/storage";

const missionIdSchema = z.object({
  missionId: z.string().uuid("Identifiant de mission invalide"),
});

export async function acceptMissionAction(
  missionId: string
): Promise<Result<{ missionId: string }>> {
  const auth = await requireRole(["courier", "admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = missionIdSchema.safeParse({ missionId });
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");

  const res = await acceptMissionService(auth.value.user.id, parsed.data.missionId);
  if (res.ok) {
    revalidatePath("/courier");
    revalidatePath(`/courier/missions/${missionId}`);
  }
  return res;
}

export async function startPickupMissionAction(
  missionId: string
): Promise<Result<{ missionId: string }>> {
  const auth = await requireRole(["courier", "admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = missionIdSchema.safeParse({ missionId });
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");

  const res = await startPickupMissionService(auth.value.user.id, parsed.data.missionId);
  if (res.ok) {
    revalidatePath("/courier");
    revalidatePath(`/courier/missions/${missionId}`);
  }
  return res;
}

const completePickupSchema = z.object({
  missionId: z.string().uuid("Identifiant de mission invalide"),
  items: z.array(
    z.object({
      orderItemId: z.string().uuid(),
      pickupQuantity: z.number().int().min(0, "Quantité invalide"),
      conditionNote: z.string().nullable().optional(),
      isFlagged: z.boolean().optional(),
    })
  ),
  onSiteApproved: z.boolean().optional(),
  note: z.string().nullable().optional(),
});

export async function completePickupMissionAction(
  input: z.infer<typeof completePickupSchema>
): Promise<Result<{ missionId: string; hasCountDiscrepancy: boolean }>> {
  const auth = await requireRole(["courier", "admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = completePickupSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");

  const res = await completePickupMissionService({
    courierId: auth.value.user.id,
    missionId: parsed.data.missionId,
    items: parsed.data.items,
    onSiteApproved: parsed.data.onSiteApproved,
    note: parsed.data.note,
  });

  if (res.ok) {
    revalidatePath("/courier");
    revalidatePath("/courier/history");
    revalidatePath(`/courier/missions/${parsed.data.missionId}`);
  }
  return res;
}

const failMissionSchema = z.object({
  missionId: z.string().uuid("Identifiant de mission invalide"),
  reason: z.string().min(2, "Le motif d'échec est requis"),
});

export async function failPickupMissionAction(
  input: z.infer<typeof failMissionSchema>
): Promise<Result<{ missionId: string }>> {
  const auth = await requireRole(["courier", "admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = failMissionSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");

  const res = await failPickupMissionService({
    courierId: auth.value.user.id,
    missionId: parsed.data.missionId,
    reason: parsed.data.reason,
  });

  if (res.ok) {
    revalidatePath("/courier");
    revalidatePath("/courier/history");
    revalidatePath(`/courier/missions/${parsed.data.missionId}`);
  }
  return res;
}

export async function startDeliveryMissionAction(
  missionId: string
): Promise<Result<{ missionId: string }>> {
  const auth = await requireRole(["courier", "admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = missionIdSchema.safeParse({ missionId });
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");

  const res = await startDeliveryMissionService(auth.value.user.id, parsed.data.missionId);
  if (res.ok) {
    revalidatePath("/courier");
    revalidatePath(`/courier/missions/${missionId}`);
  }
  return res;
}

const completeDeliverySchema = z.object({
  missionId: z.string().uuid("Identifiant de mission invalide"),
  confirmationCode: z.string().min(1, "Le code de confirmation est requis"),
  cashCollected: z.number().int().min(0, "Montant perçu invalide"),
  cashCurrency: z.enum(["CDF", "USD"]).default("CDF"),
});

export async function completeDeliveryMissionAction(
  input: z.infer<typeof completeDeliverySchema>
): Promise<Result<{ missionId: string; discrepancyFlagged: boolean }>> {
  const auth = await requireRole(["courier", "admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = completeDeliverySchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const res = await completeDeliveryMissionService({
    courierId: auth.value.user.id,
    missionId: parsed.data.missionId,
    confirmationCode: parsed.data.confirmationCode,
    cashCollected: parsed.data.cashCollected,
    cashCurrency: parsed.data.cashCurrency,
  });

  if (res.ok) {
    revalidatePath("/courier");
    revalidatePath("/courier/cash");
    revalidatePath("/courier/history");
    revalidatePath(`/courier/missions/${parsed.data.missionId}`);
  }
  return res;
}

export async function failDeliveryMissionAction(
  input: z.infer<typeof failMissionSchema>
): Promise<Result<{ missionId: string }>> {
  const auth = await requireRole(["courier", "admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = failMissionSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");

  const res = await failDeliveryMissionService({
    courierId: auth.value.user.id,
    missionId: parsed.data.missionId,
    reason: parsed.data.reason,
  });

  if (res.ok) {
    revalidatePath("/courier");
    revalidatePath("/courier/history");
    revalidatePath(`/courier/missions/${parsed.data.missionId}`);
  }
  return res;
}

const queuedActionBase = z.object({
  id: z.string().min(1),
  missionId: z.string().uuid("Identifiant de mission invalide"),
  timestamp: z.number(),
});

const queuedAcceptMissionSchema = queuedActionBase.extend({
  type: z.literal("accept_mission"),
  payload: z.record(z.string(), z.unknown()).default({}),
});

const queuedStartPickupSchema = queuedActionBase.extend({
  type: z.literal("start_pickup"),
  payload: z.record(z.string(), z.unknown()).default({}),
});

const queuedCompletePickupSchema = queuedActionBase.extend({
  type: z.literal("complete_pickup"),
  payload: completePickupSchema.omit({ missionId: true }),
});

const queuedFailPickupSchema = queuedActionBase.extend({
  type: z.literal("fail_pickup"),
  payload: failMissionSchema.omit({ missionId: true }),
});

const queuedStartDeliverySchema = queuedActionBase.extend({
  type: z.literal("start_delivery"),
  payload: z.record(z.string(), z.unknown()).default({}),
});

const queuedCompleteDeliverySchema = queuedActionBase.extend({
  type: z.literal("complete_delivery"),
  payload: completeDeliverySchema.omit({ missionId: true }),
});

const queuedFailDeliverySchema = queuedActionBase.extend({
  type: z.literal("fail_delivery"),
  payload: failMissionSchema.omit({ missionId: true }),
});

const queuedCourierActionSchema = z.discriminatedUnion("type", [
  queuedAcceptMissionSchema,
  queuedStartPickupSchema,
  queuedCompletePickupSchema,
  queuedFailPickupSchema,
  queuedStartDeliverySchema,
  queuedCompleteDeliverySchema,
  queuedFailDeliverySchema,
]);

const syncOfflineActionsSchema = z
  .array(queuedCourierActionSchema)
  .max(100, "Trop d'actions à synchroniser simultanément");

export async function syncOfflineCourierActionsAction(
  actions: QueuedCourierAction[]
): Promise<Result<OfflineSyncResult>> {
  const auth = await requireRole(["courier", "admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = syncOfflineActionsSchema.safeParse(actions);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Actions hors ligne invalides");
  }

  const res = await syncOfflineCourierActionsService({
    courierId: auth.value.user.id,
    actions: parsed.data as QueuedCourierAction[],
  });

  if (res.ok) {
    revalidatePath("/courier");
    revalidatePath("/courier/cash");
    revalidatePath("/courier/history");
  }
  return res;
}

const attachPhotoSchema = z.object({
  orderId: z.string().uuid("ID de commande invalide"),
  storageKey: z.string().min(1, "Clé de stockage requise"),
  type: z.enum(["pickup_condition", "delivery_proof", "dispute"]),
  orderItemId: z.string().uuid().optional(),
  missionId: z.string().uuid().optional(),
});

export async function attachOrderPhotoAction(
  input: z.infer<typeof attachPhotoSchema>
): Promise<Result<{ photoId: string }>> {
  const auth = await requireRole(["courier", "admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = attachPhotoSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const res = await recordUploadedPhotoService({
    user: { id: auth.value.user.id, role: auth.value.user.role },
    orderId: parsed.data.orderId,
    orderItemId: parsed.data.orderItemId,
    missionId: parsed.data.missionId,
    type: parsed.data.type,
    storageKey: parsed.data.storageKey,
  });

  if (!res.ok) return err(res.error);

  if (parsed.data.missionId) {
    revalidatePath(`/courier/missions/${parsed.data.missionId}`);
  }
  return ok({ photoId: res.value.photoId });
}
