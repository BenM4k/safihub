import Link from "next/link";
import { Sparkles } from "lucide-react";
import { FooterSocial } from "./footer-social";

export function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-12 border-t border-slate-900">
      <div className="container-page flex flex-col justify-between min-h-90">
        {/* Main top columns matching reference footer.png */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16 xl:gap-20">
          {/* Left Column: Logo + Dark Follow us box */}
          <div className="lg:col-span-2 stack gap-5">
            <Link href="/" className="flex items-center gap-2 group">
              <Sparkles className="size-6 text-primary fill-primary" />
              <span className="font-display font-black text-2xl tracking-tight text-white">
                SafiHub<span className="text-primary">.</span>
              </span>
            </Link>

            {/* Dark Social Box */}
            <FooterSocial />
          </div>

          {/* Column 1: Services */}
          <div className="stack gap-3 text-sm">
            <h4 className="font-bold text-slate-200">Prestations</h4>
            <ul className="stack gap-2.5 text-slate-400 font-medium">
              <li>
                <Link
                  href="#services"
                  className="hover:text-white transition-colors"
                >
                  Vêtements Quotidien
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="hover:text-white transition-colors"
                >
                  Costumes & Cérémonie
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="hover:text-white transition-colors"
                >
                  Linge de lit & Maison
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="hover:text-white transition-colors"
                >
                  Baskets & Sneakers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Bukavu Zones */}
          <div className="stack gap-3 text-sm">
            <h4 className="font-bold text-slate-200">Bukavu</h4>
            <ul className="stack gap-2.5 text-slate-400 font-medium">
              <li>
                <Link
                  href="#zones"
                  className="hover:text-white transition-colors"
                >
                  Commune d&apos;Ibanda
                </Link>
              </li>
              <li>
                <Link
                  href="#zones"
                  className="hover:text-white transition-colors"
                >
                  Commune de Kadutu
                </Link>
              </li>
              <li>
                <Link
                  href="#zones"
                  className="hover:text-white transition-colors"
                >
                  Commune de Bagira
                </Link>
              </li>
              <li>
                <Link
                  href="/house"
                  className="hover:text-white transition-colors"
                >
                  Pressings Partenaires
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portails */}
          <div className="stack gap-3 text-sm">
            <h4 className="font-bold text-slate-200">Portails</h4>
            <ul className="stack gap-2.5 text-slate-400 font-medium">
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors"
                >
                  Espace Client
                </Link>
              </li>
              <li>
                <Link
                  href="/house"
                  className="hover:text-white transition-colors"
                >
                  Espace Pressing
                </Link>
              </li>
              <li>
                <Link
                  href="/courier"
                  className="hover:text-white transition-colors"
                >
                  Espace Coursier
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="hover:text-white transition-colors"
                >
                  FAQ & Aide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row matching reference footer.png */}
        <div className="mt-14 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© SafiHub, 2026. Tous droits réservés.</p>

          <div className="flex items-center gap-6">
            <Link
              href="/security"
              className="hover:text-slate-300 transition-colors"
            >
              Sécurité
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-300 transition-colors"
            >
              Conditions Générales
            </Link>
            <Link
              href="/privacy"
              className="hover:text-slate-300 transition-colors"
            >
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
