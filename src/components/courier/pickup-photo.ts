import { compressImage, uploadBlobWithRetry } from "@/lib/image-compression";
import {
  getPhotoUploadUrlAction,
  recordPhotoUploadAction,
} from "@/actions/storage.actions";
import { enqueueOfflinePhoto } from "@/lib/offline/offline-photo-store";
import { ok, err, type Result } from "@/lib/result";

export async function uploadPickupConditionPhoto({
  orderId,
  orderItemId,
  missionId,
  file,
  isOnline,
}: {
  orderId: string;
  orderItemId: string;
  missionId: string;
  file: File;
  isOnline: boolean;
}): Promise<Result<void>> {
  try {
    const compressed = await compressImage(file, {
      maxDimension: 1280,
      maxSizeBytes: 300 * 1024,
    });

    if (isOnline) {
      const urlRes = await getPhotoUploadUrlAction({
        orderId,
        orderItemId,
        type: "pickup_condition",
        contentType: compressed.mimeType,
      });

      if (!urlRes.ok) return err(urlRes.error);

      const uploadOk = await uploadBlobWithRetry(
        urlRes.value.uploadUrl,
        compressed.blob,
        { maxRetries: 3 }
      );

      if (!uploadOk) return err("Échec du téléversement de la photo");

      const recordRes = await recordPhotoUploadAction({
        orderId,
        orderItemId,
        missionId,
        type: "pickup_condition",
        storageKey: urlRes.value.storageKey,
        sizeBytes: compressed.sizeBytes,
      });

      if (!recordRes.ok) return err(recordRes.error);
    } else {
      await enqueueOfflinePhoto({
        id: `offline_photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderId,
        orderItemId,
        missionId,
        type: "pickup_condition",
        blob: compressed.blob,
        sizeBytes: compressed.sizeBytes,
        timestamp: Date.now(),
      });
    }

    return ok(undefined);
  } catch (errCatch) {
    return err(
      errCatch instanceof Error ? errCatch.message : "Erreur de traitement photo"
    );
  }
}
