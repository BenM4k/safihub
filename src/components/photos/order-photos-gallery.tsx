"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Image as ImageIcon, X, ExternalLink, ShieldAlert } from "lucide-react";
import type { PhotoWithSignedUrl } from "@/services/storage";
import { Button } from "@/components/ui/button";

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
  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPhoto) return;
    lightboxRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto]);

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

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      {/* Privacy compliance banner */}
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
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:opacity-90 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.downloadUrl}
                  alt={t("photoAlt")}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
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
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:opacity-90 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.downloadUrl}
                  alt={t("deliveryProofAlt")}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
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
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:opacity-90 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.downloadUrl}
                  alt={t("disputePhotoAlt")}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox / Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            ref={lightboxRef}
            tabIndex={-1}
            className="relative max-w-lg w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 outline-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 text-white text-xs">
              <span className="font-medium text-slate-300">
                {selectedPhoto.type === "pickup_condition"
                  ? t("pickupPhotosTitle")
                  : selectedPhoto.type === "delivery_proof"
                  ? t("deliveryPhotosTitle")
                  : t("disputePhotosTitle")}
              </span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPhoto(null)}
                  className="size-7 p-0 text-slate-400 hover:text-white"
                  aria-label={t("close")}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <div className="max-h-[75vh] flex items-center justify-center bg-black/40 rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.downloadUrl}
                alt={t("photoAlt")}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
