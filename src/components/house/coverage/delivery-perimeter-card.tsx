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
    <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-muted/40 dark:bg-card/75 p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Info className="size-4.5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-heading font-display">
              {t("perimeterCardTitle")}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-success shrink-0" aria-hidden="true" />
              <span>{t("perimeterAuthority")}</span>
            </div>
          </div>
        </div>

        <Badge className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground gap-1.5 self-start sm:self-auto rounded-xl shadow-2xs">
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
              className={`p-3.5 rounded-xl text-xs space-y-1.5 transition border ${
                isCurrentLimit
                  ? "bg-primary-soft/50 border-primary/30"
                  : isAllowed
                  ? "bg-card border-border/60"
                  : "bg-muted/20 border-border/30 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className={isCurrentLimit ? "text-primary font-bold" : "text-heading"}>
                  Niveau {def.level} : {def.label}
                </span>
                {isCurrentLimit && (
                  <Badge variant="default" className="text-[10px] font-bold uppercase px-1.5 py-0 h-4 bg-primary text-primary-foreground rounded-md">
                    {t("levelLimit")}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {def.description}
              </p>
            </div>
          );
        })}
      </div>

      {canRequestExtension && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border/50 text-xs">
          <p className="text-muted-foreground">
            {t("extensionBeyondPrompt", { level: effectiveMaxDistance })}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRequestExtension}
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary rounded-xl font-bold text-xs shrink-0 w-full sm:w-auto h-10 sm:h-9 px-4 cursor-pointer"
          >
            <Send className="size-3.5 mr-1.5 text-primary" aria-hidden="true" />
            <span>{t("requestExtension")}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
