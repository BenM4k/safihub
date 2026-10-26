"use client";

import { useTranslations } from "next-intl";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface ManualOrderCustomerFieldsProps {
  source: "whatsapp" | "phone";
  onSourceChange: (source: "whatsapp" | "phone") => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  name: string;
  onNameChange: (name: string) => void;
}

export function ManualOrderCustomerFields({
  source,
  onSourceChange,
  phone,
  onPhoneChange,
  name,
  onNameChange,
}: ManualOrderCustomerFieldsProps) {
  const t = useTranslations("admin.orders.manualForm");

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-foreground">{t("channelAndContact")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field>
          <FieldLabel className="text-xs font-semibold">{t("source")}</FieldLabel>
          <select
            value={source}
            onChange={(e) => onSourceChange(e.target.value as "whatsapp" | "phone")}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          >
            <option value="whatsapp">{t("sourceWhatsapp")}</option>
            <option value="phone">{t("sourcePhone")}</option>
          </select>
        </Field>

        <Field>
          <FieldLabel className="text-xs font-semibold">
            {t("phone")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            required
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+243..."
            className="h-9 text-xs"
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs font-semibold">{t("customerName")}</FieldLabel>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t("customerNamePlaceholder")}
            className="h-9 text-xs"
          />
        </Field>
      </div>
    </div>
  );
}
