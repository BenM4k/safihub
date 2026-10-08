"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { markOrderReadyAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";

export function MarkReadyButton({
  orderId,
  houseId,
}: {
  orderId: string;
  houseId?: string;
}) {
  const t = useTranslations("house.reception");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleMarkReady() {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await markOrderReadyAction({ orderId, houseId });
      if (!res.ok) {
        setErrorMsg(res.error);
      }
    });
  }

  return (
    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Linge nettoyé et repassé ?</span>
          </h3>
          <p className="text-xs text-emerald-800">
            {t("markReadyDesc")}
          </p>
        </div>

        <Button
          onClick={handleMarkReady}
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs px-4 py-2 shrink-0"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin mr-1.5" />
          ) : (
            <CheckCircle2 className="size-3.5 mr-1.5" />
          )}
          <span>{t("readyButton")}</span>
        </Button>
      </div>

      {errorMsg && (
        <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
      )}
    </div>
  );
}
