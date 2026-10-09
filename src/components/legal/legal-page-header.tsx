import { Badge } from "@/components/ui/badge";
import { LegalNavTabs } from "./legal-nav-tabs";

interface LegalPageHeaderProps {
  badge: string;
  title: string;
  description: string;
  lastUpdated?: string;
  activeTab: "terms" | "privacy" | "security" | "consent";
}

export function LegalPageHeader({
  badge,
  title,
  description,
  lastUpdated = "7 octobre 2026",
  activeTab,
}: LegalPageHeaderProps) {
  return (
    <header className="text-center pt-8 sm:pt-12 pb-6">
      <div className="flex justify-center mb-4">
        <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold text-primary border-primary/20 bg-primary/5">
          {badge}
        </Badge>
      </div>

      <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-heading max-w-3xl mx-auto">
        {title}
      </h1>

      <p className="mt-3 text-xs sm:text-sm font-medium text-muted-foreground">
        Dernière mise à jour : {lastUpdated} • Bukavu, RDC
      </p>

      <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        {description}
      </p>

      <div className="mt-8 sm:mt-10 flex justify-center">
        <LegalNavTabs activeTab={activeTab} />
      </div>

      <hr className="border-slate-200/80 mt-12 sm:mt-16 mb-16 sm:mb-24" />
    </header>
  );
}
