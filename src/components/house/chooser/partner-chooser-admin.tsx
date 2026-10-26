import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Store, Shield } from "lucide-react";
import type { HouseRecord } from "@/dal";
import { Badge } from "@/components/ui/badge";

interface PartnerChooserAdminProps {
  houses: HouseRecord[];
}

/**
 * Partner house chooser for administrators browsing in delegated mode.
 */
export function PartnerChooserAdmin({ houses }: PartnerChooserAdminProps) {
  const t = useTranslations("house.chooser");

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <Badge
            variant="warning"
            className="gap-1.5 px-3 py-1 text-xs font-bold"
          >
            <Shield className="size-3.5" />
            <span>{t("adminMode")}</span>
          </Badge>
          <h1 className="text-2xl font-black text-heading tracking-tight">
            {t("adminTitle")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("adminSubtitle")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {houses.map((h) => (
            <Link
              key={h.id}
              href={`/partner/${h.slug}`}
              className="p-4 rounded-xl bg-card border border-border hover:border-border-strong hover:shadow-xs transition group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-secondary text-foreground flex items-center justify-center shrink-0">
                  <Store className="size-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-heading group-hover:text-primary transition">
                    {h.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    slug:{" "}
                    <span className="font-mono text-muted-foreground">
                      {h.slug}
                    </span>
                  </p>
                </div>
              </div>
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
