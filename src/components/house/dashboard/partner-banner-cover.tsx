"use client";

import { Camera } from "lucide-react";
import { normalizeStorageUrl } from "@/lib/storage-url";

interface PartnerBannerCoverProps {
  coverImageUrl?: string | null;
  houseName: string;
  initials: string;
  onOpenUpload: () => void;
}

export function PartnerBannerCover({
  coverImageUrl,
  houseName,
  initials,
  onOpenUpload,
}: PartnerBannerCoverProps) {
  const displayCoverUrl = normalizeStorageUrl(coverImageUrl);

  return (
    <div className="relative w-full h-52 sm:h-64 md:h-72 lg:h-80 bg-surface border-b border-border overflow-hidden flex items-center justify-center">
      {displayCoverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayCoverUrl}
          alt={`Photo de l'établissement ${houseName}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <span className="text-4xl sm:text-6xl font-black text-muted-foreground/30 font-display tracking-widest select-none">
            {initials}
          </span>
        </div>
      )}

      {/* Subtle bottom scrim for contrast where identity overlaps */}
      {coverImageUrl && (
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none" />
      )}

      {/* Upload Button overlay */}
      <button
        type="button"
        onClick={onOpenUpload}
        aria-label="Modifier la photo de couverture"
        title="Modifier la photo de couverture"
        className="absolute top-3 right-3 sm:top-4 sm:right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/90 hover:bg-card text-foreground hover:text-heading text-xs font-semibold shadow-xs backdrop-blur-xs transition cursor-pointer border border-border"
      >
        <Camera className="size-3.5 text-primary" />
        <span className="hidden sm:inline">Changer la photo</span>
      </button>
    </div>
  );
}
