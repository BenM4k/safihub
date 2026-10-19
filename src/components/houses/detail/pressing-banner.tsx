import Image from "next/image";

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

  return (
    <div className="relative w-full bg-slate-100">
      {/* Banner Cover Container: 4:1 on desktop, ~16:9 on mobile, max 320px on desktop */}
      <div className="relative w-full aspect-[16/9] md:aspect-[4/1] max-h-[320px] overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={`Photo de couverture du pressing ${name} à Bukavu`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1280px"
            className="object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <span className="text-4xl sm:text-6xl font-black text-slate-400/80 tracking-widest select-none">
              {initials}
            </span>
          </div>
        )}
      </div>

      {/* Overlapping Logo (88-112px, e.g. size-24 sm:size-28) overlapping bottom-left edge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="absolute -top-12 sm:-top-14 left-4 sm:left-6 size-24 sm:size-28 rounded-2xl sm:rounded-3xl bg-white p-1.5 shadow-md border border-slate-200/80 z-10 overflow-hidden flex items-center justify-center">
          {logoUrl ? (
            <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50">
              <Image
                src={logoUrl}
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
