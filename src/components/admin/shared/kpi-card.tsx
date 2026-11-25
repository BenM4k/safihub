import { type ReactNode, type ElementType } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type KpiCardVariant = "default" | "success" | "warning" | "destructive";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon?: ElementType;
  secondary?: ReactNode;
  tooltip?: string;
  formula?: string;
  variant?: KpiCardVariant;
  onClick?: () => void;
  isSelected?: boolean;
}

const variantStyles: Record<
  KpiCardVariant,
  {
    container: string;
    iconWrapper: string;
    valueClass: string;
  }
> = {
  default: {
    container: "bg-card border-border hover:border-ink-400 shadow-xs",
    iconWrapper: "bg-surface text-ink-600 border-border",
    valueClass: "text-heading",
  },
  success: {
    container: "bg-success-soft/50 border-success/40 hover:border-success/70 shadow-xs",
    iconWrapper: "bg-success-soft text-success border-success/30",
    valueClass: "text-success",
  },
  warning: {
    container: "bg-warning-soft/50 border-warning/40 hover:border-warning/70 shadow-xs",
    iconWrapper: "bg-warning-soft text-warning border-warning/30",
    valueClass: "text-warning",
  },
  destructive: {
    container: "bg-destructive-soft/50 border-destructive/40 hover:border-destructive/70 shadow-xs",
    iconWrapper: "bg-destructive-soft text-destructive border-destructive/30",
    valueClass: "text-destructive",
  },
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  secondary,
  tooltip,
  formula,
  variant = "default",
  onClick,
  isSelected,
}: KpiCardProps) {
  const styles = variantStyles[variant];
  const tooltipText = formula
    ? `${formula}${tooltip ? ` · ${tooltip}` : ""}`
    : tooltip;

  const containerClassName = cn(
    "relative p-4 rounded-xl border shadow-xs transition-all flex flex-col justify-between gap-3 w-full text-left",
    styles.container,
    isSelected && "ring-2 ring-primary border-primary shadow-sm"
  );

  const labelContent = (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {label}
    </p>
  );

  return (
    <div className={containerClassName}>
      <div className="flex items-start justify-between gap-2 w-full">
        <div className="flex items-center gap-1.5 flex-wrap">
          {onClick ? (
            <button
              type="button"
              onClick={onClick}
              className="text-left cursor-pointer focus-visible:outline-hidden after:absolute after:inset-0 after:content-[''] after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-primary"
            >
              {labelContent}
            </button>
          ) : (
            labelContent
          )}
          {tooltipText && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className="relative z-10 inline-flex items-center text-muted-foreground hover:text-heading transition-colors cursor-help focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                    aria-label={tooltip ?? formula}
                  />
                }
              >
                <Info className="size-3.5" aria-hidden="true" />
              </TooltipTrigger>
              <TooltipContent>{tooltipText}</TooltipContent>
            </Tooltip>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              "size-9 rounded-lg flex items-center justify-center border shrink-0",
              styles.iconWrapper
            )}
          >
            <Icon className="size-4.5" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="space-y-1 w-full">
        <p
          className={cn(
            "text-2xl font-bold font-mono tabular-nums tracking-tight",
            styles.valueClass
          )}
        >
          {value}
        </p>

        {secondary && (
          <div className="text-xs text-muted-foreground pt-1.5 border-t border-border">
            {secondary}
          </div>
        )}
      </div>
    </div>
  );
}
