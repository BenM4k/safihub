"use client";

// Admin review controls for orders in `awaiting_confirmation` (first-order screening).
// Decomposition: ScreeningConfirmForm + ScreeningRejectForm, each driven by useActionState.

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { confirmFirstOrderAction, rejectFirstOrderAction } from "@/actions/admin-order.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormState = { error: string | null };
const initialState: FormState = { error: null };

interface ScreeningProps {
  orderId: string;
}

export function FirstOrderScreeningActions({ orderId }: ScreeningProps) {
  const t = useTranslations("admin.orders");

  return (
    <div className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-4">
      <div>
        <h2 className="text-sm font-bold text-heading">{t("screeningTitle")}</h2>
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
    <form action={formAction} className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-3">
      <div className="space-y-1">
        <Label htmlFor="screening-note" className="text-xs">{t("screeningNote")}</Label>
        <Input id="screening-note" name="note" className="h-8 text-xs bg-white" />
      </div>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
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
    <form action={formAction} className="p-4 bg-red-50/50 rounded-lg border border-red-200 space-y-3">
      <div className="space-y-1">
        <Label htmlFor="screening-reason" className="text-xs">{t("screeningRejectReason")}</Label>
        <Input id="screening-reason" name="reason" required className="h-8 text-xs bg-white" />
      </div>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
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
