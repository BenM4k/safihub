import "server-only";
import { and, count, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { err, ok, type Result } from "@/lib/result";
import { db, schema } from "./db";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: string | null;
  status: string;
  banned: boolean | null;
  banReason: string | null;
  isGuest: boolean;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
  houseId?: string | null;
  houseName?: string | null;
  lastLoginAt?: Date | null;
}

export interface AdminCustomerRecord extends UserRecord {
  ordersCount: number;
  totalSpentCDF: number;
  lastOrderAt: Date | null;
  hasActiveOrders: boolean;
  firstOrderSource: string | null;
}

export async function searchUsers(params?: {
  query?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<UserRecord[]> {
  const conditions = [];

  if (params?.role && params.role !== "all") {
    conditions.push(eq(schema.user.role, params.role));
  }

  if (params?.status && params.status !== "all") {
    conditions.push(eq(schema.user.status, params.status));
  }

  if (params?.query && params.query.trim()) {
    const q = `%${params.query.trim()}%`;
    conditions.push(
      or(
        ilike(schema.user.name, q),
        ilike(schema.user.email, q),
        ilike(schema.user.contactPhone, q)
      )
    );
  }

  let query = db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      emailVerified: schema.user.emailVerified,
      image: schema.user.image,
      role: schema.user.role,
      status: schema.user.status,
      banned: schema.user.banned,
      banReason: schema.user.banReason,
      isGuest: schema.user.isGuest,
      contactPhone: schema.user.contactPhone,
      createdAt: schema.user.createdAt,
      updatedAt: schema.user.updatedAt,
      houseId: sql<string | null>`(
        select hm.house_id from ${schema.houseMembers} hm 
        where hm.user_id = ${schema.user.id} 
        limit 1
      )`,
      houseName: sql<string | null>`(
        select h.name from ${schema.houseMembers} hm 
        join ${schema.houses} h on h.id = hm.house_id 
        where hm.user_id = ${schema.user.id} 
        limit 1
      )`,
      lastLoginAt: sql<Date | null>`(
        select max(s.created_at) from ${schema.session} s 
        where s.user_id = ${schema.user.id}
      )`,
    })
    .from(schema.user)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.user.createdAt))
    .$dynamic();

  if (params?.limit !== undefined) {
    query = query.limit(params.limit);
  }
  if (params?.offset !== undefined) {
    query = query.offset(params.offset);
  }

  return await query;
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await db.delete(schema.session).where(eq(schema.session.userId, userId));
}

export async function blockUserAndRevokeSessions(
  userId: string,
  banReason: string
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(schema.user)
      .set({
        banned: true,
        status: "blocked",
        banReason,
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, userId));

    await tx.delete(schema.session).where(eq(schema.session.userId, userId));
  });
}

export async function countActiveAdmins(): Promise<number> {
  const result = await db
    .select({ count: count(schema.user.id) })
    .from(schema.user)
    .where(
      and(
        eq(schema.user.role, "admin"),
        or(eq(schema.user.status, "active"), eq(schema.user.status, "invitation_sent")),
        or(eq(schema.user.banned, false), sql`${schema.user.banned} is null`)
      )
    );
  return result[0]?.count ?? 0;
}

