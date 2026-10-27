"use server";

import { z } from "zod";
import { getCurrentUser } from "@/services/auth";
import {
  upsertPartnerOnboarding,
  incrementOnboardingReminder,
  type PartnerOnboardingStatus,
} from "@/dal";
import { err, ok, type Result } from "@/lib/result";
import { capturePostHogEvent } from "@/services/analytics/posthog-client";

const stepUpdateSchema = z.object({
  tourId: z.string().optional().default("partner-main"),
  stepId: z.string().min(1),
  status: z.enum(["not_started", "in_progress", "skipped", "completed"]),
});

export async function updateOnboardingStepAction(
  params: z.input<typeof stepUpdateSchema>
): Promise<Result<{ status: PartnerOnboardingStatus; lastStepId: string | null }>> {
  const user = await getCurrentUser();
  if (!user) {
    return err("Session expirée.");
  }

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
    await capturePostHogEvent({
      event: "tour_completed",
      distinctId: user.id,
      properties: {
        tourId: parsed.data.tourId,
      },
    });
  } else if (parsed.data.status === "in_progress") {
    await capturePostHogEvent({
      event: "step_viewed",
      distinctId: user.id,
      properties: {
        tourId: parsed.data.tourId,
        stepId: parsed.data.stepId,
      },
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
  const user = await getCurrentUser();
  if (!user) {
    return err("Session expirée.");
  }

  const tourId = params?.tourId ?? "partner-main";
  await upsertPartnerOnboarding({
    userId: user.id,
    tourId,
    status: "skipped",
    skippedAt: new Date(),
  });

  await capturePostHogEvent({
    event: "step_skipped",
    distinctId: user.id,
    properties: {
      tourId,
      stepId: params?.stepId,
    },
  });

  return ok({ success: true });
}

export async function resetOnboardingTourAction(params?: {
  tourId?: string;
}): Promise<Result<{ success: boolean }>> {
  const user = await getCurrentUser();
  if (!user) {
    return err("Session expirée.");
  }

  const tourId = params?.tourId ?? "partner-main";
  await upsertPartnerOnboarding({
    userId: user.id,
    tourId,
    status: "in_progress",
    lastStepId: "welcome",
    reminderCount: 0,
    startedAt: new Date(),
  });

  await capturePostHogEvent({
    event: "tour_replayed",
    distinctId: user.id,
    properties: {
      tourId,
    },
  });

  return ok({ success: true });
}

export async function recordOnboardingReminderAction(params?: {
  tourId?: string;
}): Promise<Result<{ reminderCount: number; status: PartnerOnboardingStatus }>> {
  const user = await getCurrentUser();
  if (!user) {
    return err("Session expirée.");
  }

  const tourId = params?.tourId ?? "partner-main";
  const updated = await incrementOnboardingReminder(user.id, tourId, 2);

  return ok({
    reminderCount: updated.reminderCount,
    status: updated.status,
  });
}
