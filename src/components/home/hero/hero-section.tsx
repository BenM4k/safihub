import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeroStatusCard } from "./hero-status-card";
import { NeighborhoodChecker } from "./neighborhood-checker";
import { getRoleCta } from "@/lib/role-cta";
import type { AuthenticatedUser } from "@/services/auth/guards";
import type { NeighborhoodRecord } from "@/dal";

export function HeroSection({
  user,
  neighborhoods = [],
}: {
  user?: AuthenticatedUser | null;
  neighborhoods?: NeighborhoodRecord[];
} = {}) {
  const t = useTranslations("hero");

  const cta = getRoleCta(user);
  const ctaLabel =
    cta.roleKey === "admin"
      ? t("ctaAdmin")
      : cta.roleKey === "courier"
        ? t("ctaCourier")
        : cta.roleKey === "house"
          ? t("ctaHouse")
          : t("ctaOrder");

  return (
    <section className="relative min-h-[calc(100dvh-4.5rem)] flex items-center pt-38 pb-12 sm:pt-32 sm:pb-16 md:py-16 bg-background overflow-hidden">
      {/* Subtle dimmed primary ambient wash on desktop, blending smoothly into the background */}
      <div
        aria-hidden="true"
        className="hidden lg:block pointer-events-none absolute top-1/2 left-[46%] -translate-y-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-primary/15 dark:bg-primary/20 blur-[120px]"
      />
      <div className="container-page relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
          {/* Left Column: matching reference typography and layout */}
          <div className="lg:col-span-5 stack gap-5 text-left">
            {/* Top 3 green check pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-success-light dark:bg-emerald-950/50 text-[#027A48] dark:text-emerald-400 border border-transparent dark:border-emerald-800/60">
                <Check className="size-3 stroke-3" /> {t("badgeCompliant")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-success-light dark:bg-emerald-950/50 text-[#027A48] dark:text-emerald-400 border border-transparent dark:border-emerald-800/60">
                <Check className="size-3 stroke-3" /> {t("badgeSecure")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-success-light dark:bg-emerald-950/50 text-[#027A48] dark:text-emerald-400 border border-transparent dark:border-emerald-800/60">
                <Check className="size-3 stroke-3" /> {t("badgeBukavu")}
              </span>
            </div>

            {/* 3-line stacked headline with blue accent */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-bold text-heading tracking-tight leading-[1.08]">
              {t("titleLine1")} <br />
              {t("titleLine2")} <br />
              <span className="text-primary">{t("titleLine3")}</span>
            </h1>

            {/* Sub-headline: 2 concise lines */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm">
              {t("description")}
            </p>

            {/* Primary Action Button (blue pill with arrow) */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <Link
                href={cta.href}
                className="bg-primary hover:bg-primary-hover text-white text-base font-semibold px-7 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-sm transition-all group"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Bukavu Neighborhood Coverage Checker (AC 17, AC 19) */}
            {neighborhoods && neighborhoods.length > 0 && (
              <NeighborhoodChecker neighborhoods={neighborhoods} />
            )}
          </div>

          {/* Right Column: Desktop-only Live App Showcase */}
          <div className="hidden lg:flex lg:col-span-7 justify-end w-full">
            <HeroStatusCard />
          </div>
        </div>
      </div>
    </section>
  );
}
