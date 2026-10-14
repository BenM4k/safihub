"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderEventRecord } from "@/dal";
import { addOrderTimelineNoteAction } from "@/actions/admin-order.actions";
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

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("orderId", orderId);
    fd.append("note", noteText.trim());

    const res = await addOrderTimelineNoteAction(fd);
    setIsSubmitting(false);
    if (res.ok) {
      setNoteText("");
      onEventAdded();
    }
  }

  return (
    <div className="space-y-3 pt-2">
      <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
        {t("timelineTitle")} ({events.length})
      </h3>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
          Chargement de l&apos;historique d&apos;audit...
        </div>
      ) : events.length === 0 ? (
        <p className="text-xs text-muted-foreground italic bg-surface p-3 rounded-lg border border-border">
          Aucun événement d&apos;audit enregistré.
        </p>
      ) : (
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-2.5 rounded-lg bg-surface border border-border-strong shadow-2xs text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-heading uppercase tracking-wide">
                  {ev.type}
                </span>
                <span className="text-muted-foreground">
                  {formatDateTime(ev.createdAt)}
                </span>
              </div>

              {ev.fromStatus && ev.toStatus && (
                <p className="text-foreground">
                  <span className="text-muted-foreground">{ev.fromStatus}</span> →{" "}
                  <span className="font-semibold text-heading">{ev.toStatus}</span>
                </p>
              )}

              {ev.onBehalfOfHouseId && (
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-warning-light text-warning-base border border-warning-base/20">
                  Action au nom du pressing ({ev.onBehalfOfHouseName || "Pressing"})
                </span>
              )}

              {ev.note && (
                <p className="text-ink-700 bg-card p-1.5 rounded border border-border-strong shadow-2xs text-[11px] whitespace-pre-wrap">
                  {ev.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Note form */}
      <form onSubmit={handleAddNote} className="space-y-2 pt-2">
        <Textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Ajouter une note opérationnelle..."
          rows={2}
          className="text-xs resize-none bg-card border-border-strong shadow-xs"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !noteText.trim()}
          className="h-7 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs hover:shadow-sm gap-1 cursor-pointer"
        >
          <Send className="w-3 h-3" />
          <span>Enregistrer la note</span>
        </Button>
      </form>
    </div>
  );
}
