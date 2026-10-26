import Link from "next/link";
import { useTranslations } from "next-intl";
import { Building2, ArrowRight, Store } from "lucide-react";
import type { HouseMembershipInfo } from "@/dal";
import { Badge } from "@/components/ui/badge";

interface PartnerChooserMembershipsProps {
  memberships: HouseMembershipInfo[];
}

/**
 * House selector list for partner users with multiple memberships.
 */
export function PartnerChooserMemberships({
  memberships,
}: PartnerChooserMembershipsProps) {
  const t = useTranslations("house.chooser");

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-sm">
            <Store className="size-6" />
          </div>
          <h1 className="text-2xl font-bold text-heading">
            {t("selectHouseTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("selectHouseSubtitle")}
          </p>
        </div>

        <div className="grid gap-3">
          {memberships.map((m) => (
            <Link
              key={m.houseId}
              href={`/partner/${m.houseSlug}`}
              className="p-5 rounded-2xl bg-card border border-border hover:border-border-strong hover:shadow-xs transition group flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-heading group-hover:text-primary transition">
                    {m.houseName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={m.isActive ? "success" : "secondary"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {m.isActive ? t("statusActive") : t("statusInactive")}
                    </Badge>
                    {m.isPaused && (
                      <Badge
                        variant="warning"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {t("statusPaused")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
