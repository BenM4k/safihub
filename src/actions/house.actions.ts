"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireHouseAccess } from "@/services/auth";
import { err, ok, type Result } from "@/lib/result";
import {
  acceptIncomingOrder,
  addHouseClosureEntry,
  addHouseExclusionRule,
  deleteHouseClosureEntry,
  deleteHouseExclusionRule,
  markOrderReady,
  rejectIncomingOrder,
  requestCatalogueItem,
  submitHouseReception,
  updateHouseCatalogueItem,
  updateHouseGeneralSettings,
  updateHouseHoursSchedule,
  updateNeighborhoodCoverage,
} from "@/services/house";

async function getAuthenticatedHouseContext(providedHouseId?: string) {
  const authRes = await requireHouseAccess({ houseId: providedHouseId });
  if (!authRes.ok) return authRes;

  const houseId = providedHouseId || authRes.value.houseId || authRes.value.primaryHouseId;
  if (!houseId) {
    return err("No laundry house is selected or assigned to this account.");
  }

  return ok({
    user: authRes.value.user,
    houseId,
    actorRole: (authRes.value.user.role === "admin" ? "admin" : "house") as "admin" | "house",
  });
}

// ----------------------------------------------------
// Task 4.2: Incoming Orders (Accept / Reject)
// ----------------------------------------------------

const acceptOrderSchema = z.object({
  orderId: z.string().uuid("ID de commande invalide"),
  houseId: z.string().uuid().optional(),
});

export async function acceptOrderAction(input: {
  orderId: string;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = acceptOrderSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await acceptIncomingOrder({
    houseId: authCtx.value.houseId,
    orderId: parsed.data.orderId,
    actorId: authCtx.value.user.id,
    actorRole: authCtx.value.actorRole,
  });

  if (res.ok) {
    revalidatePath("/house");
    revalidatePath("/house/orders");
    revalidatePath(`/house/orders/${parsed.data.orderId}`);
  }

  return res;
}

const rejectOrderSchema = z.object({
  orderId: z.string().uuid("ID de commande invalide"),
  reason: z.string().min(1, "Le motif de refus est obligatoire"),
  houseId: z.string().uuid().optional(),
});

export async function rejectOrderAction(input: {
  orderId: string;
  reason: string;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = rejectOrderSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await rejectIncomingOrder({
    houseId: authCtx.value.houseId,
    orderId: parsed.data.orderId,
    actorId: authCtx.value.user.id,
    actorRole: authCtx.value.actorRole,
    reason: parsed.data.reason,
  });

  if (res.ok) {
    revalidatePath("/house");
    revalidatePath("/house/orders");
    revalidatePath(`/house/orders/${parsed.data.orderId}`);
  }

  return res;
}

// ----------------------------------------------------
// Task 4.3: Reception Count & Mark Ready
// ----------------------------------------------------

const submitReceptionSchema = z.object({
  orderId: z.string().uuid("ID de commande invalide"),
  houseId: z.string().uuid().optional(),
  itemCounts: z.array(
    z.object({
      orderItemId: z.string().uuid(),
      receivedQuantity: z.number().int().min(0, "La quantité reçue ne peut être négative"),
      isExplicitlyRejectedByHouse: z.boolean().optional(),
    })
  ),
});

export async function submitHouseReceptionAction(input: {
  orderId: string;
  houseId?: string;
  itemCounts: Array<{
    orderItemId: string;
    receivedQuantity: number;
    isExplicitlyRejectedByHouse?: boolean;
  }>;
}): Promise<Result<{ hasPriceAdjustment: boolean }>> {
  const parsed = submitReceptionSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données de comptage invalides");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await submitHouseReception({
    houseId: authCtx.value.houseId,
    orderId: parsed.data.orderId,
    actorId: authCtx.value.user.id,
    actorRole: authCtx.value.actorRole,
    itemCounts: parsed.data.itemCounts,
  });

  if (res.ok) {
    revalidatePath("/house");
    revalidatePath("/house/orders");
    revalidatePath(`/house/orders/${parsed.data.orderId}`);
    return ok({ hasPriceAdjustment: res.value.hasPriceAdjustment });
  }

  return res;
}

const markReadySchema = z.object({
  orderId: z.string().uuid("ID de commande invalide"),
  houseId: z.string().uuid().optional(),
});

export async function markOrderReadyAction(input: {
  orderId: string;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = markReadySchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "ID de commande invalide");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await markOrderReady({
    houseId: authCtx.value.houseId,
    orderId: parsed.data.orderId,
    actorId: authCtx.value.user.id,
    actorRole: authCtx.value.actorRole,
  });

  if (res.ok) {
    revalidatePath("/house");
    revalidatePath("/house/orders");
    revalidatePath(`/house/orders/${parsed.data.orderId}`);
  }

  return res;
}

// ----------------------------------------------------
// Task 4.4: Catalogue & Prices
// ----------------------------------------------------

const updateCatalogueItemSchema = z.object({
  houseId: z.string().uuid().optional(),
  serviceId: z.string().uuid(),
  itemId: z.string().uuid(),
  fabricId: z.string().uuid(),
  price: z.number().int().min(0, "Le prix ne peut être négatif"),
  isActive: z.boolean(),
  currency: z.enum(["CDF", "USD"]).optional(),
});

export async function updateHouseCatalogueItemAction(input: {
  serviceId: string;
  itemId: string;
  fabricId: string;
  price: number;
  isActive: boolean;
  currency?: "CDF" | "USD";
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = updateCatalogueItemSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres de catalogue invalides");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await updateHouseCatalogueItem({
    houseId: authCtx.value.houseId,
    serviceId: parsed.data.serviceId,
    itemId: parsed.data.itemId,
    fabricId: parsed.data.fabricId,
    price: parsed.data.price,
    isActive: parsed.data.isActive,
    currency: parsed.data.currency,
  });

  if (res.ok) {
    revalidatePath("/house/catalogue");
  }

  return res;
}

