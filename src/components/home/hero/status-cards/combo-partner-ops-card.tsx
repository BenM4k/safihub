"use client";

import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  Tag,
  Truck,
  Wallet,
} from "lucide-react";
import { BrandLogoMark } from "@/components/common/brand-logo";
import { GarmentIcon } from "@/components/common/garment-icon";

export function ComboPartnerOpsCard() {
  const t = useTranslations("hero.statusCard");

  const matrixRows = [
    { kind: "shirt" as const, name: t("item1Name"), std: "2 500", silk: "4 000", net: "2 000" },
    { kind: "suit" as const, name: t("item2Name"), std: "15 000", silk: "19 000", net: "12 000" },
    { kind: "trousers" as const, name: t("item3Name"), std: "3 000", silk: "4 500", net: "2 400" },
  ];

  return (
    <div className="w-full bg-background text-foreground flex min-h-[420px] sm:min-h-[460px]">
      {/* Compact Real Partner Sidebar (sm+) */}
      <aside className="hidden sm:flex flex-col w-40 shrink-0 bg-sidebar border-r border-sidebar-border p-3 gap-2.5">
        <div className="flex items-center gap-2 px-1">
          <BrandLogoMark size="sm" />
          <span className="font-display font-bold text-xs text-heading truncate">SafiHub</span>
        </div>
        <div className="space-y-1 text-[11px] font-medium pt-1">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground">
            <LayoutDashboard className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Dashboard</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary-soft text-primary font-semibold">
            <Tag className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Catalogue</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground">
            <ClipboardList className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Commandes</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground">
            <Wallet className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Paiements</span>
          </div>
        </div>
      </aside>

      {/* Main Unified Partner Ops + Catalogue Matrix */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="px-4 py-2.5 bg-card border-b border-border flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-heading truncate">{t("partnerTitle")}</p>
            <p className="text-[10px] text-muted-foreground truncate">/partner/pressing-etoile/catalogue</p>
          </div>
          <span className="eyebrow shrink-0">{t("comboOpsTag")}</span>
        </div>

        <div className="p-4 space-y-3.5 flex-1">
          {/* Top Partner Catalogue Pricing Table (with Garment Icons!) */}
          <div className="rounded-xl bg-card border border-border shadow-soft overflow-hidden">
            <div className="px-3 py-2 bg-surface border-b border-border flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase">
              <span>Article</span>
              <div className="flex items-center gap-4">
                <span>Standard</span>
                <span className="hidden xs:inline">Soie</span>
                <span className="text-success">Net</span>
              </div>
            </div>
            <div className="divide-y divide-border/60">
              {matrixRows.map((row) => (
                <div key={row.kind} className="px-3 py-2 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <GarmentIcon kind={row.kind} size="sm" />
                    <span className="font-semibold text-heading truncate">{row.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 tabular-nums text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border font-medium">{row.std}</span>
                    <span className="hidden xs:inline px-2 py-0.5 rounded bg-surface border border-border font-medium">{row.silk}</span>
                    <span className="font-semibold text-success">{row.net}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Live Incoming Order + Courier Dispatch Bar */}
          <div className="rounded-xl bg-card border border-border p-3 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-success animate-pulse shrink-0" />
                <p className="text-xs font-semibold text-heading truncate">{t("incomingOrder")}</p>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                <Truck className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">{t("comboOpsDispatch")}</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success-soft text-success text-[10px] font-semibold self-start sm:self-auto shrink-0">
              <CheckCircle2 className="size-3" aria-hidden="true" />
              {t("comboOpsCount")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
