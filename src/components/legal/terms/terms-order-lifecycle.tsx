import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export function TermsOrderLifecycle() {
  return (
    <section className="scroll-mt-28">
      <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-heading mb-6 sm:mb-8">
        2. Commandes & Protocole des Trois Points
      </h2>
      <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-8">
        Afin de protéger toutes les parties et d&apos;éliminer toute contestation
        relative au nombre ou à l&apos;état des vêtements, SafiHub applique un
        cycle de commande hautement sécurisé et transparent.
      </p>

      <div className="space-y-8 sm:space-y-10">
        <div>
          <h3 className="text-lg font-bold text-heading mb-2">
            2.1. Validation Canonique Côté Serveur
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Les montants totaux, remises et frais de transport sont
            systématiquement recalculés par nos serveurs selon la grille
            tarifaire active du pressing sélectionné. Aucune donnée de calcul
            provenant du terminal client n&apos;est tenue pour acquise. Toute
            commande soumise fait l&apos;objet d&apos;un identifiant d&apos;idempotence
            unique pour éviter les doublons accidentels sur réseaux mobiles
            instables.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-heading mb-2">
            2.2. Horloge d&apos;Acceptation (45 Minutes)
          </h3>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Clock className="size-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">
              Le pressing partenaire dispose d&apos;un délai contractuel de{" "}
              <strong>45 minutes</strong> pour accepter la commande. Cette
              horloge ne s&apos;écoule{" "}
              <strong>que durant les heures d&apos;ouverture effectives</strong>{" "}
              de l&apos;établissement. En cas de non-réponse dans ce délai, la
              commande expire et le client est libre de rediriger son panier
              vers un pressing alternatif sans ressaisie.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-heading mb-2">
            2.3. Protocole du Double Comptage Contradictoire
          </h3>
          <ul className="space-y-3 text-slate-600 text-sm sm:text-base">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>1. Déclaration initiale :</strong> Le client sélectionne
                le type de pièces, matières et prestations souhaitées.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>2. Inventaire au seuil :</strong> Le coursier procède au
                comptage physique en présence du client. La prise de photo d&apos;état
                est <strong>obligatoire</strong> pour tout article de valeur ou
                présentant une dégradation préalable.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>3. Contrôle de réception :</strong> À l&apos;arrivée au
                pressing, un contrôle de conformité est opéré sous 1 heure. En cas
                de divergence constatée, un ajustement tarifaire est émis.
              </span>
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong>Approbation impérative du client :</strong> Aucun lavage ne
            débute en cas d&apos;écart d&apos;inventaire avant validation
            explicite de l&apos;ajustement par le client (via le lien de suivi
            ou avec le coursier). Les pièces non acceptées sont étiquetées{" "}
            <em>« retournées »</em>, déduites de la facture et restituées sans
            frais.
          </div>
        </div>
      </div>
    </section>
  );
}
