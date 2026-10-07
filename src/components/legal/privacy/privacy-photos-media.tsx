import { Camera, HardDrive, Trash2, ShieldAlert } from "lucide-react";

export function PrivacyPhotosMedia() {
  return (
    <section className="scroll-mt-28">
      <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-heading mb-6 sm:mb-8">
        3. Traitement des Photos d&apos;État & Hébergement R2
      </h2>
      <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-8">
        La prise de clichés photographiques lors de la prise en charge constitue
        un gage de sérénité et d&apos;intégrité. Elle est soumise à des règles
        strictes de protection de votre vie privée.
      </p>

      <div className="space-y-6 sm:space-y-8">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong>Périmètre exclusif du linge :</strong> Nos coursiers et
            partenaires ont pour consigne technique stricte de ne photographier
            que les vêtements ou textiles confiés.{" "}
            <strong>
              Tout cliché comportant un visage, une pièce d&apos;identité ou
              l&apos;intérieur d&apos;un domicile privé est formellement prohibé.
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <Camera className="size-5 text-primary mb-2" />
            <h4 className="font-bold text-heading text-sm mb-1">
              Purge EXIF Locale
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Avant tout envoi, l&apos;application compresse l&apos;image en format WebP
              (&lt; 300 Ko) et supprime l&apos;intégralité des métadonnées EXIF,
              notamment les coordonnées GPS exactes.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <HardDrive className="size-5 text-primary mb-2" />
            <h4 className="font-bold text-heading text-sm mb-1">
              Stockage Cloisonné R2
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Les fichiers sont transférés directement vers un espace de stockage
              sécurisé Cloudflare R2 via des liens pré-signés éphémères à durée de
              vie courte.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <Trash2 className="size-5 text-primary mb-2" />
            <h4 className="font-bold text-heading text-sm mb-1">
              Purge Automatique à 90 Jours
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Les clichés d&apos;état sont automatiquement et définitivement
              détruits 90 jours après la livraison réussie ou la clôture d&apos;un
              éventuel litige.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
