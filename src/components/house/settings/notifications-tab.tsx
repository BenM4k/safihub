"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { MatrixTable, type NotificationMatrixRow } from "./notifications/matrix-table";
import { QuietHoursCard } from "./notifications/quiet-hours-card";

export type { NotificationMatrixRow };

const INITIAL_ROWS: NotificationMatrixRow[] = [
  {
    eventKey: "new_order",
    label: "Nouvelle commande reçue",
    appSound: true,
    push: true,
    sms: false,
    whatsapp: false,
    email: false,
  },
  {
    eventKey: "expiring_order",
    label: "Commande bientôt expirée (< 10 min)",
    appSound: true,
    push: true,
    sms: false,
    whatsapp: false,
    email: false,
  },
  {
    eventKey: "order_expired",
    label: "Commande expirée / rejetée",
    appSound: false,
    push: true,
    sms: false,
    whatsapp: false,
    email: false,
  },
  {
    eventKey: "settlement_paid",
    label: "Versement de fonds effectué",
    appSound: false,
    push: true,
    sms: false,
    whatsapp: false,
    email: true,
  },
  {
    eventKey: "support_message",
    label: "Message de l'assistance SafiHub",
    appSound: true,
    push: true,
    sms: false,
    whatsapp: false,
    email: true,
  },
];

export function toggleNotificationRow(
  prev: NotificationMatrixRow[],
  rowIndex: number,
  channel: "appSound" | "push"
): NotificationMatrixRow[] {
  const next = [...prev];
  const row = { ...next[rowIndex] };

  // Rule: For new_order, at least one channel must stay true
  if (row.eventKey === "new_order") {
    const otherChannel = channel === "appSound" ? row.push : row.appSound;
    if (!otherChannel && row[channel]) {
      return prev; // Prevent disabling both
    }
  }

  row[channel] = !row[channel];
  next[rowIndex] = row;
  return next;
}

export function NotificationsTab() {
  const [rows, setRows] = useState<NotificationMatrixRow[]>(INITIAL_ROWS);
  const [testNotice, setTestNotice] = useState<string | null>(null);

  function toggleChannel(rowIndex: number, channel: "appSound" | "push") {
    setRows((prev) => toggleNotificationRow(prev, rowIndex, channel));
  }

  function handleTestSound() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
      setTestNotice("Son de notification émis avec succès.");
      setTimeout(() => setTestNotice(null), 2500);
    } catch {
      setTestNotice("Notification sonore testée (haut-parleur système).");
      setTimeout(() => setTestNotice(null), 2500);
    }
  }

  return (
    <div className="space-y-6">
      {testNotice && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <AlertDescription className="text-xs font-semibold">{testNotice}</AlertDescription>
        </Alert>
      )}

      {/* Header and Test action */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bell className="size-4 text-primary" />
              <span>Matrice des notifications d&apos;urgence</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choisissez les alertes sonores et push activées pour chaque événement critique.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestSound}
            className="min-h-[40px] font-semibold text-xs gap-1.5"
          >
            <Volume2 className="size-3.5 text-primary" />
            <span>Tester la notification sonore</span>
          </Button>
        </div>

        {/* Matrix Table */}
        <MatrixTable rows={rows} onToggleChannel={toggleChannel} />

        <p className="text-[11px] text-muted-foreground">
          Règle : Au moins un canal reste obligatoirement actif pour la notification de <em>Nouvelle commande reçue</em> afin de garantir la réactivité opérationnelle du pressing.
        </p>
      </section>

      <Separator />

      {/* Quiet hours & Proposals */}
      <QuietHoursCard />
    </div>
  );
}
