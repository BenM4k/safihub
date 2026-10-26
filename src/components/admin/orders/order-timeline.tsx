"use client";

import { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("orderId", orderId);
      fd.append("note", note.trim());

      const res = await addOrderTimelineNoteAction(fd);
      if (!res.ok) {
        setError(res.error);
      } else {
        setNote("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("screeningError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-background p-5 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-semibold text-sm text-foreground">
          {t("timelineTitle")} ({events.length})
        </h3>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {events.map((ev) => (
          <div key={ev.id} className="relative group">
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
                  Transition: <span className="font-medium text-muted-foreground">{ev.fromStatus}</span> →{" "}
                  <span className="font-semibold text-foreground">{ev.toStatus}</span>
                </div>
              )}

              {/* On-behalf-of highlighted indicator */}
              {ev.onBehalfOfHouseId && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <span>🏢 {t("auditActionOnBehalf", { house: ev.onBehalfOfHouseName || ev.onBehalfOfHouseId })}</span>
                </div>
              )}

              {ev.actorRole && (
                <div className="text-[11px] text-muted-foreground">
                  Par: <span className="font-medium capitalize text-foreground">{ev.actorRole}</span>
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
            className="text-xs resize-none"
          />
        </Field>
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={loading || !note.trim()}>
            {loading ? t("addingNote") : t("addNoteBtn")}
          </Button>
        </div>
      </form>
    </div>
  );
}