export async function blockAdminUserWithGuard(params: {
  userId: string;
  reason: string;
  isTargetActiveAdmin: boolean;
}): Promise<Result<void>> {
  try {
    return await db.transaction(async (tx) => {
      if (params.isTargetActiveAdmin) {
        const activeAdmins = await tx
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(
            and(
              eq(schema.user.role, "admin"),
              or(eq(schema.user.status, "active"), eq(schema.user.status, "invitation_sent")),
              or(eq(schema.user.banned, false), sql`${schema.user.banned} is null`)
            )
          )
          .for("update");

        if (activeAdmins.length <= 1) {
          return err(
            "Impossible de bloquer le dernier administrateur actif de la plateforme."
          );
        }
      }

      await tx
        .update(schema.user)
        .set({
          banned: true,
          status: "blocked",
          banReason: params.reason.trim(),
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, params.userId));

      await tx.delete(schema.session).where(eq(schema.session.userId, params.userId));

      return ok(undefined);
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to block user");
  }
}

export async function updateUserRoleWithHouseAndGuard(params: {
  userId: string;
  newRole: string;
  houseId?: string | null;
  isTargetActiveAdminDemotion: boolean;
}): Promise<Result<void>> {
  try {
    return await db.transaction(async (tx) => {
      if (params.isTargetActiveAdminDemotion) {
        const activeAdmins = await tx
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(
            and(
              eq(schema.user.role, "admin"),
              or(eq(schema.user.status, "active"), eq(schema.user.status, "invitation_sent")),
              or(eq(schema.user.banned, false), sql`${schema.user.banned} is null`)
            )
          )
          .for("update");

        if (activeAdmins.length <= 1) {
          return err(
            "Impossible de modifier le rôle du dernier administrateur actif de la plateforme."
          );
        }
      }

      await tx
        .update(schema.user)
        .set({
          role: params.newRole,
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, params.userId));

      await tx
        .delete(schema.houseMembers)
        .where(eq(schema.houseMembers.userId, params.userId));

      if (params.newRole === "house" && params.houseId) {
        await tx.insert(schema.houseMembers).values({
          houseId: params.houseId,
          userId: params.userId,
        });
      }

      return ok(undefined);
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update user role");
  }
}

export async function updateUserRoleWithHouse(params: {
  userId: string;
  role: string;
  houseId?: string | null;
}): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(schema.user)
      .set({
        role: params.role,
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, params.userId));

    await tx
      .delete(schema.houseMembers)
      .where(eq(schema.houseMembers.userId, params.userId));

    if (params.role === "house" && params.houseId) {
      await tx.insert(schema.houseMembers).values({
        houseId: params.houseId,
        userId: params.userId,
      });
    }
  });
}

export async function createStaffUser(data: {
  id: string;
  name: string;
  email: string;
  role: "courier" | "house" | "admin";
  contactPhone?: string | null;
}): Promise<UserRecord> {
  const [created] = await db
    .insert(schema.user)
    .values({
      id: data.id,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      contactPhone: data.contactPhone?.trim() ?? null,
      isGuest: false,
      status: "active",
      banned: false,
    })
    .returning();

  return created!;
}

export async function updateUserRoleAndStatus(
  id: string,
  data: {
    role?: string;
    status?: string;
    banned?: boolean;
    banReason?: string | null;
    contactPhone?: string | null;
    name?: string;
  }
): Promise<void> {
  await db
    .update(schema.user)
    .set({
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.banned !== undefined ? { banned: data.banned } : {}),
      ...(data.banReason !== undefined ? { banReason: data.banReason } : {}),
      ...(data.contactPhone !== undefined ? { contactPhone: data.contactPhone } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, id));
}

export async function createStaffAccountTransaction(params: {
  user: {
    id: string;
    name: string;
    email: string;
    role: "courier" | "house" | "admin";
    contactPhone?: string | null;
  };
  hashedPassword?: string;
  houseId?: string | null;
}): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(schema.user).values({
      id: params.user.id,
      name: params.user.name.trim(),
      email: params.user.email.trim().toLowerCase(),
      role: params.user.role,
      contactPhone: params.user.contactPhone?.trim() ?? null,
      isGuest: false,
      status: "active",
      banned: false,
    });

    if (params.hashedPassword) {
      await tx.insert(schema.account).values({
        id: crypto.randomUUID(),
        userId: params.user.id,
        accountId: params.user.id,
        providerId: "credential",
        password: params.hashedPassword,
      });
    }

    if (params.user.role === "house" && params.houseId) {
      await tx
        .insert(schema.houseMembers)
        .values({
          houseId: params.houseId,
          userId: params.user.id,
        })
        .onConflictDoNothing();
    }
  });
}

export interface GetAdminCustomersParams {
  query?: string;
  status?: string;
  type?: "all" | "registered" | "guest";
  hasOrdered?: boolean;
  hideTestAccounts?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "name" | "ordersCount" | "totalSpentCDF";
  sortOrder?: "asc" | "desc";
}

