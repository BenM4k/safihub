"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { sendAdminWhatsAppTestAction } from "@/actions/admin-whatsapp.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { isWhatsAppErrorKey } from "./whatsapp-error-utils";
import type {
  ExecuteWhatsAppTestResult,
  WhatsAppLocale,
  WhatsAppTestScenario,
} from "@/services/whatsapp";

export function WhatsAppTestSender() {
  const t = useTranslations("admin.whatsapp");
  const [isPending, startTransition] = useTransition();

  const [recipientPhone, setRecipientPhone] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [scenario, setScenario] =
    useState<WhatsAppTestScenario>("order_status");
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
        dryRun,
      });
      if (!res.ok) {
        const message = isWhatsAppErrorKey(res.error)
          ? t(res.error)
          : res.error;
        setErrorMsg(message);
        return;
      }
      setLastResult(res.value);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5 animate-enter-fast">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <MessageSquare className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-heading font-display">
            {t("senderTitle")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("senderSubtitle")}</p>
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
            <Select
              value={locale}
              onValueChange={(v) => setLocale(v as WhatsAppLocale)}
            >
              <SelectTrigger
                id="wa-locale"
                className="h-10 w-full rounded-xl bg-card border-border text-sm text-heading"
                aria-label={t("localeLabel")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français (FR)</SelectItem>
                <SelectItem value="sw">Kiswahili (SW)</SelectItem>
                <SelectItem value="en">English (EN)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wa-scenario">{t("scenarioLabel")}</Label>
          <Select
            value={scenario}
            onValueChange={(v) => setScenario(v as WhatsAppTestScenario)}
          >
            <SelectTrigger
              id="wa-scenario"
              className="h-10 w-full rounded-xl bg-card border-border text-sm text-heading"
              aria-label={t("scenarioLabel")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order_status">{t("scenarioOrderStatus")}</SelectItem>
              <SelectItem value="courier_arrival">{t("scenarioCourierArrival")}</SelectItem>
              <SelectItem value="price_adjustment">{t("scenarioPriceAdjustment")}</SelectItem>
              <SelectItem value="partner_settlement">{t("scenarioPartnerSettlement")}</SelectItem>
              <SelectItem value="bot_welcome">{t("scenarioBotWelcome")}</SelectItem>
              <SelectItem value="free_text">{t("scenarioFreeText")}</SelectItem>
              <SelectItem value="hello_world_template">{t("scenarioHelloWorld")}</SelectItem>
            </SelectContent>
          </Select>
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
          <div className="rounded-xl border border-destructive/30 bg-destructive-soft px-3.5 py-2.5 text-xs font-medium text-destructive flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5">
          <div className="space-y-0.5">
            <Label htmlFor="wa-sender-dryrun" className="text-xs font-semibold">
              {t("dryRunToggleLabel")}
            </Label>
            <p className="text-xs text-muted-foreground">{t("dryRunToggleHint")}</p>
          </div>
          <Switch
            id="wa-sender-dryrun"
            checked={dryRun}
            onCheckedChange={setDryRun}
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full min-h-10 press">
          <Send className="size-4 mr-2" />
          {isPending ? t("sending") : t("sendButton")}
        </Button>
      </form>

      {lastResult && (
        <div className="rounded-xl border border-success/20 bg-success-soft p-4 space-y-2 animate-enter-fast">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-success flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-success" />
              {t("lastResultTitle")}
            </span>
            <StatusBadge tone={lastResult.dryRun ? "warning" : "success"}>
              {lastResult.dryRun ? t("modeDryRunBadge") : t("modeLiveBadge")}
            </StatusBadge>
          </div>
          <div className="text-xs text-foreground space-y-1 font-mono">
            <div>
              <strong>{t("messageIdLabel")}:</strong> {lastResult.messageId}
            </div>
            <div>
              <strong>{t("recipientLabel")}:</strong> +{lastResult.recipientPhone}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
