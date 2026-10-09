import { UserCheck, MessageSquare } from "lucide-react";

export function ConsentCustomerRights() {
  return (
    <section className="scroll-mt-28 space-y-6">
      <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
        3. Droits des Utilisateurs, Retrait du Consentement & Contact
      </h3>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
        Vous conservez le contrôle total de vos données personnelles et de vos autorisations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <UserCheck className="size-4 text-sky-600" />
            <span>Gestion depuis votre Espace Client</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Vous pouvez à tout moment consulter vos consentements horodatés dans la rubrique
            « Mon Compte » de l&apos;application SafiHub. Vous avez également le droit de demander
            la suppression anticipée des photos liées à vos commandes terminées.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <MessageSquare className="size-4 text-sky-600" />
            <span>Support & Délégué à Bukavu</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Pour toute réclamation ou question relative à la prise de vue et à la confidentialité,
            contactez notre équipe d&apos;exploitation locale au numéro officiel WhatsApp SafiHub
            ou par courrier électronique à l&apos;adresse{" "}
            <a
              href="mailto:privacy@safihub.cd"
              className="font-medium text-sky-600 hover:underline"
            >
              privacy@safihub.cd
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
