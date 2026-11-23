"use server";

import { z } from "zod";
import { requireRole } from "@/services/auth";
import {
  upsertPartnerOnboarding,
  incrementOnboardingReminder,
  type PartnerOnboardingStatus,
} from "@/dal";
import { err, ok, type Result } from "@/lib/result";
import {
  trackTourCompleted,
  trackStepViewed,
  trackStepSkipped,
  trackTourReplayed,
} from "@/services/analytics/analytics.service";

const stepUpdateSchema = z.object({
  tourId: z.string().min(1).max(64).optional().default("partner-main"),
  stepId: z.string().min(1).max(64),
  status: z.enum(["not_started", "in_progress", "skipped", "completed"]),
});

const tourParamsSchema = z.object({
  tourId: z.string().min(1).max(64).optional().default("partner-main"),
  stepId: z.string().min(1).max(64).optional(),
});

export async function updateOnboardingStepAction(
  params: z.input<typeof stepUpdateSchema>
): Promise<Result<{ status: PartnerOnboardingStatus; lastStepId: string | null }>> {
  const auth = await requireRole(["house", "admin"]);
  if (!auth.ok) {
    return err("Accès réservé aux partenaires pressing.");
  }
  const user = auth.value.user;

  const parsed = stepUpdateSchema.safeParse(params);
  if (!parsed.success) {
    return err("Données de visite invalides.");
  }

  const row = await upsertPartnerOnboarding({
    userId: user.id,
    tourId: parsed.data.tourId,
    status: parsed.data.status,
    lastStepId: parsed.data.stepId,
  });

  if (parsed.data.status === "completed") {
    await trackTourCompleted({
      userId: user.id,
      tourId: parsed.data.tourId,
    });
  } else if (parsed.data.status === "in_progress") {
    await trackStepViewed({
      userId: user.id,
      tourId: parsed.data.tourId,
      stepId: parsed.data.stepId,
    });
  }

  return ok({
    status: row.status,
    lastStepId: row.lastStepId,
  });
}

export async function skipOnboardingTourAction(params?: {
  tourId?: string;
  stepId?: string;
}): Promise<Result<{ success: boolean }>> {
  const auth = await requireRole(["house", "admin"]);
  if (!auth.ok) {
    return err("Accès réservé aux partenaires pressing.");
  }
  const user = auth.value.user;

  const parsed = tourParamsSchema.safeParse(params ?? {});
  if (!parsed.success) {
    return err("Données de visite invalides.");
  }

  const { tourId, stepId } = parsed.data;
  await upsertPartnerOnboarding({
    userId: user.id,
    tourId,
    status: "skipped",
    skippedAt: new Date(),
  });

  await trackStepSkipped({
    userId: user.id,
    tourId,
    stepId,
  });

  return ok({ success: true });
}

export async function resetOnboardingTourAction(params?: {
  tourId?: string;
}): Promise<Result<{ success: boolean }>> {
  const auth = await requireRole(["house", "admin"]);
  if (!auth.ok) {
    return err("Accès réservé aux partenaires pressing.");
  }
  const user = auth.value.user;

  const parsed = tourParamsSchema.safeParse(params ?? {});
  if (!parsed.success) {
    return err("Données de visite invalides.");
  }

  const { tourId } = parsed.data;
  await upsertPartnerOnboarding({
    userId: user.id,
    tourId,
    status: "in_progress",
    lastStepId: "welcome",
    reminderCount: 0,
    startedAt: new Date(),
  });

  await trackTourReplayed({
    userId: user.id,
    tourId,
  });

  return ok({ success: true });
}

export async function recordOnboardingReminderAction(params?: {
  tourId?: string;
}): Promise<Result<{ reminderCount: number; status: PartnerOnboardingStatus }>> {
  const auth = await requireRole(["house", "admin"]);
  if (!auth.ok) {
    return err("Accès réservé aux partenaires pressing.");
  }
  const user = auth.value.user;

  const parsed = tourParamsSchema.safeParse(params ?? {});
  if (!parsed.success) {
    return err("Données de visite invalides.");
  }

  const { tourId } = parsed.data;
  const updated = await incrementOnboardingReminder(user.id, tourId, 2);

  return ok({
    reminderCount: updated.reminderCount,
    status: updated.status,
  });
}
