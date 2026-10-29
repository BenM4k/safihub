"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";
import { useTranslations } from "next-intl";
import { PressingLightbox } from "./pressing-lightbox";

interface PressingGalleryProps {
  photos: string[];
  houseName: string;
}

export function PressingGallery({ photos, houseName }: PressingGalleryProps) {
  const t = useTranslations("customerHouses");
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  const displayPhotos = photos.slice(0, 4);

  return (
    <div className="w-full bg-card border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Photos de l&apos;atelier &amp; réalisations
          </span>
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setIsOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition cursor-pointer"
          >
            <Images className="size-3.5" />
            <span>{t("viewPhotos", { count: photos.length })}</span>
          </button>
        </div>

        {/* Responsive Photo Strip / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {displayPhotos.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setIsOpen(true);
              }}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted cursor-pointer shadow-xs hover:shadow-sm transition"
            >
              <Image
                src={url}
                alt={`${houseName} - photo ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {idx === 3 && photos.length > 4 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center text-white font-black text-sm">
                  +{photos.length - 4} photos
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <PressingLightbox
        photos={photos}
        currentIndex={currentIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNavigate={setCurrentIndex}
        title={houseName}
      />
    </div>
  );
}
