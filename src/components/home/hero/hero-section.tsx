import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeroStatusCard } from "./hero-status-card";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="min-h-[calc(100dvh-4.5rem)] flex items-center py-12 md:py-16 bg-white overflow-hidden">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: matching reference typography and layout */}
          <div className="lg:col-span-6 stack gap-5 text-left">
            {/* Top 3 green check pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-success-light text-[#027A48]">
                <Check className="size-3 stroke-3" /> {t("badgeCompliant")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-success-light text-[#027A48]">
                <Check className="size-3 stroke-3" /> {t("badgeSecure")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-success-light text-[#027A48]">
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
            <div className="pt-1">
              <Link
                href="#catalogue"
                className="bg-primary hover:bg-primary-hover text-white text-base font-semibold px-7 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-sm transition-all group"
              >
                <span>{t("ctaOrder")}</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Visual Mockup */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <HeroStatusCard />
          </div>
        </div>
      </div>
    </section>
  );
}

