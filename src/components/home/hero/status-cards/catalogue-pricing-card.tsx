"use client";

import { useTranslations } from "next-intl";
import {
  Search,
  Star,
  ShieldCheck,
  Minus,
  Plus,
  ChevronDown,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { BrandLogoMark } from "@/components/common/brand-logo";
import { GarmentIcon } from "@/components/common/garment-icon";

export function CataloguePricingCard() {
  const t = useTranslations("hero.statusCard");

  const rows = [
    { kind: "shirt" as const, name: t("item1Name"), fabric: t("fabricStandard"), price: "2 500 CDF", qty: 2 },
    { kind: "suit" as const, name: t("item2Name"), fabric: t("fabricStandard"), price: "15 000 CDF", qty: 1 },
    { kind: "dress" as const, name: "Robe de cérémonie", fabric: t("fabricSilk"), price: "12 000 CDF", qty: 0 },
    { kind: "shoes" as const, name: "Baskets & Sneakers", fabric: t("fabricStandard"), price: "8 000 CDF", qty: 1 },
  ];

  return (
    <div className="w-full bg-background text-foreground flex flex-col">
      {/* Actual Top Navbar */}
      <div className="px-4 py-2.5 bg-card border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BrandLogoMark size="sm" />
          <span className="font-display font-bold text-sm text-heading">
            Safi<span className="text-primary">Hub</span>
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono truncate">/houses/pressing-lumiere</span>
      </div>

      {/* Pressing Identity Strip */}
      <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-heading truncate">
              {t("catalogueTitle")}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-soft text-success text-[10px] font-semibold">
              <ShieldCheck className="size-3" aria-hidden="true" />
              Vérifié
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
            <span>{t("catalogueSubtitle")}</span>
            <span className="inline-flex items-center gap-0.5 font-semibold text-heading">
              <Star className="size-3 fill-warning text-warning" aria-hidden="true" />
              4.9
            </span>
          </p>
        </div>
        <span className="eyebrow shrink-0">24h</span>
      </div>

      {/* Responsive Filter Bar */}
      <div className="px-4 py-2.5 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-input text-[11px] text-muted-foreground flex-1 min-w-[140px]">
          <Search className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Rechercher un article...</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <span className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold whitespace-nowrap">
            {t("serviceWash")}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-card border border-border text-muted-foreground text-[10px] font-medium whitespace-nowrap">
            {t("serviceDry")}
          </span>
        </div>
      </div>

      {/* Actual 2-Column Public House Page Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
        {/* Left 8 cols: Vertical Garment List */}
        <div className="md:col-span-8 space-y-2">
          {rows.map((row) => (
            <div
              key={row.kind}
              className={`rounded-xl border p-2.5 bg-card flex items-center justify-between gap-2 shadow-soft ${
                row.qty > 0 ? "border-primary/70 ring-1 ring-primary/15" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <GarmentIcon kind={row.kind} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-heading truncate">{row.name}</p>
                  <p className="text-[11px] font-semibold text-heading tabular-nums">{row.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="hidden xs:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted border border-input text-[10px] font-medium text-foreground">
                  <span>{row.fabric}</span>
                  <ChevronDown className="size-3 text-muted-foreground" aria-hidden="true" />
                </span>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
                  <span className="size-5 rounded bg-card border border-border/60 flex items-center justify-center text-muted-foreground">
                    <Minus className="size-2.5" aria-hidden="true" />
                  </span>
                  <span className={`min-w-4 text-center text-[11px] font-semibold tabular-nums ${row.qty > 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {row.qty}
                  </span>
                  <span className="size-5 rounded bg-primary text-primary-foreground flex items-center justify-center">
                    <Plus className="size-2.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right 4 cols: Sticky Decision Card */}
        <div className="md:col-span-4 rounded-xl bg-card border border-border p-3 shadow-card space-y-2.5">
          <p className="text-xs font-semibold text-heading border-b border-border/60 pb-2">
            Votre commande
          </p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="size-3 text-primary" aria-hidden="true" />
              Délai
            </span>
            <span className="font-semibold text-heading">24h</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
            <span className="text-muted-foreground">Total</span>
            <span className="font-bold text-heading tabular-nums">28 000 CDF</span>
          </div>
          <div className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center gap-1.5">
            <ShoppingBag className="size-3.5" aria-hidden="true" />
            <span>{t("cartAction")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
