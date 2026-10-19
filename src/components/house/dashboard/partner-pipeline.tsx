"use client";

import Link from "next/link";
import { Clock, Waves, PackageCheck, CheckCircle2, ArrowRight } from "lucide-react";
import type { HouseDashboardMetrics } from "@/dal";

interface PartnerPipelineProps {
  metrics: HouseDashboardMetrics;
  houseSlug: string;
}

export function PartnerPipeline({ metrics, houseSlug }: PartnerPipelineProps) {
  const cards = [
    {
      label: "En attente d'acceptation",
      count: metrics.waitingAcceptanceCount,
      emptyText: "Aucune commande en attente",
      href: `/partner/${houseSlug}/orders?status=created`,
      icon: Clock,
      colorClass: "text-warning bg-warning-soft border-warning/20",
      countClass: "text-warning",
    },
    {
      label: "En traitement / lavage",
      count: metrics.washingCount,
      emptyText: "Aucun linge en machine",
      href: `/partner/${houseSlug}/orders?status=washing`,
      icon: Waves,
      colorClass: "text-primary bg-primary-soft border-primary/20",
      countClass: "text-primary",
    },
    {
      label: "Prêtes pour livraison",
      count: metrics.readyCount,
      emptyText: "Aucun colis en attente",
      href: `/partner/${houseSlug}/orders?status=ready`,
      icon: PackageCheck,
      colorClass: "text-heading bg-secondary border-border",
      countClass: "text-heading",
    },
    {
      label: "Livrées aujourd'hui",
      count: metrics.completedTodayCount,
      emptyText: "Aucune livraison ce jour",
      href: `/partner/${houseSlug}/orders?status=delivered`,
      icon: CheckCircle2,
      colorClass: "text-success bg-success-soft border-success/20",
      countClass: "text-success",
    },
  ];

  return (
    <section className="space-y-3 font-sans" aria-label="Pipeline des commandes">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-heading tracking-tight font-display">
          Pipeline des commandes
        </h2>
        <Link
          href={`/partner/${houseSlug}/orders`}
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 hover:underline"
        >
          <span>Toutes les commandes</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          const hasItems = c.count > 0;

          return (
            <Link
              key={c.label}
              href={c.href}
              className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-border-strong hover:shadow-sm transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-muted-foreground truncate">
                  {c.label}
                </span>
                <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 border ${c.colorClass}`}>
                  <Icon className="size-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className={`text-2xl font-black font-display ${hasItems ? c.countClass : "text-muted-foreground/60"}`}>
                  {c.count}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {hasItems ? "Commandes actives" : c.emptyText}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
