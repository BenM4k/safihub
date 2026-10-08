import "server-only";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, schema } from "./db";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string | null;
  status: string;
  banned: boolean | null;
  banReason: string | null;
  isGuest: boolean;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
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

  const query = db
    .select()
    .from(schema.user)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.user.createdAt))
    .limit(params?.limit ?? 50)
    .offset(params?.offset ?? 0);

  return query;
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
