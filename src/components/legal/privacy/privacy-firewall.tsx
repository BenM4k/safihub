import { ShieldCheck, EyeOff, LockKeyhole } from "lucide-react";

export function PrivacyFirewall() {
  return (
    <section className="scroll-mt-28">
      <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-heading mb-6 sm:mb-8">
        2. Le Pare-Feu de Confidentialité Client
      </h2>
      <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-8">
        SafiHub intègre une barrière logicielle cryptographique native
        garantissant une séparation étanche des données d&apos;identité entre les
        acteurs de l&apos;écosystème.
      </p>

      <div className="space-y-6 sm:space-y-8">
        <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <EyeOff className="size-5 text-primary" />
            <h3 className="font-bold text-base sm:text-lg text-white">
              Anonymisation Complète Vis-à-Vis des Pressings
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Les ateliers et personnels des pressings partenaires{" "}
            <strong className="text-white">
              n&apos;ont jamais accès à votre numéro de téléphone personnel, à
              votre nom de famille ou à vos repères d&apos;habitation
            </strong>
            . Leurs écrans de production affichent uniquement le prénom, la
            commune générale et le numéro d&apos;ordre technique de lavage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-2 font-bold text-heading text-sm">
              <LockKeyhole className="size-4 text-primary" />
              <span>Accès Éphémère pour les Coursiers</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Le coursier ne peut consulter votre numéro de téléphone et votre
              repère d&apos;accès que{" "}
              <strong>durant sa mission active de collecte ou de livraison</strong>
              . Dès la mission achevée et validée, ces accès sont révoqués.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-2 font-bold text-heading text-sm">
              <ShieldCheck className="size-4 text-primary" />
              <span>Zéro Monétisation Publicitaire</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Vos informations personnelles et historiques de commande ne font
              l&apos;objet d&apos;aucune cession, revente ou profilage à des régies
              publicitaires tierces.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
