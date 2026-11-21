import { cn } from "@/lib/utils";
import { GarmentSvg } from "./garment-svgs";
import {
  GARMENT_ICON_STYLES,
  resolveGarmentKind,
  type GarmentIconKind,
} from "./resolve-garment-kind";

export type GarmentIconSize = "sm" | "md" | "lg";

interface GarmentIconProps {
  name?: string | null;
  category?: string | null;
  kind?: GarmentIconKind;
  size?: GarmentIconSize;
  className?: string;
}

const SIZE_CLASSES: Record<GarmentIconSize, { box: string; svg: string }> = {
  sm: {
    box: "size-9 rounded-xl",
    svg: "size-5",
  },
  md: {
    box: "size-10 rounded-xl",
    svg: "size-6",
  },
  lg: {
    box: "size-14 sm:size-16 rounded-2xl",
    svg: "size-8 sm:size-9",
  },
};

export function GarmentIcon({
  name,
  category,
  kind,
  size = "md",
  className,
}: GarmentIconProps) {
  const resolvedKind = kind ?? resolveGarmentKind(name, category);
  const palette = GARMENT_ICON_STYLES[resolvedKind];
  const dims = SIZE_CLASSES[size];

  return (
    <div
      className={cn(
        "shrink-0 border flex items-center justify-center transition-colors",
        dims.box,
        palette.container,
        className
      )}
      aria-hidden="true"
    >
      <GarmentSvg kind={resolvedKind} className={cn(dims.svg, palette.icon)} />
    </div>
  );
}

export { resolveGarmentKind, type GarmentIconKind };
