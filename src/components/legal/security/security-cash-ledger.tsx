import { DollarSign, ShieldAlert, History } from "lucide-react";

export function SecurityCashLedger() {
  return (
    <section className="scroll-mt-28">
      <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-heading mb-6 sm:mb-8">
        2. Intégrité Financière & Grand Livre de Caisse
      </h2>
      <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-8">
        Dans un modèle fondé sur le règlement en espèces à Bukavu, la sécurité
        des flux financiers repose sur un système comptable inaltérable et des
        garde-fous automatisés.
      </p>

      <div className="space-y-6 sm:space-y-8">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <History className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-heading font-semibold">
              Grand livre de caisse immuable (Append-Only) :
            </strong>{" "}
            Chaque perception d&apos;espèces par le coursier, versement à un pressing
            ou reversement au bureau central est enregistré dans une table de
            registre accessible en ajout uniquement. Aucune ligne
            d&apos;encaissement ne peut être modifiée ou supprimée après écriture.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong>Plafond d&apos;encaissement des coursiers (Cash Ceiling) :</strong>{" "}
            Chaque coursier se voit attribuer un seuil maximal d&apos;espèces pouvant
            être détenues simultanément en tournée. Dès que les encaissements
            cumulés dépassent ce plafond, l&apos;application coursier bloque
            automatiquement toute nouvelle mission de livraison jusqu&apos;à
            dépôt physique et rapprochement avec le gestionnaire d&apos;exploitation.
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2 font-bold text-heading text-sm">
            <DollarSign className="size-4 text-primary" />
            <span>Rapprochement Journalier Bidevise (CDF / USD)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Les écritures en Francs Congolais et en Dollars Américains sont
            réconciliées quotidiennement de manière distincte, garantissant une
            étanchéité totale face aux taux de conversion gelés lors des
            commandes.
          </p>
        </div>
      </div>
    </section>
  );
}
