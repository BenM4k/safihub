import { compressImage, uploadBlobWithRetry } from "@/lib/image-compression";
import {
  getHouseAssetUploadUrlAction,
  updateHouseImagesAction,
  uploadHouseAssetDirectAction,
} from "@/actions/house.actions";
import { ok, err, type Result } from "@/lib/result";

export interface UploadHouseAssetParams {
  houseId: string;
  file: File;
  assetType: "cover" | "logo";
  maxDimension?: number;
}

/**
 * Uploads a house cover or logo asset with dual-strategy resilience:
 * 1. Tries direct client PUT to Cloudflare R2 presigned URL (zero server streaming).
 * 2. If client network / CORS fails, seamlessly falls back to server-side action.
 */
export async function uploadHouseAsset({
  houseId,
  file,
  assetType,
  maxDimension = assetType === "cover" ? 1280 : 512,
}: UploadHouseAssetParams): Promise<Result<{ publicUrl: string }>> {
  try {
    const compressed = await compressImage(file, {
      maxDimension,
      maxSizeBytes: 300 * 1024,
    });

    // 1. Direct Presigned Upload Strategy
    try {
      const urlRes = await getHouseAssetUploadUrlAction({
        houseId,
        assetType,
        contentType: compressed.mimeType,
      });

      if (urlRes.ok) {
        const uploadOk = await uploadBlobWithRetry(
          urlRes.value.uploadUrl,
          compressed.blob,
          { maxRetries: 2, timeoutMs: 15000 }
        );

        if (uploadOk) {
          const updatePayload =
            assetType === "cover"
              ? { coverImageUrl: urlRes.value.publicUrl }
              : { logoUrl: urlRes.value.publicUrl };

          const saveRes = await updateHouseImagesAction({
            houseId,
            ...updatePayload,
          });

          if (saveRes.ok) {
            return ok({ publicUrl: urlRes.value.publicUrl });
          }
        }
      }
    } catch (directErr) {
      console.warn("[Storage] Direct client upload failed, attempting server fallback:", directErr);
    }

    // 2. Resilient Server Fallback Strategy
    const ext = compressed.mimeType === "image/jpeg" ? "jpg" : "webp";
    const formData = new FormData();
    const compressedFile = new File(
      [compressed.blob],
      `${assetType}.${ext}`,
      { type: compressed.mimeType }
    );
    formData.append("file", compressedFile);
    formData.append("houseId", houseId);
    formData.append("assetType", assetType);

    const fallbackRes = await uploadHouseAssetDirectAction(formData);
    if (fallbackRes.ok) {
      return ok({ publicUrl: fallbackRes.value.publicUrl });
    }

    return err(fallbackRes.error || "Échec du téléversement");
  } catch (caughtError) {
    return err(caughtError instanceof Error ? caughtError.message : "Erreur inattendue");
  }
}
