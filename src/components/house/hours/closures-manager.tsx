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
    startTransition(async () => {
      await deleteHouseClosureAction({ closureId, houseId });
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">{t("closuresTitle")}</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Périodes pendant lesquelles le pressing est fermé (jours fériés, inventaires).
        </p>
      </div>

      {/* Add Closure Form */}
      <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-xl space-y-3 text-xs border border-slate-200">
        <span className="font-bold text-slate-800 block text-xs">{t("addClosure")}</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              {t("startsOn")}
            </label>
            <input
              type="date"
              required
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
              className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              {t("endsOn")}
            </label>
            <input
              type="date"
              required
              value={endsOn}
              onChange={(e) => setEndsOn(e.target.value)}
              className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              {t("reason")}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex. Férié, Travaux..."
              className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
            />
          </div>
        </div>

        {errorMsg && <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>}

        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs"
        >
          {isPending ? <Loader2 className="size-3 animate-spin mr-1" /> : <PlusCircle className="size-3 mr-1" />}
          <span>{t("addClosure")}</span>
        </Button>
      </form>

      {/* Closures list */}
      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
        {closures.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            {t("noClosures")}
          </div>
        ) : (
          closures.map((c) => (
            <div key={c.id} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-violet-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">
                    Du {c.startsOn} au {c.endsOn}
                  </span>
                  {c.reason && <p className="text-[11px] text-slate-500">{c.reason}</p>}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(c.id)}
                disabled={isPending}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 px-2"
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
