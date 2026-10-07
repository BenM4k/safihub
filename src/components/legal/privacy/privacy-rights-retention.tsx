import { UserCheck, FileText, Mail, Calendar } from "lucide-react";

export function PrivacyRightsRetention() {
  return (
    <section className="scroll-mt-28">
      <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-heading mb-6 sm:mb-8">
        4. Vos Droits & Conservation des Données
      </h2>
      <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-8">
        Vous conservez la maîtrise permanente de vos données personnelles et
        pouvez exercer vos droits à tout moment auprès de nos services.
      </p>

      <div className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-2 font-bold text-heading text-sm">
              <UserCheck className="size-4 text-primary" />
              <span>Droit d&apos;Accès & Rectification</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Vous pouvez à tout moment demander une copie complète des données
              vous concernant ou actualiser votre numéro de téléphone et point
              de repère.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-2 font-bold text-heading text-sm">
              <Calendar className="size-4 text-primary" />
              <span>Droit à l&apos;Oubli & Anonymisation</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Sur simple demande, vos identifiants sont effacés. Les données
              des clients inactifs depuis plus de 24 mois sont automatiquement
              anonymisées.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <FileText className="size-5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong>Obligations fiscales et légales :</strong> Les registres de
            transactions financières du livre de caisse (montants en CDF/USD,
            dates de règlement) sont conservés sous forme archivée et anonymisée
            conformément aux délais légaux de tenue des comptes en République
            Démocratique du Congo.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 text-white flex items-start gap-3">
          <Mail className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong className="text-white">Contact Délégué aux Données :</strong>{" "}
            Pour toute question ou pour exercer vos droits, écrivez directement
            à notre équipe dédiée à Bukavu :{" "}
            <span className="font-semibold text-primary">privacy@safihub.cd</span>.
          </div>
        </div>
      </div>
    </section>
  );
}
