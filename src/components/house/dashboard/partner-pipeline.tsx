"use client";

import Link from "next/link";
import { Clock, Waves, PackageCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import type { HouseDashboardMetrics } from "@/dal";

interface PartnerPipelineProps {
  metrics: HouseDashboardMetrics;
  houseSlug: string;
}

export function PartnerPipeline({ metrics, houseSlug }: PartnerPipelineProps) {
  const t = useTranslations("house.dashboard");

  const cards = [
    {
      label: t("waitingAcceptance"),
      count: metrics.waitingAcceptanceCount,
      emptyText: t("emptyPipelineWaiting"),
      href: `/partner/${houseSlug}/orders?status=created`,
      icon: Clock,
      colorClass: "text-warning bg-warning-soft border border-warning/20",
      countClass: "text-warning",
    },
    {
      label: t("washing"),
      count: metrics.washingCount,
      emptyText: t("emptyPipelineWashing"),
      href: `/partner/${houseSlug}/orders?status=washing`,
      icon: Waves,
      colorClass: "text-primary bg-primary-soft border border-primary/20",
      countClass: "text-primary",
    },
    {
      label: t("ready"),
      count: metrics.readyCount,
      emptyText: t("emptyPipelineReady"),
      href: `/partner/${houseSlug}/orders?status=ready`,
      icon: PackageCheck,
      colorClass: "text-heading bg-secondary border border-border/40",
      countClass: "text-heading",
    },
    {
      label: t("completedToday"),
      count: metrics.completedTodayCount,
      emptyText: t("emptyPipelineCompleted"),
      href: `/partner/${houseSlug}/orders?status=delivered`,
      icon: CheckCircle2,
      colorClass: "text-success bg-success-soft border border-success/20",
      countClass: "text-success",
    },
  ];

  function renderPipelineItem(c: (typeof cards)[number], className?: string) {
    const Icon = c.icon;
    const hasItems = c.count > 0;

    return (
      <Link
        key={c.label}
        href={c.href}
        className={`flex-1 p-2.5 sm:p-3 rounded-xl hover:bg-muted/30 transition-colors group flex flex-col justify-between ${className ?? ""}`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-xs font-bold text-muted-foreground leading-snug line-clamp-2 min-h-[2rem] flex items-center">
            {c.label}
          </span>
          <div className={`size-7 sm:size-8 rounded-xl flex items-center justify-center shrink-0 ${c.colorClass}`}>
            <Icon className="size-3.5 sm:size-4" />
          </div>
        </div>

        <div className="mt-2 sm:mt-3">
          <div className={`text-xl sm:text-2xl font-black font-display ${hasItems ? c.countClass : "text-muted-foreground/60"}`}>
            {c.count}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">
            {hasItems ? t("activeOrders") : c.emptyText}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <section className="space-y-3 font-sans" aria-label={t("pipelineTitle")}>
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-heading tracking-tight font-display">
          {t("pipelineTitle")}
        </h2>
        <Link
          href={`/partner/${houseSlug}/orders`}
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 hover:underline"
        >
          <span>{t("allOrdersLink")}</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="bg-card rounded-2xl p-2 sm:p-3 font-sans">
        {/* Desktop Layout (>=768px): 1 continuous row with clean vertical separators */}
        <div className="hidden md:flex md:items-stretch">
          {cards.map((c, idx) => (
            <div key={c.label} className="flex-1 flex items-stretch">
              {idx > 0 && (
                <Separator orientation="vertical" className="h-12 mx-1 my-auto shrink-0 bg-border/60" />
              )}
              {renderPipelineItem(c)}
            </div>
          ))}
        </div>

        {/* Mobile Layout (<768px): 2 columns with clean vertical & horizontal separators */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 items-stretch">
            {renderPipelineItem(cards[0], "pr-2")}
            <div className="border-l border-border/60 pl-2 flex flex-col justify-between">
              {renderPipelineItem(cards[1])}
            </div>
          </div>

          <Separator className="my-1.5 bg-border/60" />

          <div className="grid grid-cols-2 items-stretch">
            {renderPipelineItem(cards[2], "pr-2")}
            <div className="border-l border-border/60 pl-2 flex flex-col justify-between">
              {renderPipelineItem(cards[3])}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
