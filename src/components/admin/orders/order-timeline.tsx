"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { addOrderTimelineNoteAction } from "@/actions/admin-order.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/order-formatters";
import type { OrderEventRecord } from "@/dal";

interface OrderTimelineProps {
  orderId: string;
  events: OrderEventRecord[];
}

export function OrderTimeline({ orderId, events }: OrderTimelineProps) {
  const t = useTranslations("admin.orders");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [optimisticEvents, addOptimisticEvent] = useOptimistic(
    events,
    (state: OrderEventRecord[], optimisticNote: OrderEventRecord) => [
      optimisticNote,
      ...state,
    ]
  );

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) return;
    setError(null);
    setNote("");

    startTransition(async () => {
      addOptimisticEvent({
        id: `optimistic-${trimmed.slice(0, 12)}`,
        orderId,
        type: "note",
        fromStatus: null,
        toStatus: null,
        actorId: null,
        actorName: null,
        actorRole: "admin",
        onBehalfOfHouseId: null,
        onBehalfOfHouseName: null,
        approvalMethod: null,
        recordedBy: null,
        note: trimmed,
        payload: null,
        createdAt: new Date(),
      });

      const fd = new FormData();
      fd.append("orderId", orderId);
      fd.append("note", trimmed);

      const res = await addOrderTimelineNoteAction(fd);
      if (!res.ok) {
        setNote(trimmed);
        setError(res.error);
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-background p-5 space-y-6 animate-enter">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-semibold text-sm text-foreground">
          {t("timelineTitle")} ({optimisticEvents.length})
        </h3>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {optimisticEvents.map((ev) => (
          <div key={ev.id} className="relative group animate-enter-fast">
            <div className="absolute -left-6 top-1 size-3.5 rounded-full border-2 border-background bg-primary shadow-xs" />
            <div className="bg-muted/30 rounded-lg p-3 border border-border space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-xs text-foreground uppercase tracking-wide">
                  {ev.type}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {formatDateTime(ev.createdAt)}
                </span>
              </div>

              {ev.fromStatus && ev.toStatus && (
                <div className="text-xs text-foreground">
                  {t("timelineTransition")}:{" "}
                  <span className="font-medium text-muted-foreground">{ev.fromStatus}</span> →{" "}
                  <span className="font-semibold text-foreground">{ev.toStatus}</span>
                </div>
              )}

              {ev.onBehalfOfHouseId && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-warning-soft text-warning border border-warning/20">
                  <span>
                    {t("auditActionOnBehalf", {
                      house: ev.onBehalfOfHouseName || ev.onBehalfOfHouseId,
                    })}
                  </span>
                </div>
              )}

              {ev.actorRole && (
                <div className="text-[11px] text-muted-foreground">
                  {t("timelineActorBy")}:{" "}
                  <span className="font-medium capitalize text-foreground">{ev.actorRole}</span>
                  {ev.actorName && ` (${ev.actorName})`}
                </div>
              )}

              {ev.note && (
                <p className="text-xs text-foreground bg-background p-2 rounded-md border border-border mt-1 whitespace-pre-wrap">
                  {ev.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddNote} className="pt-4 border-t border-border space-y-3">
        <Field>
          <FieldLabel className="text-xs font-medium text-foreground">
            {t("addOperationalNote")}
          </FieldLabel>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("notePlaceholder")}
            rows={2}
            className="text-base sm:text-xs resize-none"
          />
        </Field>
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isPending || !note.trim()} className="min-h-10 press">
            {isPending ? t("addingNote") : t("addNoteBtn")}
          </Button>
        </div>
      </form>
    </div>
  );
}
