import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "./db";

export interface CustomerAddressRecord {
  id: string;
  userId: string;
  label: string | null;
  neighborhoodId: string;
  neighborhoodName?: string | null;
  landmark: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
}

export async function getCustomerAddresses(
  userId: string
): Promise<CustomerAddressRecord[]> {
  const rows = await db
    .select({
      id: schema.customerAddresses.id,
      userId: schema.customerAddresses.userId,
      label: schema.customerAddresses.label,
      neighborhoodId: schema.customerAddresses.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      landmark: schema.customerAddresses.landmark,
      phone: schema.customerAddresses.phone,
      isDefault: schema.customerAddresses.isDefault,
      createdAt: schema.customerAddresses.createdAt,
    })
    .from(schema.customerAddresses)
    .innerJoin(
      schema.neighborhoods,
      eq(schema.customerAddresses.neighborhoodId, schema.neighborhoods.id)
    )
    .where(eq(schema.customerAddresses.userId, userId))
    .orderBy(desc(schema.customerAddresses.isDefault), desc(schema.customerAddresses.createdAt));

  return rows;
}

export async function createCustomerAddress(data: {
  userId: string;
  label?: string | null;
  neighborhoodId: string;
  landmark: string;
  phone: string;
  isDefault?: boolean;
}): Promise<CustomerAddressRecord> {
  return await db.transaction(async (tx) => {
    if (data.isDefault) {
      await tx
        .update(schema.customerAddresses)
        .set({ isDefault: false })
        .where(eq(schema.customerAddresses.userId, data.userId));
    }

    const [created] = await tx
      .insert(schema.customerAddresses)
      .values({
        id: crypto.randomUUID(),
        userId: data.userId,
        label: data.label?.trim() || null,
        neighborhoodId: data.neighborhoodId,
        landmark: data.landmark.trim(),
        phone: data.phone.trim(),
        isDefault: data.isDefault ?? false,
      })
      .returning();

    const [neighborhood] = await tx
      .select({ name: schema.neighborhoods.name })
      .from(schema.neighborhoods)
      .where(eq(schema.neighborhoods.id, data.neighborhoodId))
      .limit(1);

    return {
      ...created!,
      neighborhoodName: neighborhood?.name ?? null,
    };
  });
}

export async function updateCustomerAddress(
  id: string,
  userId: string,
  data: {
    label?: string | null;
    neighborhoodId?: string;
    landmark?: string;
    phone?: string;
    isDefault?: boolean;
  }
): Promise<boolean> {
  return await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: schema.customerAddresses.id })
      .from(schema.customerAddresses)
      .where(and(eq(schema.customerAddresses.id, id), eq(schema.customerAddresses.userId, userId)))
      .limit(1);

    if (!existing) {
      return false;
    }

    if (data.isDefault) {
      await tx
        .update(schema.customerAddresses)
        .set({ isDefault: false })
        .where(eq(schema.customerAddresses.userId, userId));
    }

    await tx
      .update(schema.customerAddresses)
      .set({
        ...(data.label !== undefined ? { label: data.label?.trim() || null } : {}),
        ...(data.neighborhoodId ? { neighborhoodId: data.neighborhoodId } : {}),
        ...(data.landmark ? { landmark: data.landmark.trim() } : {}),
        ...(data.phone ? { phone: data.phone.trim() } : {}),
        ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
      })
      .where(and(eq(schema.customerAddresses.id, id), eq(schema.customerAddresses.userId, userId)));

    return true;
  });
}

export async function deleteCustomerAddress(id: string, userId: string): Promise<boolean> {
  const deleted = await db
    .delete(schema.customerAddresses)
    .where(and(eq(schema.customerAddresses.id, id), eq(schema.customerAddresses.userId, userId)))
    .returning({ id: schema.customerAddresses.id });
  return deleted.length > 0;
}

export async function setDefaultCustomerAddress(id: string, userId: string): Promise<boolean> {
  return await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: schema.customerAddresses.id })
      .from(schema.customerAddresses)
      .where(and(eq(schema.customerAddresses.id, id), eq(schema.customerAddresses.userId, userId)))
      .limit(1);

    if (!existing) {
      return false;
    }

    await tx
      .update(schema.customerAddresses)
      .set({ isDefault: false })
      .where(eq(schema.customerAddresses.userId, userId));

    await tx
      .update(schema.customerAddresses)
      .set({ isDefault: true })
      .where(and(eq(schema.customerAddresses.id, id), eq(schema.customerAddresses.userId, userId)));

    return true;
  });
}

export async function updateCustomerProfile(
  userId: string,
  data: {
    name?: string;
    contactPhone?: string | null;
  }
): Promise<void> {
  await db
    .update(schema.user)
    .set({
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.contactPhone !== undefined ? { contactPhone: data.contactPhone?.trim() || null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, userId));
}
