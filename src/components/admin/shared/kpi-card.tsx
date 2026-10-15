import { type ReactNode, type ElementType } from "react";
import { Info } from "lucide-react";

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
    container: "bg-card border-border-strong hover:border-ink-400 shadow-xs",
    iconWrapper: "bg-surface text-ink-600 border-border-strong",
    valueClass: "text-heading",
  },
  success: {
    container: "bg-success-light/50 border-success-base/50 hover:border-success-base/70 shadow-xs",
    iconWrapper: "bg-success-light text-success-base border-success-base/40",
    valueClass: "text-success-base",
  },
  warning: {
    container: "bg-warning-light/50 border-warning-base/50 hover:border-warning-base/70 shadow-xs",
    iconWrapper: "bg-warning-light text-warning-base border-warning-base/40",
    valueClass: "text-warning-base",
  },
  destructive: {
    container: "bg-destructive-light/50 border-destructive-base/50 hover:border-destructive-base/70 shadow-xs",
    iconWrapper: "bg-destructive-light text-destructive-base border-destructive-base/40",
    valueClass: "text-destructive-base",
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

  const content = (
    <div
      className={`p-4 rounded-xl border-2 shadow-xs transition-all flex flex-col justify-between gap-3 ${
        styles.container
      } ${
        isSelected
          ? "ring-2 ring-primary border-primary shadow-sm"
          : ""
      } ${onClick ? "cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary" : ""}`}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === "Enter" || e.key === " ") && onClick() : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          {(tooltip || formula) && (
            <span
              className="inline-flex items-center text-ink-400 hover:text-ink-600 transition-colors cursor-help"
              title={formula ? `${formula}${tooltip ? ` · ${tooltip}` : ""}` : tooltip}
              aria-label={tooltip ?? formula}
            >
              <Info className="size-3.5" />
            </span>
          )}
        </div>

        {Icon && (
          <div
            className={`size-9 rounded-lg flex items-center justify-center border shrink-0 ${styles.iconWrapper}`}
          >
            <Icon className="size-4.5" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${styles.valueClass}`}>
          {value}
        </p>

        {secondary && (
          <div className="text-xs text-muted-foreground pt-1.5 border-t border-border-strong/70">
            {secondary}
          </div>
        )}
      </div>
    </div>
  );

  return content;
}
