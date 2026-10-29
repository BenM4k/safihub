"use client";

import { useTranslations } from "next-intl";
import { Info, Send, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DISTANCE_LEVEL_DEFINITIONS,
  getDistanceLevelLabel,
} from "./types";

interface DeliveryPerimeterCardProps {
  effectiveMaxDistance: number;
  houseName?: string;
  onRequestExtension?: () => void;
}

export function DeliveryPerimeterCard({
  effectiveMaxDistance,
  onRequestExtension,
}: DeliveryPerimeterCardProps) {
  const t = useTranslations("house.coverage");

  const canRequestExtension = effectiveMaxDistance < 3;

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-muted/40 dark:bg-card/75 p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Info className="size-4.5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground font-display">
              {t("perimeterCardTitle")}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <ShieldCheck className="size-3.5 text-success shrink-0" aria-hidden="true" />
              <span>{t("perimeterAuthority")}</span>
            </div>
          </div>
        </div>

        <Badge className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground gap-1.5 self-start sm:self-auto rounded-full shadow-2xs">
          <span>{t("perimeterBadge")}</span>
          <span className="font-black">
            {getDistanceLevelLabel(effectiveMaxDistance)}
          </span>
        </Badge>
      </div>

      {/* Level definitions table / tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {Object.values(DISTANCE_LEVEL_DEFINITIONS).map((def) => {
          const isCurrentLimit = def.level === effectiveMaxDistance;
          const isAllowed = def.level <= effectiveMaxDistance;

          return (
            <div
              key={def.level}
              className={`p-3.5 rounded-xl text-xs space-y-1.5 transition ${
                isCurrentLimit
                  ? "bg-primary/10 border border-primary/30"
                  : isAllowed
                  ? "bg-card shadow-xs"
                  : "bg-muted/20 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className={isCurrentLimit ? "text-primary font-bold" : "text-foreground"}>
                  Niveau {def.level} : {def.label}
                </span>
                {isCurrentLimit && (
                  <Badge variant="default" className="text-[10px] font-bold uppercase px-2 py-0 h-4 bg-primary text-primary-foreground rounded-full">
                    {t("levelLimit")}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {def.description}
              </p>
            </div>
          );
        })}
      </div>

      {canRequestExtension && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs sm:text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            {t("extensionBeyondPrompt", { level: effectiveMaxDistance })}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRequestExtension}
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary rounded-lg font-bold text-xs shrink-0 w-full sm:w-auto h-9 px-4 cursor-pointer"
          >
            <Send className="size-3.5 mr-1.5 text-primary" aria-hidden="true" />
            <span>{t("requestExtension")}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
