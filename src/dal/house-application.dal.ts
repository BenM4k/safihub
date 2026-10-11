import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "./db";
import type { ApplicationStatus } from "@/services/db/schema";

export interface HouseApplicationRecord {
  id: string;
  houseName: string;
  contactName: string;
  phone: string;
  email: string;
  neighborhoodId: string | null;
  neighborhoodText: string | null;
  neighborhoodName?: string | null;
  addressNote: string | null;
  servicesNote: string | null;
  hoursNote: string | null;
  message: string | null;
  status: ApplicationStatus;
  adminNote: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdHouseId: string | null;
  createdAt: Date;
}

export async function createHouseApplication(data: {
  houseName: string;
  contactName: string;
  phone: string;
  email: string;
  neighborhoodId?: string | null;
  neighborhoodText?: string | null;
  addressNote?: string | null;
  servicesNote?: string | null;
  hoursNote?: string | null;
  message?: string | null;
}): Promise<HouseApplicationRecord> {
  const [created] = await db
    .insert(schema.houseApplications)
    .values({
      houseName: data.houseName.trim(),
      contactName: data.contactName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim().toLowerCase(),
      neighborhoodId: data.neighborhoodId ?? null,
      neighborhoodText: data.neighborhoodText?.trim() ?? null,
      addressNote: data.addressNote?.trim() ?? null,
      servicesNote: data.servicesNote?.trim() ?? null,
      hoursNote: data.hoursNote?.trim() ?? null,
      message: data.message?.trim() ?? null,
      status: "pending",
    })
    .returning();

  return created!;
}

export async function getHouseApplicationById(
  id: string
): Promise<HouseApplicationRecord | null> {
  const [row] = await db
    .select({
      id: schema.houseApplications.id,
      houseName: schema.houseApplications.houseName,
      contactName: schema.houseApplications.contactName,
      phone: schema.houseApplications.phone,
      email: schema.houseApplications.email,
      neighborhoodId: schema.houseApplications.neighborhoodId,
      neighborhoodText: schema.houseApplications.neighborhoodText,
      neighborhoodName: schema.neighborhoods.name,
      addressNote: schema.houseApplications.addressNote,
      servicesNote: schema.houseApplications.servicesNote,
      hoursNote: schema.houseApplications.hoursNote,
      message: schema.houseApplications.message,
      status: schema.houseApplications.status,
      adminNote: schema.houseApplications.adminNote,
      reviewedBy: schema.houseApplications.reviewedBy,
      reviewedAt: schema.houseApplications.reviewedAt,
      createdHouseId: schema.houseApplications.createdHouseId,
      createdAt: schema.houseApplications.createdAt,
    })
    .from(schema.houseApplications)
    .leftJoin(
      schema.neighborhoods,
      eq(schema.houseApplications.neighborhoodId, schema.neighborhoods.id)
    )
    .where(eq(schema.houseApplications.id, id))
    .limit(1);

  return row ?? null;
}

export async function listHouseApplications(options?: {
  status?: ApplicationStatus;
  limit?: number;
  offset?: number;
}): Promise<{ applications: HouseApplicationRecord[]; total: number }> {
  const whereClause = options?.status
    ? eq(schema.houseApplications.status, options.status)
    : undefined;

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.houseApplications)
      .where(whereClause),
    db
      .select({
        id: schema.houseApplications.id,
        houseName: schema.houseApplications.houseName,
        contactName: schema.houseApplications.contactName,
        phone: schema.houseApplications.phone,
        email: schema.houseApplications.email,
        neighborhoodId: schema.houseApplications.neighborhoodId,
        neighborhoodText: schema.houseApplications.neighborhoodText,
        neighborhoodName: schema.neighborhoods.name,
        addressNote: schema.houseApplications.addressNote,
        servicesNote: schema.houseApplications.servicesNote,
        hoursNote: schema.houseApplications.hoursNote,
        message: schema.houseApplications.message,
        status: schema.houseApplications.status,
        adminNote: schema.houseApplications.adminNote,
        reviewedBy: schema.houseApplications.reviewedBy,
        reviewedAt: schema.houseApplications.reviewedAt,
        createdHouseId: schema.houseApplications.createdHouseId,
        createdAt: schema.houseApplications.createdAt,
      })
      .from(schema.houseApplications)
      .leftJoin(
        schema.neighborhoods,
        eq(schema.houseApplications.neighborhoodId, schema.neighborhoods.id)
      )
      .where(whereClause)
      .orderBy(desc(schema.houseApplications.createdAt))
      .limit(options?.limit ?? 50)
      .offset(options?.offset ?? 0),
  ]);

  return {
    applications: rows,
    total: countResult[0]?.count ?? 0,
  };
}

