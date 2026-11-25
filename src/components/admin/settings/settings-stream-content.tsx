import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getAdminSettingsData } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { PlatformSettingsForm } from "./platform-settings-form";
import { ExchangeRateForm } from "./exchange-rate-form";
import { ExchangeRatesHistory } from "./exchange-rates-history";

function getBukavuTodayIsoDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lubumbashi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function SettingsStreamContent() {
  const [t, res] = await Promise.all([
    getTranslations("admin.settings"),
    getAdminSettingsData(),
  ]);

  if (!res.ok) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 rounded-2xl border border-destructive/30 bg-destructive-soft font-sans animate-enter">
        <div className="size-11 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="size-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-heading font-display">
            {t("errorTitle")}
          </h2>
          <p className="text-xs text-destructive">{t("errorDescription")}</p>
        </div>
        <Button asChild size="sm" className="min-h-10 px-4 text-xs press">
          <Link href="/admin/settings">
            <RefreshCw className="size-3.5 mr-1.5" />
            {t("retry")}
          </Link>
        </Button>
      </div>
    );
  }

  const { settings, rates } = res.value;
  const bukavuToday = getBukavuTodayIsoDate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-enter-fast">
      <PlatformSettingsForm settings={settings} />
      <div className="space-y-6">
        <ExchangeRateForm defaultEffectiveDate={bukavuToday} />
        <ExchangeRatesHistory rates={rates} />
      </div>
    </div>
  );
}
