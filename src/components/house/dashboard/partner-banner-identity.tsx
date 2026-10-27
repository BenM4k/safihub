"use client";

import { Star } from "lucide-react";

interface PartnerBannerIdentityProps {
  name: string;
  initials: string;
  logoUrl?: string | null;
  locationText: string;
  rating?: number | null;
  statusPill: {
    status: "open" | "closed" | "paused";
    label: string;
    badgeClass: string;
  };
}

export function PartnerBannerIdentity({
  name,
  initials,
  logoUrl,
  locationText,
  rating,
  statusPill,
}: PartnerBannerIdentityProps) {
  return (
    <div className="flex items-stretch gap-3 sm:gap-3.5 min-w-0 flex-1">
      {/* 1. Logo container: matches the 3-row column height */}
      <div className="aspect-square self-stretch shrink-0 min-w-[3.75rem] max-w-[5rem] rounded-2xl bg-card p-1 shadow-card border-2 border-card overflow-hidden flex items-center justify-center">
        <div className="size-full rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl sm:text-2xl font-display shadow-xs">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`Logo ${name}`}
              className="size-full object-cover rounded-xl"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </div>

      {/* 2. Column: Name -> Address & Rating -> State */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-1">
        {/* Name */}
        <h1 className="text-base sm:text-lg font-black text-heading tracking-tight font-display truncate leading-tight">
          {name}
        </h1>

        {/* Address & Rating */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate leading-none">
          <span className="font-medium text-foreground truncate">{locationText}</span>
          {rating && (
            <span className="inline-flex items-center gap-1 font-bold text-warning-foreground bg-highlight px-1.5 py-0.5 rounded-full border border-warning/30 text-[10px] shrink-0">
              <Star className="size-2.5 fill-amber-400 text-amber-500" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* State / Status pill */}
        <div className="flex items-center">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${statusPill.badgeClass}`}
          >
            <span className="size-1.5 rounded-full bg-current animate-pulse" />
            <span>{statusPill.label}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
