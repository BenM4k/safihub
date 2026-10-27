"use client";

import { useId, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { requestCoverageExtensionAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DISTANCE_LEVEL_DEFINITIONS } from "./types";

interface CoverageExtensionFormProps {
  effectiveMaxDistance: number;
  houseId?: string;
  onSuccess: (ticketRef: string) => void;
  onCancel: () => void;
}

export function CoverageExtensionForm({
  effectiveMaxDistance,
  houseId,
  onSuccess,
  onCancel,
}: CoverageExtensionFormProps) {
  const t = useTranslations("house.coverage");
  const formId = useId();

  const minTargetLevel = Math.min(3, effectiveMaxDistance + 1);
  const [targetLevel, setTargetLevel] = useState(minTargetLevel);
  const [category, setCategory] = useState("Demande client");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const eligibleTargetLevels = [1, 2, 3].filter((lvl) => lvl > effectiveMaxDistance);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() || note.trim().length < 5) {
      setErrorMsg(t("reasonNoteLabel"));
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await requestCoverageExtensionAction({
        houseId,
        targetDistanceLevel: targetLevel,
        reasonCategory: category,
        note: note.trim(),
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        onSuccess(res.value.ticketReference);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
      {errorMsg && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Target Level Choice */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-heading">{t("targetLevelLabel")}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {eligibleTargetLevels.map((lvl) => {
            const def = DISTANCE_LEVEL_DEFINITIONS[lvl];
            const isSelected = targetLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setTargetLevel(lvl)}
                className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                  isSelected
                    ? "bg-primary-soft/60 border-primary text-primary font-bold shadow-2xs"
                    : "bg-surface border-border text-foreground hover:bg-muted"
                }`}
              >
                <div className="font-extrabold">Niveau {lvl} : {def?.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {def?.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Dropdown with shadcn Select */}
      <div className="space-y-1.5">
        <label htmlFor={`${formId}-cat`} className="text-xs font-bold text-heading">
          {t("reasonCategoryLabel")}
        </label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id={`${formId}-cat`} className="h-10 text-base sm:text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Demande client" className="text-xs">{t("catCustomerDemand")}</SelectItem>
            <SelectItem value="Capacité logistique" className="text-xs">{t("catCapacity")}</SelectItem>
            <SelectItem value="Partenariat local" className="text-xs">{t("catPartnership")}</SelectItem>
            <SelectItem value="Autre motif" className="text-xs">{t("catOther")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Motivation Textarea with shadcn Textarea */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor={`${formId}-note`} className="font-bold text-heading">
            {t("reasonNoteLabel")}
          </label>
          <span
            className={`text-[10px] ${
              note.length < 5 ? "text-muted-foreground" : "text-success font-semibold"
            }`}
          >
            {t("charactersCount", { count: note.length })}
          </span>
        </div>
        <Textarea
          id={`${formId}-note`}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("reasonNotePlaceholder")}
          className="text-base sm:text-xs resize-none"
        />
      </div>

      {/* Internal Processing Notice */}
      <div className="p-3 bg-muted/40 rounded-xl border border-border text-[11px] text-muted-foreground leading-snug">
        {t("ticketNotice")}
      </div>

      {/* Footer Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onCancel}
          className="flex-1 sm:flex-initial h-10 sm:h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer"
        >
          {t("cancelChanges")}
        </Button>
        <Button
          type="submit"
          disabled={isPending || note.trim().length < 5}
          className="flex-1 sm:flex-initial h-10 sm:h-9 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t("submittingTicket")}</span>
            </>
          ) : (
            <>
              <Send className="size-3.5" />
              <span>{t("submitTicket")}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
