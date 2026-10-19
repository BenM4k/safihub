"use client";

import { useState, useTransition } from "react";
import { PlusCircle, Trash2, Calendar, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { addHouseClosureAction, deleteHouseClosureAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";
import type { HouseClosureRecord } from "@/dal";

export function ClosuresManager({
  closures,
  houseId,
}: {
  closures: HouseClosureRecord[];
  houseId?: string;
}) {
  const t = useTranslations("house.hours");
  const [isPending, startTransition] = useTransition();

  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!startsOn || !endsOn) {
      setErrorMsg("Les dates de début et de fin sont obligatoires");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await addHouseClosureAction({
        startsOn,
        endsOn,
        reason: reason.trim() || undefined,
        houseId,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setStartsOn("");
        setEndsOn("");
        setReason("");
      }
    });
  }

  function handleDelete(closureId: string) {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await deleteHouseClosureAction({ closureId, houseId });
      if (!res.ok) {
        setErrorMsg(res.error);
      }
    });
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-5">
      <div className="border-b border-border pb-3">
        <h2 className="text-base font-bold text-heading">{t("closuresTitle")}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Périodes pendant lesquelles le pressing est fermé (jours fériés, inventaires).
        </p>
      </div>

      {/* Add Closure Form */}
      <form onSubmit={handleAdd} className="bg-surface p-4 rounded-xl space-y-3 text-xs border border-border">
        <span className="font-bold text-heading block text-xs">{t("addClosure")}</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="text-[11px] font-semibold text-foreground block mb-1">
              {t("startsOn")}
            </label>
            <input
              type="date"
              required
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
              className="w-full h-8 px-2 rounded-lg border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-foreground block mb-1">
              {t("endsOn")}
            </label>
            <input
              type="date"
              required
              value={endsOn}
              onChange={(e) => setEndsOn(e.target.value)}
              className="w-full h-8 px-2 rounded-lg border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-foreground block mb-1">
              {t("reason")}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex. Férié, Travaux..."
              className="w-full h-8 px-2 rounded-lg border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {errorMsg && <p className="text-xs text-destructive font-semibold">{errorMsg}</p>}

        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs"
        >
          {isPending ? <Loader2 className="size-3 animate-spin mr-1" /> : <PlusCircle className="size-3 mr-1" />}
          <span>{t("addClosure")}</span>
        </Button>
      </form>

      {/* Closures list */}
      <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
        {closures.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            {t("noClosures")}
          </div>
        ) : (
          closures.map((c) => (
            <div key={c.id} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-surface">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-heading">
                    Du {c.startsOn} au {c.endsOn}
                  </span>
                  {c.reason && <p className="text-[11px] text-muted-foreground">{c.reason}</p>}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(c.id)}
                disabled={isPending}
                className="text-destructive hover:text-destructive hover:bg-destructive-soft h-7 px-2"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
