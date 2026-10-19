"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HouseRecord } from "@/dal";

interface IdentityCardProps {
  house: HouseRecord;
  description?: string;
}

export function IdentityCard({
  house,
  description = "Service de blanchisserie, lavage délicat et repassage professionnel à Bukavu.",
}: IdentityCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  function handleCopyPublicLink() {
    const url = `${window.location.origin}/houses/${house.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-heading">Identité du pressing</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Raison sociale et visibilité publique sur SafiHub.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyPublicLink}
            className="text-xs font-semibold min-h-[40px] px-3"
          >
            {copiedLink ? (
              <>
                <Check className="size-3.5 text-success mr-1.5" />
                <span>Lien copié</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 mr-1.5" />
                <span>Copier lien client</span>
              </>
            )}
          </Button>
          <a
            href={`/houses/${house.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 min-h-[40px] border border-border"
          >
            <span>Voir</span>
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="font-semibold text-foreground block mb-1.5">
            Nom officiel du pressing
          </label>
          <input
            type="text"
            value={house.name}
            disabled
            className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border bg-secondary/60 text-muted-foreground text-xs font-medium cursor-not-allowed"
          />
          <span className="text-[10px] text-muted-foreground mt-1 block">
            Pour modifier le nom officiel ou les informations légales, contactez l&apos;administration SafiHub.
          </span>
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1.5">
            Quartier d&apos;implantation
          </label>
          <input
            type="text"
            value={house.neighborhoodName || "Bukavu"}
            disabled
            className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border bg-secondary/60 text-muted-foreground text-xs font-medium cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="font-semibold text-foreground block mb-1.5">
          Description courte (Vitrine client)
        </label>
        <textarea
          value={description}
          readOnly
          disabled
          rows={2}
          className="w-full p-3 rounded-xl border border-border bg-secondary/60 text-muted-foreground text-xs cursor-not-allowed"
        />
        <span className="text-[10px] text-muted-foreground block text-right mt-0.5">
          Géré par l&apos;administration SafiHub
        </span>
      </div>

      {/* Spécialités et langues */}
      <div className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-primary" />
          <span className="font-semibold text-foreground">Langues & Spécialités :</span>
          <span className="text-muted-foreground">Français, Kiswahili • Lavage délicat, Repassage vapeur</span>
        </div>
      </div>
    </section>
  );
}
