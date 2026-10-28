"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateBannerImageFile } from "@/lib/partner-dashboard";
import { uploadHouseAsset } from "@/lib/house-asset-uploader";
import { updateHouseImagesAction } from "@/actions/house.actions";
import { normalizeStorageUrl } from "@/lib/storage-url";

interface CoverPhotoSectionProps {
  houseId: string;
  initialCoverUrl?: string | null;
}

export function CoverPhotoSection({
  houseId,
  initialCoverUrl,
}: CoverPhotoSectionProps) {
  const t = useTranslations("house.settingsPhotos");
  const [coverUrl, setCoverUrl] = useState<string | null>(
    normalizeStorageUrl(initialCoverUrl) ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    const validation = validateBannerImageFile(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      const uploadRes = await uploadHouseAsset({
        houseId,
        file,
        assetType: "cover",
        maxDimension: 1280,
      });

      if (!uploadRes.ok) {
        setError(uploadRes.error);
        setIsUploading(false);
        return;
      }

      setCoverUrl(uploadRes.value.publicUrl);
      setSuccess(t("successCover"));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleDelete() {
    setError(null);
    setSuccess(null);

    startDeleteTransition(async () => {
      const res = await updateHouseImagesAction({
        houseId,
        coverImageUrl: null,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        setCoverUrl(null);
        setSuccess(t("deleteCoverSuccess"));
        setTimeout(() => setSuccess(null), 3000);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-foreground">{t("coverTitle")}</h3>
          <p className="text-[11px] text-muted-foreground">{t("coverDesc")}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isUploading || isDeleting}
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold gap-1.5 cursor-pointer h-8"
          >
            {isUploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            <span>{coverUrl ? t("changeCover") : t("uploadCover")}</span>
          </Button>

          {coverUrl && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isUploading || isDeleting}
              onClick={handleDelete}
              className="text-xs font-semibold text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer h-8"
            >
              {isDeleting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              <span>{t("deletePhoto")}</span>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="py-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
          <AlertDescription className="text-xs font-semibold">{success}</AlertDescription>
        </Alert>
      )}

      <div className="aspect-[4/1] w-full rounded-2xl overflow-hidden border border-border bg-muted/40 relative flex items-center justify-center">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt="Couverture du pressing"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground/60 p-4 text-center">
            <ImageIcon className="size-8" />
            <span className="text-xs font-medium">Format 4:1 · JPG, PNG, WebP (max 5 Mo)</span>
          </div>
        )}
      </div>
    </div>
  );
}
