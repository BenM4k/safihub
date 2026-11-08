import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoMarkProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "auto" | "light" | "dark";
  priority?: boolean;
}

const SIZE_MAP: Record<NonNullable<BrandLogoMarkProps["size"]>, { class: string; px: number }> = {
  xs: { class: "size-5", px: 20 },
  sm: { class: "size-6", px: 24 },
  md: { class: "size-8", px: 32 },
  lg: { class: "size-10", px: 40 },
  xl: { class: "size-12", px: 48 },
};

/**
 * Renders the official SafiHub folded isometric ribbon logo mark without background.
 * Theme-aware: automatically switches between Royal Indigo (light) and Electric Indigo (dark).
 */
export function BrandLogoMark({
  size = "md",
  className,
  variant = "auto",
  priority = false,
}: BrandLogoMarkProps) {
  const { class: sizeClass, px } = SIZE_MAP[size];

  return (
    <div className={cn("relative shrink-0 flex items-center justify-center select-none", sizeClass, className)}>
      {variant !== "dark" && (
        <Image
          src="/logo-light.png"
          alt="SafiHub"
          width={px}
          height={px}
          priority={priority}
          className={cn("size-full object-contain", variant === "auto" && "dark:hidden")}
        />
      )}
      {variant !== "light" && (
        <Image
          src="/logo-dark.png"
          alt="SafiHub"
          width={px}
          height={px}
          priority={priority}
          className={cn("size-full object-contain", variant === "auto" ? "hidden dark:block" : "block")}
        />
      )}
    </div>
  );
}

export interface BrandLogoProps extends BrandLogoMarkProps {
  href?: string | null;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  hubClassName?: string;
  dot?: boolean;
}

/**
 * Official SafiHub brand logo (Icon mark + Wordmark).
 * Dimensions: font-display font-black text-2xl tracking-tight matching the landing navbar.
 * Design: "Safi" in heading text + "Hub" in primary brand color.
 */
export function BrandLogo({
  href = "/",
  size = "md",
  showWordmark = true,
  wordmarkClassName,
  hubClassName,
  dot = false,
  className,
  variant = "auto",
  priority = false,
}: BrandLogoProps) {
  const textSizes: Record<NonNullable<BrandLogoProps["size"]>, string> = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 group shrink-0", className)}>
      <BrandLogoMark size={size} variant={variant} priority={priority} />
      {showWordmark && (
        <span
          className={cn(
            "font-display font-black tracking-tight text-heading leading-none",
            textSizes[size],
            wordmarkClassName
          )}
        >
          Safi<span className={cn("text-primary", hubClassName)}>Hub</span>
          {dot && <span className="text-primary">.</span>}
        </span>
      )}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center shrink-0 hover:opacity-95 transition-opacity"
      aria-label="SafiHub Accueil"
    >
      {content}
    </Link>
  );
}

