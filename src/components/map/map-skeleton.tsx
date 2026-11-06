import { MapPin } from "lucide-react";

interface MapSkeletonProps {
  label?: string;
  className?: string;
}

export function MapSkeleton({ label, className = "" }: MapSkeletonProps) {
  return (
    <div
      className={`relative w-full h-full min-h-[260px] bg-[#182a38] overflow-hidden select-none flex items-center justify-center ${className}`}
    >
      {/* Lake Kivu stylized backdrop */}
      <div className="absolute top-0 right-0 w-[55%] h-[65%] rounded-bl-[120px] bg-[#0b1f33]/90">
        <div className="absolute top-6 right-6 text-[10px] font-bold tracking-widest uppercase opacity-35 text-cyan-200">
          Lac Kivu (Bukavu)
        </div>
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Center loading badge */}
      {label && (
        <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-card/90 border border-border text-xs font-bold text-foreground shadow-md backdrop-blur-md">
          <MapPin className="size-3.5 text-primary animate-bounce" />
          <span>{label}</span>
        </div>
      )}
    </div>
  );
}

