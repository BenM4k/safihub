"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { validateBannerImageFile } from "@/lib/partner-dashboard";
import { uploadHouseAsset } from "@/lib/house-asset-uploader";
import { updateHouseImagesAction } from "@/actions/house.actions";
import { normalizeStorageUrl } from "@/lib/storage-url";

interface LogoPhotoSectionProps {
  houseId: string;
  houseName: string;
  initialLogoUrl?: string | null;
}

export function LogoPhotoSection({
  houseId,
  houseName,
  initialLogoUrl,
}: LogoPhotoSectionProps) {
  const t = useTranslations("house.settingsPhotos");
  const [logoUrl, setLogoUrl] = useState<string | null>(
    normalizeStorageUrl(initialLogoUrl) ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = houseName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        assetType: "logo",
        maxDimension: 512,
      });

      if (!uploadRes.ok) {
        setError(uploadRes.error);
        setIsUploading(false);
        return;
      }

      setLogoUrl(uploadRes.value.publicUrl);
      setSuccess(t("successLogo"));
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
        logoUrl: null,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        setLogoUrl(null);
        setSuccess(t("deleteLogoSuccess"));
        setTimeout(() => setSuccess(null), 3000);
      }
    });
  }

  return (
    <div className="space-y-3 pt-2 border-t border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-foreground">{t("logoTitle")}</h3>
          <p className="text-[11px] text-muted-foreground">{t("logoDesc")}</p>
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
            className="text-xs font-semibold gap-1.5 cursor-pointer h-8 rounded-lg"
          >
            {isUploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            <span>{logoUrl ? t("changeLogo") : t("uploadLogo")}</span>
          </Button>

          {logoUrl && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isUploading || isDeleting}
              onClick={handleDelete}
              className="text-xs font-semibold text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer h-8 rounded-lg"
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
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive-soft/30 p-2.5 text-xs font-semibold text-destructive flex items-center gap-2"
        >
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-success/20 bg-success-soft/30 p-2.5 text-xs font-semibold text-success flex items-center gap-2"
        >
          <CheckCircle2 className="size-3.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="size-20 rounded-2xl overflow-hidden border-2 border-border/80 shadow-xs bg-muted/40 shrink-0 flex items-center justify-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`Logo ${houseName}`}
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xl font-display">
              {initials}
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Format carré 1:1</p>
          <p className="text-[11px]">Recommandé : 512x512 px · PNG ou WebP sur fond transparent ou uni.</p>
        </div>
      </div>
    </div>
  );
}
