import { ShieldCheck, Server, Lock, Layers } from "lucide-react";

export function SecurityOverviewArch() {
  return (
    <section className="scroll-mt-28">
      <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-heading mb-6 sm:mb-8">
        1. Architecture Système & Chiffrement
      </h2>
      <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-8">
        La sécurité de la plateforme SafiHub repose sur une architecture moderne
        en couches avec séparation stricte des accès et protection continue des
        flux.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2 font-bold text-heading">
            <Lock className="size-4 text-primary" />
            <span>Chiffrement en Transit (TLS 1.3)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Toutes les communications entre les terminaux des utilisateurs et
            les serveurs de production sont intégralement chiffrées en HTTPS /
            TLS 1.3 avec redirection forcée et en-têtes HSTS stricts.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2 font-bold text-heading">
            <Server className="size-4 text-primary" />
            <span>Chiffrement au Repos (AES-256)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Les données transactionnelles hébergées sur PostgreSQL sont
            chiffrées au repos selon le standard AES-256. Les mots de passe sont
            hachés avec salage individuel via des algorithmes à haute résistance.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2 font-bold text-heading">
            <Layers className="size-4 text-primary" />
            <span>Cloisonnement DAL & Rôles (RBAC)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Une couche d&apos;accès aux données (Data Access Layer - DAL) unique
            interdit toute fuite de périmètre. Les 4 rôles (Client, Pressing,
            Coursier, Administrateur) disposent de projections de données
            strictement étanches.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2 font-bold text-heading">
            <ShieldCheck className="size-4 text-primary" />
            <span>Sessions Sécurisées & Protection CSRF</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            L&apos;authentification utilise des cookies d&apos;état chiffrés, protégés
            par les attributs `httpOnly`, `SameSite=Lax` et `Secure`, éliminant
            les risques d&apos;interception XSS et CSRF.
          </p>
        </div>
      </div>
    </section>
  );
}
