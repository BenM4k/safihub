"use client";

import { useState, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Camera, Loader2, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressImage, uploadBlobWithRetry } from "@/lib/image-compression";
import {
  getPhotoUploadUrlAction,
  recordPhotoUploadAction,
} from "@/actions/storage.actions";

interface PhotoUploaderProps {
  orderId: string;
  orderItemId?: string | null;
  missionId?: string | null;
  disputeId?: string | null;
  type: "pickup_condition" | "delivery_proof" | "dispute";
  onPhotoUploaded?: (storageKey: string, photoId: string) => void;
  label?: string;
  className?: string;
}

export function PhotoUploader({
  orderId,
  orderItemId,
  missionId,
  disputeId,
  type,
  onPhotoUploaded,
  label,
  className,
}: PhotoUploaderProps) {
  const t = useTranslations("photos");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [progressText, setProgressText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsSuccess(false);

    startTransition(async () => {
      try {
        // 1. Compress on device (< 1280px, < 300 KB)
        setProgressText(t("compressing"));
        const compressed = await compressImage(file, {
          maxDimension: 1280,
          maxSizeBytes: 300 * 1024,
        });

        // 2. Request short-lived presigned PUT URL
        setProgressText(t("requestingUrl"));
        const urlRes = await getPhotoUploadUrlAction({
          orderId,
          orderItemId,
          type,
          contentType: compressed.mimeType,
        });

        if (!urlRes.ok) {
          setErrorMessage(urlRes.error);
          setProgressText(null);
          return;
        }

        // 3. Direct upload to R2 with retry
        setProgressText(t("uploading"));
        const uploadSuccess = await uploadBlobWithRetry(
          urlRes.value.uploadUrl,
          compressed.blob,
          { maxRetries: 3 }
        );

        if (!uploadSuccess) {
          setErrorMessage(t("uploadFailed"));
          setProgressText(null);
          return;
        }

        // 4. Confirm upload in order_photos
        setProgressText(t("confirming"));
        const recordRes = await recordPhotoUploadAction({
          orderId,
          orderItemId,
          missionId,
          disputeId,
          type,
          storageKey: urlRes.value.storageKey,
          sizeBytes: compressed.sizeBytes,
        });

        if (!recordRes.ok) {
          setErrorMessage(recordRes.error);
          setProgressText(null);
          return;
        }

        setIsSuccess(true);
        setProgressText(null);
        onPhotoUploaded?.(recordRes.value.storageKey, recordRes.value.photoId);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : t("unknownError")
        );
        setProgressText(null);
      }
    });
  };

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => fileInputRef.current?.click()}
        className="h-9 px-3 text-xs font-semibold rounded-xl border-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin text-blue-600" />
        ) : isSuccess ? (
          <Check className="size-3.5 text-emerald-600" />
        ) : (
          <Camera className="size-3.5 text-slate-600" />
        )}
        <span>{progressText || label || t("takePhoto")}</span>
      </Button>

      {errorMessage && (
        <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px] flex items-center gap-1.5">
          <AlertTriangle className="size-3.5 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