const requestItemSchema = z.object({
  houseId: z.string().uuid().optional(),
  kind: z.enum(["item", "fabric"]),
  name: z.string().min(1, "Le nom est obligatoire"),
  note: z.string().optional(),
});

export async function requestCatalogueItemAction(input: {
  kind: "item" | "fabric";
  name: string;
  note?: string;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = requestItemSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Demande invalide");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await requestCatalogueItem({
    houseId: authCtx.value.houseId,
    requestedBy: authCtx.value.user.id,
    kind: parsed.data.kind,
    name: parsed.data.name,
    note: parsed.data.note,
  });

  if (res.ok) {
    revalidatePath("/house/catalogue");
  }

  return res;
}

// ----------------------------------------------------
// Task 4.5: Hours, Coverage & Settings
// ----------------------------------------------------

const updateHoursSchema = z.object({
  houseId: z.string().uuid().optional(),
  hours: z.array(
    z.object({
      weekday: z.number().int().min(1).max(7),
      opensAt: z.string(),
      closesAt: z.string(),
    })
  ),
});

export async function updateHouseHoursAction(input: {
  hours: Array<{ weekday: number; opensAt: string; closesAt: string }>;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = updateHoursSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Horaires invalides");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await updateHouseHoursSchedule(authCtx.value.houseId, parsed.data.hours);
  if (res.ok) {
    revalidatePath("/house/hours");
  }
  return res;
}

const addClosureSchema = z.object({
  houseId: z.string().uuid().optional(),
  startsOn: z.string(),
  endsOn: z.string(),
  reason: z.string().optional(),
});

export async function addHouseClosureAction(input: {
  startsOn: string;
  endsOn: string;
  reason?: string;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = addClosureSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Période de fermeture invalide");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await addHouseClosureEntry({
    houseId: authCtx.value.houseId,
    startsOn: parsed.data.startsOn,
    endsOn: parsed.data.endsOn,
    reason: parsed.data.reason,
  });

  if (res.ok) {
    revalidatePath("/house/hours");
  }
  return res;
}

export async function deleteHouseClosureAction(input: {
  closureId: string;
  houseId?: string;
}): Promise<Result<void>> {
  const authCtx = await getAuthenticatedHouseContext(input.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await deleteHouseClosureEntry(authCtx.value.houseId, input.closureId);
  if (res.ok) {
    revalidatePath("/house/hours");
  }
  return res;
}

const updateCoverageSchema = z.object({
  houseId: z.string().uuid().optional(),
  neighborhoodId: z.string().uuid("ID de quartier invalide"),
  isActive: z.boolean(),
});

export async function updateNeighborhoodCoverageAction(input: {
  neighborhoodId: string;
  isActive: boolean;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = updateCoverageSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres de couverture invalides");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await updateNeighborhoodCoverage({
    houseId: authCtx.value.houseId,
    neighborhoodId: parsed.data.neighborhoodId,
    isActive: parsed.data.isActive,
  });

  if (res.ok) {
    revalidatePath("/house/coverage");
  }
  return res;
}

const updateSettingsSchema = z.object({
  houseId: z.string().uuid().optional(),
  dailyCapacity: z.number().int().positive().nullable(),
  minimumOrderAmount: z.number().int().min(0),
  isPaused: z.boolean(),
  pausedUntil: z.string().optional().nullable(),
  addressNote: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
});

export async function updateHouseGeneralSettingsAction(input: {
  dailyCapacity: number | null;
  minimumOrderAmount: number;
  isPaused: boolean;
  pausedUntil?: string | null;
  addressNote?: string | null;
  contactPhone?: string | null;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = updateSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await updateHouseGeneralSettings({
    houseId: authCtx.value.houseId,
    dailyCapacity: parsed.data.dailyCapacity,
    minimumOrderAmount: parsed.data.minimumOrderAmount,
    isPaused: parsed.data.isPaused,
    pausedUntil: parsed.data.pausedUntil ? new Date(parsed.data.pausedUntil) : null,
    addressNote: parsed.data.addressNote,
    contactPhone: parsed.data.contactPhone,
  });

  if (res.ok) {
    revalidatePath("/house");
    revalidatePath("/house/settings");
  }
  return res;
}

const addExclusionSchema = z.object({
  houseId: z.string().uuid().optional(),
  itemId: z.string().uuid().optional().nullable(),
  fabricId: z.string().uuid().optional().nullable(),
  note: z.string().optional().nullable(),
});

export async function addHouseExclusionAction(input: {
  itemId?: string | null;
  fabricId?: string | null;
  note?: string | null;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = addExclusionSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Exclusion invalide");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await addHouseExclusionRule({
    houseId: authCtx.value.houseId,
    itemId: parsed.data.itemId,
    fabricId: parsed.data.fabricId,
    note: parsed.data.note,
  });

  if (res.ok) {
    revalidatePath("/house/settings");
  }
  return res;
}

export async function deleteHouseExclusionAction(input: {
  exclusionId: string;
  houseId?: string;
}): Promise<Result<void>> {
  const authCtx = await getAuthenticatedHouseContext(input.houseId);
  if (!authCtx.ok) return authCtx;

  const res = await deleteHouseExclusionRule(authCtx.value.houseId, input.exclusionId);
  if (res.ok) {
    revalidatePath("/house/settings");
  }
  return res;
}
