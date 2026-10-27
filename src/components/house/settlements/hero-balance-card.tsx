"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Calendar, CheckCircle2, ChevronRight, HelpCircle, Phone, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerSettlementHeroData } from "@/types/partner-settlements";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HeroBalanceCardProps {
  hero: PartnerSettlementHeroData;
  houseSlug: string;
}

export function HeroBalanceCard({ hero, houseSlug }: HeroBalanceCardProps) {
  const t = useTranslations("house.settlements");
  const isPositive = hero.balanceOwedCDF > 0;

  return (
    <div className="space-y-6 py-2">
      {/* Top row: Section Header & Payout Method */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Wallet className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("balanceOwed")}
              </span>
              <span
                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-help"
                title={t("balanceOwedHelp")}
              >
                <HelpCircle className="size-3.5" />
              </span>
            </div>
            <p className="text-2xs text-muted-foreground">
              {t("totalAccumulatedOwed")}
            </p>
          </div>
        </div>

        {/* Payout method badge or action */}
        {hero.isPayoutMethodConfigured ? (
          <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-foreground">
            <Phone className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span className="font-mono text-2xs sm:text-xs">
              {hero.payoutMethodName} · {hero.maskedAccount}
            </span>
          </div>
        ) : (
          <Link
            href={`/partner/${houseSlug}/settings`}
            className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs font-semibold hover:bg-amber-500/20 transition min-h-[40px] sm:min-h-0"
          >
            <span>{t("addMobileMoney")}</span>
            <ChevronRight className="size-3.5" />
          </Link>
        )}
      </div>

      {/* Main balance display */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight text-foreground tabular-nums">
            {formatMoney(hero.balanceOwedCDF, "CDF")}
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary shrink-0" aria-hidden="true" />
              <span>
                {t("nextPayout", { date: hero.nextPayoutDate })}
              </span>
            </div>
            <span>•</span>
            <span>{hero.payoutCycle}</span>
            {hero.minPayoutThresholdCDF ? (
              <>
                <span>•</span>
                <span>{t("minThreshold", { amount: formatMoney(hero.minPayoutThresholdCDF) })}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Status badge on large balance */}
        <div className="self-start md:self-end">
          {isPositive ? (
            <Badge variant="outline" className="gap-1.5 px-3 py-1 rounded-full border-primary/30 text-primary text-xs font-bold">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span>{t("pendingWeeklyCycle")}</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 px-3 py-1 rounded-full border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="size-3.5" />
              <span>{t("allUpToDate")}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Reconciliation Equation Line */}
      <div className="pt-2">
        <Separator className="mb-4" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap text-muted-foreground font-mono">
            <span className="text-foreground font-bold">
              {formatMoney(hero.totalAllTimeNetCDF, "CDF")}
            </span>
            <span className="text-muted-foreground text-2xs font-sans">({t("netEarned")})</span>
            <span className="font-bold">−</span>
            <span className="text-foreground font-bold">
              {formatMoney(hero.totalAllTimeSettledCDF, "CDF")}
            </span>
            <span className="text-muted-foreground text-2xs font-sans">({t("alreadyPaid")})</span>
            <span className="font-bold">=</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {formatMoney(hero.balanceOwedCDF, "CDF")}
            </span>
            <span className="text-emerald-600/80 dark:text-emerald-400/80 text-2xs font-sans">({t("remainingDue")})</span>
          </div>

          <span className="text-2xs text-muted-foreground">
            {t("reconciliationCertified")}
          </span>
        </div>
      </div>
    </div>
  );
}
