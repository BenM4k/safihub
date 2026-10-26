"use client";

import Link from "next/link";
import { Clock, MapPin, Ban, CheckCircle2, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AdminHouseRow } from "../types";

interface HouseTabInfoProps {
  house: AdminHouseRow;
  onToggleStatus: () => void;
}

export function HouseTabInfo({ house, onToggleStatus }: HouseTabInfoProps) {
  return (
    <div className="space-y-5 text-xs">
      {/* Operating status section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary" />
            <span>Horaires aujourd&apos;hui</span>
          </span>
          <span
            className={cn(
              "text-[11px] font-semibold px-2 py-0.5 rounded-md",
              house.isOpenNow
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {house.isOpenNow ? "Ouvert maintenant" : "Fermé"}
          </span>
        </div>
        <p className="text-muted-foreground font-medium">
          Créneau du jour : <span className="font-semibold text-foreground">{house.todayHoursText}</span>
        </p>
      </div>

      <Separator />

      {/* Address & details section */}
      <div className="space-y-2.5">
        <div className="font-semibold text-foreground flex items-center gap-1.5">
          <MapPin className="size-3.5 text-primary" />
          <span>Localisation &amp; Repères</span>
        </div>
        <div className="space-y-1.5 text-muted-foreground">
          <p>
            <span className="text-foreground font-medium">Quartier :</span>{" "}
            {house.neighborhoodName || "—"}
          </p>
          <p>
            <span className="text-foreground font-medium">Repère coursiers :</span>{" "}
            {house.addressNote || "Aucune note d'adresse enregistrée"}
          </p>
          <p>
            <span className="text-foreground font-medium">Identifiant technique :</span>{" "}
            <span className="font-mono text-[11px] text-foreground">{house.slug}</span>
          </p>
        </div>
      </div>

      <Separator />

      {/* Quick Status Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">État du pressing</span>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {house.isActive ? "Actuellement actif" : "Actuellement suspendu"}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {house.isActive
            ? "La suspension empêche la prise de nouvelles commandes par les clients sans annuler les missions déjà en cours."
            : "La réactivation rend le pressing immédiatement disponible pour recevoir de nouvelles commandes."}
        </p>
        <Button
          type="button"
          onClick={onToggleStatus}
          variant="outline"
          className={cn(
            "w-full min-h-[38px] text-xs font-semibold",
            house.isActive
              ? "border-destructive/30 text-destructive hover:bg-destructive/10"
              : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
          )}
        >
          {house.isActive ? (
            <>
              <Ban className="size-3.5 mr-1.5" />
              <span>Suspendre le pressing...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-3.5 mr-1.5" />
              <span>Réactiver le pressing</span>
            </>
          )}
        </Button>
      </div>

      <Separator />

      {/* Workspace links */}
      <div>
        <Link
          href={`/partner/${house.slug}`}
          target="_blank"
          className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between font-semibold text-foreground"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-violet-600 dark:text-violet-400" />
            <span>Ouvrir l&apos;espace partenaire (vue déléguée)</span>
          </div>
          <ArrowUpRight className="size-3.5 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
