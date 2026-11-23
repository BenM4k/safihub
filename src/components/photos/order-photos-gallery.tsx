"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Image as ImageIcon, X, ExternalLink, ShieldAlert } from "lucide-react";
import type { PhotoWithSignedUrl } from "@/services/storage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderPhotosGalleryProps {
  photos: PhotoWithSignedUrl[];
  className?: string;
}

export function OrderPhotosGallery({
  photos,
  className,
}: OrderPhotosGalleryProps) {
  const t = useTranslations("photos");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithSignedUrl | null>(
    null
  );

  if (photos.length === 0) {
    return (
      <div
        className={`p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1 text-slate-500 text-xs ${
          className ?? ""
        }`}
      >
        <ImageIcon className="size-5 mx-auto text-slate-400" />
        <p>{t("noPhotos")}</p>
      </div>
    );
  }

  const pickupPhotos = photos.filter((p) => p.type === "pickup_condition");
  const deliveryPhotos = photos.filter((p) => p.type === "delivery_proof");
  const disputePhotos = photos.filter((p) => p.type === "dispute");

  const selectedPhotoTitle =
    selectedPhoto?.type === "pickup_condition"
      ? t("pickupPhotosTitle")
      : selectedPhoto?.type === "delivery_proof"
        ? t("deliveryPhotosTitle")
        : t("disputePhotosTitle");

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-blue-900 text-[11px]">
        <ShieldAlert className="size-4 shrink-0 text-blue-600" />
        <span>{t("privacyNotice")}</span>
      </div>

      {pickupPhotos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("pickupPhotosTitle")} ({pickupPhotos.length})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {pickupPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:opacity-90 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <Image
                  src={photo.downloadUrl}
                  alt={t("photoAlt")}
                  fill
                  sizes="(max-width: 768px) 33vw, 120px"
                  unoptimized
                  className="object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {deliveryPhotos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("deliveryPhotosTitle")} ({deliveryPhotos.length})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {deliveryPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:opacity-90 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <Image
                  src={photo.downloadUrl}
                  alt={t("deliveryProofAlt")}
                  fill
                  sizes="(max-width: 768px) 33vw, 120px"
                  unoptimized
                  className="object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {disputePhotos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("disputePhotosTitle")} ({disputePhotos.length})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {disputePhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:opacity-90 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <Image
                  src={photo.downloadUrl}
                  alt={t("disputePhotoAlt")}
                  fill
                  sizes="(max-width: 768px) 33vw, 120px"
                  unoptimized
                  className="object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(selectedPhoto)}
        onOpenChange={(open) => {
          if (!open) setSelectedPhoto(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-lg w-full bg-slate-900 border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-2 gap-0"
        >
          {selectedPhoto && (
            <>
              <div className="flex items-center justify-between p-2 text-white text-xs">
                <DialogTitle className="text-xs font-medium text-slate-300">
                  {selectedPhotoTitle}
                </DialogTitle>
                <div className="flex items-center gap-1">
                  <a
                    href={selectedPhoto.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:text-blue-400"
                    aria-label={t("openInNewTab")}
                  >
                    <ExternalLink className="size-4" />
                  </a>
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-7 p-0 text-slate-400 hover:text-white"
                      aria-label={t("close")}
                    >
                      <X className="size-4" />
                    </Button>
                  </DialogClose>
                </div>
              </div>

              <div className="relative max-h-[75vh] min-h-[200px] flex items-center justify-center bg-black/40 rounded-xl overflow-hidden p-2">
                <Image
                  src={selectedPhoto.downloadUrl}
                  alt={t("photoAlt")}
                  width={800}
                  height={800}
                  unoptimized
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
