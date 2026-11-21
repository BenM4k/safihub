"use client";

import { useTranslations } from "next-intl";
import { Check, Clock, MapPin, Minus, Plus, ShieldCheck } from "lucide-react";
import { BrandLogoMark } from "@/components/common/brand-logo";
import { GarmentIcon } from "@/components/common/garment-icon";

export function ComboOrderCatalogueCard() {
  const t = useTranslations("hero.statusCard");

  const catalogueRows = [
    { kind: "shirt" as const, name: t("item1Name"), price: "2 500 CDF", qty: 3 },
    { kind: "duvet" as const, name: "Couette & Duvet", price: "18 000 CDF", qty: 1 },
    { kind: "trousers" as const, name: t("item3Name"), price: "3 000 CDF", qty: 2 },
  ];

  return (
    <div className="w-full bg-background text-foreground flex flex-col">
      {/* Real Navbar */}
      <div className="px-4 py-2.5 bg-card border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BrandLogoMark size="sm" />
          <span className="font-display font-bold text-sm text-heading">
            Safi<span className="text-primary">Hub</span>
          </span>
        </div>
        <span className="eyebrow">{t("comboOrderTag")}</span>
      </div>

      {/* Split Live Page Composition: Catalogue Page + Live Order Checkout Panel */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* Left 7 cols: Public Catalogue Page Slice */}
        <div className="md:col-span-7 rounded-xl bg-card border border-border p-3.5 shadow-soft space-y-2.5">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <p className="text-xs font-semibold text-heading truncate">{t("catalogueTitle")}</p>
            <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold">
              {t("serviceWash")}
            </span>
          </div>

          <div className="space-y-2">
            {catalogueRows.map((row) => (
              <div
                key={row.kind}
                className="rounded-lg border border-border/80 bg-surface p-2 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GarmentIcon kind={row.kind} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-heading truncate">{row.name}</p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">{row.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-md border border-primary/30 bg-card p-0.5 shrink-0">
                  <Minus className="size-3 text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-4 text-center text-[11px] font-semibold text-primary tabular-nums">
                    {row.qty}
                  </span>
                  <Plus className="size-3 text-primary" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Live Order & Pickup Confirmation Sheet */}
        <div className="md:col-span-5 rounded-xl bg-card border-2 border-primary/30 p-3.5 shadow-card flex flex-col justify-between gap-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-heading">#SH-2849</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-soft text-success text-[10px] font-semibold">
                <Check className="size-3 stroke-[2.5]" aria-hidden="true" />
                Confirmée
              </span>
            </div>

            <div className="rounded-lg bg-surface border border-border p-2.5 space-y-1.5">
              <p className="text-xs font-semibold text-heading flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">{t("comboPickupTitle")}</span>
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">{t("comboPickupMeta")}</span>
              </p>
            </div>
          </div>

          <div className="pt-2.5 border-t border-border/70 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-muted-foreground">Total CoD</span>
              <span className="text-sm font-bold text-heading tabular-nums">31 500 CDF</span>
            </div>
            <p className="text-[10px] text-success font-medium flex items-center gap-1">
              <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{t("courierMeta")}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
