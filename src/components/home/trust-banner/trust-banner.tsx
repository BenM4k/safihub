import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { getRoleCta } from "@/lib/role-cta";
import type { AuthenticatedUser } from "@/services/auth/guards";

export function TrustBanner({ user }: { user?: AuthenticatedUser | null } = {}) {
  const tHero = useTranslations("hero");
  const cta = getRoleCta(user);
  const ctaLabel =
    cta.roleKey === "admin"
      ? tHero("ctaAdmin")
      : cta.roleKey === "courier"
        ? tHero("ctaCourier")
        : cta.roleKey === "house"
          ? tHero("ctaHouse")
          : tHero("ctaOrder");

  const partners = [
    { name: "Hôtel du Lac Kivu", role: "Hôtellerie" },
    { name: "Clinique de Muhumba", role: "Médical" },
    { name: "Kivu Lodge Resort", role: "Tourisme" },
    { name: "Banque Trust RDC", role: "Finance" },
    { name: "Bukavu Business Center", role: "Entreprises" },
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center py-16 md:py-24 border-t border-border bg-white overflow-hidden">
      <div className="container-page flex flex-col gap-14 md:gap-20">
        {/* Top: Trusted by partners bar with dividers (from reference trust.png) */}
        <div>
          <p className="text-sm sm:text-base font-bold text-primary mb-6 text-center lg:text-left">
            Partenaires de confiance & entreprises à Bukavu
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-y border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 py-4 sm:py-6">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-3 text-center"
              >
                <span className="font-display font-extrabold text-base sm:text-lg text-heading tracking-tight">
                  {partner.name}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {partner.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Network Map graphic (Left) + Coverage Copy (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: Interactive network circle graphic matching reference */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative size-90 sm:size-100 rounded-full bg-[#E5E2FE]/60 border border-indigo-100 flex items-center justify-center p-6">
              {/* Central Map Badge */}
              <div className="size-36 sm:size-44 rounded-full bg-white shadow-md border border-indigo-100 flex flex-col items-center justify-center p-4 text-center">
                <MapPin className="size-7 text-primary mb-1 animate-bounce" />
                <span className="font-display font-extrabold text-sm sm:text-base text-heading leading-tight">
                  Grand Bukavu
                </span>
                <span className="text-[10px] text-muted-foreground">
                  3 Communes reliées
                </span>
              </div>

              {/* Orbiting Avatar Pins */}
              <div className="absolute top-6 left-1/4 -translate-x-1/2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                <div className="size-6 rounded-full overflow-hidden relative">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                    alt="Nguba"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-heading">Nguba</span>
              </div>

              <div className="absolute top-1/4 right-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                <div className="size-6 rounded-full overflow-hidden relative">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                    alt="Muhumba"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-heading">Muhumba</span>
              </div>

              <div className="absolute bottom-10 left-8 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                <div className="size-6 rounded-full overflow-hidden relative">
                  <Image
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                    alt="La Botte"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-heading">La Botte</span>
              </div>

              <div className="absolute bottom-8 right-12 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                <div className="size-6 rounded-full overflow-hidden relative">
                  <Image
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"
                    alt="Kadutu"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-heading">Kadutu</span>
              </div>
            </div>
          </div>

          {/* Right: Coverage copy matching reference text layout */}
          <div className="lg:col-span-6 stack gap-4 text-left">
            <span className="text-sm font-bold text-primary">
              Couverture Bukavu
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-heading leading-[1.15] tracking-tight">
              Collecte & livraison dans toutes les communes
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
              Nos coursiers certifiés assurent la liaison directe entre votre
              domicile à Ibanda, Kadutu ou Bagira et les meilleurs ateliers de
              pressing de la ville en moins de 45 minutes.
            </p>

            <div className="pt-2">
              <Link
                href={cta.href}
                className="bg-primary hover:bg-primary-hover text-white text-base font-semibold px-7 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-sm transition-all group"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