export async function getAdminCustomers(params?: GetAdminCustomersParams): Promise<{
  customers: AdminCustomerRecord[];
  totalCount: number;
}> {
  const conditions: (SQL | undefined)[] = [eq(schema.user.role, "customer")];

  if (params?.status === "active") {
    conditions.push(and(eq(schema.user.status, "active"), eq(schema.user.banned, false)));
  } else if (params?.status === "blocked") {
    conditions.push(or(eq(schema.user.status, "blocked"), eq(schema.user.banned, true)));
  }

  if (params?.type === "guest") {
    conditions.push(eq(schema.user.isGuest, true));
  } else if (params?.type === "registered") {
    conditions.push(eq(schema.user.isGuest, false));
  }

  if (params?.createdAfter) {
    conditions.push(gte(schema.user.createdAt, params.createdAfter));
  }
  if (params?.createdBefore) {
    conditions.push(lte(schema.user.createdAt, params.createdBefore));
  }

  if (params?.query && params.query.trim()) {
    const q = `%${params.query.trim()}%`;
    conditions.push(
      or(
        ilike(schema.user.name, q),
        ilike(schema.user.email, q),
        ilike(schema.user.contactPhone, q)
      )
    );
  }

  const validConditions = conditions.filter((c): c is SQL => c !== undefined);

  const countQuery = await db
    .select({ count: count(schema.user.id) })
    .from(schema.user)
    .where(and(...validConditions));

  const totalCount = countQuery[0]?.count ?? 0;

  const activeStatuses = [
    "created",
    "accepted",
    "pickup_assigned",
    "pickup_in_progress",
    "picked_up",
    "received",
    "price_adjusted",
    "washing",
    "ready",
    "delivery_slot_confirmed",
    "delivery_assigned",
    "delivery_in_progress",
  ];

  const rows = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      emailVerified: schema.user.emailVerified,
      role: schema.user.role,
      status: schema.user.status,
      banned: schema.user.banned,
      banReason: schema.user.banReason,
      isGuest: schema.user.isGuest,
      contactPhone: schema.user.contactPhone,
      createdAt: schema.user.createdAt,
      updatedAt: schema.user.updatedAt,
      ordersCount: sql<number>`cast(count(${schema.orders.id}) as int)`,
      totalSpentCDF: sql<number>`coalesce(cast(sum(${schema.orders.totalDue}) as int), 0)`,
      lastOrderAt: sql<Date | null>`max(${schema.orders.createdAt})`,
      hasActiveOrders: sql<boolean>`coalesce(bool_or(${schema.orders.status} in (${sql.raw(
        activeStatuses.map((s) => `'${s}'`).join(",")
      )})), false)`,
      firstOrderSource: sql<string | null>`(
        select source from orders o2 
        where o2.customer_id = "user".id 
        order by o2.created_at asc 
        limit 1
      )`,
    })
    .from(schema.user)
    .leftJoin(schema.orders, eq(schema.orders.customerId, schema.user.id))
    .where(and(...validConditions))
    .groupBy(schema.user.id)
    .orderBy(desc(schema.user.createdAt))
    .limit(params?.limit ?? 100)
    .offset(params?.offset ?? 0);

  return {
    customers: rows.map((r) => ({
      ...r,
      hasActiveOrders: Boolean(r.hasActiveOrders),
      ordersCount: Number(r.ordersCount || 0),
      totalSpentCDF: Number(r.totalSpentCDF || 0),
    })),
    totalCount,
  };
}

export async function getMergedGuestAccounts(targetUserId: string): Promise<UserRecord[]> {
  const sanitizedTargetId = targetUserId.replace(/[%_\\]/g, "\\$&");
  return db
    .select()
    .from(schema.user)
    .where(
      and(
        eq(schema.user.status, "merged"),
        or(
          ilike(schema.user.banReason, `%Fusionné vers le compte client ${sanitizedTargetId}%`),
          ilike(schema.user.banReason, `%Merged into registered account ${sanitizedTargetId}%`)
        )
      )
    );
}

