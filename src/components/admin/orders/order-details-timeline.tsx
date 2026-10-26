"use client";

import { useState } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("orderId", orderId);
      fd.append("note", noteText.trim());

      const res = await addOrderTimelineNoteAction(fd);
      if (res.ok) {
        setNoteText("");
        onEventAdded();
      } else {
        setError(res.error || t("screeningError"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("screeningError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 pt-2">
      <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
        {t("timelineTitle")} ({events.length})
      </h3>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
          {t("loadingAudit")}
        </div>
      ) : events.length === 0 ? (
        <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border border-border">
          {t("noAuditEvents")}
        </p>
      ) : (
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-2.5 rounded-lg bg-muted/20 border border-border text-xs space-y-1"
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
                <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  {t("auditActionOnBehalf", { house: ev.onBehalfOfHouseName || "Pressing" })}
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

      {/* Note form */}
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
          className="text-xs resize-none"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !noteText.trim()}
          className="h-8 text-xs font-semibold gap-1.5"
        >
          <Send className="size-3" />
          <span>{isSubmitting ? t("addingNote") : t("saveNote")}</span>
        </Button>
      </form>
    </div>
  );
}
