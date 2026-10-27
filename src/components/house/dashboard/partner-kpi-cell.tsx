import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PartnerKpiCellProps {
  label: string;
  value: string | number;
  subtext: React.ReactNode;
  icon: LucideIcon;
  href: string;
  iconBgClass?: string;
  valueClass?: string;
  className?: string;
}

export function PartnerKpiCell({
  label,
  value,
  subtext,
  icon: Icon,
  href,
  iconBgClass = "bg-primary/10 text-primary",
  valueClass = "text-foreground",
  className,
}: PartnerKpiCellProps) {
  return (
    <Link
      href={href}
      className={cn(
        "p-3 sm:p-3.5 text-left rounded-xl hover:bg-muted/30 transition-colors group cursor-pointer flex flex-col justify-between",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {label}
          </span>
          <div
            className={cn(
              "size-7 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform",
              iconBgClass
            )}
          >
            <Icon className="size-3.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-2 mt-1 sm:mt-1.5">
          <span
            className={cn(
              "text-lg sm:text-xl font-bold font-mono tabular-nums truncate",
              valueClass
            )}
          >
            {value}
          </span>
          <ChevronRight className="size-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground truncate mt-1">{subtext}</div>
    </Link>
  );
}
