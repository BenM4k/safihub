"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  generatePhotoUploadUrlService,
  generatePhotoDownloadUrlService,
  recordUploadedPhotoService,
  getOrderPhotosWithSignedUrlsService,
  type PhotoWithSignedUrl,
} from "@/services/storage";

const uploadUrlSchema = z.object({
  orderId: z.string().uuid("Identifiant de commande invalide"),
  orderItemId: z.string().uuid().nullable().optional(),
  type: z.enum(["pickup_condition", "delivery_proof", "dispute"]),
  contentType: z.string().optional(),
});

const recordPhotoSchema = z.object({
  orderId: z.string().uuid("Identifiant de commande invalide"),
  orderItemId: z.string().uuid().nullable().optional(),
  missionId: z.string().uuid().nullable().optional(),
  disputeId: z.string().uuid().nullable().optional(),
  type: z.enum(["pickup_condition", "delivery_proof", "dispute"]),
  storageKey: z.string().min(1, "Clé de stockage requise"),
  sizeBytes: z.number().int().positive().nullable().optional(),
});

const downloadUrlSchema = z.object({
  photoId: z.string().uuid("Identifiant de photo invalide"),
  guestToken: z.string().optional(),
});

const orderPhotosQuerySchema = z.object({
  orderId: z.string().uuid("Identifiant de commande invalide"),
  guestToken: z.string().optional(),
});

/**
 * Task 7.1: Server Action to obtain a presigned PUT URL for Cloudflare R2 direct upload.
 */
export async function getPhotoUploadUrlAction(
  input: z.infer<typeof uploadUrlSchema>
): Promise<
  Result<{
    uploadUrl: string;
    storageKey: string;
    expiresInSeconds: number;
  }>
> {
  const user = await getCurrentUser();
  if (!user) {
    return err("Veuillez vous connecter pour téléverser une photo");
  }

  const parsed = uploadUrlSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  return generatePhotoUploadUrlService({
    user: { id: user.id, role: user.role },
    orderId: parsed.data.orderId,
    orderItemId: parsed.data.orderItemId,
    type: parsed.data.type,
    contentType: parsed.data.contentType,
  });
}

/**
 * Task 7.1 & 7.2: Server Action to confirm and record uploaded photo metadata in order_photos.
 */
export async function recordPhotoUploadAction(
  input: z.infer<typeof recordPhotoSchema>
): Promise<Result<{ photoId: string; storageKey: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return err("Veuillez vous connecter pour enregistrer cette photo");
  }

  const parsed = recordPhotoSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  const res = await recordUploadedPhotoService({
    user: { id: user.id, role: user.role },
    orderId: parsed.data.orderId,
    orderItemId: parsed.data.orderItemId,
    missionId: parsed.data.missionId,
    disputeId: parsed.data.disputeId,
    type: parsed.data.type,
    storageKey: parsed.data.storageKey,
    sizeBytes: parsed.data.sizeBytes,
  });

  if (res.ok) {
    revalidatePath(`/orders/${parsed.data.orderId}`);
    revalidatePath(`/house/orders`);
    revalidatePath(`/courier/missions`);
  }

  return res;
}

/**
 * Task 7.1: Server Action to obtain a presigned GET download URL for an authorized photo.
 */
export async function getPhotoDownloadUrlAction(
  input: z.infer<typeof downloadUrlSchema>
): Promise<
  Result<{
    downloadUrl: string;
    storageKey: string;
    expiresInSeconds: number;
  }>
> {
  const user = await getCurrentUser();

  const parsed = downloadUrlSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  return generatePhotoDownloadUrlService({
    user: user ? { id: user.id, role: user.role } : null,
    photoId: parsed.data.photoId,
    guestToken: parsed.data.guestToken,
  });
}

/**
 * Task 7.3: Server Action to retrieve all authorized order photos with signed download URLs.
 */
export async function getOrderPhotosWithSignedUrlsAction(
  input: z.infer<typeof orderPhotosQuerySchema>
): Promise<Result<PhotoWithSignedUrl[]>> {
  const user = await getCurrentUser();

  const parsed = orderPhotosQuerySchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  return getOrderPhotosWithSignedUrlsService({
    user: user ? { id: user.id, role: user.role } : null,
    orderId: parsed.data.orderId,
    guestToken: parsed.data.guestToken,
  });
}
