"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MergeStepConfirmProps {
  confirmedCheck: boolean;
  typedConfirm: string;
  onCheckChange: (checked: boolean) => void;
  onTypedChange: (text: string) => void;
}

export function MergeStepConfirm({
  confirmedCheck,
  typedConfirm,
  onCheckChange,
  onTypedChange,
}: MergeStepConfirmProps) {
  const t = useTranslations("admin.customers.mergeDialog");
  const confirmKeyword = t("confirmKeyword");

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-destructive-light border-2 border-destructive-base/40 text-xs space-y-2 text-destructive font-medium">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{t("irreversibleTitle")}</span>
        </div>
        <p className="text-2xs leading-relaxed text-ink-700">
          {t("irreversibleDesc")}
        </p>
      </div>

      <label className="flex items-start gap-2.5 p-3 rounded-lg border-2 border-border-strong cursor-pointer hover:bg-surface text-xs font-semibold text-heading">
        <input
          type="checkbox"
          checked={confirmedCheck}
          onChange={(e) => onCheckChange(e.target.checked)}
          className="mt-0.5 rounded-sm size-4 text-destructive border-border-strong focus:ring-destructive"
        />
        <span>{t("confirmCheckboxLabel")}</span>
      </label>

      <div className="space-y-1.5">
        <label className="text-2xs font-bold text-ink-700">
          {t("typeToConfirm", { keyword: confirmKeyword })}
        </label>
        <Input
          value={typedConfirm}
          onChange={(e) => onTypedChange(e.target.value.toUpperCase())}
          placeholder={confirmKeyword}
          className="h-10 text-xs font-mono font-bold tracking-widest border-2 border-border-strong"
        />
      </div>
    </div>
  );
}
