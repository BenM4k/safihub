import "server-only";

import { randomUUID } from "node:crypto";
import {
  getOrderPhotos,
  getOrderPhotoById,
  countPhotosForOrder,
  countPhotosForItem,
  insertOrderPhotoRecord,
  getOrderAccessDetails,
  getExpiredPhotosForPruning,
  markPhotosDeletedAtomic,
  checkUserHouseAccess,
  type OrderPhotoRecord,
  type OrderAccessDetails,
} from "@/dal";
import {
  getSignedUploadUrl,
  getSignedDownloadUrl,
  deleteStorageObject,
  headStorageObject,
  isStorageConfigured,
} from "@/lib/storage/r2-client";
import { ok, err, type Result } from "@/lib/result";

export const PHOTO_LIMITS = {
  MAX_PER_ORDER: 20,
  MAX_PER_ITEM: 3,
  MAX_SIZE_BYTES: 500 * 1024, // 500 KB (target compressed is < 300 KB)
  RETENTION_DAYS: 90,
} as const;

export interface PhotoWithSignedUrl extends OrderPhotoRecord {
  downloadUrl: string;
}

export interface UserSessionContext {
  id: string;
  role: string;
}

/**
 * Checks if a user (or guest tracking token) has permission to access order photos.
 * Implements strict authorization and the house privacy firewall (AC 14 / Task 7.1 & 7.3).
 */
export async function canAccessOrderPhotos(params: {
  user?: UserSessionContext | null;
  orderAccess: OrderAccessDetails;
  guestToken?: string;
}): Promise<boolean> {
  const { user, orderAccess, guestToken } = params;

  // 1. Admin has global access to all order photos
  if (user?.role === "admin") {
    return true;
  }

  // 2. Customer who placed the order
  if (user && user.id === orderAccess.customerId) {
    return true;
  }

  // 3. Guest tracking token matches order guestToken
  if (guestToken && guestToken === orderAccess.guestToken) {
    return true;
  }

  // 4. Courier assigned to active or completed mission on this order
  if (user?.role === "courier") {
    return orderAccess.activeCourierIds.includes(user.id);
  }

  // 5. House staff: MUST be a member of the house assigned to this order
  // (Prevents house A from seeing photos of house B's orders)
  if (user?.role === "house") {
    return checkUserHouseAccess(user.id, orderAccess.houseId);
  }

  return false;
}

/**
 * Task 7.1: Generates a short-lived presigned upload (PUT) URL.
 * Checks order authorization and enforces photo limits (Task 7.2).
 */
export async function generatePhotoUploadUrlService(params: {
  user: UserSessionContext;
  orderId: string;
  orderItemId?: string | null;
  type: "pickup_condition" | "delivery_proof" | "dispute";
  contentType?: string;
}): Promise<
  Result<{
    uploadUrl: string;
    storageKey: string;
    expiresInSeconds: number;
  }>
> {
  try {
    const orderAccess = await getOrderAccessDetails(params.orderId);
    if (!orderAccess) {
      return err("Commande introuvable");
    }

    const hasAccess = await canAccessOrderPhotos({
      user: params.user,
      orderAccess,
    });
    if (!hasAccess) {
      return err("Accès non autorisé aux photos de cette commande");
    }

    // Task 7.2: Limit photos per order
    const orderPhotoCount = await countPhotosForOrder(params.orderId);
    if (orderPhotoCount >= PHOTO_LIMITS.MAX_PER_ORDER) {
      return err(
        `Limite maximale atteinte pour cette commande (${PHOTO_LIMITS.MAX_PER_ORDER} photos max)`
      );
    }

    // Task 7.2: Limit photos per item
    if (params.orderItemId) {
      const itemPhotoCount = await countPhotosForItem(params.orderItemId);
      if (itemPhotoCount >= PHOTO_LIMITS.MAX_PER_ITEM) {
        return err(
          `Limite maximale atteinte pour cet article (${PHOTO_LIMITS.MAX_PER_ITEM} photos max)`
        );
      }
    }

    const fileId = randomUUID();
    const storageKey = `orders/${params.orderId}/${params.type}/${fileId}.webp`;
    const expiresInSeconds = 300; // 5 minutes

    const uploadUrl = await getSignedUploadUrl(
      storageKey,
      params.contentType || "image/webp",
      expiresInSeconds
    );

    return ok({
      uploadUrl,
      storageKey,
      expiresInSeconds,
    });
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Échec de génération de l'URL de téléversement"
    );
  }
}

