import { getTranslations } from "next-intl/server";
import { CheckCircle2, AlertCircle, Webhook, ShieldCheck, KeyRound } from "lucide-react";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import type { WhatsAppIntegrationStatus } from "@/services/whatsapp";

export async function WhatsAppConfigCard({
  status,
}: {
  status: WhatsAppIntegrationStatus;
}) {
  const t = await getTranslations("admin.whatsapp");

  const items = [
    {
      label: t("apiVersionLabel"),
      value: status.apiVersion,
      ok: true,
    },
    {
      label: t("phoneIdLabel"),
      value: status.phoneNumberIdMasked ?? t("missing"),
      ok: Boolean(status.phoneNumberIdMasked),
    },
    {
      label: t("wabaIdLabel"),
      value: status.wabaIdMasked ?? t("missing"),
      ok: Boolean(status.wabaIdMasked),
    },
    {
      label: t("accessTokenLabel"),
      value: status.hasAccessToken ? t("configured") : t("missing"),
      ok: status.hasAccessToken,
    },
    {
      label: t("verifyTokenLabel"),
      value: status.hasVerifyToken ? t("configured") : t("missing"),
      ok: status.hasVerifyToken,
    },
    {
      label: t("appSecretLabel"),
      value: status.hasAppSecret ? t("configured") : t("missing"),
      ok: status.hasAppSecret,
    },
  ];

  return (
    <div className="rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#EAECF0] pb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#101828]">
              {t("configTitle")}
            </h2>
            <p className="text-xs text-[#667085]">{t("configSubtitle")}</p>
          </div>
        </div>

        <StatusBadge
          tone={status.isConfigured ? "success" : "warning"}
          icon={
            status.isConfigured ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <AlertCircle className="size-3.5" />
            )
          }
        >
          {status.isConfigured ? t("statusLive") : t("statusDryRun")}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] px-3.5 py-2.5 flex items-center justify-between gap-2"
          >
            <span className="text-xs font-medium text-[#475467]">
              {item.label}
            </span>
            <span
              className={`text-xs font-semibold font-mono ${
                item.ok ? "text-emerald-700" : "text-amber-600"
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#344054]">
          <Webhook className="size-4 text-primary shrink-0" />
          <span>{t("webhookUrlLabel")} :</span>
        </div>
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono bg-white border border-[#D0D5DD] px-2.5 py-1 rounded-lg text-[#101828] select-all">
            {status.webhookUrl}
          </code>
          {status.hasAppSecret && (
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}

