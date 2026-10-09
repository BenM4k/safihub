import { AlertCircle, EyeOff, Sparkles } from "lucide-react";

export function ConsentCaptureRules() {
  return (
    <section className="scroll-mt-28 space-y-6">
      <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
        1. Protocole de Prise de Vue & Délimitation Stricte
      </h3>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
        Lors de la collecte au seuil du client et de la réception dans la buanderie partenaire,
        des photos d&apos;état peuvent être capturées conformément au cahier des charges SafiHub.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
            <Sparkles className="size-4" />
            <span>Cas Autorisés & Obligatoires</span>
          </div>
          <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-disc list-inside">
            <li>Déchirures, accrocs ou boutons manquants constatés avant lavage.</li>
            <li>Taches préexistantes importantes ou décolorations sur tissu délicat.</li>
            <li>Articles spéciaux ou de valeur soumis à un tarif sur mesure.</li>
            <li>Preuve photographique du colis scellé remis lors de la livraison.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-red-200/60 bg-red-50/30 p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
            <EyeOff className="size-4" />
            <span>Interdictions Formelles & Contrôles</span>
          </div>
          <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-disc list-inside">
            <li>Visage du client, des membres du foyer ou du coursier.</li>
            <li>Pièces d&apos;identité, documents financiers ou cartes bancaires.</li>
            <li>Intérieur d&apos;une pièce d&apos;habitation ou effets personnels non liés au linge.</li>
            <li>Tout cliché non conforme est immédiatement rejeté et supprimé.</li>
          </ul>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong>Information immédiate au seuil :</strong> Le coursier annonce
          systématiquement au client la prise de vue d&apos;un éventuel défaut
          au moment du comptage contradictoire. Le client peut inspecter le cliché
          sur l&apos;écran du téléphone du coursier en temps réel.
        </div>
      </div>
    </section>
  );
}
