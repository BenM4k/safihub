import { type ReactNode } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  children: ReactNode;
  onRemove: () => void;
  removeAriaLabel: string;
  tone?: "default" | "warning";
  className?: string;
}

export function FilterChip({
  children,
  onRemove,
  removeAriaLabel,
  tone = "default",
  className,
}: FilterChipProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border-2 shadow-none",
        tone === "default"
          ? "bg-surface border-border-strong text-ink-800 hover:bg-surface"
          : "bg-warning-soft border-warning/40 text-warning hover:bg-warning-soft",
        className
      )}
    >
      <span>{children}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-ink-400 hover:text-ink-800 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer shrink-0"
        aria-label={removeAriaLabel}
      >
        <X className="size-3.5" />
      </button>
    </Badge>
  );
}
