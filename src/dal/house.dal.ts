import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema } from "./db";

export interface HouseMembershipInfo {
  houseId: string;
  userId: string;
  houseName: string;
  isActive: boolean;
  isPaused: boolean;
}

/**
 * Retrieves all laundry houses that a given user is an authorized member/staff of.
 */
export async function getUserHouseMemberships(
  userId: string
): Promise<HouseMembershipInfo[]> {
  const rows = await db
    .select({
      houseId: schema.houseMembers.houseId,
      userId: schema.houseMembers.userId,
      houseName: schema.houses.name,
      isActive: schema.houses.isActive,
      isPaused: schema.houses.isPaused,
    })
    .from(schema.houseMembers)
    .innerJoin(schema.houses, eq(schema.houseMembers.houseId, schema.houses.id))
    .where(eq(schema.houseMembers.userId, userId));

  return rows;
}

/**
 * Checks whether a user has staff access to a specific laundry house.
 */
export async function checkUserHouseAccess(
  userId: string,
  houseId: string
): Promise<boolean> {
  const [membership] = await db
    .select({ houseId: schema.houseMembers.houseId })
    .from(schema.houseMembers)
    .where(
      and(
        eq(schema.houseMembers.userId, userId),
        eq(schema.houseMembers.houseId, houseId)
      )
    )
    .limit(1);

  return !!membership;
}

/**
 * Assigns a user as a staff member of a laundry house.
 */
export async function addHouseMember({
  houseId,
  userId,
}: {
  houseId: string;
  userId: string;
}): Promise<void> {
  await db
    .insert(schema.houseMembers)
    .values({
      houseId,
      userId,
    })
    .onConflictDoNothing();
}
