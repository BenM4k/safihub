"use client";

import Link from "next/link";
import { Clock, MapPin, Ban, CheckCircle2, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminHouseRow } from "../types";

interface HouseTabInfoProps {
  house: AdminHouseRow;
  onToggleStatus: () => void;
}

export function HouseTabInfo({ house, onToggleStatus }: HouseTabInfoProps) {
  return (
    <div className="space-y-4 text-xs">
      {/* Operating status banner */}
      <div className="p-3.5 rounded-xl border-2 border-border-strong bg-surface space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-heading flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary" />
            <span>Horaires aujourd&apos;hui</span>
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
            house.isOpenNow ? "bg-success-light text-success-base" : "bg-ink-100 text-ink-600"
          }`}>
            {house.isOpenNow ? "Ouvert maintenant" : "Fermé"}
          </span>
        </div>
        <p className="text-ink-700 font-medium">
          Créneau du jour : <span className="font-bold text-heading">{house.todayHoursText}</span>
        </p>
      </div>

      {/* Address & details card */}
      <div className="p-3.5 rounded-xl border-2 border-border-strong bg-card space-y-2.5">
        <div className="font-bold text-heading flex items-center gap-1.5">
          <MapPin className="size-3.5 text-primary" />
          <span>Localisation &amp; Repères</span>
        </div>
        <div className="space-y-1 text-ink-700">
          <p><span className="text-ink-500">Quartier :</span> {house.neighborhoodName || "—"}</p>
          <p><span className="text-ink-500">Repère coursiers :</span> {house.addressNote || "Aucune note d'adresse enregistrée"}</p>
          <p><span className="text-ink-500">Identifiant technique :</span> <span className="font-mono text-[11px]">{house.slug}</span></p>
        </div>
      </div>

      {/* Quick Status Control */}
      <div className="p-3.5 rounded-xl border-2 border-border-strong bg-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-heading">État du pressing</span>
          <span className="text-[11px] font-semibold text-ink-600">
            {house.isActive ? "Actuellement actif" : "Actuellement suspendu"}
          </span>
        </div>
        <p className="text-[11px] text-ink-600">
          {house.isActive
            ? "La suspension empêche la prise de nouvelles commandes par les clients sans annuler les missions déjà en cours."
            : "La réactivation rend le pressing immédiatement disponible pour recevoir de nouvelles commandes."}
        </p>
        <Button
          type="button"
          onClick={onToggleStatus}
          variant="outline"
          className={`w-full min-h-[40px] text-xs font-semibold border-2 ${
            house.isActive
              ? "border-destructive-base/40 text-destructive-base hover:bg-destructive-light"
              : "border-success-base/40 text-success-base hover:bg-success-light"
          }`}
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

      {/* Workspace links */}
      <div className="pt-2 flex flex-col gap-2">
        <Link
          href={`/partner/${house.slug}`}
          target="_blank"
          className="p-3 rounded-xl border-2 border-border-strong bg-surface hover:bg-surface-hover transition-colors flex items-center justify-between font-bold text-heading"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-violet-600" />
            <span>Ouvrir l&apos;espace partenaire (vue déléguée)</span>
          </div>
          <ArrowUpRight className="size-3.5 text-ink-400" />
        </Link>
      </div>
    </div>
  );
}
