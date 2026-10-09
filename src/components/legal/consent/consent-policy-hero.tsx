import { Camera, ShieldCheck, CheckCircle2 } from "lucide-react";

export function ConsentPolicyHero() {
  return (
    <section className="scroll-mt-28">
      <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-sky-600/10 p-3 text-sky-600">
            <Camera className="size-6" />
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Engagement Fondamental : Vos Vêtements, Rien d&apos;Autre
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Chez SafiHub, nous documentons photographiquement l&apos;état des articles confiés
              exclusivement dans le but de prévenir tout litige d&apos;inventaire ou de détérioration préalable.
              Aucune image ne capture de personnes, de visages, de pièces d&apos;identité ou d&apos;intérieurs d&apos;habitation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-lg border border-sky-200/50">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Textiles & défauts uniquement</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-lg border border-sky-200/50">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>EXIF & GPS supprimés localement</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-lg border border-sky-200/50">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Purge programmée à 90 jours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
