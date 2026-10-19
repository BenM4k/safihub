"use client";

import { useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { validateBannerImageFile } from "@/lib/partner-dashboard";

export function PhotoCard() {
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateBannerImageFile(file);
    if (!validation.ok) {
      setPhotoError(validation.error);
      return;
    }

    setCoverPhotoUrl(URL.createObjectURL(file));
  }

  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="size-4 text-primary" />
        <h2 className="text-sm font-bold text-heading">Photo de vitrine du pressing</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Image affichée sur la carte et la fiche client. Format JPG, PNG ou WebP (max 5 Mo).
      </p>

      {photoError && (
        <div className="p-3 bg-destructive-soft border border-destructive/30 rounded-xl text-xs text-destructive font-semibold">
          {photoError}
        </div>
      )}

      {coverPhotoUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-border h-40 bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverPhotoUrl}
            alt="Vitrine du pressing"
            className="w-full h-full object-cover"
          />
          <label className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer font-semibold backdrop-blur-xs flex items-center gap-1.5">
            <Upload className="size-3.5" />
            <span>Changer la photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="sr-only"
            />
          </label>
        </div>
      ) : (
        <label className="p-6 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-surface transition space-y-2 text-center">
          <Upload className="size-6 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">
            Téléverser une photo de votre vitrine
          </span>
          <span className="text-[11px] text-muted-foreground">
            Glissez-déposez ou cliquez pour parcourir (JPG, PNG, WebP &lt; 5 Mo)
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="sr-only"
          />
        </label>
      )}

      <p className="text-[11px] text-muted-foreground">
        Toute nouvelle photo de vitrine reste soumise à validation modérée par l&apos;équipe SafiHub avant publication publique.
      </p>
    </section>
  );
}
