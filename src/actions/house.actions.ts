"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireHouseAccess } from "@/services/auth";
import { getHouses } from "@/dal";
import { err, ok, type Result } from "@/lib/result";
import {
  acceptIncomingOrder,
  addHouseClosureEntry,
  updateHouseClosureEntry,
  importHouseHolidays,
  addHouseExclusionRule,
  updateHouseExclusionRule,
  deleteHouseClosureEntry,
  deleteHouseExclusionRule,
  markOrderReady,
  rejectIncomingOrder,
  requestCatalogueItem,
  submitHouseReception,
  updateHouseCatalogueItem,
  updateHouseCatalogueBatch,
  updateHouseGeneralSettings,
  updateHouseHoursSchedule,
  requestCoverageExtension,
  updateNeighborhoodCoverage,
  updateNeighborhoodCoverageBatch,
} from "@/services/house";

import { normalizeStaffRole, type HouseStaffRole } from "@/services/auth/house-permissions";

async function getAuthenticatedHouseContext(providedHouseId?: string) {
  const authRes = await requireHouseAccess({ houseId: providedHouseId });
  if (!authRes.ok) return authRes;

  const isPlatformAdmin = authRes.value.user.role === "admin";
  let houseId = isPlatformAdmin
    ? providedHouseId || authRes.value.houseId || authRes.value.primaryHouseId
    : authRes.value.houseId || authRes.value.primaryHouseId;

  if (!houseId && isPlatformAdmin) {
    const allHouses = await getHouses();
    if (allHouses.length > 0) {
      houseId = allHouses[0].id;
    }
  }

  if (!houseId) {
    return err("No laundry house is selected or assigned to this account.");
  }

  const staffRole: HouseStaffRole =
    authRes.value.user.role === "admin" ? "owner" : normalizeStaffRole(authRes.value.user.role);

  return ok({
    user: authRes.value.user,
    houseId,
    actorRole: (authRes.value.user.role === "admin" ? "admin" : "house") as "admin" | "house",
    staffRole,
    isAdminOverride: authRes.value.user.role === "admin",
  });
}

function requireHouseManagerOrOwner(authCtx: {
  isAdminOverride: boolean;
  staffRole: HouseStaffRole;
}): Result<void> {
  if (authCtx.isAdminOverride || authCtx.staffRole === "owner" || authCtx.staffRole === "manager") {
    return ok(undefined);
  }
  return err("Accès refusé : Seuls les gestionnaires et propriétaires peuvent modifier ces paramètres.");
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
    revalidatePath("/partner", "layout");
    revalidatePath("/orders");
    revalidatePath("/admin/orders");
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
    revalidatePath("/partner", "layout");
    revalidatePath("/orders");
    revalidatePath("/admin/orders");
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
    revalidatePath("/partner", "layout");
    revalidatePath("/orders");
    revalidatePath("/admin/orders");
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
    revalidatePath("/partner", "layout");
    revalidatePath("/orders");
    revalidatePath("/admin/orders");
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

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

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
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
  }

  return res;
}

const batchItemSchema = z.object({
  serviceId: z.string().uuid("Identifiant de service invalide"),
  itemId: z.string().uuid("Identifiant d'article invalide"),
  fabricId: z.string().uuid("Identifiant de matière invalide"),
  price: z.number().int().min(0, "Le prix ne peut être négatif"),
  isActive: z.boolean(),
  currency: z.enum(["CDF", "USD"]).optional(),
});

const updateCatalogueBatchSchema = z.object({
  houseId: z.string().uuid().optional(),
  items: z.array(batchItemSchema).min(1, "Aucune modification fournie"),
});

export async function updateHouseCatalogueBatchAction(input: {
  houseId?: string;
  items: Array<{
    serviceId: string;
    itemId: string;
    fabricId: string;
    price: number;
    isActive: boolean;
    currency?: "CDF" | "USD";
  }>;
}): Promise<Result<{ updatedCount: number }>> {
  const parsed = updateCatalogueBatchSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres de catalogue invalides");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  const res = await updateHouseCatalogueBatch({
    houseId: authCtx.value.houseId,
    items: parsed.data.items,
  });

  if (res.ok) {
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
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
    revalidatePath("/partner", "layout");
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
      opensAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format d'ouverture invalide (HH:MM)"),
      closesAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format de fermeture invalide (HH:MM)"),
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

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  const res = await updateHouseHoursSchedule(authCtx.value.houseId, parsed.data.hours);
  if (res.ok) {
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
  }
  return res;
}

