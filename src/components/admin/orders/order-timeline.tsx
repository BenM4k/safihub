"use client";

import { useState } from "react";
import { addOrderTimelineNoteAction } from "@/actions/admin-order.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { OrderEventRecord } from "@/dal";

interface OrderTimelineProps {
  orderId: string;
  events: OrderEventRecord[];
}

export function OrderTimeline({ orderId, events }: OrderTimelineProps) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;

    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("orderId", orderId);
    fd.append("note", note.trim());

    const res = await addOrderTimelineNoteAction(fd);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
    } else {
      setNote("");
    }
  }

  return (
    <div className="rounded-xl border border-[#EAECF0] bg-white p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
        <h3 className="font-semibold text-[#101828]">Historique des événements ({events.length})</h3>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAECF0]">
        {events.map((ev) => (
          <div key={ev.id} className="relative group">
            <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#2824D5] shadow-xs" />
            <div className="bg-[#F8F9FA] rounded-lg p-3 border border-[#EAECF0] space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-xs text-[#101828] uppercase tracking-wide">
                  {ev.type}
                </span>
                <span className="text-[11px] text-[#667085]">
                  {new Date(ev.createdAt).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              {ev.fromStatus && ev.toStatus && (
                <div className="text-xs text-[#344054]">
                  Transition: <span className="font-medium text-[#667085]">{ev.fromStatus}</span> →{" "}
                  <span className="font-semibold text-[#101828]">{ev.toStatus}</span>
                </div>
              )}

              {/* On-behalf-of highlighted indicator */}
              {ev.onBehalfOfHouseId && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-[#FEF0C7] text-[#B54708] border border-[#FEE4E2]">
                  <span>🏢 Action au nom du pressing (on_behalf_of):</span>
                  <span className="font-semibold">{ev.onBehalfOfHouseName || ev.onBehalfOfHouseId}</span>
                </div>
              )}

              {ev.actorRole && (
                <div className="text-[11px] text-[#667085]">
                  Par: <span className="font-medium capitalize">{ev.actorRole}</span>
                  {ev.actorName && ` (${ev.actorName})`}
                </div>
              )}

              {ev.note && (
                <p className="text-xs text-[#344054] bg-white p-2 rounded border border-[#EAECF0] mt-1 whitespace-pre-wrap">
                  {ev.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddNote} className="pt-4 border-t border-[#EAECF0] space-y-3">
        <label className="block text-xs font-medium text-[#344054]">Ajouter une note opérationnelle</label>
        <Textarea
          value={note}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
          placeholder="Ex: Confirmation reçue par appel direct à 14h30..."
          rows={2}
          className="text-xs"
        />
        {error && <p className="text-xs text-[#D92D20]">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={loading || !note.trim()}>
            {loading ? "Enregistrement..." : "Ajouter la note"}
          </Button>
        </div>
      </form>
    </div>
  );
}
