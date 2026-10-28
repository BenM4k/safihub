import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "./db";
import type {
  PartnerOnboarding,
  PartnerOnboardingStatus,
} from "@/services/db/schema";

export type {
  PartnerOnboarding,
  PartnerOnboardingStatus,
};
export type PartnerOnboardingData = PartnerOnboarding;

export async function getPartnerOnboarding(
  userId: string,
  tourId = "partner-main"
): Promise<PartnerOnboarding | null> {
  const [row] = await db
    .select()
    .from(schema.partnerOnboarding)
    .where(
      and(
        eq(schema.partnerOnboarding.userId, userId),
        eq(schema.partnerOnboarding.tourId, tourId)
      )
    )
    .limit(1);

  return row ?? null;
}

export async function upsertPartnerOnboarding(params: {
  userId: string;
  tourId?: string;
  version?: number;
  status: PartnerOnboardingStatus;
  lastStepId?: string | null;
  reminderCount?: number;
  startedAt?: Date | null;
  skippedAt?: Date | null;
  completedAt?: Date | null;
}): Promise<PartnerOnboarding> {
  const tourId = params.tourId ?? "partner-main";
  const version = params.version ?? 1;

  const now = new Date();
  const [upserted] = await db
    .insert(schema.partnerOnboarding)
    .values({
      userId: params.userId,
      tourId,
      version,
      status: params.status,
      lastStepId: params.lastStepId ?? null,
      reminderCount: params.reminderCount ?? 0,
      startedAt: params.startedAt ?? (params.status === "in_progress" ? now : null),
      skippedAt: params.skippedAt ?? (params.status === "skipped" ? now : null),
      completedAt: params.completedAt ?? (params.status === "completed" ? now : null),
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [schema.partnerOnboarding.userId, schema.partnerOnboarding.tourId],
      set: {
        status: params.status,
        version,
        ...(params.lastStepId !== undefined ? { lastStepId: params.lastStepId } : {}),
        ...(params.reminderCount !== undefined ? { reminderCount: params.reminderCount } : {}),
        ...(params.startedAt !== undefined
          ? { startedAt: params.startedAt }
          : params.status === "in_progress"
            ? {
                startedAt: sql`coalesce(${schema.partnerOnboarding.startedAt}, ${now})`,
              }
            : {}),
        ...(params.skippedAt !== undefined
          ? { skippedAt: params.skippedAt }
          : params.status === "skipped"
            ? { skippedAt: now }
            : {}),
        ...(params.completedAt !== undefined
          ? { completedAt: params.completedAt }
          : params.status === "completed"
            ? { completedAt: now }
            : {}),
        updatedAt: now,
      },
    })
    .returning();

  return upserted;
}

export async function incrementOnboardingReminder(
  userId: string,
  tourId = "partner-main",
  maxReminders = 2
): Promise<PartnerOnboarding> {
  const current = await getPartnerOnboarding(userId, tourId);
  const now = new Date();

  if (!current) {
    const [created] = await db
      .insert(schema.partnerOnboarding)
      .values({
        userId,
        tourId,
        version: 1,
        status: "in_progress",
        reminderCount: 1,
        startedAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  }

  const nextCount = current.reminderCount + 1;
  const nextStatus: PartnerOnboardingStatus =
    nextCount >= maxReminders ? "skipped" : current.status;

  const [updated] = await db
    .update(schema.partnerOnboarding)
    .set({
      reminderCount: nextCount,
      status: nextStatus,
      ...(nextStatus === "skipped" && !current.skippedAt ? { skippedAt: now } : {}),
      updatedAt: now,
    })
    .where(
      and(
        eq(schema.partnerOnboarding.userId, userId),
        eq(schema.partnerOnboarding.tourId, tourId)
      )
    )
    .returning();

  return updated;
}
