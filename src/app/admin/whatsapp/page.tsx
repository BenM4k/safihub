import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { getWhatsAppIntegrationStatus } from "@/services/whatsapp";
import { PageHeader } from "@/components/admin/shared/page-header";
import { WhatsAppConfigCard } from "@/components/admin/whatsapp/whatsapp-config-card";
import { WhatsAppTestSender } from "@/components/admin/whatsapp/whatsapp-test-sender";
import { WhatsAppBotSimulator } from "@/components/admin/whatsapp/whatsapp-bot-simulator";

export default async function AdminWhatsAppPage() {
  const [, t] = await Promise.all([
    guardAdminRoute(),
    getTranslations("admin.whatsapp"),
  ]);
  const status = getWhatsAppIntegrationStatus();

  return (
    <div className="space-y-6 animate-enter">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <WhatsAppConfigCard status={status} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WhatsAppTestSender />
        <WhatsAppBotSimulator />
      </div>
    </div>
  );
}