const addClosureSchema = z.object({
  houseId: z.string().uuid().optional(),
  startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de début invalide"),
  endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de fin invalide"),
  reason: z.string().max(100).optional(),
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

  if (parsed.data.endsOn < parsed.data.startsOn) {
    return err("La date de fin doit être égale ou postérieure à la date de début");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  const res = await addHouseClosureEntry({
    houseId: authCtx.value.houseId,
    startsOn: parsed.data.startsOn,
    endsOn: parsed.data.endsOn,
    reason: parsed.data.reason,
  });

  if (res.ok) {
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
  }
  return res;
}

const updateClosureSchema = z.object({
  houseId: z.string().uuid().optional(),
  closureId: z.string().uuid("Identifiant de fermeture invalide"),
  startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de début invalide"),
  endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de fin invalide"),
  reason: z.string().max(100).optional(),
});

export async function updateHouseClosureAction(input: {
  closureId: string;
  startsOn: string;
  endsOn: string;
  reason?: string;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = updateClosureSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Modification de fermeture invalide");
  }

  if (parsed.data.endsOn < parsed.data.startsOn) {
    return err("La date de fin doit être égale ou postérieure à la date de début");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  const res = await updateHouseClosureEntry(authCtx.value.houseId, parsed.data.closureId, {
    startsOn: parsed.data.startsOn,
    endsOn: parsed.data.endsOn,
    reason: parsed.data.reason,
  });

  if (res.ok) {
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
  }
  return res;
}

const importHolidaysSchema = z.object({
  houseId: z.string().uuid().optional(),
  holidays: z.array(
    z.object({
      startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      reason: z.string(),
    })
  ),
});

export async function importHouseHolidaysAction(input: {
  holidays: Array<{ startsOn: string; endsOn: string; reason: string }>;
  houseId?: string;
}): Promise<Result<{ importedCount: number }>> {
  const parsed = importHolidaysSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Importation de jours fériés invalide");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  const res = await importHouseHolidays(authCtx.value.houseId, parsed.data.holidays);
  if (res.ok) {
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
  }
  return res;
}

const deleteClosureSchema = z.object({
  closureId: z.string().uuid("Identifiant de fermeture invalide"),
  houseId: z.string().uuid().optional(),
});

export async function deleteHouseClosureAction(input: {
  closureId: string;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = deleteClosureSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Suppression invalide");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  const res = await deleteHouseClosureEntry(authCtx.value.houseId, parsed.data.closureId);
  if (res.ok) {
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
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

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  const res = await updateNeighborhoodCoverage({
    houseId: authCtx.value.houseId,
    neighborhoodId: parsed.data.neighborhoodId,
    isActive: parsed.data.isActive,
  });

  if (res.ok) {
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
  }
  return res;
}

const updateCoverageBatchSchema = z.object({
  houseId: z.string().uuid().optional(),
  items: z
    .array(
      z.object({
        neighborhoodId: z.string().uuid("ID de quartier invalide"),
        isActive: z.boolean(),
      })
    )
    .min(1, "Aucune modification fournie"),
});

export async function updateNeighborhoodCoverageBatchAction(input: {
  items: Array<{ neighborhoodId: string; isActive: boolean }>;
  houseId?: string;
}): Promise<Result<{ updatedCount: number }>> {
  const parsed = updateCoverageBatchSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres de couverture invalides");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  const res = await updateNeighborhoodCoverageBatch({
    houseId: authCtx.value.houseId,
    items: parsed.data.items,
  });

  if (res.ok) {
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
  }
  return res;
}

const requestCoverageExtensionSchema = z.object({
  houseId: z.string().uuid().optional(),
  targetDistanceLevel: z.number().int().min(1).max(3),
  requestedNeighborhoodIds: z.array(z.string().uuid()).optional(),
  reasonCategory: z.string().min(1, "Catégorie requise"),
  note: z.string().min(5, "Veuillez détailler votre motivation (au moins 5 caractères)"),
});

export type RequestCoverageExtensionInput = z.infer<typeof requestCoverageExtensionSchema>;

export async function requestCoverageExtensionAction(
  input: RequestCoverageExtensionInput
): Promise<Result<{ ticketReference: string }>> {
  const parsed = requestCoverageExtensionSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  const res = await requestCoverageExtension({
    houseId: authCtx.value.houseId,
    userId: authCtx.value.user.id,
    targetDistanceLevel: parsed.data.targetDistanceLevel,
    requestedNeighborhoodIds: parsed.data.requestedNeighborhoodIds,
    reasonCategory: parsed.data.reasonCategory,
    note: parsed.data.note,
  });

  if (res.ok) {
    revalidatePath("/partner", "layout");
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

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

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
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
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

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  const res = await addHouseExclusionRule({
    houseId: authCtx.value.houseId,
    itemId: parsed.data.itemId,
    fabricId: parsed.data.fabricId,
    note: parsed.data.note,
  });

  if (res.ok) {
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
  }
  return res;
}

export async function deleteHouseExclusionAction(input: {
  exclusionId: string;
  houseId?: string;
}): Promise<Result<void>> {
  const authCtx = await getAuthenticatedHouseContext(input.houseId);
  if (!authCtx.ok) return authCtx;

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  const res = await deleteHouseExclusionRule(authCtx.value.houseId, input.exclusionId);
  if (res.ok) {
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
  }
  return res;
}

const updateExclusionSchema = z.object({
  houseId: z.string().uuid().optional(),
  exclusionId: z.string().uuid("Identifiant d'exclusion invalide"),
  itemId: z.string().uuid().optional().nullable(),
  fabricId: z.string().uuid().optional().nullable(),
  note: z.string().optional().nullable(),
});

export async function updateHouseExclusionAction(input: {
  exclusionId: string;
  itemId?: string | null;
  fabricId?: string | null;
  note?: string | null;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = updateExclusionSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Exclusion invalide");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  const res = await updateHouseExclusionRule({
    houseId: authCtx.value.houseId,
    exclusionId: parsed.data.exclusionId,
    itemId: parsed.data.itemId,
    fabricId: parsed.data.fabricId,
    note: parsed.data.note,
  });

  if (res.ok) {
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
  }
  return res;
}

const toggleHousePauseSchema = z.object({
  houseId: z.string().uuid().optional(),
  isPaused: z.boolean(),
});

export async function toggleHousePauseAction(input: {
  isPaused: boolean;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = toggleHousePauseSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  try {
    const { updateHouse } = await import("@/dal");
    await updateHouse(authCtx.value.houseId, {
      isPaused: parsed.data.isPaused,
      pausedUntil: null,
    });

    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Erreur lors de la mise à jour du statut de pause."
    );
  }
}

const updateCommandesSchema = z.object({
  houseId: z.string().uuid().optional(),
  dailyCapacity: z.number().int().positive().nullable(),
  minimumOrderAmount: z.number().int().min(0, "Le montant minimum ne peut pas être négatif").max(500000, "Le montant maximum autorisé est de 500 000 CDF"),
  isPaused: z.boolean(),
  pausedUntil: z.string().optional().nullable(),
  pauseReason: z.string().optional().nullable(),
});

export async function updateHouseCommandesAction(input: {
  dailyCapacity: number | null;
  minimumOrderAmount: number;
  isPaused: boolean;
  pausedUntil?: string | null;
  pauseReason?: string | null;
  houseId?: string;
}): Promise<Result<void>> {
  const parsed = updateCommandesSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  const authCtx = await getAuthenticatedHouseContext(parsed.data.houseId);
  if (!authCtx.ok) return authCtx;

  const roleCheck = requireHouseManagerOrOwner(authCtx.value);
  if (!roleCheck.ok) return roleCheck;

  // Log pause audit if paused
  if (parsed.data.isPaused) {
    console.info(
      `[House Pause Audit] House ${authCtx.value.houseId} paused by user ${authCtx.value.user.id}. Reason: "${parsed.data.pauseReason || "Non précisé"}". PausedUntil: ${parsed.data.pausedUntil || "Indéterminé"}`
    );
  }

  const res = await updateHouseGeneralSettings({
    houseId: authCtx.value.houseId,
    dailyCapacity: parsed.data.dailyCapacity,
    minimumOrderAmount: parsed.data.minimumOrderAmount,
    isPaused: parsed.data.isPaused,
    pausedUntil: parsed.data.pausedUntil ? new Date(parsed.data.pausedUntil) : null,
  });

  if (res.ok) {
    revalidatePath("/partner", "layout");
    revalidatePath("/houses");
  }
  return res;
}

export async function revokeOtherSessionsAction(): Promise<Result<{ revokedCount: number }>> {
  const authRes = await requireHouseAccess();
  if (!authRes.ok) return authRes;

  try {
    const { revokeOtherUserSessions } = await import("@/dal");
    const count = await revokeOtherUserSessions(authRes.value.user.id, authRes.value.session.id);
    revalidatePath("/partner", "layout");
    return ok({ revokedCount: count });
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Erreur lors de la révocation des autres sessions."
    );
  }
}

