"use client";

import { useTranslations } from "next-intl";
import {
  Bell,
  Clock,
  LayoutDashboard,
  ClipboardList,
  Tag,
  MapPin,
  Wallet,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { BrandLogoMark } from "@/components/common/brand-logo";

const WEEKLY_BARS = [44, 62, 54, 78, 70, 96, 84];

export function PartnerDashboardCard() {
  const t = useTranslations("hero.statusCard");

  return (
    <div className="w-full bg-background text-foreground flex min-h-[420px] sm:min-h-[460px]">
      {/* Actual Partner AppShell Sidebar (visible sm+) */}
      <aside className="hidden sm:flex flex-col w-44 shrink-0 bg-sidebar border-r border-sidebar-border p-3 gap-3">
        <div className="flex items-center gap-2 px-1.5 py-1">
          <BrandLogoMark size="sm" />
          <div className="min-w-0 leading-tight">
            <p className="font-display font-bold text-xs text-heading truncate">SafiHub</p>
            <p className="text-[10px] text-muted-foreground truncate">Partenaire</p>
          </div>
        </div>

        <div className="rounded-lg bg-surface border border-border px-2.5 py-1.5">
          <p className="text-[11px] font-semibold text-heading truncate">{t("partnerTitle")}</p>
          <p className="text-[10px] text-success font-medium truncate">{t("partnerLive")}</p>
        </div>

        <nav className="space-y-1 text-[11px] font-medium">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary-soft text-primary font-semibold">
            <LayoutDashboard className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Tableau de bord</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-muted-foreground">
            <span className="flex items-center gap-2 truncate">
              <ClipboardList className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Commandes</span>
            </span>
            <span className="px-1.5 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold">3</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground">
            <Tag className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Catalogue</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Couverture</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground">
            <Wallet className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Paiements</span>
          </div>
        </nav>
      </aside>

      {/* Main Partner Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Partner Top Bar */}
        <div className="px-4 py-2.5 bg-card border-b border-border flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-heading truncate">{t("partnerTitle")}</p>
            <p className="text-[10px] text-muted-foreground truncate">/partner/pressing-etoile</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-soft text-success text-[10px] font-semibold">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              Ouvert
            </span>
            <span className="size-7 rounded-lg border border-border bg-surface flex items-center justify-center text-muted-foreground relative">
              <Bell className="size-3.5" aria-hidden="true" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary" />
            </span>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="p-4 space-y-3.5 flex-1">
          {/* 3 KPI Stat Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl bg-card border border-border p-3 shadow-soft">
              <p className="text-[10px] font-medium text-muted-foreground truncate">{t("kpiRevenueLabel")}</p>
              <p className="text-sm sm:text-base font-bold text-heading tabular-nums mt-0.5">390 000</p>
              <p className="text-[10px] text-success font-medium flex items-center gap-0.5 mt-0.5">
                <TrendingUp className="size-3" aria-hidden="true" />
                +24%
              </p>
            </div>
            <div className="rounded-xl bg-card border border-border p-3 shadow-soft">
              <p className="text-[10px] font-medium text-muted-foreground truncate">{t("kpiOrdersLabel")}</p>
              <p className="text-sm sm:text-base font-bold text-primary tabular-nums mt-0.5">18</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">3 en attente</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-3 shadow-soft">
              <p className="text-[10px] font-medium text-muted-foreground truncate">{t("kpiSlaLabel")}</p>
              <p className="text-sm sm:text-base font-bold text-success tabular-nums mt-0.5">98%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">SLA 45 min</p>
            </div>
          </div>

          {/* Incoming Orders Queue Table */}
          <div className="rounded-xl bg-card border border-border shadow-soft overflow-hidden">
            <div className="px-3.5 py-2.5 bg-surface border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-heading">{t("incomingOrder")}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-soft text-warning text-[10px] font-semibold">
                <Clock className="size-3" aria-hidden="true" />
                32 min
              </span>
            </div>
            <div className="divide-y divide-border/60 text-xs">
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-heading truncate">#SH-2904 · Panzi</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t("incomingMeta")}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold shrink-0">
                  Accepter
                </span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-heading truncate">#SH-2901 · Muhumba</p>
                  <p className="text-[11px] text-muted-foreground truncate">6 articles · Lavage & Repassage</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success shrink-0">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  En lavage
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Revenue Bar Strip */}
          <div className="rounded-xl bg-card border border-border p-3 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-muted-foreground">{t("netPayoutLabel")}</span>
              <span className="text-xs font-semibold text-heading tabular-nums">1 840 000 CDF</span>
            </div>
            <div className="flex items-end gap-1.5 h-10">
              {WEEKLY_BARS.map((h, i) => (
                <div key={i} className="flex-1 flex items-end h-full">
                  <div
                    style={{ height: `${h}%` }}
                    className={`w-full rounded-t-sm ${i === 5 ? "bg-primary" : "bg-primary-soft border border-primary/15"}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
