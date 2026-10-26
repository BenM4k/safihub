"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldLabel } from "@/components/ui/field";
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
      <Alert variant="destructive">
        <AlertTriangle className="size-4 shrink-0" />
        <AlertTitle>{t("irreversibleTitle")}</AlertTitle>
        <AlertDescription className="text-2xs leading-relaxed">
          {t("irreversibleDesc")}
        </AlertDescription>
      </Alert>

      <label className="flex items-start gap-2.5 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 text-xs font-semibold text-foreground transition-colors">
        <input
          type="checkbox"
          checked={confirmedCheck}
          onChange={(e) => onCheckChange(e.target.checked)}
          className="mt-0.5 rounded-sm size-4 accent-destructive"
        />
        <span>{t("confirmCheckboxLabel")}</span>
      </label>

      <Field>
        <FieldLabel className="text-2xs font-bold text-foreground">
          {t("typeToConfirm", { keyword: confirmKeyword })}
        </FieldLabel>
        <Input
          value={typedConfirm}
          onChange={(e) => onTypedChange(e.target.value.toUpperCase())}
          placeholder={confirmKeyword}
          className="h-10 text-xs font-mono font-bold tracking-widest border border-border"
        />
      </Field>
    </div>
  );
}
