import Link from "next/link";
import { ChevronRight, HelpCircle } from "lucide-react";

interface FaqPageHeroProps {
  badge: string;
  breadcrumbHome: string;
  breadcrumbFaq: string;
  title: string;
  subtitle: string;
}

export function FaqPageHero({
  badge,
  breadcrumbHome,
  breadcrumbFaq,
  title,
  subtitle,
}: FaqPageHeroProps) {
  return (
    <header className="w-full max-w-4xl lg:max-w-5xl flex flex-col items-center text-center mb-10 sm:mb-12">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-5"
      >
        <Link href="/" className="hover:text-primary transition-colors">
          {breadcrumbHome}
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span className="text-heading font-semibold">{breadcrumbFaq}</span>
      </nav>

      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-4">
        <HelpCircle className="size-3.5" aria-hidden="true" />
        <span>{badge}</span>
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-heading tracking-tight">
        {title}
      </h1>

      <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
        {subtitle}
      </p>
    </header>
  );
}
