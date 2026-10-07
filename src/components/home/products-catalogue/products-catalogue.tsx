import { Sparkles } from "lucide-react";
import { CatalogueShowcase } from "./catalogue-showcase";

export function ProductsCatalogue() {
  return (
    <section id="catalogue" className="min-h-screen flex flex-col justify-center py-16 md:py-24 border-t border-border bg-surface/30 relative">
      <div className="container-page">
        {/* Title */}
        <div className="stack gap-3 text-center max-w-3xl mx-auto mb-14">
          <span className="eyebrow mx-auto">
            <Sparkles className="size-3.5 text-primary" />
            Catalogue & Tarifs Transparents
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-heading tracking-tight">
            Tarifs fixes en Francs Congolais & USD
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Aucune mauvaise surprise à la livraison. Tous les prix sont fixés à l&apos;avance,
            avec recalcul automatique et validation contradictoire au seuil de votre porte.
          </p>
        </div>

        {/* Interactive Client Showcase */}
        <CatalogueShowcase />
      </div>
    </section>
  );
}
