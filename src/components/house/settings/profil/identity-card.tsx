"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    <section className="py-2 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Identité du pressing</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Raison sociale et visibilité publique sur SafiHub.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyPublicLink}
            className="text-xs font-semibold h-9 px-3.5 rounded-lg cursor-pointer"
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
          <Button asChild variant="outline" size="sm" className="h-9 px-3.5 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer">
            <a href={`/houses/${house.slug}`} target="_blank" rel="noreferrer">
              <span>Voir</span>
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="font-semibold text-foreground block mb-1.5">
            Nom officiel du pressing
          </label>
          <Input
            type="text"
            value={house.name}
            disabled
            className="h-10 sm:h-9 rounded-lg text-base sm:text-xs font-medium bg-muted/50 cursor-not-allowed"
          />
          <span className="text-[10px] text-muted-foreground mt-1 block">
            Pour modifier le nom officiel ou les informations légales, contactez l&apos;administration SafiHub.
          </span>
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1.5">
            Quartier d&apos;implantation
          </label>
          <Input
            type="text"
            value={house.neighborhoodName || "Bukavu"}
            disabled
            className="h-10 sm:h-9 rounded-lg text-base sm:text-xs font-medium bg-muted/50 cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="font-semibold text-foreground block mb-1.5">
          Description courte (Vitrine client)
        </label>
        <Textarea
          value={description}
          readOnly
          disabled
          rows={2}
          className="text-base sm:text-xs bg-muted/50 cursor-not-allowed resize-none rounded-lg"
        />
        <span className="text-[10px] text-muted-foreground block text-right mt-0.5">
          Géré par l&apos;administration SafiHub
        </span>
      </div>

      {/* Spécialités et langues */}
      <div className="p-3 bg-muted/30 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-primary shrink-0" />
          <span className="font-semibold text-foreground">Langues & Spécialités :</span>
          <span className="text-muted-foreground">Français, Kiswahili • Lavage délicat, Repassage vapeur</span>
        </div>
      </div>
    </section>
  );
}
