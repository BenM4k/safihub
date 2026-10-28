"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Ban,
  Sparkles,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequestChangesDialog } from "./request-changes-dialog";
import { adminReviewHouseAction } from "@/actions/partner-review.actions";
import type { AdminPendingReviewRow } from "@/dal/house-review.dal";

interface AdminReviewQueueProps {
  pendingReviews: AdminPendingReviewRow[];
}

export function AdminReviewQueue({ pendingReviews }: AdminReviewQueueProps) {
  const router = useRouter();
  const [selectedHouseForChanges, setSelectedHouseForChanges] =
    useState<AdminPendingReviewRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApprove(house: AdminPendingReviewRow) {
    if (
      !confirm(
        `Confirmer la validation et mise en ligne du pressing "${house.name}" ? Il sera immédiatement visible par les clients.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await adminReviewHouseAction({
        houseId: house.houseId,
        action: "approve",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  }

  function handleSuspend(house: AdminPendingReviewRow) {
    if (
      !confirm(
        `Suspendre le pressing "${house.name}" ? Il ne pourra plus recevoir de commandes.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await adminReviewHouseAction({
        houseId: house.houseId,
        action: "suspend",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  }

  if (pendingReviews.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl border border-dashed border-border bg-card space-y-3 font-sans">
        <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="size-6" />
        </div>
        <h3 className="text-sm font-bold text-heading">Aucun pressing en attente de validation</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Tous les dossiers partenaires soumis ont été traités. Les nouveaux dossiers apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-heading flex items-center gap-2">
          <span>Dossiers à valider</span>
          <Badge variant="secondary" className="text-xs font-bold bg-amber-500/10 text-amber-700">
            {pendingReviews.length}
          </Badge>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pendingReviews.map((house) => (
          <div
            key={house.houseId}
            className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-heading">{house.name}</h3>
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    {house.neighborhoodName}
                  </Badge>
                  <Badge className="text-[10px] font-bold bg-amber-500/15 text-amber-700 border-amber-500/30">
                    En attente
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Contact: <span className="font-mono">{house.contactPhone || "Non renseigné"}</span> · Soumis le{" "}
                  {house.submittedAt ? new Date(house.submittedAt).toLocaleDateString("fr-FR") : "Récemment"}
                </p>
              </div>

              {/* Public preview button */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8 px-3 text-xs font-semibold gap-1.5 self-start sm:self-auto"
              >
                <Link
                  href={`/houses/${house.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Aperçu fiche publique</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            </div>

            {/* Checklist Snapshot & Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex items-center gap-2.5">
                <Sparkles className="size-4 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-foreground">
                    Checklist de configuration :
                  </span>{" "}
                  <span className="font-semibold text-emerald-600">
                    {house.completedChecklistCount} / 6 étapes prêtes
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex items-center gap-2.5">
                <Tag className="size-4 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-foreground">
                    Articles avec tarif :
                  </span>{" "}
                  <span className="font-semibold text-foreground">
                    {house.pricedItemsCount} article(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => handleSuspend(house)}
                className="h-8 px-3 text-xs font-semibold text-destructive hover:bg-destructive-soft gap-1.5"
              >
                <Ban className="size-3.5" />
                <span>Suspendre</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setSelectedHouseForChanges(house)}
                className="h-8 px-3 text-xs font-semibold gap-1.5"
              >
                <AlertCircle className="size-3.5 text-amber-600" />
                <span>Demander des corrections</span>
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() => handleApprove(house)}
                className="h-8 px-3.5 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="size-3.5" />
                <span>Valider le pressing</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <RequestChangesDialog
        house={selectedHouseForChanges}
        isOpen={Boolean(selectedHouseForChanges)}
        onClose={() => setSelectedHouseForChanges(null)}
      />
    </div>
  );
}