export async function updateHouseApplication(
  id: string,
  data: {
    status?: ApplicationStatus;
    adminNote?: string | null;
    reviewedBy?: string | null;
    reviewedAt?: Date | null;
    createdHouseId?: string | null;
  }
): Promise<HouseApplicationRecord | null> {
  const [updated] = await db
    .update(schema.houseApplications)
    .set({
      ...(data.status ? { status: data.status } : {}),
      ...(data.adminNote !== undefined ? { adminNote: data.adminNote } : {}),
      ...(data.reviewedBy !== undefined ? { reviewedBy: data.reviewedBy } : {}),
      ...(data.reviewedAt !== undefined ? { reviewedAt: data.reviewedAt } : {}),
      ...(data.createdHouseId !== undefined
        ? { createdHouseId: data.createdHouseId }
        : {}),
    })
    .where(eq(schema.houseApplications.id, id))
    .returning();

  return updated ?? null;
}

export async function isHouseSlugAvailable(slug: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: schema.houses.id })
    .from(schema.houses)
    .where(eq(schema.houses.slug, slug))
    .limit(1);

  return !existing;
}

export async function approveHouseApplicationTransaction(params: {
  applicationId: string;
  adminUserId: string;
  adminNote?: string | null;
  house: {
    name: string;
    slug: string;
    neighborhoodId: string;
    addressNote?: string | null;
    contactPhone?: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    contactPhone?: string | null;
  };
}): Promise<{ houseId: string; userId: string; houseSlug: string }> {
  return await db.transaction(async (tx) => {
    // 1. Create house (isActive: false until configured)
    const [createdHouse] = await tx
      .insert(schema.houses)
      .values({
        name: params.house.name.trim(),
        slug: params.house.slug.trim(),
        neighborhoodId: params.house.neighborhoodId,
        addressNote: params.house.addressNote ?? null,
        contactPhone: params.house.contactPhone ?? null,
        isActive: false,
        isPaused: false,
      })
      .returning({ id: schema.houses.id, slug: schema.houses.slug });

    const houseId = createdHouse!.id;

    // 2. Check if user already exists with that email
    const [existingUser] = await tx
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, params.user.email.toLowerCase()))
      .limit(1);

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
      await tx
        .update(schema.user)
        .set({ role: "house", updatedAt: new Date() })
        .where(eq(schema.user.id, userId));
    } else {
      userId = params.user.id;
      await tx.insert(schema.user).values({
        id: userId,
        name: params.user.name.trim(),
        email: params.user.email.toLowerCase().trim(),
        role: "house",
        contactPhone: params.user.contactPhone ?? null,
        isGuest: false,
        status: "active",
        banned: false,
      });
    }

    // 3. Link user to house
    await tx
      .insert(schema.houseMembers)
      .values({ houseId, userId })
      .onConflictDoNothing();

    // 4. Update application status
    await tx
      .update(schema.houseApplications)
      .set({
        status: "approved",
        adminNote: params.adminNote ?? null,
        reviewedBy: params.adminUserId,
        reviewedAt: new Date(),
        createdHouseId: houseId,
      })
      .where(eq(schema.houseApplications.id, params.applicationId));

    return { houseId, userId, houseSlug: createdHouse!.slug };
  });
}
