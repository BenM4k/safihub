"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Camera,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { OrderTrackingCard } from "./status-cards/order-tracking-card";
import { PartnerDashboardCard } from "./status-cards/partner-dashboard-card";
import { CataloguePricingCard } from "./status-cards/catalogue-pricing-card";
import { ComboOrderCatalogueCard } from "./status-cards/combo-order-catalogue-card";
import { ComboPartnerOpsCard } from "./status-cards/combo-partner-ops-card";

const PAGE_VARIANTS = [
  { id: "order", Component: OrderTrackingCard },
  { id: "partner", Component: PartnerDashboardCard },
  { id: "catalogue", Component: CataloguePricingCard },
  { id: "combo-order-catalogue", Component: ComboOrderCatalogueCard },
  { id: "combo-partner-ops", Component: ComboPartnerOpsCard },
] as const;

export function HeroStatusCard() {
  const t = useTranslations("hero.statusCard");
  const [activeIndex, setActiveIndex] = useState(0);

  // Pick a random page showcase on mount (deterministic SSR, zero hydration mismatch)
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * PAGE_VARIANTS.length);
    const frameId = requestAnimationFrame(() => {
      setActiveIndex(randomIndex);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const ActivePage = PAGE_VARIANTS[activeIndex]?.Component ?? OrderTrackingCard;
  const activeKey = PAGE_VARIANTS[activeIndex]?.id ?? "order";

  return (
    <div className="hidden lg:block relative w-full max-w-[680px] font-sans">
      {/* Main Layered Composition matching reference: offset dimmed primary backdrop + overhanging cards */}
      <div className="relative pt-8 pb-7 pl-0 pr-8">
        {/* Dimmed Primary Color Backdrop Rectangle (offset to the right behind cards) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 bottom-0 left-14 rounded-[1.75rem] bg-gradient-to-b from-primary/40 via-primary/25 to-primary/15 dark:from-primary/35 dark:via-primary/20 dark:to-primary/10"
        />

        {/* Foreground Overhanging Page Window (breaks out cleanly to the left of the backdrop) */}
        <div className="relative z-10 rounded-2xl bg-card border border-border/70 shadow-[0_22px_55px_-14px_rgba(40,36,213,0.18),0_6px_20px_-4px_rgba(16,24,40,0.08)] dark:shadow-[0_22px_55px_-14px_rgba(0,0,0,0.65)] overflow-hidden">
          <div
            key={activeKey}
            className="animate-fade-up max-h-[390px] overflow-hidden"
          >
            <ActivePage />
          </div>

          {/* Blended bottom edge melting smoothly into the card surface */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card via-card/80 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card/75 to-transparent"
          />
        </div>

        {/* Lower Floating Status Rows + Accent Square Tiles (matching reference layout) */}
        <div className="relative z-10 mt-3.5 pl-10 pr-2 flex items-stretch gap-3">
          {/* Left: 2 crisp floating white cards */}
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="rounded-xl bg-card border border-primary/25 px-3.5 py-2.5 shadow-[0_8px_24px_-6px_rgba(40,36,213,0.12)] flex items-center justify-between gap-3 animate-float">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="size-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <Camera className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-heading truncate">
                    {t("courierTitle")}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {t("courierMeta")}
                  </p>
                </div>
              </div>
              <CheckCircle2
                className="size-4 text-primary shrink-0"
                aria-hidden="true"
              />
            </div>

            <div className="rounded-xl bg-card border border-border/80 px-3.5 py-2.5 shadow-[0_8px_24px_-6px_rgba(16,24,40,0.08)] flex items-center justify-between gap-3 animate-float [animation-delay:2.5s]">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="size-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <Clock className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-heading truncate">
                    {t("etaTitle")} · {t("etaWindow")}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-4/5 rounded-full bg-primary" />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                      80%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: 2 solid accent square tiles (emerald + primary with badge) */}
          <div className="flex flex-col justify-between gap-2.5 shrink-0">
            <div className="size-13 rounded-2xl bg-emerald-500 text-white shadow-[0_10px_24px_-6px_rgba(16,185,129,0.45)] flex items-center justify-center">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </div>
            <div className="relative size-13 rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_-6px_rgba(40,36,213,0.45)] flex items-center justify-center">
              <Sparkles className="size-6" aria-hidden="true" />
              <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Interactive Switcher Dots */}
      <div
        className="mt-4 pl-14 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Hero showcase"
      >
        {PAGE_VARIANTS.map((variant, idx) => {
          const isCurrent = idx === activeIndex;
          return (
            <button
              key={variant.id}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              aria-label={t("switchCardAria", { index: idx + 1 })}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                isCurrent
                  ? "w-8 bg-primary"
                  : "w-2 bg-border-strong/50 hover:bg-primary/60"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
