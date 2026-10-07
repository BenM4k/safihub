import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="section pb-16">
      <div className="container-page">
        <div className="panel bg-primary text-white shadow-lift relative p-8 sm:p-12 lg:p-14">
          <div className="relative z-10 max-w-2xl stack gap-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 self-start">
              <Sparkles className="size-3.5" />
              SafiHub Bukavu
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Prêt pour un linge impeccable sans quitter la maison ?
            </h2>

            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Dites adieu aux corvées et aux allers-retours dans les
              embouteillages. Commandez votre premier lavage aujourd&apos;hui et
              payez uniquement à la livraison après vérification.
            </p>

            <div className="cluster gap-3 pt-1">
              <Button asChild variant="contrast" size="lg" className="group">
                <Link href="#catalogue">
                  <span>Commander maintenant</span>
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    data-icon="trailing"
                  />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-white! border-white/30! hover:bg-white/10!"
              >
                <a
                  href="https://wa.me/243999000123"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="size-4" />
                  <span>Assistance WhatsApp</span>
                </a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/20 text-xs sm:text-sm font-semibold text-white/90">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-white" />
                <span>Paiement Cash CoD (CDF/USD)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-white" />
                <span>Collecte 45 min garantie</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-white" />
                <span>Double comptage contradictoire</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