/**
 * Task 7.1: Generates a short-lived presigned download (GET) URL for a single photo.
 */
export async function generatePhotoDownloadUrlService(params: {
  user?: UserSessionContext | null;
  photoId: string;
  guestToken?: string;
}): Promise<
  Result<{
    downloadUrl: string;
    storageKey: string;
    expiresInSeconds: number;
  }>
> {
  try {
    const photo = await getOrderPhotoById(params.photoId);
    if (!photo || photo.deletedAt) {
      return err("Photo introuvable ou supprimée");
    }

    const orderAccess = await getOrderAccessDetails(photo.orderId);
    if (!orderAccess) {
      return err("Commande associée introuvable");
    }

    const hasAccess = await canAccessOrderPhotos({
      user: params.user,
      orderAccess,
      guestToken: params.guestToken,
    });
    if (!hasAccess) {
      return err("Accès non autorisé à cette photo");
    }

    const expiresInSeconds = 900; // 15 minutes
    const downloadUrl = await getSignedDownloadUrl(photo.storageKey, expiresInSeconds);

    return ok({
      downloadUrl,
      storageKey: photo.storageKey,
      expiresInSeconds,
    });
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Échec de génération de l'URL de téléchargement"
    );
  }
}

/**
 * Task 7.3: Retrieves all active photos for an order along with signed download URLs.
 * Respects customer, house, admin, and guest permissions.
 */
export async function getOrderPhotosWithSignedUrlsService(params: {
  user?: UserSessionContext | null;
  orderId: string;
  guestToken?: string;
}): Promise<Result<PhotoWithSignedUrl[]>> {
  try {
    const orderAccess = await getOrderAccessDetails(params.orderId);
    if (!orderAccess) {
      return err("Commande introuvable");
    }

    const hasAccess = await canAccessOrderPhotos({
      user: params.user,
      orderAccess,
      guestToken: params.guestToken,
    });
    if (!hasAccess) {
      return err("Accès non autorisé aux photos de cette commande");
    }

    const photos = await getOrderPhotos(params.orderId);
    const photosWithUrls: PhotoWithSignedUrl[] = await Promise.all(
      photos.map(async (photo) => {
        const downloadUrl = await getSignedDownloadUrl(photo.storageKey, 900);
        return {
          ...photo,
          downloadUrl,
        };
      })
    );

    return ok(photosWithUrls);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Échec de récupération des photos de la commande"
    );
  }
}

/**
 * Task 7.2: Records an uploaded photo in order_photos after successful client upload.
 * Sets 90-day retention deadline if order is already delivered (Task 7.4).
 */
