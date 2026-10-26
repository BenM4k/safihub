import { type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusBadgeTone =
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "secondary"
  | "outline";

interface StatusBadgeProps {
  children: ReactNode;
  tone?: StatusBadgeTone;
  icon?: ReactNode;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({
  children,
  tone = "secondary",
  icon,
  dot,
  className,
}: StatusBadgeProps) {
  const dotColorClass =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
      ? "bg-warning"
      : tone === "destructive"
      ? "bg-destructive"
      : tone === "info"
      ? "bg-primary"
      : "bg-ink-500";

  return (
    <Badge
      variant={tone}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border shadow-none",
        className
      )}
    >
      {dot && (
        <span
          className={cn("size-1.5 rounded-full shrink-0", dotColorClass)}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </Badge>
  );
}
