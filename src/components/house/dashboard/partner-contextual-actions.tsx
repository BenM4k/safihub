"use client";

import Link from "next/link";
import {
  CalendarX,
  PauseCircle,
  PlusCircle,
  PhoneCall,
} from "lucide-react";

interface PartnerContextualActionsProps {
  houseSlug: string;
  onOpenPause: () => void;
  isPaused: boolean;
}

export function PartnerContextualActions({
  houseSlug,
  onOpenPause,
  isPaused,
}: PartnerContextualActionsProps) {
  return (
    <section className="space-y-3 font-sans" aria-label="Actions rapides contextuelles">
      <h3 className="font-display font-bold text-sm sm:text-base text-heading">
        Actions rapides pressing
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Fermer pour aujourd'hui */}
        <Link
          href={`/partner/${houseSlug}/hours`}
          className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-border-strong hover:shadow-sm transition group flex items-center gap-3.5"
        >
          <div className="size-10 rounded-xl bg-destructive-soft text-destructive flex items-center justify-center shrink-0 group-hover:bg-destructive-soft/80 transition">
            <CalendarX className="size-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-heading group-hover:text-primary transition block">
              Fermer aujourd&apos;hui
            </span>
            <span className="text-[11px] text-muted-foreground">
              Déclarer fermeture
            </span>
          </div>
        </Link>

        {/* 2. Mettre en pause */}
        <button
          type="button"
          onClick={onOpenPause}
          className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-border-strong hover:shadow-sm transition group flex items-center gap-3.5 text-left cursor-pointer"
        >
          <div className="size-10 rounded-xl bg-warning-soft text-warning flex items-center justify-center shrink-0 group-hover:bg-warning-soft/80 transition">
            <PauseCircle className="size-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-heading group-hover:text-primary transition block">
              {isPaused ? "Reprendre" : "Mettre en pause"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Arrêter les flux
            </span>
          </div>
        </button>

        {/* 3. Ajouter un service */}
        <Link
          href={`/partner/${houseSlug}/catalogue`}
          className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-border-strong hover:shadow-sm transition group flex items-center gap-3.5"
        >
          <div className="size-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 group-hover:bg-primary-soft/80 transition">
            <PlusCircle className="size-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-heading group-hover:text-primary transition block">
              Ajouter un service
            </span>
            <span className="text-[11px] text-muted-foreground">
              Tarifs & catalogue
            </span>
          </div>
        </Link>

        {/* 4. Contacter le support Bukavu */}
        <a
          href="https://wa.me/243999000123?text=Bonjour%20SafiHub%20Support%2C%20j%27ai%20besoin%20d%27assistance%20concernant%20mon%20pressing."
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-border-strong hover:shadow-sm transition group flex items-center gap-3.5"
        >
          <div className="size-10 rounded-xl bg-success-soft text-success flex items-center justify-center shrink-0 group-hover:bg-success-soft/80 transition">
            <PhoneCall className="size-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-heading group-hover:text-success transition block">
              Support SafiHub
            </span>
            <span className="text-[11px] text-muted-foreground">
              WhatsApp Bukavu
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}
