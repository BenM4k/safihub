import { getTranslations } from "next-intl/server";
import { getAdminSettingsData } from "@/services/admin";
import { PlatformSettingsForm } from "@/components/admin/settings/platform-settings-form";
import { ExchangeRateForm } from "@/components/admin/settings/exchange-rate-form";
import { ExchangeRatesHistory } from "@/components/admin/settings/exchange-rates-history";

export default async function AdminSettingsPage() {
  const t = await getTranslations("admin.settings");
  const res = await getAdminSettingsData();

  if (!res.ok) {
    return (
      <div className="p-8 text-center text-sm text-[#D92D20]">
        Erreur lors du chargement des paramètres: {res.error}
      </div>
    );
  }

  const { settings, rates } = res.value;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EAECF0] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
            {t("title")}
          </h1>
          <p className="text-sm text-[#667085] mt-1">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlatformSettingsForm settings={settings} />
        <div className="space-y-6">
          <ExchangeRateForm />
          <ExchangeRatesHistory rates={rates} />
        </div>
      </div>
    </div>
  );
}
