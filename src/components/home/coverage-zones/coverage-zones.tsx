import { MapPin, Bike, Clock, ShieldCheck, Check } from "lucide-react";
import { SAMPLE_ZONES } from "@/lib/sample-data";

export function CoverageZones() {
  return (
    <section id="zones" className="section bg-surface/50 border-t border-border">
      <div className="container-page">
        {/* Title */}
        <div className="stack gap-3 text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow mx-auto">
            <MapPin className="size-3.5 text-primary" />
            Couverture Géographique
          </span>
          <h2 className="text-h2 font-extrabold text-heading">
            SafiHub dessert les 3 communes de Bukavu
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Nos coursiers partenaires sont positionnés stratégiquement pour garantir
            une collecte rapide, quel que soit l&apos;état de la circulation.
          </p>
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_ZONES.map((zone) => (
            <div
              key={zone.id}
              className="card card-interactive bg-card border border-border p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-heading">
                      {zone.commune}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="size-3 text-primary" />
                      Arrivée : {zone.estimatedDeliveryMin}
                    </p>
                  </div>
                  <span className="eyebrow text-[11px]">
                    Dispo: {zone.courierAvailability}
                  </span>
                </div>

                {/* Neighborhoods list */}
                <div className="space-y-2 mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Quartiers desservis
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {zone.neighborhoods.map((n) => (
                      <span
                        key={n}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-surface border border-border/80 text-heading flex items-center gap-1"
                      >
                        <Check className="size-3 text-success" />
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery Fee summary */}
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                <div>
                  <p className="text-muted-foreground">Frais de livraison aller-retour</p>
                  <p className="text-base font-extrabold text-heading tabular">
                    {zone.baseFeeCdf.toLocaleString("fr-FR")} CDF
                  </p>
                </div>
                <div className="size-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                  <Bike className="size-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weather Protection Reassurance */}
        <div className="mt-8 card bg-card border border-border p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-heading">
                Protection météo & Sacs scellés étanches
              </h4>
              <p className="text-xs text-muted-foreground">
                Même pendant les fortes pluies ou sur pistes poussiéreuses, vos vêtements voyagent dans des housses étanches renforcées.
              </p>
            </div>
          </div>
          <span className="eyebrow text-xs shrink-0">
            Garantie Zéro Tache
          </span>
        </div>
      </div>
    </section>
  );
}
