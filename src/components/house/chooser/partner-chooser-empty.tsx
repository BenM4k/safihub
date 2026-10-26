import Link from "next/link";
import { useTranslations } from "next-intl";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Empty state displayed when a user has no laundry houses assigned.
 */
export function PartnerChooserEmpty() {
  const t = useTranslations("house.chooser");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center space-y-4 shadow-xs">
        <Store className="size-10 text-muted-foreground mx-auto" />
        <h2 className="text-lg font-bold text-heading">{t("noHouseTitle")}</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("noHouseMessage")}
        </p>
        <Button asChild className="rounded-xl font-semibold text-xs px-5 h-9">
          <Link href="/">{t("backHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
