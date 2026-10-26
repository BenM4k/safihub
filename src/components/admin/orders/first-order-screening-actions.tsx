"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { confirmFirstOrderAction, rejectFirstOrderAction } from "@/actions/admin-order.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type FormState = { error: string | null };
const initialState: FormState = { error: null };

interface ScreeningProps {
  orderId: string;
}

export function FirstOrderScreeningActions({ orderId }: ScreeningProps) {
  const t = useTranslations("admin.orders");

  return (
    <div className="p-5 bg-background rounded-lg border border-border space-y-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">{t("screeningTitle")}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{t("screeningDescription")}</p>
      </div>
      <ScreeningConfirmForm orderId={orderId} />
      <ScreeningRejectForm orderId={orderId} />
    </div>
  );
}

function ScreeningConfirmForm({ orderId }: ScreeningProps) {
  const t = useTranslations("admin.orders");
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      try {
        const note = String(formData.get("note") ?? "").trim();
        const res = await confirmFirstOrderAction(orderId, note || undefined);
        return { error: res.ok ? null : res.error };
      } catch {
        return { error: t("screeningError") };
      }
    },
    initialState
  );

  return (
    <form action={formAction} className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20 space-y-3">
      <Field>
        <FieldLabel htmlFor="screening-note" className="text-xs font-semibold">{t("screeningNote")}</FieldLabel>
        <Input id="screening-note" name="note" className="h-8 text-xs" />
      </Field>
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="flex justify-end">
        <Button
          id="screening-confirm-btn"
          type="submit"
          disabled={pending}
          size="sm"
          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {pending ? "..." : t("screeningConfirm")}
        </Button>
      </div>
    </form>
  );
}

function ScreeningRejectForm({ orderId }: ScreeningProps) {
  const t = useTranslations("admin.orders");
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const reason = String(formData.get("reason") ?? "").trim();
      if (!reason) return { error: t("screeningReasonRequired") };
      try {
        const res = await rejectFirstOrderAction(orderId, reason);
        return { error: res.ok ? null : res.error };
      } catch {
        return { error: t("screeningError") };
      }
    },
    initialState
  );

  return (
    <form action={formAction} className="p-4 bg-destructive/5 rounded-lg border border-destructive/20 space-y-3">
      <Field>
        <FieldLabel htmlFor="screening-reason" className="text-xs font-semibold">{t("screeningRejectReason")}</FieldLabel>
        <Input id="screening-reason" name="reason" required className="h-8 text-xs" />
      </Field>
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="flex justify-end">
        <Button
          id="screening-reject-btn"
          type="submit"
          variant="destructive"
          disabled={pending}
          size="sm"
          className="h-8 text-xs"
        >
          {pending ? "..." : t("screeningReject")}
        </Button>
      </div>
    </form>
  );
}
