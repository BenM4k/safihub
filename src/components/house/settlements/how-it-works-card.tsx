"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface HowItWorksCardProps {
  commissionRatePercent: number;
  settlementDelayNotice: string;
}

export function HowItWorksCard({
  commissionRatePercent,
  settlementDelayNotice,
}: HowItWorksCardProps) {
  const t = useTranslations("house.settlements");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="py-2 border-t border-border/60"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full py-3 flex items-center justify-between gap-3 text-left hover:opacity-80 transition cursor-pointer min-h-[44px]"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HelpCircle className="size-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground block">
                {t("howItWorksTitle")}
              </span>
              <span className="text-2xs text-muted-foreground">
                {t("howItWorksSubtitle")}
              </span>
            </div>
          </div>

          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-2 pb-4 space-y-4 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-150">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rule 1: Frequency */}
          <div className="p-3.5 rounded-lg bg-muted/40 space-y-1">
            <span className="font-bold text-foreground block text-xs">
              {t("ruleFrequencyTitle")}
            </span>
            <p>{t("ruleFrequencyDesc")}</p>
          </div>

          {/* Rule 2: Commission */}
          <div className="p-3.5 rounded-lg bg-muted/40 space-y-1">
            <span className="font-bold text-foreground block text-xs">
              {t("ruleCommissionTitle", { rate: commissionRatePercent })}
            </span>
            <p>{t("ruleCommissionDesc", { rate: commissionRatePercent })}</p>
          </div>

          {/* Rule 3: Delivery cutoff */}
          <div className="p-3.5 rounded-lg bg-muted/40 space-y-1">
            <span className="font-bold text-foreground block text-xs">
              {t("ruleDelayTitle")}
            </span>
            <p>{t("ruleDelayDesc", { notice: settlementDelayNotice })}</p>
          </div>

          {/* Rule 4: Disputes & Cancelled */}
          <div className="p-3.5 rounded-lg bg-muted/40 space-y-1">
            <span className="font-bold text-foreground block text-xs">
              {t("ruleDisputesTitle")}
            </span>
            <p>{t("ruleDisputesDesc")}</p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-primary/5 text-foreground flex items-center gap-2.5 text-2xs">
          <ShieldCheck className="size-4 text-primary shrink-0" />
          <span>{t("supportNotice")}</span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
