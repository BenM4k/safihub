"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { HouseStatusPill } from "../house-status-pill";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import type { AdminHouseRow } from "../types";

interface HouseDetailsHeaderProps {
  house: AdminHouseRow;
  onClose: () => void;
}

export function HouseDetailsHeader({ house, onClose }: HouseDetailsHeaderProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="border-b-2 border-border-strong bg-surface">
      {/* Top Banner Picture */}
      <div className="relative h-28 w-full bg-slate-900 overflow-hidden">
        {!imageError && house.imageUrl ? (
          <Image
            src={house.imageUrl}
            alt={house.name}
            fill
            sizes="(max-width: 768px) 100vw, 450px"
            className="object-cover opacity-85"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="size-full flex items-center justify-center bg-primary text-white font-bold text-2xl">
            {house.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label="Fermer le panneau de détails"
        >
          <X className="size-4" />
        </button>

        {/* Status Pill in corner */}
        <div className="absolute top-3 left-3">
          <HouseStatusPill status={house.status} />
        </div>
      </div>

      {/* Header Info */}
      <div className="p-4 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 id="house-sheet-title" className="text-base font-bold text-heading font-display">
              {house.name}
            </h2>
            <p className="text-xs text-ink-600 font-medium">
              {house.neighborhoodName || "Quartier non assigné"}
              {house.addressNote ? ` · ${house.addressNote}` : ""}
            </p>
          </div>
          <Link
            href={`/admin/houses/${house.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0"
            title="Ouvrir la page complète"
          >
            <span>Fiche</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>

        <div className="pt-1">
          <PhoneCell phone={house.contactPhone} showIcon />
        </div>
      </div>
    </div>
  );
}
