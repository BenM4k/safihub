import { WifiOff, Key, Repeat } from "lucide-react";

export function SecurityOfflineAntiFraud() {
  return (
    <section className="scroll-mt-28">
      <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-heading mb-6 sm:mb-8">
        3. Résilience Hors-Ligne & Prévention Anti-Fraude
      </h2>
      <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-8">
        Les conditions de connectivité mobile à Bukavu nécessitent une
        conception tolérante aux pannes sans aucun compromis sur l&apos;intégrité
        opérationnelle.
      </p>

      <div className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-2 font-bold text-heading text-sm">
              <WifiOff className="size-4 text-primary" />
              <span>Exécution Hors-Ligne Sécurisée (PWA)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              L&apos;application coursier enregistre les inventaires et photos dans
              un stockage chiffré local (IndexedDB) même en zone blanche. Les
              actions sont rejouées séquentiellement à la reconnexion.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-2 font-bold text-heading text-sm">
              <Repeat className="size-4 text-primary" />
              <span>Idempotence Universelle des Événements</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Chaque transaction ou mise à jour de statut porte un identifiant
              unique (UUID). Les requêtes redondantes causées par des coupures
              réseau 3G sont dédupliquées sans aucun impact côté serveur.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <Key className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-heading font-semibold">
              Code de Confirmation de Remise :
            </strong>{" "}
            Le système génère un code secret aléatoire communiqué uniquement au
            client. Pour finaliser la livraison et clore la mission, le coursier
            doit impérativement saisir ce code, interdisant toute validation
            frauduleuse ou prématurée.
          </div>
        </div>
      </div>
    </section>
  );
}
