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
    <div className="flex items-end gap-3.5 min-w-0">
      <div className="size-20 sm:size-24 rounded-2xl bg-card p-1 shadow-card border-2 border-card shrink-0 overflow-hidden">
        <div className="size-full rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-2xl font-display shadow-xs">
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

      <div className="space-y-1 min-w-0 pb-1">
        <h1 className="text-lg sm:text-2xl font-black text-heading tracking-tight font-display truncate">
          {name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{locationText}</span>
          {rating && (
            <span className="inline-flex items-center gap-1 font-bold text-warning-foreground bg-highlight px-2 py-0.5 rounded-full border border-warning/30 text-[11px]">
              <Star className="size-3 fill-amber-400 text-amber-500" />
              {rating.toFixed(1)}
            </span>
          )}
          {/* Status pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-xs ${statusPill.badgeClass}`}
          >
            <span className="size-1.5 rounded-full bg-current animate-pulse" />
            <span>{statusPill.label}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
