"use client";

import { useTranslations } from "next-intl";
import { Home, MapPin } from "lucide-react";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import type { CustomerDetailedProfile } from "@/services/admin";

interface CustomerTabAddressesProps {
  profile: CustomerDetailedProfile;
}

export function CustomerTabAddresses({ profile }: CustomerTabAddressesProps) {
  const t = useTranslations("admin.customers.details");
  const { addresses } = profile;

  if (addresses.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground border border-border rounded-lg bg-muted/20">
        <MapPin className="size-8 text-muted-foreground/60 mx-auto mb-2" />
        <div className="font-semibold text-foreground">{t("noAddressesTitle")}</div>
        <div className="text-2xs text-muted-foreground mt-0.5">{t("noAddressesDesc")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between text-2xs text-muted-foreground font-semibold px-1">
        <span>{t("addressesCount", { count: addresses.length })}</span>
      </div>

      <div className="divide-y divide-border border border-border rounded-lg bg-muted/10 overflow-hidden">
        {addresses.map((addr) => (
          <div key={addr.id} className="p-3.5 hover:bg-muted/30 transition-colors space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Home className="size-3.5 text-primary" />
                <span>{addr.label || t("fallbackAddressLabel")}</span>
              </div>
              {addr.isDefault && (
                <span className="px-2 py-0.5 rounded-full text-2xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {t("defaultAddress")}
                </span>
              )}
            </div>

            <div className="text-2xs text-muted-foreground">
              <span className="font-semibold text-foreground">{addr.neighborhoodName || t("fallbackNeighborhood")}</span> · {addr.landmark}
            </div>

            <div className="text-2xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <span>{t("contactDelivery")}</span>
              <PhoneCell phone={addr.phone} showCopy={true} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
