"use client";

import { useTranslations } from "next-intl";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ApplicationReviewFormFieldsProps {
  neighborhoods: { id: string; name: string }[];
  selectedNeighborhoodId: string;
  onNeighborhoodChange: (value: string) => void;
  customPassword: string;
  onCustomPasswordChange: (value: string) => void;
  adminNote: string;
  onAdminNoteChange: (value: string) => void;
  isPending: boolean;
}

export function ApplicationReviewFormFields({
  neighborhoods,
  selectedNeighborhoodId,
  onNeighborhoodChange,
  customPassword,
  onCustomPasswordChange,
  adminNote,
  onAdminNoteChange,
  isPending,
}: ApplicationReviewFormFieldsProps) {
  const t = useTranslations("admin.applications");

  return (
    <>
      <Field className="space-y-1.5">
        <FieldLabel htmlFor="assignNeighborhood" className="text-xs font-semibold text-foreground">
          {t("assignNeighborhood")}
        </FieldLabel>
        <select
          id="assignNeighborhood"
          value={selectedNeighborhoodId}
          onChange={(e) => onNeighborhoodChange(e.target.value)}
          disabled={isPending}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground ring-offset-background"
        >
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </Field>

      <Field className="space-y-1.5">
        <FieldLabel htmlFor="customPasswordInput" className="text-xs font-semibold text-foreground">
          {t("optionalCustomPassword")}
        </FieldLabel>
        <Input
          id="customPasswordInput"
          type="text"
          minLength={8}
          value={customPassword}
          onChange={(e) => onCustomPasswordChange(e.target.value)}
          placeholder={t("passwordHelp")}
          disabled={isPending}
          className="h-9 text-xs font-mono"
        />
        <p className="text-[11px] text-muted-foreground">{t("passwordHelp")}</p>
      </Field>

      <Field className="space-y-1.5">
        <FieldLabel htmlFor="adminNote" className="text-xs font-semibold text-foreground">
          {t("reviewNotes")}
        </FieldLabel>
        <Textarea
          id="adminNote"
          rows={3}
          value={adminNote}
          onChange={(e) => onAdminNoteChange(e.target.value)}
          placeholder={t("notesPlaceholder")}
          disabled={isPending}
          className="text-xs"
        />
      </Field>
    </>
  );
}
