"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  addAdminMasterFabric,
  addAdminMasterItem,
  addAdminMasterService,
  approveAdminItemRequest,
  rejectAdminItemRequest,
  toggleAdminMasterFabricActive,
  toggleAdminMasterItemActive,
} from "@/services/admin";

const createItemSchema = z.object({
  nameFr: z.string().min(1, "Nom en français requis"),
  nameSw: z.string().min(1, "Nom en swahili requis"),
  category: z.string().optional().nullable(),
  sortOrder: z.coerce.number().optional().default(0),
});

const createFabricSchema = z.object({
  nameFr: z.string().min(1, "Nom en français requis"),
  nameSw: z.string().min(1, "Nom en swahili requis"),
  sortOrder: z.coerce.number().optional().default(0),
});

const createServiceSchema = z.object({
  slug: z.string().min(1, "Identifiant (slug) requis"),
  nameFr: z.string().min(1, "Nom en français requis"),
  nameSw: z.string().min(1, "Nom en swahili requis"),
  sortOrder: z.coerce.number().optional().default(0),
});

const approveRequestSchema = z.object({
  requestId: z.string().uuid(),
  kind: z.enum(["item", "fabric"]),
  nameFr: z.string().min(1, "Nom en français requis"),
  nameSw: z.string().min(1, "Nom en swahili requis"),
  category: z.string().optional().nullable(),
  adminNote: z.string().optional(),
});

const rejectRequestSchema = z.object({
  requestId: z.string().uuid(),
  adminNote: z.string().min(1, "Motif du refus requis"),
});

export async function createMasterItemAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = createItemSchema.safeParse({
    nameFr: formData.get("nameFr"),
    nameSw: formData.get("nameSw"),
    category: formData.get("category"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await addAdminMasterItem(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/catalogue");
  }
  return res;
}

export async function toggleMasterItemActiveAction(itemId: string, isActive: boolean): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await toggleAdminMasterItemActive(itemId, isActive);
  if (res.ok) {
    revalidatePath("/admin/catalogue");
  }
  return res;
}

export async function createMasterFabricAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = createFabricSchema.safeParse({
    nameFr: formData.get("nameFr"),
    nameSw: formData.get("nameSw"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await addAdminMasterFabric(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/catalogue");
  }
  return res;
}

export async function toggleMasterFabricActiveAction(fabricId: string, isActive: boolean): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await toggleAdminMasterFabricActive(fabricId, isActive);
  if (res.ok) {
    revalidatePath("/admin/catalogue");
  }
  return res;
}

export async function createMasterServiceAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = createServiceSchema.safeParse({
    slug: formData.get("slug"),
    nameFr: formData.get("nameFr"),
    nameSw: formData.get("nameSw"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await addAdminMasterService(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/catalogue");
  }
  return res;
}

export async function approveItemRequestAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = approveRequestSchema.safeParse({
    requestId: formData.get("requestId"),
    kind: formData.get("kind"),
    nameFr: formData.get("nameFr"),
    nameSw: formData.get("nameSw"),
    category: formData.get("category"),
    adminNote: formData.get("adminNote"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await approveAdminItemRequest({
    ...parsed.data,
    adminId: auth.value.user.id,
  });

  if (res.ok) {
    revalidatePath("/admin/catalogue");
  }
  return res;
}

export async function rejectItemRequestAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = rejectRequestSchema.safeParse({
    requestId: formData.get("requestId"),
    adminNote: formData.get("adminNote"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await rejectAdminItemRequest({
    ...parsed.data,
    adminId: auth.value.user.id,
  });

  if (res.ok) {
    revalidatePath("/admin/catalogue");
  }
  return res;
}
