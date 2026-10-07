import { UserCheck, MapPin, Shirt, PhoneCall } from "lucide-react";

export function PrivacyDataCollected() {
  return (
    <section className="scroll-mt-28">
      <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-heading mb-6 sm:mb-8">
        1. Données Collectées & Finalités
      </h2>
      <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-8">
        La présente Politique de Confidentialité explicite la manière dont
        SafiHub collecte, protège et traite les données personnelles de ses
        utilisateurs à Bukavu, dans le respect des meilleures pratiques de
        sécurité et du principe de minimisation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-8">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2 font-bold text-heading">
            <UserCheck className="size-4 text-primary" />
            <span>Identité & Profil</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Prénom, nom (optionnel pour les clients réguliers), adresse e-mail
            et mot de passe haché selon des algorithmes cryptographiques
            sécurisés.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2 font-bold text-heading">
            <PhoneCall className="size-4 text-primary" />
            <span>Coordination Mobile</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Numéro de téléphone portable direct utilisé pour les notifications de
            suivi de commande et l&apos;acheminement rapide par le coursier.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2 font-bold text-heading">
            <MapPin className="size-4 text-primary" />
            <span>Localisation Bukavu</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Sélection de la commune (Ibanda, Kadutu, Bagira) et description d&apos;un
            point de repère usuel (bâtiment public, carrefour, institution) pour
            permettre l&apos;accès physique.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2 font-bold text-heading">
            <Shirt className="size-4 text-primary" />
            <span>Prestations & Linge</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Types de vêtements, tissus déclarés, prestations de nettoyage
            sélectionnées et historiques d&apos;ajustements de prix.
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">
        <strong>Minimisation stricte :</strong> Nous ne collectons aucune donnée
        biométrique, aucune pièce d&apos;identité officielle et aucune
        information bancaire sur l&apos;application. Le paiement des prestations
        est opéré en numéraire au moment de la livraison.
      </p>
    </section>
  );
}
