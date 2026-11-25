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
  pill?: boolean;
  title?: string;
  className?: string;
}

export function StatusBadge({
  children,
  tone = "secondary",
  icon,
  dot,
  pill = false,
  title,
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
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium border shadow-none whitespace-nowrap",
        pill ? "rounded-full" : "rounded-md",
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
