"use client";

import { useTranslations } from "next-intl";
import { Info, Send, ShieldCheck } from "lucide-react";
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
    <div className="p-4 sm:p-5 bg-card rounded-2xl border border-border shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Info className="size-5" aria-hidden="true" />
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

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shrink-0 shadow-xs self-start sm:self-auto">
          <span>Périmètre :</span>
          <span className="underline font-black">
            {getDistanceLevelLabel(effectiveMaxDistance)}
          </span>
        </div>
      </div>

      {/* Level definitions table / pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border">
        {Object.values(DISTANCE_LEVEL_DEFINITIONS).map((def) => {
          const isCurrentLimit = def.level === effectiveMaxDistance;
          const isAllowed = def.level <= effectiveMaxDistance;

          return (
            <div
              key={def.level}
              className={`p-3 rounded-xl border text-xs space-y-1 transition ${
                isCurrentLimit
                  ? "bg-primary-soft/60 border-primary/30"
                  : isAllowed
                  ? "bg-surface border-border"
                  : "bg-surface/40 border-border/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className={isCurrentLimit ? "text-primary font-black" : "text-heading"}>
                  Niveau {def.level} : {def.label}
                </span>
                {isCurrentLimit && (
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary text-white">
                    Limite
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {def.description}
              </p>
            </div>
          );
        })}
      </div>

      {canRequestExtension && (
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-surface/50 p-3 rounded-xl border border-dashed border-border text-xs">
          <p className="text-muted-foreground">
            Vous souhaitez desservir des quartiers situés au-delà du niveau {effectiveMaxDistance} ?
          </p>
          <button
            type="button"
            onClick={onRequestExtension}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary bg-transparent hover:bg-primary-soft/70 active:bg-primary-soft text-primary font-bold text-xs transition shrink-0 self-start sm:self-auto min-h-[40px] cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <Send className="size-3.5 text-primary" aria-hidden="true" />
            <span>{t("requestExtension")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
