"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Bot,
  Play,
  RotateCcw,
  MapPin,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { simulateAdminWhatsAppBotStepAction } from "@/actions/admin-whatsapp.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { isWhatsAppErrorKey } from "./whatsapp-error-utils";
import type { WhatsAppBotSession } from "@/services/whatsapp";

export function WhatsAppBotSimulator() {
  const t = useTranslations("admin.whatsapp");
  const [isPending, startTransition] = useTransition();

  const [phone, setPhone] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [customText, setCustomText] = useState("");
  const [sessionState, setSessionState] = useState<WhatsAppBotSession | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function triggerStep(
    actionType: "text" | "button" | "list" | "location" | "reset",
    value?: string
  ) {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await simulateAdminWhatsAppBotStepAction({
        phone,
        actionType,
        value,
        dryRun,
      });
      if (!res.ok) {
        const message = isWhatsAppErrorKey(res.error)
          ? t(res.error)
          : res.error;
        setErrorMsg(message);
        return;
      }
      setSessionState(res.value);
    });
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customText.trim()) return;
    const text = customText.trim();
    setCustomText("");
    triggerStep("text", text);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5 animate-enter-fast">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Bot className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-heading font-display">
            {t("simulatorTitle")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("simulatorSubtitle")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="sim-phone">{t("recipientPhoneLabel")}</Label>
          <Input
            id="sim-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("recipientPhonePlaceholder")}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5">
          <div className="space-y-0.5">
            <Label htmlFor="wa-sim-dryrun" className="text-xs font-semibold">
              {t("dryRunToggleLabel")}
            </Label>
            <p className="text-xs text-muted-foreground">{t("dryRunToggleHint")}</p>
          </div>
          <Switch
            id="wa-sim-dryrun"
            checked={dryRun}
            onCheckedChange={setDryRun}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => triggerStep("text", "Bonjour")}
            className="justify-start text-xs min-h-9 press"
          >
            <MessageCircle className="size-3.5 mr-1.5" />
            {t("simBtnBonjour")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => triggerStep("button", "START_ORDER")}
            className="justify-start text-xs min-h-9 press"
          >
            <Play className="size-3.5 mr-1.5" />
            {t("simBtnStartOrder")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => triggerStep("location", "La Botte, Ibanda, Bukavu")}
            className="justify-start text-xs min-h-9 press"
          >
            <MapPin className="size-3.5 mr-1.5" />
            {t("simBtnGpsPin")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => triggerStep("reset")}
            className="justify-start text-xs min-h-9 text-destructive hover:text-destructive press"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            {t("simBtnReset")}
          </Button>
        </div>

        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <Input
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={t("simCustomInputPlaceholder")}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isPending || !customText.trim()}
            className="press"
          >
            {t("simSendText")}
          </Button>
        </form>

        {errorMsg && (
          <div className="rounded-xl border border-destructive/30 bg-destructive-soft px-3.5 py-2.5 text-xs font-medium text-destructive flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {sessionState && (
        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2.5 text-xs animate-enter-fast">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-bold text-heading">
              {t("simSessionStateTitle")}
            </span>
            <StatusBadge tone="info">{sessionState.step}</StatusBadge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-foreground">
            <div>
              <span className="text-muted-foreground block">
                {t("simNeighborhoodLabel")}
              </span>
              <span className="font-semibold">
                {sessionState.neighborhoodName ?? t("simNone")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">
                {t("simHouseLabel")}
              </span>
              <span className="font-semibold">
                {sessionState.houseName ?? t("simNone")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">
                {t("simItemsCountLabel")}
              </span>
              <span className="font-semibold">{sessionState.items.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">
                {t("simLandmarkLabel")}
              </span>
              <span className="font-semibold">
                {sessionState.landmark ?? t("simNone")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
