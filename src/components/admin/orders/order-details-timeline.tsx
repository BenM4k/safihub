"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderEventRecord } from "@/dal";
import { addOrderTimelineNoteAction } from "@/actions/admin-order.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/order-formatters";

interface OrderDetailsTimelineProps {
  orderId: string;
  events: OrderEventRecord[];
  isLoading: boolean;
  onEventAdded: () => void;
}

export function OrderDetailsTimeline({
  orderId,
  events,
  isLoading,
  onEventAdded,
}: OrderDetailsTimelineProps) {
  const t = useTranslations("admin.orders");
  const [noteText, setNoteText] = useState("");
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
    const trimmed = noteText.trim();
    if (!trimmed) return;
    setError(null);
    setNoteText("");

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
      if (res.ok) {
        onEventAdded();
      } else {
        setNoteText(trimmed);
        setError(res.error || t("screeningError"));
      }
    });
  }

  return (
    <div className="space-y-3 pt-2">
      <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
        {t("timelineTitle")} ({optimisticEvents.length})
      </h3>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
          {t("loadingAudit")}
        </div>
      ) : optimisticEvents.length === 0 ? (
        <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border border-border">
          {t("noAuditEvents")}
        </p>
      ) : (
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {optimisticEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-2.5 rounded-lg bg-muted/20 border border-border text-xs space-y-1 animate-enter-fast"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-foreground uppercase tracking-wide">
                  {ev.type}
                </span>
                <span className="text-muted-foreground font-mono">
                  {formatDateTime(ev.createdAt)}
                </span>
              </div>

              {ev.fromStatus && ev.toStatus && (
                <p className="text-foreground">
                  <span className="text-muted-foreground">{ev.fromStatus}</span> →{" "}
                  <span className="font-semibold text-foreground">{ev.toStatus}</span>
                </p>
              )}

              {ev.onBehalfOfHouseId && (
                <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-warning-soft text-warning border border-warning/20">
                  {t("auditActionOnBehalf", { house: ev.onBehalfOfHouseName || t("house") })}
                </span>
              )}

              {ev.note && (
                <p className="text-foreground bg-background p-1.5 rounded-md border border-border text-[11px] whitespace-pre-wrap">
                  {ev.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAddNote} className="space-y-2 pt-2">
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
        <Textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={t("notePlaceholder")}
          rows={2}
          className="text-base sm:text-xs resize-none"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !noteText.trim()}
          className="min-h-10 text-xs font-semibold gap-1.5 press"
        >
          <Send className="size-3" />
          <span>{isPending ? t("addingNote") : t("saveNote")}</span>
        </Button>
      </form>
    </div>
  );
}
