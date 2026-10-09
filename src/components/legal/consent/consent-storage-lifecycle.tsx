import { Cloud, Clock, RefreshCw } from "lucide-react";

export function ConsentStorageLifecycle() {
  return (
    <section className="scroll-mt-28 space-y-6">
      <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
        2. Chiffrement, Stockage Cloudflare R2 & Rétention 90 Jours
      </h3>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
        L&apos;infrastructure SafiHub applique un modèle de stockage hautement sécurisé
        à rétention limitée, garantissant la stricte confidentialité des images.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="size-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <RefreshCw className="size-4" />
          </div>
          <h4 className="font-semibold text-slate-900 text-sm">Compression & Nettoyage Local</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chaque image est redimensionnée à un maximum de 1280px et compressée en WebP
            (&lt; 300 Ko) directement dans le navigateur du coursier. Toutes les balises GPS
            et EXIF sont purgées avant l&apos;envoi.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="size-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Cloud className="size-4" />
          </div>
          <h4 className="font-semibold text-slate-900 text-sm">URLs Pré-signées Éphémères</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Les clichés sont hébergés dans un compartiment Cloudflare R2 privé.
            Aucun accès public direct n&apos;est permis. L&apos;affichage utilise des signatures
            cryptographiques à validité limitée (60 minutes).
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="size-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Clock className="size-4" />
          </div>
          <h4 className="font-semibold text-slate-900 text-sm">Purge Automatique à 90 Jours</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Conformément à notre politique de minimisation des données, toutes les photos
            associées à une commande sont définitivement supprimées 90 jours après la livraison,
            sauf en cas de litige en cours d&apos;instruction.
          </p>
        </div>
      </div>
    </section>
  );
}