export async function recordUploadedPhotoService(params: {
  user: UserSessionContext;
  orderId: string;
  orderItemId?: string | null;
  missionId?: string | null;
  disputeId?: string | null;
  type: "pickup_condition" | "delivery_proof" | "dispute";
  storageKey: string;
  sizeBytes?: number | null;
}): Promise<Result<{ photoId: string; storageKey: string }>> {
  try {
    const orderAccess = await getOrderAccessDetails(params.orderId);
    if (!orderAccess) {
      return err("Commande introuvable");
    }

    const hasAccess = await canAccessOrderPhotos({
      user: params.user,
      orderAccess,
    });
    if (!hasAccess) {
      return err("Accès non autorisé pour enregistrer cette photo");
    }

    // Validate storageKey format: orders/<orderId>/<type>/<uuid>.webp
    const expectedPrefix = `orders/${params.orderId}/${params.type}/`;
    if (!params.storageKey.startsWith(expectedPrefix)) {
      return err("La clé de stockage ne correspond pas à la commande ou au type spécifié");
    }
    const fileName = params.storageKey.slice(expectedPrefix.length);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i;
    if (!uuidRegex.test(fileName)) {
      return err("Format de clé de stockage invalide (UUID .webp attendu)");
    }

    // Verify object existence and actual size in storage
    const objMeta = await headStorageObject(params.storageKey);
    if (!objMeta) {
      if (isStorageConfigured()) {
        return err("Fichier introuvable dans le stockage");
      }
    }

    const actualSizeBytes = objMeta?.size ?? params.sizeBytes ?? null;

    // Limit checks
    if (actualSizeBytes && actualSizeBytes > PHOTO_LIMITS.MAX_SIZE_BYTES) {
      return err(
        `Taille de photo excessive (${Math.round(actualSizeBytes / 1024)} Ko > 500 Ko)`
      );
    }

    const orderPhotoCount = await countPhotosForOrder(params.orderId);
    if (orderPhotoCount >= PHOTO_LIMITS.MAX_PER_ORDER) {
      return err(`Limite maximale de photos atteinte pour cette commande`);
    }

    if (params.orderItemId) {
      const itemPhotoCount = await countPhotosForItem(params.orderItemId);
      if (itemPhotoCount >= PHOTO_LIMITS.MAX_PER_ITEM) {
        return err(`Limite maximale de photos atteinte pour cet article`);
      }
    }

    // Calculate 90-day retention if order is delivered
    let deleteAfter: Date | null = null;
    if (orderAccess.status === "delivered") {
      deleteAfter = new Date(Date.now() + PHOTO_LIMITS.RETENTION_DAYS * 24 * 60 * 60 * 1000);
    }

    const photoId = await insertOrderPhotoRecord({
      orderId: params.orderId,
      orderItemId: params.orderItemId,
      missionId: params.missionId,
      disputeId: params.disputeId,
      type: params.type,
      storageKey: params.storageKey,
      sizeBytes: actualSizeBytes,
      takenBy: params.user.id,
      deleteAfter,
    });

    return ok({ photoId, storageKey: params.storageKey });
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Échec de l'enregistrement de la photo"
    );
  }
}

/**
 * Task 7.4: Scheduled retention job that deletes photos 90 days after delivery or dispute resolution.
 * Idempotent: Deletes objects from Cloudflare R2 and marks them deleted in order_photos.
 * Open disputes protect photos from deletion until resolved.
 */
export async function pruneExpiredPhotosService(params?: {
  now?: Date;
  limit?: number;
}): Promise<Result<{ prunedCount: number; skippedCount: number }>> {
  try {
    const referenceDate = params?.now || new Date();
    const candidatePhotos = await getExpiredPhotosForPruning(
      referenceDate,
      params?.limit || 100
    );

    if (candidatePhotos.length === 0) {
      return ok({ prunedCount: 0, skippedCount: 0 });
    }

    const photosToPrune: typeof candidatePhotos = [];
    let skippedCount = 0;

    for (const photo of candidatePhotos) {
      const access = await getOrderAccessDetails(photo.orderId);
      // Photos with open disputes are retained until dispute resolution
      if (access && access.openDisputeCount > 0) {
        skippedCount++;
        continue;
      }
      photosToPrune.push(photo);
    }

    // Delete objects from R2 and retain each deletion result
    const deletionResults = await Promise.all(
      photosToPrune.map(async (p) => {
        const deleted = await deleteStorageObject(p.storageKey);
        return { id: p.id, deleted };
      })
    );

    // Atomically mark records as deleted in DB for photos whose storage deletion succeeded
    const idsToMark = deletionResults
      .filter((r) => r.deleted)
      .map((r) => r.id);

    const prunedCount =
      idsToMark.length > 0
        ? await markPhotosDeletedAtomic(idsToMark, referenceDate)
        : 0;

    return ok({ prunedCount, skippedCount });
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Échec de l'exécution du nettoyage de rétention des photos"
    );
  }
}
