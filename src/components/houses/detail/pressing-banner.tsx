import Image from "next/image";
import { normalizeStorageUrl } from "@/lib/storage-url";

interface PressingBannerProps {
  name: string;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PressingBanner({ name, coverImageUrl, logoUrl }: PressingBannerProps) {
  const initials = getInitials(name);
  const displayCoverUrl = normalizeStorageUrl(coverImageUrl);
  const displayLogoUrl = normalizeStorageUrl(logoUrl);

  return (
    <div className="relative w-full bg-background">
      {/* Banner Cover Container: 4:1 on desktop, ~16:9 on mobile, max 320px on desktop */}
      <div className="relative w-full aspect-[16/9] md:aspect-[4/1] max-h-[320px] overflow-hidden bg-muted">
        {displayCoverUrl ? (
          <Image
            src={displayCoverUrl}
            alt={`Photo de couverture du pressing ${name} à Bukavu`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1280px"
            className="object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-4xl sm:text-6xl font-black text-muted-foreground/40 tracking-widest select-none">
              {initials}
            </span>
          </div>
        )}
      </div>

      {/* Overlapping Logo (88-112px, e.g. size-24 sm:size-28) overlapping bottom-left edge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="absolute -top-12 sm:-top-14 left-4 sm:left-6 size-24 sm:size-28 rounded-2xl sm:rounded-3xl bg-card p-1.5 shadow-md border border-border z-10 overflow-hidden flex items-center justify-center">
          {displayLogoUrl ? (
            <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-muted">
              <Image
                src={displayLogoUrl}
                alt={`Logo ${name}`}
                fill
                sizes="112px"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-full rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-black text-primary tracking-wider">
                {initials}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
