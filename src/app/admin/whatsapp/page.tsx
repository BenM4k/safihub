import { getTranslations } from "next-intl/server";
import { getWhatsAppIntegrationStatus } from "@/services/whatsapp";
import { WhatsAppConfigCard } from "@/components/admin/whatsapp/whatsapp-config-card";
import { WhatsAppTestSender } from "@/components/admin/whatsapp/whatsapp-test-sender";
import { WhatsAppBotSimulator } from "@/components/admin/whatsapp/whatsapp-bot-simulator";

export default async function AdminWhatsAppPage() {
  const t = await getTranslations("admin.whatsapp");
  const status = getWhatsAppIntegrationStatus();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EAECF0] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
            {t("title")}
          </h1>
          <p className="text-sm text-[#667085] mt-1">{t("subtitle")}</p>
        </div>
      </div>

      <WhatsAppConfigCard status={status} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WhatsAppTestSender />
        <WhatsAppBotSimulator />
      </div>
    </div>
  );
}

