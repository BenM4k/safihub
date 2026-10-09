import Link from "next/link";
import { ShieldCheck, FileText, Lock, Camera } from "lucide-react";

interface LegalNavTabsProps {
  activeTab: "terms" | "privacy" | "security" | "consent";
}

export function LegalNavTabs({ activeTab }: LegalNavTabsProps) {
  const tabs = [
    {
      id: "terms",
      label: "Conditions Générales",
      href: "/terms",
      icon: FileText,
    },
    {
      id: "privacy",
      label: "Confidentialité",
      href: "/privacy",
      icon: Lock,
    },
    {
      id: "security",
      label: "Sécurité & Données",
      href: "/security",
      icon: ShieldCheck,
    },
    {
      id: "consent",
      label: "Consentement Photos",
      href: "/consent",
      icon: Camera,
    },
  ] as const;

  return (
    <nav
      aria-label="Navigation légale"
      className="inline-flex flex-wrap items-center justify-center p-1.5 rounded-full bg-slate-100/90 border border-slate-200 shadow-2xs gap-1"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              isActive
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Icon className="size-3.5 sm:size-4 shrink-0" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
