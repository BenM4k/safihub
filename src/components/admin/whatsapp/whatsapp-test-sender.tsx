"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Send, CheckCircle2, AlertTriangle, MessageSquare } from "lucide-react";
import { sendAdminWhatsAppTestAction } from "@/actions/admin-whatsapp.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import type {
  ExecuteWhatsAppTestResult,
  WhatsAppLocale,
  WhatsAppTestScenario,
} from "@/services/whatsapp";

export function WhatsAppTestSender() {
  const t = useTranslations("admin.whatsapp");
  const [isPending, startTransition] = useTransition();

  const [recipientPhone, setRecipientPhone] = useState("+243991234567");
  const [scenario, setScenario] = useState<WhatsAppTestScenario>("order_status");
  const [locale, setLocale] = useState<WhatsAppLocale>("fr");
  const [orderCode, setOrderCode] = useState("ORD-20261105-4821");
  const [houseName, setHouseName] = useState("Pressing Rafiki");
  const [courierName, setCourierName] = useState("Justin");
  const [amountCdf, setAmountCdf] = useState("25000");
  const [verificationCode, setVerificationCode] = useState("4821");
  const [customText, setCustomText] = useState("");

  const [lastResult, setLastResult] =
    useState<ExecuteWhatsAppTestResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      const res = await sendAdminWhatsAppTestAction({
        scenario,
        recipientPhone,
        locale,
        orderCode,
        houseName,
        courierName,
        amountCdf: Number(amountCdf) || 0,
        verificationCode,
        customText,
      });
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      setLastResult(res.value);
    });
  }

  return (
    <div className="rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-3 border-b border-[#EAECF0] pb-4">
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <MessageSquare className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#101828]">{t("senderTitle")}</h2>
          <p className="text-xs text-[#667085]">{t("senderSubtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="wa-phone">{t("recipientPhoneLabel")}</Label>
            <Input
              id="wa-phone"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder={t("recipientPhonePlaceholder")}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wa-locale">{t("localeLabel")}</Label>
            <select
              id="wa-locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value as WhatsAppLocale)}
              className="flex h-10 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#101828]"
            >
              <option value="fr">Français (FR)</option>
              <option value="sw">Kiswahili (SW)</option>
              <option value="en">English (EN)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wa-scenario">{t("scenarioLabel")}</Label>
          <select
            id="wa-scenario"
            value={scenario}
            onChange={(e) => setScenario(e.target.value as WhatsAppTestScenario)}
            className="flex h-10 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#101828]"
          >
            <option value="order_status">{t("scenarioOrderStatus")}</option>
            <option value="courier_arrival">{t("scenarioCourierArrival")}</option>
            <option value="price_adjustment">{t("scenarioPriceAdjustment")}</option>
            <option value="partner_settlement">{t("scenarioPartnerSettlement")}</option>
            <option value="bot_welcome">{t("scenarioBotWelcome")}</option>
            <option value="free_text">{t("scenarioFreeText")}</option>
            <option value="hello_world_template">{t("scenarioHelloWorld")}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {[
            { id: "wa-order-code", label: t("orderCodeLabel"), val: orderCode, set: setOrderCode },
            { id: "wa-house", label: t("houseNameLabel"), val: houseName, set: setHouseName },
            { id: "wa-courier", label: t("courierNameLabel"), val: courierName, set: setCourierName },
            { id: "wa-amount", label: t("amountCdfLabel"), val: amountCdf, set: setAmountCdf, type: "number" },
            { id: "wa-code", label: t("verificationCodeLabel"), val: verificationCode, set: setVerificationCode },
            { id: "wa-custom", label: t("customTextLabel"), val: customText, set: setCustomText },
          ].map((f) => (
            <div key={f.id} className="space-y-1">
              <Label htmlFor={f.id} className="text-xs">{f.label}</Label>
              <Input
                id={f.id}
                type={f.type ?? "text"}
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
              />
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          <Send className="size-4 mr-2" />
          {isPending ? t("sending") : t("sendButton")}
        </Button>
      </form>

      {lastResult && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600" />
              {t("lastResultTitle")}
            </span>
            <StatusBadge tone={lastResult.dryRun ? "warning" : "success"}>
              {lastResult.dryRun ? t("modeDryRunBadge") : t("modeLiveBadge")}
            </StatusBadge>
          </div>
          <div className="text-xs text-[#344054] space-y-1 font-mono">
            <div><strong>{t("messageIdLabel")}:</strong> {lastResult.messageId}</div>
            <div><strong>To:</strong> +{lastResult.recipientPhone}</div>
          </div>
        </div>
      )}
    </div>
  );
}
