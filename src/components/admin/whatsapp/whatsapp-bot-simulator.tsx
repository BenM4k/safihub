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
import { StatusBadge } from "@/components/admin/shared/status-badge";
import type { WhatsAppBotSession } from "@/services/whatsapp";

export function WhatsAppBotSimulator() {
  const t = useTranslations("admin.whatsapp");
  const [isPending, startTransition] = useTransition();

  const [phone, setPhone] = useState("+243991234567");
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
      });
      if (!res.ok) {
        setErrorMsg(res.error);
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
    <div className="rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-3 border-b border-[#EAECF0] pb-4">
        <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Bot className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#101828]">
            {t("simulatorTitle")}
          </h2>
          <p className="text-xs text-[#667085]">{t("simulatorSubtitle")}</p>
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

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => triggerStep("text", "Bonjour")}
            className="justify-start text-xs"
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
            className="justify-start text-xs"
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
            className="justify-start text-xs"
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
            className="justify-start text-xs text-destructive hover:text-destructive"
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
          <Button type="submit" disabled={isPending || !customText.trim()}>
            {t("simSendText")}
          </Button>
        </form>

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {sessionState && (
        <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-[#EAECF0] pb-2">
            <span className="font-bold text-[#101828]">
              {t("simSessionStateTitle")}
            </span>
            <StatusBadge tone="info">{sessionState.step}</StatusBadge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[#344054]">
            <div>
              <span className="text-[#667085] block">{t("simNeighborhoodLabel")}</span>
              <span className="font-semibold">
                {sessionState.neighborhoodName ?? t("simNone")}
              </span>
            </div>
            <div>
              <span className="text-[#667085] block">{t("simHouseLabel")}</span>
              <span className="font-semibold">
                {sessionState.houseName ?? t("simNone")}
              </span>
            </div>
            <div>
              <span className="text-[#667085] block">{t("simItemsCountLabel")}</span>
              <span className="font-semibold">{sessionState.items.length}</span>
            </div>
            <div>
              <span className="text-[#667085] block">{t("simLandmarkLabel")}</span>
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

