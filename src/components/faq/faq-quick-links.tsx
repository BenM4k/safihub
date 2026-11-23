import Link from "next/link";
import { ArrowRight, MapPin, PackageSearch, Sparkles } from "lucide-react";

interface FaqQuickLinksProps {
  title: string;
  links: Array<{
    href: string;
    title: string;
    description: string;
    icon: "houses" | "coverage" | "track";
  }>;
}

const ICONS = {
  houses: Sparkles,
  coverage: MapPin,
  track: PackageSearch,
} as const;

export function FaqQuickLinks({ title, links }: FaqQuickLinksProps) {
  return (
    <section className="w-full max-w-4xl lg:max-w-5xl mb-14">
      <h2 className="text-base sm:text-lg font-bold text-heading mb-4 text-center sm:text-left">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {links.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl bg-card border border-border p-5 flex flex-col justify-between gap-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="space-y-2">
                <div className="size-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-bold text-heading group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                <span>→</span>
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
