import { Banknote, MapPin, RefreshCw } from "lucide-react";

export function TermsPricingPayment() {
  return (
    <section className="scroll-mt-28">
      <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-heading mb-6 sm:mb-8">
        3. Tarification & Modalités de Paiement
      </h2>
      <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-8">
        Les tarifs des prestations sont fixés de manière indépendante par chaque
        pressing partenaire. SafiHub garantit une lisibilité intégrale avant la
        confirmation de chaque commande.
      </p>

      <div className="space-y-8 sm:space-y-10">
        <div>
          <h3 className="text-lg font-bold text-heading mb-2">
            3.1. Monnaie de Référence & Règle du Taux Gelé
          </h3>
          <p className="text-slate-600 leading-relaxed mb-3">
            La monnaie officielle de référence sur SafiHub est le{" "}
            <strong>Franc Congolais (CDF)</strong>, comptabilisé en unités
            entières.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <Banknote className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 leading-relaxed">
              <strong>Paiement en Dollars Américains (USD) :</strong> Lorsque le
              client opte pour un règlement en USD, le taux de change appliqué
              est celui publié par la plateforme à la date et heure exacte de la
              création de la commande.{" "}
              <strong>Ce taux est irrévocablement gelé</strong> pour la durée du
              cycle de la commande, protégeant le client contre toute
              fluctuation monétaire en cours de traitement.
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-heading mb-2">
            3.2. Règlement en Espèces à la Livraison (Cash on Delivery)
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Le règlement s&apos;effectue intégralement en espèces entre les mains
            du coursier au moment de la livraison du linge nettoyé. Le coursier
            dispose d&apos;un fond de caisse (« change float ») pour assurer le rendu
            de monnaie usuel. Tout encaissement est enregistré de façon
            instantanée dans notre grand livre de caisse immuable.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-heading mb-2">
            3.3. Frais de Livraison & Matrice de Zones
          </h3>
          <p className="text-slate-600 leading-relaxed mb-3">
            Les frais de livraison sont à la charge du client et rémunèrent
            directement les deux étapes de déplacement du coursier (ramassage et
            livraison). Le tarif dépend du niveau d&apos;éloignement entre la
            commune du client et celle du pressing :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-semibold text-heading flex items-center gap-1.5 mb-1">
                <MapPin className="size-4 text-primary" /> Niveau 1 (Même zone)
              </span>
              <p className="text-xs text-muted-foreground">
                Ex. Ibanda vers Ibanda. Trajet court et tarif de base.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-semibold text-heading flex items-center gap-1.5 mb-1">
                <MapPin className="size-primary text-primary" /> Niveau 2
                (Zone limitrophe)
              </span>
              <p className="text-xs text-muted-foreground">
                Ex. Ibanda vers Kadutu. Tarif intermédiaire standard.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-semibold text-heading flex items-center gap-1.5 mb-1">
                <MapPin className="size-4 text-primary" /> Niveau 3 (Zone
                éloignée)
              </span>
              <p className="text-xs text-muted-foreground">
                Ex. Ibanda vers Bagira. Tarif compensant la distance.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-heading mb-2">
            3.4. Absence du Client & Frais de Nouvelle Présentation
          </h3>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <RefreshCw className="size-5 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">
              En cas d&apos;absence non signalée du client lors du créneau de
              livraison expressément validé, une relivraison ultérieure pourra
              faire l&apos;objet de frais de présentation supplémentaires
              équivalents à une course unitaire.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
