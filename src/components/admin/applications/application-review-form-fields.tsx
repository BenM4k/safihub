"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
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
      <div className="space-y-1.5">
        <Label htmlFor="assignNeighborhood" className="text-xs font-semibold text-ink-600">
          {t("assignNeighborhood")}
        </Label>
        <select
          id="assignNeighborhood"
          value={selectedNeighborhoodId}
          onChange={(e) => onNeighborhoodChange(e.target.value)}
          disabled={isPending}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs ring-offset-background"
        >
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customPasswordInput" className="text-xs font-semibold text-ink-600">
          {t("optionalCustomPassword")}
        </Label>
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
        <p className="text-2xs text-muted-foreground">{t("passwordHelp")}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="adminNote" className="text-xs font-semibold text-ink-600">
          {t("reviewNotes")}
        </Label>
        <Textarea
          id="adminNote"
          rows={3}
          value={adminNote}
          onChange={(e) => onAdminNoteChange(e.target.value)}
          placeholder={t("notesPlaceholder")}
          disabled={isPending}
          className="text-xs"
        />
      </div>
    </>
  );
}
