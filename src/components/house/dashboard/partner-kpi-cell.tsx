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
}

export function PartnerKpiCell({
  label,
  value,
  subtext,
  icon: Icon,
  href,
  iconBgClass = "bg-primary/10 text-primary",
  valueClass = "text-foreground",
}: PartnerKpiCellProps) {
  return (
    <Link
      href={href}
      className="flex-1 p-3 text-left space-y-1 transition-colors rounded-xl hover:bg-muted/30 group cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2">
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
      <div className="flex items-baseline justify-between gap-2 mt-1">
        <span
          className={cn(
            "text-xl sm:text-2xl font-bold font-mono tabular-nums truncate",
            valueClass
          )}
        >
          {value}
        </span>
        <ChevronRight className="size-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="text-[11px] text-muted-foreground truncate">{subtext}</div>
    </Link>
  );
}
