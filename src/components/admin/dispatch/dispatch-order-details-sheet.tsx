"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Phone,
  PhoneCall,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCDF, formatOrderRef } from "@/lib/dispatch-urgency";
import type { EnrichedDispatchOrder } from "@/lib/dispatch-grouping";

interface DispatchOrderDetailsSheetProps {
  order: EnrichedDispatchOrder | null;
  onClose: () => void;
  onOpenOutcomeModal: (order: EnrichedDispatchOrder, channel: "call" | "whatsapp") => void;
  onOpenReassignDialog: (order: EnrichedDispatchOrder) => void;
}

export function DispatchOrderDetailsSheet({
  order,
  onClose,
  onOpenOutcomeModal,
  onOpenReassignDialog,
}: DispatchOrderDetailsSheetProps) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const phone = order.housePhone || "";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    `Bonjour ${order.houseName || "Pressing"}, vous avez une nouvelle commande SafiHub #${order.code} en attente d'acceptation. Merci de confirmer rapidement votre disponibilité.`
  );

  function copyId() {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-details-title"
      className="fixed inset-0 z-50 flex justify-end bg-ink-950/40 backdrop-blur-xs animate-in fade-in font-sans"
    >
      <div className="w-full max-w-lg bg-card h-full shadow-2xl flex flex-col border-l border-border overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-heading">
                {formatOrderRef(order.code, order.id)}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground capitalize">
                Canal: {order.source}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Détails opérationnels et suivi de la relance</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-ink-400 hover:text-heading hover:bg-muted transition-colors cursor-pointer"
            aria-label="Fermer le panneau"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* UUID with copy */}
          <div className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Identifiant complet</p>
              <p className="font-mono text-xs text-heading select-all">{order.id}</p>
            </div>
            <button
              type="button"
              onClick={copyId}
              className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
              aria-label="Copier l'identifiant"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-ink-400" />}
            </button>
          </div>

          {/* Urgency and Time */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Attente pressing</span>
              <span className="text-xs font-bold text-heading flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-ink-400" />
                {order.urgency.formattedElapsed}
              </span>
            </div>
            <div className="text-xs flex items-center justify-between text-muted-foreground">
              <span>Statut d&apos;urgence:</span>
              <span className="font-semibold text-heading">{order.urgency.label}</span>
            </div>
            {order.acceptanceDeadlineAt && (
              <div className="text-xs flex items-center justify-between text-destructive">
                <span>Échéance SLA (45 min):</span>
                <span className="font-semibold font-mono">
                  {new Date(order.acceptanceDeadlineAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
          </div>

          {/* Pressing Details */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pressing partenaire</p>
            <p className="text-sm font-bold text-heading font-display">{order.houseName || "Non assigné"}</p>
            {phone ? (
              <p className="text-xs text-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-ink-400" />
                {phone}
              </p>
            ) : (
              <p className="text-xs text-warning italic">Téléphone non renseigné</p>
            )}
          </div>

          {/* Customer & Location (Only if present!) */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Client & Localisation</p>
            {order.customerName && (
              <p className="text-sm font-medium text-heading flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-ink-400" />
                {order.customerName}
              </p>
            )}
            {order.neighborhoodName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-ink-400" />
                {order.neighborhoodName}
              </p>
            )}
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Montant total :</span>
              <span className="font-bold text-heading font-mono">{formatCDF(order.totalDue)}</span>
            </div>
          </div>

          {/* Follow-up / Relance History */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Historique des relances ({order.relances.length})
              </p>
              {order.isRecentlyRelanced && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-warning-soft text-warning font-medium border border-warning/30">
                  Déjà relancé il y a {order.recentRelanceMinutes} min
                </span>
              )}
            </div>

            {order.relances.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Aucune relance effectuée pour le moment.</p>
            ) : (
              <div className="space-y-2">
                {order.relances.map((rel) => (
                  <div key={rel.id} className="p-2.5 rounded-lg bg-surface border border-border text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-heading">
                        {rel.channel === "call" ? "📞 Appel" : "💬 WhatsApp"} par {rel.operatorName || "Opérateur"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(rel.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {rel.outcome && (
                      <p className="text-[11px] text-muted-foreground">
                        Résultat : <strong className="text-heading">{rel.outcome}</strong>
                      </p>
                    )}
                    {rel.note && <p className="text-[11px] text-muted-foreground italic">{rel.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-surface flex flex-wrap items-center gap-2">
          {cleanPhone && (
            <>
              <a
                href={`tel:${phone}`}
                onClick={() => onOpenOutcomeModal(order, "call")}
                className="flex-1"
              >
                <Button size="sm" className="w-full text-xs min-h-[40px] bg-primary hover:bg-primary-hover text-primary-foreground font-display">
                  <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
                  Appeler
                </Button>
              </a>
              <a
                href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => onOpenOutcomeModal(order, "whatsapp")}
                className="flex-1"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs min-h-[40px] border-success/40 text-success hover:bg-success-soft font-display"
                >
                  WhatsApp
                </Button>
              </a>
            </>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenReassignDialog(order)}
            className="text-xs min-h-[40px] text-warning border-warning/30 hover:bg-warning-soft font-display"
          >
            Réassigner
          </Button>

          <Link href={`/admin/orders/${order.id}`} className="shrink-0">
            <Button size="sm" variant="ghost" className="text-xs min-h-[40px] text-muted-foreground hover:text-heading">
              <ExternalLink className="w-4 h-4 mr-1" />
              Page complète
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
