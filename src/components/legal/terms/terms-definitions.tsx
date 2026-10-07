import { Info } from "lucide-react";

export function TermsDefinitions() {
  return (
    <section className="scroll-mt-28">
      <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-heading mb-6 sm:mb-8">
        1. Définitions & Interprétation
      </h2>
      <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-8">
        Les présentes Conditions Générales d&apos;Utilisation (ci-après les «{" "}
        <strong>CGU</strong> ») régissent l&apos;accès et l&apos;utilisation de
        la plateforme <strong>SafiHub</strong>, opérant à Bukavu, Province du
        Sud-Kivu, République Démocratique du Congo.
      </p>

      <div className="space-y-5 sm:space-y-6 text-slate-600 leading-relaxed">
        <p>
          <strong className="text-heading font-semibold">« SafiHub »</strong> :
          désigne la société opératrice de la marketplace numérique de pressing
          et de blanchisserie à domicile, assurant l&apos;intermédiation
          technologique, la gestion des missions de livraison et le contrôle
          qualité.
        </p>

        <p>
          <strong className="text-heading font-semibold">« Client »</strong> :
          toute personne physique ou morale passant commande de prestations de
          nettoyage via l&apos;application web ou le service d&apos;assistance
          téléphonique de SafiHub.
        </p>

        <p>
          <strong className="text-heading font-semibold">
            « Pressing Partenaire » (Laundry House)
          </strong>{" "}
          : établissement professionnel local de blanchisserie ou nettoyage à
          sec, sélectionné et agréé par SafiHub, responsable de l&apos;exécution
          des soins textiles.
        </p>

        <p>
          <strong className="text-heading font-semibold">« Coursier »</strong> :
          prestataire logistique agréé, en charge du ramassage à domicile, du
          double comptage contradictoire, du transport sécurisé et de la
          livraison du linge propre.
        </p>

        <p>
          <strong className="text-heading font-semibold">
            « Double Comptage au Seuil »
          </strong>{" "}
          : protocole contractuel en trois étapes (déclaration client,
          inventaire physique contradictoire au ramassage, et vérification de
          réception au pressing) garantissant l&apos;exactitude des pièces
          confiées.
        </p>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
        <Info className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          <strong className="text-heading font-semibold">
            Spécificité locale de Bukavu :
          </strong>{" "}
          En l&apos;absence de numérotation postale standardisée, la
          localisation des commandes s&apos;effectue par désignation de la
          commune (Ibanda, Kadutu, Bagira), d&apos;un point de repère public
          notoire et d&apos;un contact téléphonique direct.
        </div>
      </div>
    </section>
  );
}
