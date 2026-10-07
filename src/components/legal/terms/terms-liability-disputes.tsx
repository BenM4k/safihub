import { ShieldAlert, KeyRound, Scale } from "lucide-react";

export function TermsLiabilityDisputes() {
  return (
    <section className="scroll-mt-28">
      <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-heading mb-6 sm:mb-8">
        4. Responsabilité, Garanties & Litiges
      </h2>
      <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-8">
        SafiHub établit un cadre équitable et rigoureux de protection contre
        les risques de détérioration ou de perte textile.
      </p>

      <div className="space-y-8 sm:space-y-10">
        <div>
          <h3 className="text-lg font-bold text-heading mb-2">
            4.1. Responsabilité des Pressings Partenaires
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Dès validation de la réception au sein de ses ateliers, le pressing
            partenaire assume l&apos;entière responsabilité juridique du soin,
            du traitement adapté selon l&apos;étiquetage du vêtement et de la
            garde des articles qui lui sont confiés.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-heading mb-2">
            4.2. Photos d&apos;État Contradictoires & Plafond d&apos;Indemnisation
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <ShieldAlert className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 leading-relaxed">
              Les clichés photographiques capturés contradictoirement par le
              coursier lors de la collecte constituent la preuve irréfutable de
              l&apos;état initial du vêtement (déchirures antérieures, boutons
              manquants, taches indélébiles). En cas de perte ou de dégradation
              imputable avérée au pressing, une indemnisation plafonnée à un
              multiple du tarif de nettoyage (ou barème convenu de la convention
              partenaire) sera versée au client sous 72h ouvrées.
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-heading mb-2">
            4.3. Code Secret de Remise (Delivery Verification Code)
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <KeyRound className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 leading-relaxed">
              Pour éviter toute erreur d&apos;attribution ou remise à un tiers non
              autorisé, le client reçoit un code de sécurité unique à 4 chiffres
              sur sa page de suivi. La remise définitive du linge par le coursier
              est strictement conditionnée à la saisie de ce code de validation.
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-heading mb-2">
            4.4. Procédure de Réclamation & Droit Applicable
          </h3>
          <p className="text-slate-600 leading-relaxed mb-3">
            Toute anomalie doit être signalée dans un délai maximal de{" "}
            <strong>48 heures</strong> suivant la remise du colis via
            l&apos;assistance SafiHub ou à l&apos;adresse{" "}
            <span className="font-semibold text-primary">support@safihub.cd</span>.
          </p>
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-start gap-3">
            <Scale className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">Droit applicable :</strong> Les
              présentes CGU sont soumises au droit commercial de la République
              Démocratique du Congo. Tout différend persistant relèvera de la
              compétence exclusive des tribunaux du ressort de la ville de
              Bukavu.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
